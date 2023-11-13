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

export const monosynth_options = {
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
}

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

export const hiHat = new Tone.MetalSynth({
  frequency: 200,
  envelope: {
      attack: 0.001,
      decay: 0.1,
      release: 0.01
  },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 4000,
  octaves: 1.5
})

  /**** SimpleSynth3  */
  export class SimpleSynth3 extends Tone.Synth {
    constructor(options = {}) {
      super(options = Object.assign({
        oscillator: {
          type: 'sawtooth'
        },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.1,
          release: 1
        },
        // This is the envelope that will control the filter frequency
        filterEnvelope: {
          baseFrequency: 200, // Starting frequency for the filter
          octaves: 2, // How many octaves the filter envelope will modulate
          attack: 0.02,
          decay: 0.1,
          sustain: 0.1,
          release: 0.7
        }
      }, options));
  
      // ... your oscillator and signal path setup as before
      // Disconnect the inherited oscillator to use a custom one
      this.oscillator.disconnect();
      this.envelope.disconnect()

      //this synths signal path
      this.vco = new Tone.Oscillator({
        type: 'sawtooth'
        //frequency: this.frequency.value // Use the frequency of the Synth
      }).start();
      this.vco2 = new Tone.Oscillator({
        type: 'sawtooth'
        //frequency: this.frequency.value // Use the frequency of the Synth
      }).start();
      this.vco2_ratio = new Tone.Multiply(1.99)
      this.filter = new Tone.Filter({ frequency: 1000 });
      this.vca = new Tone.Multiply()
      //envelopes
      this.env = new Tone.Envelope({
        attack: options.envelope.attack,
        decay: options.envelope.decay,
        sustain: options.envelope.sustain,
        release: options.envelope.release
      })
      this.filterEnv = new Tone.Envelope({
        attack: options.filterEnvelope.attack,
        decay: options.filterEnvelope.decay,
        sustain: options.filterEnvelope.sustain,
        release: options.filterEnvelope.release
      });
      this.filterEnvScale = new Tone.Scale(options.filterEnvelope.baseFrequency, 
        options.filterEnvelope.baseFrequency * Math.pow(2, options.filterEnvelope.octaves));
  

      //connections
      this.vco.connect(this.filter);
      this.vco2.connect(this.filter);
      this.env.connect( this.vca.factor )
      this.filter.connect( this.vca )
      this.vca.connect( this.output )
      this.filter.connect(this.envelope);
      this.frequency.connect( this.vco.frequency )
      this.frequency.connect( this.vco2_ratio )
      this.vco2_ratio.connect( this.vco2.frequency )
      this.filterEnv.connect(this.filterEnvScale);
      this.filterEnvScale.connect(this.filter.frequency);
    }
  
    // Override triggerAttack to include the filter envelope
    triggerAttack(note, time = Tone.now(), velocity = 1) {
      super.triggerAttack(note, time, velocity);
      this.env.triggerAttack(time);
      this.filterEnv.triggerAttack(time);
    }
  
    // Override triggerRelease to include the filter envelope
    triggerRelease(time = Tone.now()) {
      super.triggerRelease(time);
      this.env.triggerRelease(time);
      this.filterEnv.triggerRelease(time);
    }
  } //simplesynth3
  