import math
import struct
import random
import os

def generate_wav(filename, duration, func, num_channels=1):
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    # create wav header
    header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF', 36 + n_samples * 2 * num_channels, b'WAVE', b'fmt ', 16, 1, num_channels, sample_rate,
        sample_rate * 2 * num_channels, 2 * num_channels, 16, b'data', n_samples * 2 * num_channels)
    with open(filename, 'wb') as f:
        f.write(header)
        for i in range(n_samples):
            t = i / float(sample_rate)
            if num_channels == 1:
                sample = max(-32768, min(32767, int(func(t) * 32767.0)))
                f.write(struct.pack('<h', sample))
            else:
                left, right = func(t)
                sl = max(-32768, min(32767, int(left * 32767.0)))
                sr = max(-32768, min(32767, int(right * 32767.0)))
                f.write(struct.pack('<hh', sl, sr))

# CALM: Soft, gentle wind breeze (low frequency noise).
# We use simple filtered random variations
def calm_func(t):
    noise1 = (random.random() * 2 - 1)
    noise2 = (random.random() * 2 - 1)
    # Slow LFO for wind sweeping effect
    lfo = (math.sin(t * 2 * math.pi * 0.15) * 0.5 + 0.5) 
    # Mute the highs by stacking noise
    wind = (noise1 + noise2) * 0.5 * lfo * 0.15
    return wind

# BREATHE: Deep drone sine waves for meditative pacing.
def breathe_func(t):
    # Base drone at 108Hz (Meditative frequency)
    # Beating frequency at 110Hz
    # Higher harmonic at 216Hz to add richness
    s1 = math.sin(t * 2 * math.pi * 108) * 0.4
    s2 = math.sin(t * 2 * math.pi * 110.5) * 0.4
    s3 = math.sin(t * 2 * math.pi * 216) * 0.1
    # Very slow pacing LFO (10 seconds cycle: 5 in, 5 out)
    pace = (math.sin(t * 2 * math.pi * 0.1) * 0.5 + 0.5)
    return (s1 + s2 + s3) * (0.3 + 0.7 * pace) * 0.6

# FOCUS: Alpha-wave binaural beat to block distractions.
# 200 Hz carrier, 10Hz Alpha beat (R: 205Hz, L: 195Hz)
def focus_func(t):
    # Left channel
    left = math.sin(t * 2 * math.pi * 195) * 0.5
    # Right channel
    right = math.sin(t * 2 * math.pi * 205) * 0.5
    return (left, right)

# RELEASE: Higher frequency sweeping waves simulating ocean flow.
def release_func(t):
    # pink-ish noise by summing octaves of random (naive approximation)
    n = sum((random.random() * 2 - 1) * (0.5 ** i) for i in range(1, 4))
    # Wave crashing sweep LFO (about 6 seconds)
    sweep = (math.sin(t * 2 * math.pi * 0.16) * 0.5 + 0.5) ** 2
    # Add a continuous low roar
    roar = (random.random() * 2 - 1) * 0.05
    ocean = (n * sweep * 0.2) + roar
    return ocean

os.makedirs('assets/sounds', exist_ok=True)
print("Generating CALM...")
generate_wav('assets/sounds/calm.wav', 6.66, calm_func, num_channels=1) 
print("Generating BREATHE...")
generate_wav('assets/sounds/breathe.wav', 10.0, breathe_func, num_channels=1)
print("Generating FOCUS...")
generate_wav('assets/sounds/focus.wav', 2.0, focus_func, num_channels=2)
print("Generating RELEASE...")
generate_wav('assets/sounds/release.wav', 6.25, release_func, num_channels=1)
print("Sounds successfully generated and updated!")
