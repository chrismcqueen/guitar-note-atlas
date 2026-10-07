import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import React, { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { PositionStore, PositionVisibilityStore, Store } from "../../Store";
import coordinates from "../../data/positionCoordinates.json";
import { guitarSources, drumSources } from "../utils/audioSources";
import { monotonicNow } from "../utils/audioClock.mjs";
import { createNativeAudioTransport } from "../utils/nativeAudioTransport";
import { buildPositionSequence, getPositionNotes, playbackNoteAt, practiceAudioMode } from "../utils/positionPlayback.mjs";
import { clampTempo, DEFAULT_NOTE_RATE, DEFAULT_TEMPO, millisecondsPerBeat, millisecondsPerNote, normalizeNoteRate } from "../utils/audioSequence.mjs";

export const AudioPlaybackStore = createContext(null);
const DEFAULTS = { tempo: DEFAULT_TEMPO, noteRate: DEFAULT_NOTE_RATE, loop: true, notesEnabled: true, accompaniment: "off", countIn: true, startOnRoot: true };
const STORAGE_KEY = "audioPracticeSettings";
const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error("Audio initialization timed out.")), ms);
  Promise.resolve(promise).then((value) => { clearTimeout(timeout); resolve(value); }, (error) => { clearTimeout(timeout); reject(error); });
});
const dispose = (player) => { try { player.remove(); } catch (_) {} };

