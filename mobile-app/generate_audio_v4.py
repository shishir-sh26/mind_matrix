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
        samples = render_func(n_samples, sample_rate, duration)
        
        fade_len = int(sample_rate * 0.1)
        for i in range(fade_len):
            fade_in = i / fade_len
            fade_out = 1.0 - fade_in
            if num_channels == 1:
                samples[i] = samples[i] * fade_in + samples[n_samples - fade_len + i] * fade_out
            else:
                samples[i][0] = samples[i][0] * fade_in + samples[n_samples - fade_len + i][0] * fade_out
                samples[i][1] = samples[i][1] * fade_in + samples[n_samples - fade_len + i][1] * fade_out
                
        if num_channels == 1:
            for i in range(n_samples):
                s = max(-32768, min(32767, int(samples[i] * 32767.0)))
                f.write(struct.pack('<h', s))
        else:
            for i in range(n_samples):
                sl = max(-32768, min(32767, int(samples[i][0] * 32767.0)))
                sr = max(-32768, min(32767, int(samples[i][1] * 32767.0)))
                f.write(struct.pack('<hh', sl, sr))

class LowPass:
    def __init__(self, start_z=0):
        self.z = start_z
    def process(self, x, c):
        self.z += c * (x - self.z)
        return self.z

# CALM: Warm Ambient Pad (C Maj 7)
def calm_render(n_samples, sr, dur):
    out = [0.0]*n_samples
    notes = [130.81, 164.81, 196.00, 246.94] # C3, E3, G3, B3
    for i in range(n_samples):
        t = i / sr
        s = 0.0
        for idx, f in enumerate(notes):
            # Slow LFO on amplitude for each note
            lfo = math.sin(t * math.pi * 2 * (0.1 + idx*0.02)) * 0.5 + 0.5
            s += math.sin(t * math.pi * 2 * f) * (0.3 + lfo * 0.7) * 0.2
        out[i] = s * 0.8
    return out

# BREATHE: Filtered Brown-ish noise for wind/ocean breath
def breathe_render(n_samples, sr, dur):
    out = [0.0]*n_samples
    lp = LowPass()
    for i in range(n_samples):
        t = i / sr
        white = random.random()*2 - 1
        
        # 4 sec in, 6 sec out
        cycle = t % dur
        if cycle < 4.0:
            env = cycle / 4.0 # 0 to 1
        else:
            env = 1.0 - ((cycle - 4.0) / 6.0) # 1 to 0
        
        # Smooth envelope
        smooth_env = (math.cos(math.pi * (env + 1)) + 1) * 0.5
        
        # Filter opens up during inhale, closes during exhale
        cutoff = 0.005 + smooth_env * 0.05
        brown = lp.process(white, cutoff)
        
        # Mix with a very deep sub bass to anchor it (100 Hz)
        sub = math.sin(t * math.pi * 2 * 100.0) * smooth_env * 0.1
        
        out[i] = (brown * 3.0 + sub) * (0.2 + smooth_env * 0.8) * 0.8
    return out

# FOCUS: Steady ambient pulse (Binaural Beats + rhythmic clicking drone)
def focus_render(n_samples, sr, dur):
    out = [[0.0, 0.0] for _ in range(n_samples)]
    # Carrier frequency 220Hz (A3), Binaural beat 14Hz (High Alpha / Low Beta for focus)
    f_left = 220.0 - 7.0
    f_right = 220.0 + 7.0
    
    for i in range(n_samples):
        t = i / sr
        
        # Binaural drones
        left = math.sin(t * math.pi * 2 * f_left) * 0.3
        right = math.sin(t * math.pi * 2 * f_right) * 0.3
        
        # Fast 16th note 'tick' pulse or soft arp pattern to keep brain engaged
        # 120 beats per minute -> 2 beats per second -> 8 eighth notes or 16 sixteenths
        pulse_period = 0.125 # 8 Hz (8 ticks per second)
        in_pulse = (t % pulse_period) / pulse_period
        tick_env = math.exp(-in_pulse * 15.0) # sharp decay
        
        tick_osc = math.sin(t * math.pi * 2 * 880.0) * tick_env * 0.05
        
        out[i][0] = left + tick_osc
        out[i][1] = right + tick_osc
    return out

os.makedirs('assets/sounds', exist_ok=True)
print("Generating new CALM (10s)...")
generate_wav('assets/sounds/calm.wav', 10.0, 1, calm_render)
print("Generating new BREATHE (10s)...")
generate_wav('assets/sounds/breathe.wav', 10.0, 1, breathe_render)
print("Generating new FOCUS (10s)...")
generate_wav('assets/sounds/focus.wav', 10.0, 2, focus_render)
print("New Sounds successfully generated and updated!")
