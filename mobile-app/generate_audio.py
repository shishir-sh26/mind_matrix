import math
import struct
import random

def generate_wav(filename, duration, func):
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    # create wav header
    header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF', 36 + n_samples * 2, b'WAVE', b'fmt ', 16, 1, 1, sample_rate,
        sample_rate * 2, 2, 16, b'data', n_samples * 2)
    with open(filename, 'wb') as f:
        f.write(header)
        for i in range(n_samples):
            t = i / float(sample_rate)
            sample = max(-32768, min(32767, int(func(t) * 32767.0)))
            f.write(struct.pack('<h', sample))

# 1. Calm: Soft filtered noise simulation (gentle wind)
def calm_func(t):
    # Simulate gentle rumbling/wind
    return (random.random() * 2 - 1) * 0.1 * (math.sin(t * 2 * math.pi * 0.5) * 0.5 + 0.5)

# 2. Breathe: Deep drone (sine at 130Hz mixed with 132Hz for slow pulse)
def breathe_func(t):
    return (math.sin(t * 2 * math.pi * 130) + math.sin(t * 2 * math.pi * 132)) * 0.2

# 3. Focus: Alpha binaural beat base (200Hz + 210Hz)
def focus_func(t):
    return (math.sin(t * 2 * math.pi * 200) + math.sin(t * 2 * math.pi * 210)) * 0.15

# 4. Release: Sweeping sine
def release_func(t):
    freq = 150 + math.sin(t * 2 * math.pi * 0.2) * 50
    return math.sin(t * 2 * math.pi * freq) * 0.15

import os
os.makedirs('assets/sounds', exist_ok=True)
generate_wav('assets/sounds/calm.wav', 2.0, calm_func) # 2 sec loop
generate_wav('assets/sounds/breathe.wav', 2.0, breathe_func)
generate_wav('assets/sounds/focus.wav', 2.0, focus_func)
generate_wav('assets/sounds/release.wav', 5.0, release_func)
print("Sounds generated!")
