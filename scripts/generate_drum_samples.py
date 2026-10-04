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
    frames = []
    for index in range(int(RATE * duration)):
        time = index / RATE
        value = max(-1.0, min(1.0, render(time, duration)))
        frames.append(struct.pack("<h", int(value * 32767)))
    with wave.open(str(OUTPUT / name), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(b"".join(frames))


write(
    "kick.wav",
    0.22,
    lambda t, d: math.sin(2 * math.pi * (92 - 55 * (t / d)) * t) * math.exp(-19 * t),
)
write(
    "snare.wav",
    0.16,
    lambda t, _d: (random.uniform(-1, 1) * 0.72 + math.sin(2 * math.pi * 185 * t) * 0.28)
    * math.exp(-27 * t),
)
write(
    "hat.wav",
    0.075,
    lambda t, _d: random.uniform(-1, 1) * math.exp(-65 * t) * (1 if int(t * RATE) % 2 else -1),
)
