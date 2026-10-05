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
import {
  buildScaleSequence,
  clampTempo,
  DEFAULT_TEMPO,
  millisecondsPerBeat,
  normalizePlaybackIndex,
} from "../utils/audioSequence.mjs";

const TEMPO_STORAGE_KEY = "audioTempo";
const VOICES_PER_SOUND = 2;
export const AudioPlaybackStore = createContext(null);

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
  const [drumsEnabled, setDrumsEnabled] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tempo, setTempoState] = useState(DEFAULT_TEMPO);

  const guitarPlayers = useRef(new Map());
  const drumPlayers = useRef(new Map());
  const activeGuitarPlayer = useRef(null);
  const nextVoice = useRef(new Map());
  const timer = useRef(null);
  const generation = useRef(0);
  const pendingReset = useRef(Promise.resolve());
  const playingRef = useRef(false);
  const loopRef = useRef(loopEnabled);
  const drumsRef = useRef(drumsEnabled);
  const tempoRef = useRef(tempo);
  const sequence = useMemo(
    () => buildScaleSequence(globalState.scale?.degrees, globalState.key?.key_offset),
    [globalState.key?.key_offset, globalState.scale?.degrees],
  );
  const sequenceRef = useRef(sequence);

  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { loopRef.current = loopEnabled; }, [loopEnabled]);
  useEffect(() => { drumsRef.current = drumsEnabled; }, [drumsEnabled]);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);

  const updateActivePitchClass = useCallback((pitchClass) => {
    startTransition(() => setActivePitchClass(pitchClass));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(TEMPO_STORAGE_KEY).then((storedTempo) => {
      if (storedTempo !== null) setTempoState(clampTempo(storedTempo));
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

  const resetPlayer = useCallback(async (player) => {
    if (!player) return;
    try {
      player.pause();
      await player.seekTo(0, 0, 0);
    } catch (_error) {}
  }, []);

  const stopPlayers = useCallback(async () => {
    activeGuitarPlayer.current = null;
    await Promise.all(allPlayers().map(resetPlayer));
  }, [allPlayers, resetPlayer]);

  const stop = useCallback(() => {
    generation.current += 1;
    playingRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pendingReset.current = stopPlayers();
    updateActivePitchClass(null);
    setIsPlaying(false);
  }, [stopPlayers, updateActivePitchClass]);

  const ensurePlayers = useCallback(async (collection, key, source, volume = 1) => {
    let players = collection.current.get(key);
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
      players = Array.from({ length: VOICES_PER_SOUND }, () => {
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

  const prepare = useCallback(async (includeDrums = drumsRef.current) => {
    if (sequenceRef.current.length === 0) return false;
    setError("");
    setIsLoading(true);
    try {
      const sampleIds = [...new Set(sequenceRef.current.map(({ sample }) => sample))];
      await Promise.all(sampleIds.map((sample) => ensurePlayers(
        guitarPlayers,
        sample,
        guitarSources[sample],
        0.92,
      )));
      if (includeDrums) {
        await Promise.all(Object.entries(drumSources).map(([name, source]) => ensurePlayers(
          drumPlayers,
          name,
          source,
          name === "hat" ? 0.16 : 0.28,
        )));
      }
      return true;
    } catch (loadError) {
      setError(loadError.message || "Unable to load audio.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [ensurePlayers]);

  const beginSequence = useCallback(() => {
    const run = generation.current + 1;
    generation.current = run;
    playingRef.current = true;
    setIsPlaying(true);
    let index = 0;
    let beat = 0;
    let targetTime = monotonicNow();

    const tick = () => {
      if (!playingRef.current || generation.current !== run) return;
      const currentSequence = sequenceRef.current;
      if (currentSequence.length === 0) return stop();

      const beatDuration = millisecondsPerBeat(tempoRef.current);
      const now = monotonicNow();
      const missedBeats = getMissedBeatCount(now, targetTime, beatDuration);
      if (missedBeats > 0) {
        index += missedBeats;
        beat += missedBeats;
      }

      index = normalizePlaybackIndex(index, currentSequence.length, loopRef.current);
      if (index >= currentSequence.length) return stop();

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

      if (drumsRef.current) {
        startReadyVoice(getReadyVoice(drumPlayers, "hat", "drum"));
        startReadyVoice(getReadyVoice(
          drumPlayers,
          beat % 4 === 0 || beat % 4 === 2 ? "kick" : "snare",
          "drum",
        ));
      }

      index += 1;
      beat += 1;
      const nextDelay = getNextBeatDelay(now, targetTime, beatDuration, missedBeats);
      targetTime = now + nextDelay;
      timer.current = setTimeout(tick, nextDelay);
    };

    tick();
  }, [getReadyVoice, resetPlayer, startReadyVoice, stop, updateActivePitchClass]);

  const play = useCallback(async () => {
    if (playingRef.current) return stop();
    const command = generation.current + 1;
    generation.current = command;
    await pendingReset.current;
    if (generation.current !== command) return;
    const ready = await prepare();
    if (ready && generation.current === command) beginSequence();
  }, [beginSequence, prepare, stop]);

  const restart = useCallback(async () => {
    if (!playingRef.current) return;
    const command = generation.current + 1;
    generation.current = command;
    playingRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    updateActivePitchClass(null);
    pendingReset.current = stopPlayers();
    await pendingReset.current;
    if (generation.current !== command) return;
    const ready = await prepare();
    if (ready && generation.current === command) beginSequence();
  }, [beginSequence, prepare, stopPlayers, updateActivePitchClass]);

  const musicalSignature = `${globalState.key?.key_offset}:${globalState.scale?.degrees?.join(",")}`;
  useEffect(() => {
    restart();
  }, [musicalSignature]);

  useEffect(() => {
    if (drumsEnabled) prepare(true);
  }, [drumsEnabled]);

  const setTempo = useCallback((nextTempo) => {
    const clamped = clampTempo(nextTempo);
    tempoRef.current = clamped;
    setTempoState(clamped);
    AsyncStorage.setItem(TEMPO_STORAGE_KEY, String(clamped));
  }, []);

  const openPopover = useCallback(() => {
    setPopoverOpen(true);
    prepare();
  }, [prepare]);

  useEffect(() => () => {
    generation.current += 1;
    playingRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    allPlayers().forEach(disposePlayer);
    guitarPlayers.current.clear();
    drumPlayers.current.clear();
    nextVoice.current.clear();
    activeGuitarPlayer.current = null;
  }, [allPlayers]);

  const value = useMemo(() => ({
    activePitchClass,
    drumsEnabled,
    error,
    isLoading,
    isPlaying,
    loopEnabled,
    openPopover,
    play,
    popoverOpen,
    prepare,
    sequenceEmpty: sequence.length === 0,
    setDrumsEnabled,
    setLoopEnabled,
    setPopoverOpen,
    setTempo,
    stop,
    tempo,
  }), [activePitchClass, drumsEnabled, error, isLoading, isPlaying, loopEnabled, openPopover, play, popoverOpen, prepare, sequence.length, setTempo, stop, tempo]);

  return <AudioPlaybackStore.Provider value={value}>{children}</AudioPlaybackStore.Provider>;
};
