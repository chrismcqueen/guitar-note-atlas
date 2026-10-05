"""Generate tiny, dependency-free practice-groove samples."""

import math
import random
import struct
import wave
from pathlib import Path

RATE = 44100
OUTPUT = Path(__file__).parents[1] / "assets" / "audio" / "drums"
OUTPUT.mkdir(parents=True, exist_ok=True)
random.seed(7)


def write(name, duration, render):
    samples = []
    for index in range(int(RATE * duration)):
        time = index / RATE
        end_fade = min(1.0, (duration - time) / 0.006)
        samples.append(render(time, duration) * end_fade)
    peak = max(abs(sample) for sample in samples) or 1
    frames = [struct.pack("<h", int(max(-1, min(1, sample * 0.94 / peak)) * 32767)) for sample in samples]
    with wave.open(str(OUTPUT / name), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(b"".join(frames))


def kick_renderer():
    phase = 0

    def render(time, _duration):
        nonlocal phase
        frequency = 48 + (112 * math.exp(-34 * time))
        phase += 2 * math.pi * frequency / RATE
        body = math.sin(phase) * math.exp(-15 * time)
        beater = random.uniform(-1, 1) * math.exp(-115 * time) * 0.18
        return body + beater

    return render


def snare_renderer():
    low_passed_noise = 0
    shell_phase = 0

    def render(time, _duration):
        nonlocal low_passed_noise, shell_phase
        noise = random.uniform(-1, 1)
        low_passed_noise += 0.16 * (noise - low_passed_noise)
        bright_noise = noise - low_passed_noise
        noise_body = bright_noise * math.exp(-19 * time) * 0.58
        warm_noise = low_passed_noise * math.exp(-17 * time) * 0.20
        shell_frequency = 148 + (66 * math.exp(-28 * time))
        shell_phase += 2 * math.pi * shell_frequency / RATE
        shell_body = math.sin(shell_phase) * math.exp(-23 * time) * 0.43
        snap = random.uniform(-1, 1) * math.exp(-95 * time) * 0.13
        return noise_body + warm_noise + shell_body + snap

    return render


def hat_renderer():
    low_passed_noise = 0

    def render(time, _duration):
        nonlocal low_passed_noise
        noise = random.uniform(-1, 1)
        low_passed_noise += 0.08 * (noise - low_passed_noise)
        bright_noise = noise - low_passed_noise
        metallic = (
            math.sin(2 * math.pi * 5791 * time)
            + math.sin(2 * math.pi * 7483 * time + 0.7)
            + math.sin(2 * math.pi * 9311 * time + 1.4)
            + math.sin(2 * math.pi * 11257 * time + 2.1)
        ) / 4
        # Let the cymbal body decay naturally instead of collapsing into a
        # short click. Playback uses four independent hat voices, so this tail
        # may overlap later beats without either hit cutting the other off.
        attack = min(1.0, time / 0.0015)
        envelope = (0.82 * math.exp(-34 * time)) + (0.18 * math.exp(-11 * time))
        return attack * (bright_noise * 0.86 + metallic * 0.14) * envelope

    return render


write("kick.wav", 0.28, kick_renderer())
write("snare.wav", 0.30, snare_renderer())
write("hat.wav", 0.38, hat_renderer())