export const AudioPlaybackProvider = ({ children }) => {
  const { dimensions, globalState } = useContext(Store);
  const { positionId, positionFret } = useContext(PositionStore);
  const { showPositionOverview } = useContext(PositionVisibilityStore);
  const [settings, setSettings] = useState(DEFAULTS);
  const [activeNote, setActiveNote] = useState(null);
  const [countRemaining, setCountRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [error, setError] = useState("");
  const readySettings = useRef(false);
  const mounted = useRef(true);
  const running = useRef(false);
  const command = useRef(0);
  const native = useRef(undefined);
  const players = useRef(new Map());
  const timers = useRef(new Set());
  const fallbackIndex = useRef(0);
  const fallbackTimer = useRef(null);
  const voices = useRef(new Map());
  const voiceRuns = useRef(new WeakMap());
  const preparationQueue = useRef(Promise.resolve());
  const previousGuitar = useRef(null);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const overview = !isTablet && showPositionOverview;
  const positionNotes = useMemo(() => getPositionNotes(coordinates, globalState.scale?.degrees, globalState.key?.key_offset,
    positionId, positionFret, globalState.options?.bassMode),
  [globalState.scale?.degrees, globalState.key?.key_offset, globalState.options?.bassMode, positionId, positionFret]);
  const plan = useMemo(() => buildPositionSequence(positionNotes, globalState.key?.key_offset, settings.startOnRoot),
    [positionNotes, globalState.key?.key_offset, settings.startOnRoot]);
  const config = useMemo(() => ({ ...settings, plan, ...practiceAudioMode({ ...settings, overview }) }), [settings, plan, overview]);
  const configRef = useRef(config);
  configRef.current = config;

  const pauseAudio = useCallback(() => {
    if (fallbackTimer.current) clearInterval(fallbackTimer.current);
    fallbackTimer.current = null;
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    native.current?.pause();
    players.current.forEach((pool) => pool.forEach((player) => { try { player.pause(); } catch (_) {} }));
    previousGuitar.current = null;
    setActiveNote(null);
    setCountRemaining(0);
  }, []);
  const pause = useCallback(() => {
    command.current += 1;
    running.current = false;
    pauseAudio();
    setIsPlaying(false);
    setIsLoading(false);
  }, [pauseAudio]);
  const stop = useCallback(() => {
    pause();
    fallbackIndex.current = 0;
    native.current?.stop();
  }, [pause]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const legacy = saved ? {} : {
          tempo: (await AsyncStorage.getItem("audioTempo")) ?? DEFAULT_TEMPO,
          noteRate: (await AsyncStorage.getItem("audioNoteRate")) ?? DEFAULT_NOTE_RATE,
          loop: (await AsyncStorage.getItem("audioLoopEnabled")) !== "false",
        };
        const value = { ...DEFAULTS, ...legacy, ...(saved ? JSON.parse(saved) : {}) };
        if (!cancelled) setSettings({ ...value, tempo: clampTempo(value.tempo), noteRate: normalizeNoteRate(value.noteRate),
          accompaniment: ["off", "metronome", "drums"].includes(value.accompaniment) ? value.accompaniment : "off" });
      } catch (_) {} finally { if (!cancelled) readySettings.current = true; }
    })();
    setAudioModeAsync({ interruptionMode: "mixWithOthers", playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
    const listener = AppState.addEventListener("change", (state) => { if (state !== "active") stop(); });
    return () => { cancelled = true; listener.remove(); };
  }, [stop]);
  useEffect(() => {
    if (readySettings.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  const ensurePlayer = useCallback(async (key, source) => {
    if (!mounted.current) return;
    if (!players.current.has(key)) {
      players.current.set(key, Array.from({ length: key === "drum:hat" ? 4 : 2 }, () => createAudioPlayer(source, {
        downloadFirst: true, keepAudioSessionActive: true, updateInterval: 1000,
      })));
    }
    const pool = players.current.get(key);
    await Promise.all(pool.map(async (player) => {
      const deadline = Date.now() + 4000;
      while (!player.isLoaded) {
        if (!mounted.current) return;
        if (Date.now() > deadline) throw new Error("Audio took too long to load.");
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      await player.seekTo(0, 0, 0);
    }));
  }, []);

  const prepare = useCallback(async (next) => {
    if (!mounted.current) return;
    const entries = [
      ...[...new Set(next.notesEnabled ? next.plan.notes.map((note) => note.sample) : [])].map((sample) => [`guitar:${sample}`, guitarSources[sample]]),
      ...Object.entries(drumSources).map(([key, source]) => [`drum:${key}`, source]),
    ];
    if (native.current === undefined) {
      native.current = createNativeAudioTransport({
        onNote: (note) => startTransition(() => setActiveNote(note)),
        onCount: (count) => startTransition(() => setCountRemaining(count)),
        onEnded: () => { running.current = false; fallbackIndex.current = 0; setIsPlaying(false); },
      });
    }
    if (native.current) {
      try { await withTimeout(native.current.load(entries), 5000); return; }
      catch (_) {
        const failed = native.current;
        native.current = null;
        void failed.close().catch(() => {});
      }
    }
    await Promise.all(entries.map(([key, source]) => ensurePlayer(key, source)));
  }, [ensurePlayer]);

  const trigger = useCallback((key, volume, rate = 1) => {
    const pool = players.current.get(key);
    if (!pool) return;
    const index = voices.current.get(key) ?? 0;
    const player = pool[index % pool.length];
    voices.current.set(key, index + 1);
    player.volume = volume;
    player.shouldCorrectPitch = false;
    player.setPlaybackRate(rate);
    player.play();
    const voiceRun = (voiceRuns.current.get(player) ?? 0) + 1;
    voiceRuns.current.set(player, voiceRun);
    // Rewind after its transient so the next use is ready without delaying
    // the attack with a seek. Pause cancels timers; prepare rewinds all voices.
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      if (voiceRuns.current.get(player) === voiceRun) {
        try { player.pause(); void player.seekTo(0, 0, 0).catch(() => {}); } catch (_) {}
      }
    }, key.startsWith("guitar:") ? millisecondsPerNote(configRef.current.tempo, configRef.current.noteRate) : 400);
    timers.current.add(timer);
    if (key.startsWith("guitar:")) {
      const previous = previousGuitar.current;
      if (previous && previous !== player) { previous.pause(); void previous.seekTo(0, 0, 0).catch(() => {}); }
      previousGuitar.current = player;
    }
  }, []);

  const begin = useCallback((next, count) => {
    if (native.current) {
      native.current.configure(next);
      native.current.start(count, !count);
      return;
    }
    const origin = monotonicNow();
    const countBeats = count && next.countIn ? 4 : 0;
    const beatMs = millisecondsPerBeat(next.tempo);
    const noteMs = millisecondsPerNote(next.tempo, next.noteRate);
    let beat = 0;
    let noteTime = origin + countBeats * beatMs;
    const tick = () => {
      if (!running.current) return;
      try {
        const now = monotonicNow();
        if (now >= origin + beat * beatMs) {
          beat = Math.max(beat, Math.floor((now - origin) / beatMs));
          if (beat < countBeats || next.accompaniment === "metronome") trigger("drum:click", 0.3);
          else if (next.accompaniment === "drums") {
            trigger("drum:hat", 0.12);
            if ((beat - countBeats) % 4 === 0) trigger("drum:kick", 0.58);
            if ((beat - countBeats) % 4 === 2) trigger("drum:snare", 0.52);
          }
          setCountRemaining(beat < countBeats ? countBeats - beat : 0);
          beat += 1;
        }
        if (next.notesEnabled && now >= noteTime) {
          const missed = Math.max(0, Math.floor((now - noteTime) / noteMs));
          fallbackIndex.current += missed;
          const note = playbackNoteAt(next.plan, fallbackIndex.current, next.loop);
          if (!note) return stop();
          trigger(`guitar:${note.sample}`, 0.92, note.playbackRate);
          setActiveNote(note);
          fallbackIndex.current += 1;
          noteTime += (missed + 1) * noteMs;
        }
      } catch (failure) { setError(failure.message || "Unable to play audio."); stop(); }
    };
    fallbackTimer.current = setInterval(tick, 16);
    tick();
  }, [stop, trigger]);

  const start = useCallback(async (count = true, resetPosition = false) => {
    const id = ++command.current;
    const preservingNativeClock = running.current && native.current && !count;
    if (!preservingNativeClock) pauseAudio();
    if (resetPosition) { fallbackIndex.current = 0; if (native.current) native.current.audibleIndex = 0; }
    setError("");
    setIsLoading(true);
    try {
      const next = configRef.current;
      if ((!next.notesEnabled || !next.plan.notes.length) && next.accompaniment === "off") {
        pause(); return;
      }
      // Empty note selections can still use the selected accompaniment.
      const playable = { ...next, notesEnabled: next.notesEnabled && next.plan.notes.length > 0 };
      // Serialize loads/seeks so a superseded settings update cannot rewind
      // voices after the newest command has begun playing.
      const preparation = preparationQueue.current.catch(() => {}).then(() => prepare(playable));
      preparationQueue.current = preparation;
      await preparation;
      if (!mounted.current || command.current !== id) return;
      if (next !== configRef.current) { void start(count, true); return; }
      if (preservingNativeClock && native.current) {
        native.current.configure(playable, resetPosition);
        setIsPlaying(true);
        return;
      }
      if (resetPosition && native.current) native.current.audibleIndex = 0;
      running.current = true;
      setIsPlaying(true);
      begin(playable, count);
    } catch (failure) {
      if (mounted.current && command.current === id) { setError(failure.message || "Unable to load audio."); pause(); }
    } finally { if (mounted.current && command.current === id) setIsLoading(false); }
  }, [begin, pause, pauseAudio, prepare]);
  const play = useCallback(() => { if (running.current || isLoading) pause(); else void start(); }, [isLoading, pause, start]);
  const lastConfig = useRef(config);
  useEffect(() => {
    const previous = lastConfig.current;
    lastConfig.current = config;
    if (running.current) void start(false, previous.plan !== config.plan || previous.notesEnabled !== config.notesEnabled);
  }, [config, start]);
  useEffect(() => {
    if (!globalState.options?.audioPlayer) { setPopoverOpen(false); stop(); }
  }, [globalState.options?.audioPlayer, stop]);
  useEffect(() => () => {
    mounted.current = false;
    command.current += 1;
    running.current = false;
    if (fallbackTimer.current) clearInterval(fallbackTimer.current);
    timers.current.forEach(clearTimeout);
    players.current.forEach((pool) => pool.forEach(dispose));
    void native.current?.close().catch(() => {});
  }, []);

  const update = useCallback((key, value) => setSettings((previous) => ({ ...previous, [key]: value })), []);
  const value = {
    activeNote, countRemaining, error, isLoading, isPlaying, popoverOpen, overview, ...settings,
    loopEnabled: settings.loop, sequenceEmpty: plan.notes.length === 0,
    canPlay: (config.notesEnabled && plan.notes.length > 0) || config.accompaniment !== "off",
    play, stop, setPopoverOpen, openPopover: () => setPopoverOpen(true),
    setTempo: (tempo) => update("tempo", clampTempo(tempo)),
    setNoteRate: (rate) => update("noteRate", normalizeNoteRate(rate)),
    setLoopEnabled: (enabled) => update("loop", enabled),
    setNotesEnabled: (enabled) => update("notesEnabled", enabled),
    setAccompaniment: (mode) => update("accompaniment", mode),
    setCountIn: (enabled) => update("countIn", enabled),
    setStartOnRoot: (enabled) => update("startOnRoot", enabled),
  };
  return <AudioPlaybackStore.Provider value={value}>{children}</AudioPlaybackStore.Provider>;
};
