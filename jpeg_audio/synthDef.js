

// Create and export your monosynth
export const monosynth = new Tone.MonoSynth({
    oscillator: {
        type: 'sawtooth', // Set oscillator type (e.g., 'sawtooth', 'square', 'triangle', 'sine')
    },
    envelope: {
    attack: 0.01, // Set attack time in seconds
    decay: 0.1, // Set decay time in seconds
    sustain: 0.7, // Set sustain level (between 0 and 1)
    release: 0.8, // Set release time in seconds
    },
    filter: {
    Q: 6, // Set filter Q value
    type: 'lowpass', // Set filter type (e.g., 'lowpass', 'highpass', 'bandpass', etc.)
    rolloff: -24, // Set filter rolloff in dB per octave (-12 or -24)
    frequency: 800, // Set filter frequency in Hz
    },
    filterEnvelope: {
    attack: 0.1, // Set filter envelope attack time in seconds
    decay: 0.5, // Set filter envelope decay time in seconds
    sustain: .5, // Set filter envelope sustain level (between 0 and 1)
    release: 2, // Set filter envelope release time in seconds
    baseFrequency: 200, // Set the base frequency for filter envelope modulation (adjust this for depth)
    },
    volume: -12
}).toDestination();

export const kick2 = new Tone.MembraneSynth({
    pitchDecay: 0.05, // Pitch decay time in seconds
    octaves: 10, // Octaves of the harmonics
    oscillator: {
        type: 'sine', // Oscillator type (e.g., 'sine', 'square', 'sawtooth', 'triangle')
    },
    envelope: {
        attack: 0.001, // Envelope attack time in seconds
        decay: 0.4, // Envelope decay time in seconds
        sustain: 0.01, // Envelope sustain level (between 0 and 1)
        release: 1.4, // Envelope release time in seconds
    },
    volume: -12
}).toDestination();

export const hihat = new Tone.NoiseSynth({
    noise: {
        type: 'white', // Type of noise (e.g., 'white', 'pink', 'brown')
        playbackRate: 1, // Playback rate of the noise source
      },
      envelope: {
        attack: 0.005, // Envelope attack time in seconds
        decay: 0.1, // Envelope decay time in seconds
        sustain: 0.3, // Envelope sustain level (between 0 and 1)
        release: 1, // Envelope release time in seconds
      },
      volume: -12
}).toDestination();

export const kick = new Tone.Player('https://raw.githubusercontent.com/Tonejs/Tone.js/dev/test/audio/kick.mp3');
const kickVolume = new Tone.Multiply(.5).toDestination()
kick.connect( kickVolume)