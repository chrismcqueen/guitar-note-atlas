import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import React, { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { PositionStore, PositionVisibilityStore, Store } from "../../Store";
import coordinates from "../../data/positionCoordinates.json";
import { guitarSources, drumSources } from "../utils/audioSources";
import { monotonicNow } from "../utils/audioClock.mjs";
import { PracticeTimeline } from "../utils/practiceTimeline.mjs";
import { createNativeAudioTransport } from "../utils/nativeAudioTransport";
import { buildPositionSequence, getPositionNotes, practiceAudioMode } from "../utils/positionPlayback.mjs";
import { clampTempo, DEFAULT_NOTE_RATE, DEFAULT_TEMPO, millisecondsPerNote, normalizeNoteRate } from "../utils/audioSequence.mjs";

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
  const notesRequested = useRef(false);
  const accompanimentStartRequested = useRef(false);
  const fallbackTimeline = useRef(new PracticeTimeline());
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
    notesRequested.current = false;
    accompanimentStartRequested.current = false;
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
      if (!running.current) await player.seekTo(0, 0, 0);
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
        onEnded: () => { running.current = false; notesRequested.current = false; fallbackIndex.current = 0; setIsPlaying(false); },
      });
    }
    if (native.current) {
      const transport = native.current;
      try { await withTimeout(transport.load(entries, next), 15000); return; }
      catch (_) {
        if (native.current !== transport) return;
        native.current = null;
        void transport.close().catch(() => {});
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
      native.current.start(count);
      return;
    }
    const timeline = fallbackTimeline.current;
    timeline.start(monotonicNow() / 1000 + 0.1, next, count, fallbackIndex.current);
    const tick = () => {
      if (!running.current) return;
      try {
        const now = monotonicNow() / 1000;
        for (const event of timeline.events(now, now + 0.000001)) {
          if (event.kind === "beat") {
            if (event.count || event.config.accompaniment === "metronome") trigger("drum:click", 0.3);
            else if (event.config.accompaniment === "drums") {
              trigger("drum:hat", 0.08);
              if ((event.beat - timeline.countBeats) % 4 === 0) trigger("drum:kick", 0.48);
              if ((event.beat - timeline.countBeats) % 4 === 2) trigger("drum:snare", 0.45);
            }
            setCountRemaining(event.count);
          } else if (event.kind === "note") {
            trigger(`guitar:${event.note.sample}`, event.config.accompaniment === "drums" ? 0.64 : 0.92, event.note.playbackRate);
            setActiveNote(event.note);
            fallbackIndex.current = event.index + 1;
          } else if (event.kind === "end") return stop();
        }
      } catch (failure) { setError(failure.message || "Unable to play audio."); stop(); }
    };
    fallbackTimer.current = setInterval(tick, 16);
    tick();
  }, [stop, trigger]);

  const start = useCallback(async (count = true, resetPosition = false) => {
    const id = ++command.current;
    const preservingClock = running.current && !count;
    if (!preservingClock) pauseAudio();
    if (resetPosition) { fallbackIndex.current = 0; if (native.current) native.current.audibleIndex = 0; }
    setError("");
    setIsLoading(true);
    try {
      const next = configRef.current;
      const playable = { ...next, notesEnabled: notesRequested.current && next.notesEnabled && next.plan.notes.length > 0 };
      if (!playable.notesEnabled && playable.accompaniment === "off") {
        pause(); return;
      }
      // Empty note selections can still use the selected accompaniment.
      // Serialize loads/seeks so a superseded settings update cannot rewind
      // voices after the newest command has begun playing.
      const preparation = preparationQueue.current.catch(() => {}).then(() => prepare(playable));
      preparationQueue.current = preparation;
      await preparation;
      if (!mounted.current || command.current !== id) return;
      if (next !== configRef.current) { void start(count, resetPosition); return; }
      if (preservingClock) {
        if (native.current) native.current.configure(playable, resetPosition);
        else fallbackTimeline.current.configure(playable, monotonicNow() / 1000, resetPosition);
        setIsPlaying(notesRequested.current);
        return;
      }
      if (resetPosition && native.current) native.current.audibleIndex = 0;
      running.current = true;
      setIsPlaying(notesRequested.current);
      begin(playable, count);
    } catch (failure) {
      if (mounted.current && command.current === id) { setError(failure.message || "Unable to load audio."); pause(); }
    } finally { if (mounted.current && command.current === id) setIsLoading(false); }
  }, [begin, pause, pauseAudio, prepare]);
  const play = useCallback(() => {
    if ((running.current && notesRequested.current) || isLoading) pause();
    else { notesRequested.current = true; void start(!running.current); }
  }, [isLoading, pause, start]);
  const lastConfig = useRef(config);
  useEffect(() => {
    const previous = lastConfig.current;
    lastConfig.current = config;
    if (running.current || accompanimentStartRequested.current) {
      accompanimentStartRequested.current = false;
      void start(false, previous.plan !== config.plan || previous.notesEnabled !== config.notesEnabled);
    }
  }, [config, start]);
  useEffect(() => {
    if (!globalState.options?.audioPlayer) { setPopoverOpen(false); stop(); }
  }, [globalState.options?.audioPlayer, stop]);
  useEffect(() => {
    mounted.current = true;
    setIsPlaying(false);
    setIsLoading(false);
    return () => {
      mounted.current = false;
      command.current += 1;
      running.current = false;
      notesRequested.current = false;
      accompanimentStartRequested.current = false;
      if (fallbackTimer.current) clearInterval(fallbackTimer.current);
      fallbackTimer.current = null;
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      players.current.forEach((pool) => pool.forEach(dispose));
      players.current.clear();
      void native.current?.close().catch(() => {});
      native.current = undefined;
      preparationQueue.current = Promise.resolve();
    };
  }, []);

  const update = useCallback((key, value) => setSettings((previous) => ({ ...previous, [key]: value })), []);
  const setAccompaniment = useCallback((mode) => {
    if (!running.current && mode !== "off") accompanimentStartRequested.current = true;
    setSettings(previous => ({ ...previous, accompaniment: running.current && previous.accompaniment === mode ? "off" : mode }));
  }, []);
  const value = {
    activeNote, countRemaining, error, isLoading, isPlaying, popoverOpen, overview, ...settings,
    loopEnabled: settings.loop, sequenceEmpty: plan.notes.length === 0,
    canPlay: (config.notesEnabled && plan.notes.length > 0) || config.accompaniment !== "off",
    play, stop, setPopoverOpen, openPopover: () => setPopoverOpen(true),
    setTempo: (tempo) => update("tempo", clampTempo(tempo)),
    setNoteRate: (rate) => update("noteRate", normalizeNoteRate(rate)),
    setLoopEnabled: (enabled) => update("loop", enabled),
    setNotesEnabled: (enabled) => update("notesEnabled", enabled),
    setAccompaniment,
    setCountIn: (enabled) => update("countIn", enabled),
    setStartOnRoot: (enabled) => update("startOnRoot", enabled),
  };
  return <AudioPlaybackStore.Provider value={value}>{children}</AudioPlaybackStore.Provider>;
};
