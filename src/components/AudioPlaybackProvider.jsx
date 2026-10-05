import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";

import { Store } from "../../Store";
import { guitarSources, drumSources } from "../utils/audioSources";
import { getMissedBeatCount, getNextBeatDelay, monotonicNow } from "../utils/audioClock.mjs";
import { createNativeAudioTransport } from "../utils/nativeAudioTransport";
import {
  buildScaleSequence,
  clampTempo,
  DEFAULT_NOTE_RATE,
  DEFAULT_TEMPO,
  millisecondsPerBeat,
  millisecondsPerNote,
  normalizeNoteRate,
  normalizePlaybackIndex,
} from "../utils/audioSequence.mjs";

const TEMPO_STORAGE_KEY = "audioTempo";
const NOTE_RATE_STORAGE_KEY = "audioNoteRate";
const LOOP_STORAGE_KEY = "audioLoopEnabled";
const VOICES_PER_SOUND = 2;
const DRUM_VOICES_PER_SOUND = { hat: 4, kick: 2, snare: 2 };
const DRUM_RESET_DELAYS = { hat: 440, kick: 300, snare: 350 };
const DRUM_VOLUMES = { hat: 0.12, kick: 0.58, snare: 0.52 };
const NATIVE_LOAD_TIMEOUT_MS = 5000;
export const AudioPlaybackStore = createContext(null);

const withTimeout = (promise, timeout, message) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(message)), timeout);
  Promise.resolve(promise).then(
    (value) => {
      clearTimeout(timer);
      resolve(value);
    },
    (error) => {
      clearTimeout(timer);
      reject(error);
    },
  );
});

const waitUntilLoaded = (player, timeout = 4000) => new Promise((resolve, reject) => {
  const startedAt = Date.now();
  const check = () => {
    try {
      if (player.isLoaded) return resolve();
    } catch (_error) {
      return reject(new Error("Audio player was refreshed while loading."));
    }
    if (Date.now() - startedAt >= timeout) return reject(new Error("Audio took too long to load."));
    setTimeout(check, 25);
  };
  check();
});

const disposePlayer = (player) => {
  try {
    if (typeof player?.remove === "function") player.remove();
    else player?.release?.();
  } catch (_error) {}
};

