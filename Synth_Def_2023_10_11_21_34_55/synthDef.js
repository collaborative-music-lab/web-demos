//const synth = new Tone.MonoSynth().toDestination();

// // Create a feedback delay effect
// const feedbackDelay = new Tone.FeedbackDelay('16nd', 0.5).toDestination();
// // Connect the synth to the delay effect
// synth.connect(feedbackDelay);
// feedbackDelay.wet.value = .3
// feedbackDelay.delayTime.value = '4n'


// class MonoSubtractiveSynth extends Tone.Synth {
//     constructor() {
//         super({
//             oscillator: {
//                 type: 'sawtooth'
//             },
//             envelope: {
//                 attack: 0.5,
//                 decay: 0.2,
//                 sustain: 0.3,
//                 release: 1
//             }
//         });

//         this.filter = new Tone.Filter({
//             type: 'lowpass',
//             frequency: 800,
//             rolloff: -24,
//             Q: 1.4,
//             gain: 0
//         });

//         this.filterEnvelope = new Tone.Envelope({
//             attack: 0.6,
//             decay: 0.2,
//             sustain: 0.5,
//             release: 2
//         });

//         // Modify the signal chain
//         // Disconnect the default connection from oscillator to output
//         this.oscillator.disconnect();
//         // Then set up the custom chain
//         this.oscillator.chain(this.filter, this.output);

//         // Connect the filter envelope to modulate the filter's frequency
//         this.filterEnvelope.connect(this.filter.frequency);
//     }
// }

// Create a polyphonic subtractive synthesizer
// const synth = new Tone.PolySynth({
//     voice: MonoSubtractiveSynth,
//     maxPolyphony: 4  // Adjust the maximum number of voices based on your requirements
// }).toDestination();

// const synth = new Tone.PolySynth(Tone.Synth).toDestination();

//const synth = new Tone.PolySynth(MonoSubtractiveSynth).toDestination();

// Play some notes
//polySynth.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '4n');


class MonoSubtractiveSynth extends Tone.Synth {
    constructor() {
        super({
            oscillator: {
                type: 'square'
            }
        });
      
            this.filter = new Tone.Filter({
            type: 'lowpass',
            frequency: 800,
            rolloff: -24,
            Q: 1.4,
            gain: 0
        });
      
        this.filterEnvelope = new Tone.Envelope({
            attack: 0.01,
            decay: 0.2,
            sustain: 1,
            release: 1
        });
      
      this.filterEnvDepth = new Tone.Multiply(2000)
      
     // this.cutoff = new Tone.Signal(100)
     // this.cutoff.connect( this.filter.frequency )
      
        // Modify the signal chain
        // Disconnect the default connection from oscillator to output
        this.oscillator.disconnect();
        // Then set up the custom chain
        this.oscillator.chain(this.filter, this.output);
      
         // Connect the filter envelope to modulate the filter's frequency
        // this.filterEnvelope.connect(this.filterEnvDepth )
        //this.filterEnvDepth.connect(this.filter.frequency);
      
    }
  
      // Override the triggerAttack method to include the filterEnvelope
    triggerAttack(time, velocity) {
        super.triggerAttack();
        this.filterEnvelope.triggerAttack();
        return this; // To support method chaining
    }

    // Override the triggerRelease method to include the filterEnvelope
    triggerRelease(time) {
        super.triggerRelease();
        this.filterEnvelope.triggerRelease();
        return this; // To support method chaining
    }
}

const synth = new Tone.PolySynth({
    voice: MonoSubtractiveSynth,
    maxPolyphony: 4
}).toDestination();
