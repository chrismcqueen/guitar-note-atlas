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

    def render(time, _duration):
        nonlocal low_passed_noise
        noise = random.uniform(-1, 1)
        low_passed_noise += 0.12 * (noise - low_passed_noise)
        bright_noise = noise - low_passed_noise
        noise_body = bright_noise * math.exp(-19 * time) * 0.82
        shell = math.sin(2 * math.pi * 188 * time) * math.exp(-27 * time) * 0.28
        snap = random.uniform(-1, 1) * math.exp(-75 * time) * 0.22
        return noise_body + shell + snap

    return render


def hat_renderer():
    low_passed_noise = 0

    def render(time, _duration):
        nonlocal low_passed_noise
        noise = random.uniform(-1, 1)
        low_passed_noise += 0.08 * (noise - low_passed_noise)
        bright_noise = noise - low_passed_noise
        metallic = (
            math.sin(2 * math.pi * 6410 * time)
            + math.sin(2 * math.pi * 8170 * time)
            + math.sin(2 * math.pi * 10310 * time)
        ) / 3
        return (bright_noise * 0.78 + metallic * 0.22) * math.exp(-58 * time)

    return render


write("kick.wav", 0.28, kick_renderer())
write("snare.wav", 0.22, snare_renderer())
write("hat.wav", 0.095, hat_renderer())