export const AudioPlaybackProvider = ({ children }) => {
  const { globalState } = useContext(Store);
  const [activePitchClass, setActivePitchClass] = useState(null);
  const [drumsEnabled, setDrumsEnabledState] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabledState] = useState(true);
  const [noteRate, setNoteRateState] = useState(DEFAULT_NOTE_RATE);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tempo, setTempoState] = useState(DEFAULT_TEMPO);

  const guitarPlayers = useRef(new Map());
  const drumPlayers = useRef(new Map());
  const activeGuitarPlayer = useRef(null);
  const nextVoice = useRef(new Map());
  const drumVoiceRuns = useRef(new WeakMap());
  const drumTimers = useRef(new Set());
  const drumClockTimer = useRef(null);
  const timer = useRef(null);
  const generation = useRef(0);
  const drumGeneration = useRef(0);
  const noteStartPending = useRef(false);
  const drumStartPending = useRef(false);
  const beginDrumsRef = useRef(null);
  const pendingReset = useRef(Promise.resolve());
  const nativeTransport = useRef(null);
  const nativeTransportChecked = useRef(false);
  const nativeTransportDisabled = useRef(false);
  const playingRef = useRef(false);
  const loopRef = useRef(loopEnabled);
  const noteRateRef = useRef(noteRate);
  const drumsRef = useRef(drumsEnabled);
  const tempoRef = useRef(tempo);
  const sequence = useMemo(
    () => buildScaleSequence(globalState.scale?.degrees, globalState.key?.key_offset),
    [globalState.key?.key_offset, globalState.scale?.degrees],
  );
  const sequenceRef = useRef(sequence);

  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { loopRef.current = loopEnabled; }, [loopEnabled]);
  useEffect(() => { noteRateRef.current = noteRate; }, [noteRate]);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);

  const updateActivePitchClass = useCallback((pitchClass) => {
    startTransition(() => setActivePitchClass(pitchClass));
  }, []);

  const getNativeTransport = useCallback(() => {
    if (nativeTransportDisabled.current) return null;
    if (!nativeTransportChecked.current) {
      nativeTransportChecked.current = true;
      nativeTransport.current = createNativeAudioTransport({
        onNote: updateActivePitchClass,
        onNotesEnded: () => {
          playingRef.current = false;
          setIsPlaying(false);
          updateActivePitchClass(null);
        },
      });
    }
    return nativeTransport.current;
  }, [updateActivePitchClass]);

  const disableNativeTransport = useCallback(async () => {
    const failedTransport = nativeTransport.current;
    nativeTransport.current = null;
    nativeTransportDisabled.current = true;
    if (failedTransport) {
      try {
        await withTimeout(failedTransport.close(), 500, "Native audio shutdown timed out.");
      } catch (_error) {}
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(TEMPO_STORAGE_KEY).then((storedTempo) => {
      if (storedTempo !== null) setTempoState(clampTempo(storedTempo));
    });
    AsyncStorage.getItem(NOTE_RATE_STORAGE_KEY).then((storedRate) => {
      if (storedRate !== null) setNoteRateState(normalizeNoteRate(storedRate));
    });
    AsyncStorage.getItem(LOOP_STORAGE_KEY).then((storedLoop) => {
      if (storedLoop !== null) setLoopEnabledState(storedLoop === "true");
    });
    setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(() => {});
  }, []);

  const allPlayers = useCallback(() => [
    ...[...guitarPlayers.current.values()].flat(),
    ...[...drumPlayers.current.values()].flat(),
  ], []);

  const clearDrumTimers = useCallback(() => {
    drumTimers.current.forEach(clearTimeout);
    drumTimers.current.clear();
  }, []);

  const scheduleDrumTask = useCallback((task, delay) => {
    const scheduled = setTimeout(() => {
      drumTimers.current.delete(scheduled);
      task();
    }, delay);
    drumTimers.current.add(scheduled);
  }, []);

  const resetPlayer = useCallback(async (player) => {
    if (!player) return;
    try {
      player.pause();
      await player.seekTo(0, 0, 0);
    } catch (_error) {}
  }, []);

  const stopGuitarPlayers = useCallback(async () => {
    activeGuitarPlayer.current = null;
    await Promise.all([...guitarPlayers.current.values()].flat().map(resetPlayer));
  }, [resetPlayer]);

  const stopDrumPlayers = useCallback(async () => {
    await Promise.all([...drumPlayers.current.values()].flat().map(resetPlayer));
  }, [resetPlayer]);

  const stop = useCallback(() => {
    const shouldStartPendingDrums = drumStartPending.current;
    generation.current += 1;
    noteStartPending.current = false;
    drumStartPending.current = false;
    playingRef.current = false;
    if (nativeTransport.current) {
      nativeTransport.current.stopNotes();
      updateActivePitchClass(null);
      setIsPlaying(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pendingReset.current = stopGuitarPlayers();
    updateActivePitchClass(null);
    setIsPlaying(false);
    if (shouldStartPendingDrums) beginDrumsRef.current?.();
  }, [stopGuitarPlayers, updateActivePitchClass]);

  const ensurePlayers = useCallback(async (collection, key, source, volume = 1, voiceCount = VOICES_PER_SOUND) => {
    let players = collection.current.get(key);
    if (players && players.length !== voiceCount) {
      players.forEach(disposePlayer);
      collection.current.delete(key);
      players = null;
    }
    if (players) {
      try {
        players.forEach((player) => player.isLoaded);
      } catch (_error) {
        players.forEach(disposePlayer);
        collection.current.delete(key);
        players = null;
      }
    }
    if (!players) {
      players = Array.from({ length: voiceCount }, () => {
        const player = createAudioPlayer(source, {
          downloadFirst: true,
          keepAudioSessionActive: true,
          updateInterval: 1000,
        });
        player.volume = volume;
        return player;
      });
      collection.current.set(key, players);
    }
    await Promise.all(players.map(async (player) => {
      await waitUntilLoaded(player);
      if (!player.playing && player.currentTime !== 0) await player.seekTo(0, 0, 0);
    }));
    return players;
  }, []);

  const getReadyVoice = useCallback((collection, key, prefix) => {
    const players = collection.current.get(key);
    if (!players?.length) return null;
    const voiceKey = `${prefix}:${key}`;
    const voiceIndex = nextVoice.current.get(voiceKey) ?? 0;
    nextVoice.current.set(voiceKey, (voiceIndex + 1) % players.length);
    return players[voiceIndex];
  }, []);

  const startReadyVoice = useCallback((player) => {
    if (!player) return;
    try {
      player.play();
    } catch (_error) {}
  }, []);

  const triggerDrum = useCallback((name) => {
    const player = getReadyVoice(drumPlayers, name, "drum");
    if (!player) return;
    const voiceRun = (drumVoiceRuns.current.get(player) ?? 0) + 1;
    drumVoiceRuns.current.set(player, voiceRun);
    startReadyVoice(player);
    scheduleDrumTask(() => {
      // A delayed JS callback from an older hit must never rewind a voice that
      // has since been reused for a newer beat.
      if (drumVoiceRuns.current.get(player) === voiceRun) void resetPlayer(player);
    }, DRUM_RESET_DELAYS[name]);
  }, [getReadyVoice, resetPlayer, scheduleDrumTask, startReadyVoice]);

  const prepare = useCallback(async () => {
    if (sequenceRef.current.length === 0) return false;
    setError("");
    setIsLoading(true);
    try {
      const sampleIds = [...new Set(sequenceRef.current.map(({ sample }) => sample))];
      const native = getNativeTransport();
      if (native) {
        native.configure({
          loop: loopRef.current,
          noteRate: noteRateRef.current,
          sequence: sequenceRef.current,
          tempo: tempoRef.current,
        });
        try {
          await withTimeout(
            native.load(sampleIds.map((sample) => [`guitar:${sample}`, guitarSources[sample]])),
            NATIVE_LOAD_TIMEOUT_MS,
            "Native audio initialization timed out.",
          );
          return true;
        } catch (_nativeError) {
          // A native clock without an active audio session still advances the
          // note highlights while producing silence. Fall back atomically to
          // expo-audio instead of leaving Android stuck or visually playing.
          await disableNativeTransport();
        }
      }
      await Promise.all(sampleIds.map((sample) => ensurePlayers(
        guitarPlayers,
        sample,
        guitarSources[sample],
        0.92,
      )));
      return true;
    } catch (loadError) {
      setError(loadError.message || "Unable to load audio.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [disableNativeTransport, ensurePlayers, getNativeTransport]);

  const prepareDrums = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const native = getNativeTransport();
      if (native) {
        try {
          await withTimeout(
            native.load(Object.entries(drumSources).map(([name, source]) => [`drum:${name}`, source])),
            NATIVE_LOAD_TIMEOUT_MS,
            "Native drum audio initialization timed out.",
          );
          return true;
        } catch (_nativeError) {
          await disableNativeTransport();
        }
      }
      await Promise.all(Object.entries(drumSources).map(([name, source]) => ensurePlayers(
        drumPlayers,
        name,
        source,
        DRUM_VOLUMES[name],
        DRUM_VOICES_PER_SOUND[name],
      )));
      return true;
    } catch (loadError) {
      setError(loadError.message || "Unable to load audio.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [disableNativeTransport, ensurePlayers, getNativeTransport]);

  const beginSequence = useCallback(() => {
    const run = generation.current + 1;
    generation.current = run;
    playingRef.current = true;
    setIsPlaying(true);
    let index = 0;
    let targetTime = monotonicNow();

    const tick = () => {
      if (!playingRef.current || generation.current !== run) return;
      const currentSequence = sequenceRef.current;
      if (currentSequence.length === 0) return stop();

      const noteDuration = millisecondsPerNote(tempoRef.current, noteRateRef.current);
      const now = monotonicNow();
      const missedNotes = getMissedBeatCount(now, targetTime, noteDuration);
      index += missedNotes;

      index = normalizePlaybackIndex(index, currentSequence.length, loopRef.current);
      if (index >= currentSequence.length) return stop();

      if (drumStartPending.current) {
        drumStartPending.current = false;
        beginDrumsRef.current?.();
      }

      const note = currentSequence[index];
      const previousPlayer = activeGuitarPlayer.current;
      const notePlayer = getReadyVoice(guitarPlayers, note.sample, "guitar");
      activeGuitarPlayer.current = notePlayer;

      // Put the time-critical native play command ahead of cleanup and visual
      // work. Seeking the previous voice first can delay the next attack on
      // slower devices because both operations share the native audio queue.
      startReadyVoice(notePlayer);
      if (previousPlayer && previousPlayer !== notePlayer) void resetPlayer(previousPlayer);
      updateActivePitchClass(note.pitchClass);

      index += 1;

      const nextDelay = getNextBeatDelay(now, targetTime, noteDuration, missedNotes);
      targetTime = now + nextDelay;
      timer.current = setTimeout(tick, nextDelay);
    };

    tick();
  }, [getReadyVoice, resetPlayer, startReadyVoice, stop, updateActivePitchClass]);

  const stopDrums = useCallback(() => {
    if (nativeTransport.current) {
      nativeTransport.current.stopDrums();
      drumsRef.current = false;
      setDrumsEnabledState(false);
      return;
    }
    const shouldStartPendingNotes = noteStartPending.current;
    noteStartPending.current = false;
    drumStartPending.current = false;
    drumGeneration.current += 1;
    drumsRef.current = false;
    setDrumsEnabledState(false);
    if (drumClockTimer.current) clearTimeout(drumClockTimer.current);
    drumClockTimer.current = null;
    clearDrumTimers();
    void stopDrumPlayers();
    if (shouldStartPendingNotes) beginSequence();
  }, [beginSequence, clearDrumTimers, stopDrumPlayers]);

  const stopAll = useCallback(() => {
    stop();
    stopDrums();
  }, [stop, stopDrums]);

  const beginDrums = useCallback(() => {
    const run = drumGeneration.current + 1;
    drumGeneration.current = run;
    drumsRef.current = true;
    setDrumsEnabledState(true);
    let beat = 0;
    let targetTime = monotonicNow();

    const tick = () => {
      if (!drumsRef.current || drumGeneration.current !== run) return;
      const beatDuration = millisecondsPerBeat(tempoRef.current);
      const now = monotonicNow();
      const missedBeats = getMissedBeatCount(now, targetTime, beatDuration);
      beat += missedBeats;

      triggerDrum("hat");
      if (beat % 4 === 0) triggerDrum("kick");
      if (beat % 4 === 2) triggerDrum("snare");
      if (beat % 4 === 0 && noteStartPending.current) {
        noteStartPending.current = false;
        beginSequence();
      }
      beat += 1;

      const nextDelay = getNextBeatDelay(now, targetTime, beatDuration, missedBeats);
      targetTime = now + nextDelay;
      drumClockTimer.current = setTimeout(tick, nextDelay);
    };

    tick();
  }, [beginSequence, triggerDrum]);

  useEffect(() => {
    beginDrumsRef.current = beginDrums;
  }, [beginDrums]);

  const setDrumsEnabled = useCallback(async (enabled) => {
    if (!enabled) return stopDrums();
    if (drumsRef.current || drumStartPending.current) return;
    const command = drumGeneration.current + 1;
    drumGeneration.current = command;
    const ready = await prepareDrums();
    if (ready && drumGeneration.current === command) {
      if (nativeTransport.current) {
        nativeTransport.current.configure({
          loop: loopRef.current,
          noteRate: noteRateRef.current,
          sequence: sequenceRef.current,
          tempo: tempoRef.current,
        });
        nativeTransport.current.startDrums();
        drumsRef.current = true;
        setDrumsEnabledState(true);
        return;
      }
      if (playingRef.current) {
        drumStartPending.current = true;
        setDrumsEnabledState(true);
      } else {
        beginDrums();
      }
    }
  }, [beginDrums, prepareDrums, stopDrums]);

  const play = useCallback(async () => {
    if (playingRef.current || noteStartPending.current) return stopAll();
    const command = generation.current + 1;
    generation.current = command;
    await pendingReset.current;
    if (generation.current !== command) return;
    const ready = await prepare();
    if (ready && generation.current === command) {
      if (nativeTransport.current) {
        nativeTransport.current.configure({
          loop: loopRef.current,
          noteRate: noteRateRef.current,
          sequence: sequenceRef.current,
          tempo: tempoRef.current,
        });
        nativeTransport.current.startNotes();
        playingRef.current = true;
        setIsPlaying(true);
        return;
      }
      if (drumsRef.current) {
        noteStartPending.current = true;
        setIsPlaying(true);
      } else {
        beginSequence();
      }
    }
  }, [beginSequence, prepare, stopAll]);

  const restart = useCallback(async () => {
    if (!playingRef.current) return;
    if (nativeTransport.current) {
      const ready = await prepare();
      if (!ready || !playingRef.current) return;
      nativeTransport.current.configure({
        loop: loopRef.current,
        noteRate: noteRateRef.current,
        sequence: sequenceRef.current,
        tempo: tempoRef.current,
      });
      nativeTransport.current.restartActive();
      return;
    }
    const command = generation.current + 1;
    generation.current = command;
    playingRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    updateActivePitchClass(null);
    pendingReset.current = stopGuitarPlayers();
    await pendingReset.current;
    if (generation.current !== command) return;
    const ready = await prepare();
    if (ready && generation.current === command) beginSequence();
  }, [beginSequence, prepare, stopGuitarPlayers, updateActivePitchClass]);

  const musicalSignature = `${globalState.key?.key_offset}:${globalState.scale?.degrees?.join(",")}`;
  useEffect(() => {
    restart();
  }, [musicalSignature]);

  const setTempo = useCallback((nextTempo) => {
    const clamped = clampTempo(nextTempo);
    tempoRef.current = clamped;
    setTempoState(clamped);
    AsyncStorage.setItem(TEMPO_STORAGE_KEY, String(clamped));
    if (nativeTransport.current) {
      nativeTransport.current.configure({
        loop: loopRef.current,
        noteRate: noteRateRef.current,
        sequence: sequenceRef.current,
        tempo: clamped,
      });
      if (playingRef.current || drumsRef.current) nativeTransport.current.restartActive();
    }
  }, []);

  const setNoteRate = useCallback((nextRate) => {
    const normalized = normalizeNoteRate(nextRate);
    noteRateRef.current = normalized;
    setNoteRateState(normalized);
    AsyncStorage.setItem(NOTE_RATE_STORAGE_KEY, normalized);
    if (nativeTransport.current) {
      nativeTransport.current.configure({
        loop: loopRef.current,
        noteRate: normalized,
        sequence: sequenceRef.current,
        tempo: tempoRef.current,
      });
      if (playingRef.current) nativeTransport.current.restartActive();
    }
  }, []);

  const setLoopEnabled = useCallback((enabled) => {
    const nextEnabled = Boolean(enabled);
    loopRef.current = nextEnabled;
    setLoopEnabledState(nextEnabled);
    AsyncStorage.setItem(LOOP_STORAGE_KEY, String(nextEnabled));
    nativeTransport.current?.configure({
      loop: nextEnabled,
      noteRate: noteRateRef.current,
      sequence: sequenceRef.current,
      tempo: tempoRef.current,
    });
  }, []);

  const openPopover = useCallback(() => {
    if (!globalState.options?.audioPlayer) return;
    setPopoverOpen(true);
    prepare();
  }, [globalState.options?.audioPlayer, prepare]);

  useEffect(() => {
    if (globalState.options?.audioPlayer) {
      // Audio assets stay completely lazy until the beta feature is enabled.
      void prepare();
      return;
    }
    setPopoverOpen(false);
    stopAll();
  }, [globalState.options?.audioPlayer, prepare, stopAll]);

  useEffect(() => () => {
    generation.current += 1;
    drumGeneration.current += 1;
    playingRef.current = false;
    drumsRef.current = false;
    noteStartPending.current = false;
    drumStartPending.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (drumClockTimer.current) clearTimeout(drumClockTimer.current);
    drumClockTimer.current = null;
    clearDrumTimers();
    allPlayers().forEach(disposePlayer);
    guitarPlayers.current.clear();
    drumPlayers.current.clear();
    nextVoice.current.clear();
    drumVoiceRuns.current = new WeakMap();
    activeGuitarPlayer.current = null;
    void nativeTransport.current?.close();
    nativeTransport.current = null;
  }, [allPlayers, clearDrumTimers]);

  const value = useMemo(() => ({
    activePitchClass,
    drumsEnabled,
    error,
    isLoading,
    isPlaying,
    loopEnabled,
    noteRate,
    openPopover,
    play,
    popoverOpen,
    prepare,
    sequenceEmpty: sequence.length === 0,
    setDrumsEnabled,
    setLoopEnabled,
    setNoteRate,
    setPopoverOpen,
    setTempo,
    stop: stopAll,
    tempo,
  }), [activePitchClass, drumsEnabled, error, isLoading, isPlaying, loopEnabled, noteRate, openPopover, play, popoverOpen, prepare, sequence.length, setLoopEnabled, setNoteRate, setTempo, stop, tempo]);

  return <AudioPlaybackStore.Provider value={value}>{children}</AudioPlaybackStore.Provider>;
};
