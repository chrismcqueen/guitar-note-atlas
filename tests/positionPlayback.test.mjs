import assert from "node:assert/strict";
import test from "node:test";
import coordinates from "../data/positionCoordinates.json" with { type: "json" };
import { buildPositionSequence, getPositionNotes, playbackNoteAt, practiceAudioMode } from "../src/utils/positionPlayback.mjs";
import { normalizePitchClass } from "../src/utils/music.mjs";
import { positionSelectionTargets } from "../src/utils/positions.mjs";

const major = [0, 2, 4, 5, 7, 9, 11];
test("position run starts at lowest root and includes grey notes on the descent", () => {
  const notes = getPositionNotes(coordinates, major, 0, 6);
  const plan = buildPositionSequence(notes, 0);
  assert.equal(plan.notes[0].midi, Math.min(...notes.filter(n => n.pitchClass === 0).map(n => n.midi)));
  const pass = Array.from({ length: plan.oneShotLength }, (_, i) => playbackNoteAt(plan, i, false));
  assert.equal(Math.max(...pass.map(n => n.midi)), Math.max(...notes.map(n => n.midi)));
  assert.equal(pass.at(-1).midi, Math.min(...notes.map(n => n.midi)));
  assert.ok(pass.some(n => n.color === "gray" && n.midi < pass[0].midi));
  assert.equal(playbackNoteAt(plan, plan.oneShotLength, false), null);
  const looped = Array.from({ length: plan.notes.length * 3 }, (_, i) => playbackNoteAt(plan, i, true));
  assert.ok(looped.every((n, i) => i === 0 || n.midi !== looped[i - 1].midi));
  assert.equal(looped[plan.oneShotLength].midi, [...new Set(notes.map(n => n.midi))].sort((a,b) => a-b)[1]);
});
test("every key, position and bass fingering has the right pitch and playable sample", () => {
  for (const bass of [false, true]) for (let key = 0; key < 12; key++) for (const {id, fret} of positionSelectionTargets(key)) {
    const notes = getPositionNotes(coordinates, [0,1,2,3,3.1,4,5,6,6.1,7,8,8.1,9,10,11], key, id, fret, bass);
    assert.ok(notes.length);
    for (const note of notes) {
      assert.equal(note.pitchClass, normalizePitchClass(key + note.degree));
      assert.ok(note.sample >= 8 && note.sample <= 32);
      assert.equal(note.sample + 40 + 12 * Math.log2(note.playbackRate), note.midi);
      assert.ok(note.playbackRate >= 0.1 && note.playbackRate <= 2);
      assert.ok(note.stringIndex < (bass ? 4 : 6));
    }
    const plan = buildPositionSequence(notes, key);
    assert.equal(plan.notes[0].pitchClass, key);
    for (const note of plan.notes) assert.equal(notes.filter(n => n.location === note.location).length, 1);
  }
});
test("custom selections without a root fall back to the lowest note; unisons choose one location", () => {
  const notes = getPositionNotes(coordinates, [2, 6.1], 0, 0);
  const plan = buildPositionSequence(notes, 0);
  assert.equal(plan.notes[0].midi, Math.min(...notes.map(n => n.midi)));
  assert.equal(new Set(plan.notes.filter(n => n.midi === plan.notes[0].midi).map(n => n.location)).size, 1);
  assert.equal(playbackNoteAt(buildPositionSequence([]), 0, true), null);
  const single = buildPositionSequence([notes[0]], 0);
  assert.equal(playbackNoteAt(single, 100, true), notes[0]);
});
test("lowest-note option uses the full range immediately", () => {
  const notes = getPositionNotes(coordinates, major, 0, 6);
  const plan = buildPositionSequence(notes, 0, false);
  assert.equal(plan.notes[0].midi, Math.min(...notes.map(n => n.midi)));
});
test("overview suppresses notes without overriding the saved preference", () => {
  assert.deepEqual(practiceAudioMode({ notesEnabled:true, overview:true, accompaniment:'off' }), {notesEnabled:false, accompaniment:'metronome'});
  assert.deepEqual(practiceAudioMode({ notesEnabled:true, overview:false, accompaniment:'off' }), {notesEnabled:true, accompaniment:'off'});
  assert.deepEqual(practiceAudioMode({ notesEnabled:false, overview:false, accompaniment:'drums' }), {notesEnabled:false, accompaniment:'drums'});
});
