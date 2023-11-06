



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

// export class CustomMonoSynth extends Tone.Monophonic {
//     constructor(options) {
//       super(options);
//       this.oscillator = new Tone.Oscillator().start();
//       this.envelope = new Tone.Envelope();
//       this.oscillator.connect(this.envelope);
//       this.envelope.toDestination();
//     }
  
//     _triggerEnvelopeAttack(time, velocity) {
//       // Start the envelope with the specified velocity and time
//       this.envelope.triggerAttack(time, velocity);
//     }
  
//     _triggerEnvelopeRelease(time) {
//       // Release the envelope at the specified time
//       this.envelope.triggerRelease(time);
//     }
  
//     dispose() {
//       super.dispose();
//       this.oscillator.dispose();
//       this.envelope.dispose();
//     }
//   }
  
  // Define the synthesizer to be used with Tone.PolySynth
//   const polySynth = new Tone.PolySynth(Tone.context, {
//     voice: CustomMonoSynth,
//   });
  
  /*********** CUSTOM POLY SYNTH
   * 
   */
  export class CustomPolySynth {
    constructor(instrumentClass, polyphony = 16, options) {
      this.instrumentClass = instrumentClass;
      this.polyphony = polyphony;
      this.voices = [];
      this.activeVoices = {};
      this.output = new Tone.Signal()
  
      // Initialize the pool of voices (synth instances).
      for (let i = 0; i < this.polyphony; i++) {
        this.voices.push(new this.instrumentClass(options));
        this.voices[i].vca.connect( this.output )
      }

      
    }
  
    _findAvailableVoice() {
      //console.log("Checking for available voice...");
      let oldestVoice = null;
      let oldestTime = Infinity;
      
      for (let i = 0; i < this.voices.length; i++) {
        const voice = this.voices[i];
        //console.log(`Voice ${i} is active: ${this.voices[i].isActive}`);
        if (!voice.isActive) {
          
          //console.log('Available voice found:', voice);
          return voice;
        } else {
          // Track the oldest voice in case all are active
          if (voice.lastUsed < oldestTime) {
            oldestVoice = voice;
            oldestTime = voice.lastUsed;
          }
        }
      }
    
      //console.log("No inactive voices. Reallocating the oldest voice:", oldestVoice);
      return oldestVoice;
    }
    
    triggerAttack(note, time = Tone.now(), velocity = 1) {
      //console.log('at', note, time)
      const availableVoice = this._findAvailableVoice();
      availableVoice.lastUsed = time; // Set the time the voice was last used
      availableVoice.triggerAttack(note, time, velocity);
      this.activeVoices[note] = availableVoice;
    }
    
    triggerRelease(note, time = Tone.now()) {
      //console.log('re', note, time)
      if (this.activeVoices[note]) {
        this.activeVoices[note].triggerRelease(time);
        delete this.activeVoices[note];
      }
    }
  
    triggerAttackRelease(note, duration, time = Tone.now(), velocity = 1) {
      this.triggerAttack(note, time, velocity);
      // Calculate release time based on duration and current time
      const releaseTime = time + Tone.Time(duration).toSeconds();
      this.triggerRelease(note, releaseTime);
    }
  
    dispose() {
      this.voices.forEach(voice => voice.dispose());
      this.voices = [];
      this.activeVoices = {};
    }

    connect(destination){
      this.output.connect( destination )
    }
  }

   /*********** CUSTOM POLY SYNTH 2
   * finds next voice after triggering a note
   * attempting to minimize timing problems
   */
  
  export class CustomPolySynth2 {
    constructor(instrumentClass, polyphony = 16, options) {
      this.instrumentClass = instrumentClass;
      this.polyphony = polyphony;
      this.voices = [];
      this.activeVoices = {};
      this.output = new Tone.Signal()
      this.nextVoice
  
      // Initialize the pool of voices (synth instances).
      for (let i = 0; i < this.polyphony; i++) {
        this.voices.push(new this.instrumentClass(options));
        this.voices[i].vca.connect( this.output )
      }

      
    }
  
    _findAvailableVoice() {
      //console.log("Checking for available voice...");
      let oldestVoice = null;
      let oldestTime = Infinity;
      
      for (let i = 0; i < this.voices.length; i++) {
        const voice = this.voices[i];
        //console.log(`Voice ${i} is active: ${this.voices[i].isActive}`);
        if (!voice.isActive) {
          
          //console.log('Available voice found:', voice);
          this.nextVoice = voice
          return voice;
        } else {
          // Track the oldest voice in case all are active
          if (voice.lastUsed < oldestTime) {
            oldestVoice = voice;
            oldestTime = voice.lastUsed;
          }
        }
      }
    
      //console.log("No inactive voices. Reallocating the oldest voice:", oldestVoice);
      this.nextVoice = oldestVoice
      return oldestVoice;
    }
    
    triggerAttack(note, time = Tone.now(), velocity = 1) {
      //console.log('at', note, time)
      //const availableVoice = this._findAvailableVoice();
      this.nextVoice.lastUsed = time; // Set the time the voice was last used
      this.nextVoice.triggerAttack(note, time, velocity);
      this.activeVoices[note] = this.nextVoice;
      this._findAvailableVoice();
    }
    
    triggerRelease(note, time = Tone.now()) {
      //console.log('re', note, time)
      if (this.activeVoices[note]) {
        this.activeVoices[note].triggerRelease(time);
        delete this.activeVoices[note];
      }
    }
  
    triggerAttackRelease(note, duration, time = Tone.now(), velocity = 1) {
      this.triggerAttack(note, time, velocity);
      // Calculate release time based on duration and current time
      const releaseTime = time + Tone.Time(duration).toSeconds();
      this.triggerRelease(note, releaseTime);
    }
  
    dispose() {
      this.voices.forEach(voice => voice.dispose());
      this.voices = [];
      this.activeVoices = {};
    }

    connect(destination){
      this.output.connect( destination )
    }
  }
  

  export class MySynth {
    constructor() {
        this.vco = new Tone.Oscillator({type:'sawtooth'}).start()
        //   this.oscillator.type = 'sawtooth';
        this.frequency = new Tone.Signal(100)
      
        // Setting up the custom signal path
        this.vcf = new Tone.Filter();
        this.vca = new Tone.Multiply();
        this.env = new Tone.Envelope();
        this.vcf_env_depth = new Tone.Multiply(1000)
        this.cutoff = new Tone.Signal(100)
        this.env.attack = .005
        this.env.decay = .3
        this.env.sustain = 1
        this.env.release = .2
    
        // Connect the oscillator to the filter, then to the VCA
        this.frequency.connect( this.vco.frequency )
        this.vco.connect(this.vcf);
        this.vcf.connect(this.vca);
        this.cutoff.connect( this.vcf.frequency )
        this.env.connect(this.vca.factor);
        this.env.connect( this.vcf_env_depth)
        this.vcf_env_depth.connect( this.vcf.frequency )
    
        this.output = this.vca;
        this.isActive = false; // Track if the synth is currently active
    }
  
    // Override the triggerAttack method to include our custom functionality
    triggerAttack(note, time = Tone.now(), velocity = 1) {
      this.frequency.value = note
      this.env.triggerAttack(time, velocity);
      this.isActive = true; // Set the voice as active
      //console.log('att', this.isActive, this.frequency.value)
    }
  
    // Override the triggerRelease method to include our custom functionality
    triggerRelease(time = Tone.now()) {
      this.env.triggerRelease(time);
      setTimeout(() => this.isActive = false, this.env.release * 1000);
      //this.isActive = false; // Set the voice as inactive
      //console.log('rel', this.isActive)
    }

    triggerAttackRelease(note, duration, time = Tone.now(), velocity = 1) {
        this.triggerAttack(note, time, velocity);
        // Calculate release time based on duration and current time
        const releaseTime = time + Tone.Time(duration).toSeconds();
        this.triggerRelease(releaseTime);
    }
  }
  

  /******** SimpleSynth2 */
  export class SimpleSynth2 extends Tone.Synth {
    constructor(options = {}) {
      super(Object.assign({
        oscillator: {
          type: 'sawtooth'
        },
        envelope: {
          attack: 0.1,
          decay: 0.1,
          sustain: 0.1,
          release: 0.5
        }
      }, options));
  
      // Disconnect the inherited oscillator to use a custom one
      this.oscillator.disconnect();
      this.vco = new Tone.Oscillator({
        type: 'sawtooth'
        //frequency: this.frequency.value // Use the frequency of the Synth
      }).start();
      this.vco2 = new Tone.Oscillator({
        type: 'sawtooth'
        //frequency: this.frequency.value // Use the frequency of the Synth
      }).start();
      this.vco2_ratio = new Tone.Multiply(1.99)
  
      // Use the predefined filter and envelope from Tone.Synth
      this.filter = new Tone.Filter({ frequency: 1000 });
      this.vco.connect(this.filter);
      this.vco2.connect(this.filter);
  
      this.filter.connect(this.envelope);
      this.envelope.connect(this.output);
      this.frequency.connect( this.vco.frequency )
      this.frequency.connect( this.vco2_ratio )
      this.vco2_ratio.connect( this.vco2.frequency )
    }
  
    // Make sure to use the predefined methods for envelope triggering
    // triggerAttack(note, time, velocity) {
    //   //console.log(note, time, this.frequency.get())
    //   //this.frequency.setValueAtTime(note, time);
    //   super.triggerAttack(time, velocity);
    // }
  
    // triggerRelease(note, time) {
    //   super.triggerRelease(time);
    // }
  }
  
  

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
  