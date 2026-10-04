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
} from "react";

import { Store } from "../../Store";
import { guitarSources, drumSources } from "../utils/audioSources";
import {
  buildScaleSequence,
  clampTempo,
  DEFAULT_TEMPO,
  millisecondsPerBeat,
} from "../utils/audioSequence.mjs";

const TEMPO_STORAGE_KEY = "audioTempo";
export const AudioPlaybackStore = createContext(null);

const waitUntilLoaded = (player, timeout = 4000) => new Promise((resolve, reject) => {
  const startedAt = Date.now();
  const check = () => {
    if (player.isLoaded) return resolve();
    if (Date.now() - startedAt >= timeout) return reject(new Error("Audio took too long to load."));
    setTimeout(check, 25);
  };
  check();
});

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
  const timer = useRef(null);
  const generation = useRef(0);
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

  useEffect(() => {
    AsyncStorage.getItem(TEMPO_STORAGE_KEY).then((storedTempo) => {
      if (storedTempo !== null) setTempoState(clampTempo(storedTempo));
    });
    setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      playsInSilentMode: false,
      shouldPlayInBackground: false,
    }).catch(() => {});
  }, []);

  const stopPlayers = useCallback(() => {
    [...guitarPlayers.current.values(), ...drumPlayers.current.values()].forEach((player) => {
      try {
        player.pause();
        player.seekTo(0).catch(() => {});
      } catch (_error) {}
    });
  }, []);

  const stop = useCallback(() => {
    generation.current += 1;
    playingRef.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    stopPlayers();
    setActivePitchClass(null);
    setIsPlaying(false);
  }, [stopPlayers]);

  const ensurePlayer = useCallback(async (collection, key, source, volume = 1) => {
    if (!collection.current.has(key)) {
      const player = createAudioPlayer(source, { downloadFirst: true, updateInterval: 1000 });
      player.volume = volume;
      collection.current.set(key, player);
    }
    const player = collection.current.get(key);
    await waitUntilLoaded(player);
    return player;
  }, []);

  const prepare = useCallback(async (includeDrums = drumsRef.current) => {
    if (sequenceRef.current.length === 0) return false;
    setError("");
    setIsLoading(true);
    try {
      const sampleIds = [...new Set(sequenceRef.current.map(({ sample }) => sample))];
      await Promise.all(sampleIds.map((sample) => ensurePlayer(
        guitarPlayers,
        sample,
        guitarSources[sample],
        0.92,
      )));
      if (includeDrums) {
        await Promise.all(Object.entries(drumSources).map(([name, source]) => ensurePlayer(
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
  }, [ensurePlayer]);

  const playOneShot = useCallback((player) => {
    if (!player) return;
    player.seekTo(0).then(() => player.play()).catch(() => {});
  }, []);

  const beginSequence = useCallback(() => {
    const run = generation.current + 1;
    generation.current = run;
    playingRef.current = true;
    setIsPlaying(true);
    let index = 0;
    let beat = 0;
    let targetTime = Date.now();

    const tick = () => {
      if (!playingRef.current || generation.current !== run) return;
      const currentSequence = sequenceRef.current;
      if (currentSequence.length === 0) return stop();

      if (index >= currentSequence.length) {
        if (!loopRef.current) return stop();
        index = 0;
      }

      const note = currentSequence[index];
      playOneShot(guitarPlayers.current.get(note.sample));
      setActivePitchClass(note.pitchClass);

      if (drumsRef.current) {
        playOneShot(drumPlayers.current.get("hat"));
        playOneShot(drumPlayers.current.get(beat % 4 === 0 || beat % 4 === 2 ? "kick" : "snare"));
      }

      index += 1;
      beat += 1;
      targetTime += millisecondsPerBeat(tempoRef.current);
      timer.current = setTimeout(tick, Math.max(0, targetTime - Date.now()));
    };

    tick();
  }, [playOneShot, stop]);

  const play = useCallback(async () => {
    if (playingRef.current) return stop();
    const ready = await prepare();
    if (ready) beginSequence();
  }, [beginSequence, prepare, stop]);

  const restart = useCallback(async () => {
    if (!playingRef.current) return;
    stop();
    const ready = await prepare();
    if (ready) beginSequence();
  }, [beginSequence, prepare, stop]);

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
    if (timer.current) clearTimeout(timer.current);
    [...guitarPlayers.current.values(), ...drumPlayers.current.values()].forEach((player) => player.release());
  }, []);

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
