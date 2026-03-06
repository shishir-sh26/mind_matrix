import math
import struct
import random
import os

def generate_wav(filename, duration, num_channels, render_func):
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF', 36 + n_samples * 2 * num_channels, b'WAVE', b'fmt ', 16, 1, num_channels, sample_rate,
        sample_rate * 2 * num_channels, 2 * num_channels, 16, b'data', n_samples * 2 * num_channels)
    
    with open(filename, 'wb') as f:
        f.write(header)
        # Precompute the entire buffer for speed
        samples = render_func(n_samples, sample_rate, duration)
        
        # Apply gentle cross-fade to make it seamlessly loopable
        fade_len = int(sample_rate * 0.1)  # 100ms fade
        for i in range(fade_len):
            fade_in = i / fade_len
            fade_out = 1.0 - fade_in
            if num_channels == 1:
                # Wrap start/end
                samples[i] = samples[i] * fade_in + samples[n_samples - fade_len + i] * fade_out
            else:
                samples[i][0] = samples[i][0] * fade_in + samples[n_samples - fade_len + i][0] * fade_out
                samples[i][1] = samples[i][1] * fade_in + samples[n_samples - fade_len + i][1] * fade_out
                
        # Write bytes
        if num_channels == 1:
            for i in range(n_samples):
                s = max(-32768, min(32767, int(samples[i] * 32767.0)))
                f.write(struct.pack('<h', s))
        else:
            for i in range(n_samples):
                sl = max(-32768, min(32767, int(samples[i][0] * 32767.0)))
                sr = max(-32768, min(32767, int(samples[i][1] * 32767.0)))
                f.write(struct.pack('<hh', sl, sr))

# Simple 1-pole lowpass filter
class LowPass:
    def __init__(self, start_z=0):
        self.z = start_z
    def process(self, x, c):
        self.z += c * (x - self.z)
        return self.z

def calm_render(n_samples, sr, dur):
    out = [0.0]*n_samples
    lp = LowPass()
    for i in range(n_samples):
        t = i / sr
        white = random.random()*2 - 1
        # LFO between 0.05 and 0.15 for cutoff (slow wash)
        cutoff = 0.02 + (math.sin(t * math.pi * 2 / 8.0) * 0.5 + 0.5) * 0.03
        pinker = lp.process(white, cutoff)
        # gentle amplitude envelope
        amp = 0.6 + (math.sin(t * math.pi * 2 / 12.0) * 0.5 + 0.5) * 0.4
        out[i] = pinker * amp * 3.5  # Boost output as LP lowers gain
    return out

def breathe_render(n_samples, sr, dur):
    out = [0.0]*n_samples
    # Rich drone drone at 174 Hz (Solfeggio frequency for pain relief/calm)
    # with 5ths and octaves
    freqs = [174.0, 174.5, 173.5, 174.0 * 1.5, 174.0 * 2, 87.0]
    amps = [0.4, 0.3, 0.3, 0.25, 0.15, 0.5]
    for i in range(n_samples):
        t = i / sr
        s = 0.0
        for f, a in zip(freqs, amps):
            s += math.sin(t * math.pi * 2 * f) * a
        # Breathing envelope (4 sec in, 6 sec out)
        cycle = t % 10.0
        if cycle < 4.0:
            env = cycle / 4.0
        else:
            env = 1.0 - ((cycle - 4.0) / 6.0)
        # Smoother shape
        env = (math.cos(math.pi * (env + 1)) + 1) * 0.5
        out[i] = s * (0.3 + env * 0.7) * 0.3
    return out

def focus_render(n_samples, sr, dur):
    out = [[0.0, 0.0] for _ in range(n_samples)]
    # Ethereal singing bowls / bells (FM synthesis)
    # Pentatonic scale (E3, G3, A3, C4, D4, E4)
    freqs = [164.81]*2 + [196.00, 220.00, 261.63, 293.66, 329.63]
    delays_l = [0.0]*int(sr * 0.7)
    delays_r = [0.0]*int(sr * 0.9)
    delay_idx_l = 0
    delay_idx_r = 0
    
    events = [ (random.random()*dur, random.choice(freqs)) for _ in range(8) ]
    for i in range(n_samples):
        t = i / sr
        signal = 0.0
        
        # Trigger bells
        for et, ef in events:
            if t > et and t < et + 3.0:
                dt = t - et
                # FM envelope
                env = math.exp(-dt * 2.0)
                mod = math.sin(dt * math.pi * 2 * ef * 1.5) * env * 2.0
                signal += math.sin(dt * math.pi * 2 * ef + mod) * env * 0.3
                
        # Ping pong delay
        out_l = signal + delays_r[delay_idx_r] * 0.6
        out_r = signal + delays_l[delay_idx_l] * 0.6
        
        delays_l[delay_idx_l] = out_l
        delays_r[delay_idx_r] = out_r
        
        delay_idx_l = (delay_idx_l + 1) % len(delays_l)
        delay_idx_r = (delay_idx_r + 1) % len(delays_r)
        
        # Add a soft drone
        drone = math.sin(t * math.pi * 2 * 110.0) * 0.05
        
        out[i][0] = out_l * 0.5 + drone
        out[i][1] = out_r * 0.5 + drone
    return out

def release_render(n_samples, sr, dur):
    out = [0.0]*n_samples
    # Massive lush pad
    # 10 detuned saw waves at Cmaj9 (C3, E3, G3, B3, D4)
    notes = [130.81, 164.81, 196.00, 246.94, 293.66]
    phases = [0.0] * (len(notes) * 2)
    lp = LowPass()
    
    for i in range(n_samples):
        t = i / sr
        s = 0.0
        idx = 0
        for base_f in notes:
            for detune in [-1.5, 1.5]: # hz
                f = base_f + detune
                phases[idx] += f / sr
                if phases[idx] > 1.0: phases[idx] -= 1.0
                s += (phases[idx] * 2.0 - 1.0) # saw wave
                idx += 1
                
        # Sweeping lowpass filter
        cutoff = 0.05 + (math.sin(t * math.pi * 2 / dur) * 0.5 + 0.5) * 0.15
        filtered = lp.process(s, cutoff)
        
        out[i] = filtered * 0.15
    return out

os.makedirs('assets/sounds', exist_ok=True)
print("Generating CALM (12s)...")
generate_wav('assets/sounds/calm.wav', 12.0, 1, calm_render)
print("Generating BREATHE (10s)...")
generate_wav('assets/sounds/breathe.wav', 10.0, 1, breathe_render)
print("Generating FOCUS (12s)...")
generate_wav('assets/sounds/focus.wav', 12.0, 2, focus_render)
print("Generating RELEASE (12s)...")
generate_wav('assets/sounds/release.wav', 12.0, 1, release_render)
print("Beautiful Sounds successfully generated!")
