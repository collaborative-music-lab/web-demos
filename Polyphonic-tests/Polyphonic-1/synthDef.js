export class SimpleSynth extends Tone.Synth {
    constructor(options = {}) {
      super(options);
  
      // Disconnecting the inherited oscillator and setting custom properties
      //this.oscillator.disconnect();
      this.vco = new Tone.Oscillator({type:'sawtooth'}).start()
    //   this.oscillator.type = 'sawtooth';
      this.vco.frequency.value = 100;
  
      // Setting up the custom signal path
      this.filter = new Tone.Filter({ frequency: 1000 });
      this.vca = new Tone.Multiply();
      this.env = new Tone.Envelope();
      this.env.attack = .1
      this.env.decay = .1
      this.env.sustain = .1
      this.env.release = .5
  
      // Connect the oscillator to the filter, then to the VCA
      this.vco.connect(this.filter);
      this.filter.connect(this.vca);
      this.env.connect(this.vca.factor);

      //connect the default frequency Tone.Signal() object to set 
      //the frequency of all oscillators
      this.frequency.connect( this.vco.frequency )
  
      this.output = this.vca;
    }
  
    // The method to start the note (attack phase)
    _triggerEnvelopeAttack(time, velocity) {
      //this.vco.frequency.setValueAtTime(note, time);
      //this.env.triggerAttack(time, velocity);
      //this.envelope.triggerAttack(time, velocity);
      console.log('attack')
    }
  
    // The method to end the note (release phase)
    _triggerEnvelopeRelease(time) {
      //this.env.triggerRelease(time);
      //this.envelope.triggerRelease(time);
      console.log('release')
    }
  }

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
  
    // Function to find an available voice or the oldest voice if all are active
    _findAvailableVoice() {
      for (let voice of this.voices) {
        if (!voice.isActive) {
          return voice;
        }
      }
      // If no inactive voices, use the oldest active voice
      return this.voices.shift();
    }
  
    triggerAttack(note, time = Tone.now(), velocity = 1) {
      const availableVoice = this._findAvailableVoice();
      availableVoice.triggerAttack(note, time, velocity);
      this.activeVoices[note] = availableVoice;
      availableVoice.isActive = true;
    }
  
    triggerRelease(note, time = Tone.now()) {
      if (this.activeVoices[note]) {
        this.activeVoices[note].triggerRelease(time);
        this.activeVoices[note].isActive = false;
        this.voices.push(this.activeVoices[note]); // Put back into the pool
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
        this.env.attack = .1
        this.env.decay = .1
        this.env.sustain = .1
        this.env.release = .5
    
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
      let freq = Tone.Midi(note).toFrequency()
      this.frequency.value = freq
      this.env.triggerAttack(note, time, velocity);
      this.isActive = true; // Set the voice as active
      console.log(this.frequency.value)
    }
  
    // Override the triggerRelease method to include our custom functionality
    triggerRelease(time = Tone.now()) {
      this.env.triggerRelease(time);
      this.isActive = false; // Set the voice as inactive
    }

    triggerAttackRelease(note, duration, time = Tone.now(), velocity = 1) {
        console.log(note, duration,time )
        this.triggerAttack(note, time, velocity);
        // Calculate release time based on duration and current time
        const releaseTime = time + Tone.Time(duration).toSeconds();
        this.triggerRelease(note, releaseTime);
    }
  }
  