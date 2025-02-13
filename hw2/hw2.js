
var modulatorFreq;
var modulationIndex;


document.addEventListener("DOMContentLoaded", function(event) {
    const waveformOptions = document.getElementById("waveform")
    const chordsOptions = document.getElementById("chords")
    const synthesisOptions = document.getElementById("synthesis")
    const lfoOptions = document.getElementById("lfo")
    var waveform ="sine"
    var chords = 0
    var synthesis = "none"
    var lfoChoice = 0

    waveformOptions.addEventListener("change", function (event) {
        waveform = event.target.value
    });

    chordsOptions.addEventListener("change", function(event){
        chords = event.target.value
    });

    synthesisOptions.addEventListener("change", function (event){
        synthesis = event.target.value
    });

    lfoOptions.addEventListener("change",function(event){
        lfoChoice = event.target.value;
    });

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.6, audioCtx.currentTime)
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    const chordFrequencyMap = {
        '90': [90,67,66],  //Z - C
        '83': [83, 71,72], //S - C#
        '88': [88,71,78],  //X - D
        '68': [68,72,71], //D - D#
        '67': [67,72,77],  //C - Es
        '86': [86,74,87],  //V - F
        '71': [71,74,50], //G - F#
        '66': [66,77,87],  //B - G
        '72': [72,81,51], //H - G#
        '78': [78,88,71],  //N - A
        '74': [74, 86,87], //J - A#
        '77': [77,67,72],  //M - B
        '81': [81, 72,51],  //Q - C
        '50': [50,71,74], //2 - C#
        '87': [87,86,74],  //W - D
        '51': [51,72,81], //3 - D#
        '69': [69,54,85],  //E - E
        '82': [82,87,55],  //R - F
        '53': [53,50,55], //5 - F#
        '84': [84,87,85],  //T - G
        '54': [54,69,85], //6 - G#
        '89': [89,87,53],  //Y - A
        '55': [55,53,50], //7 - A#
        '85': [85,84,87],  //U - B
    }

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    var activeOscillators = {};
    var activeGainNodes = {};

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            if(chords==1){
                playChords(key);
            }
            else if(synthesis=="none"){
                playNote(key);
            }
            else if(synthesis=="additive"){
                initAdditive(key);
            }
            else if(synthesis=="AM"){
                initAM(key);
            }
            else if(synthesis=="FM"){
                initFM(key);
            }
            else if(synthesis=="additiveAM"){
                combo(key);
            }
        }
    }

    function keyUp(event) { // cancelScheduledValues
        const key = (event.detail || event.which).toString();

        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            // release
            if(chords==1){
                const keys = chordFrequencyMap[key]

                for(const k of keys){
                    activeGainNodes[k].forEach(keyGain =>{
                        keyGain.gain.cancelScheduledValues(audioCtx.currentTime);
                        keyGain.gain.setValueAtTime(keyGain.gain.value, audioCtx.currentTime);
                        keyGain.gain.exponentialRampToValueAtTime(.00001, audioCtx.currentTime + .1);
                    });

                    setTimeout(function(){
                        activeOscillators[k].forEach(keyOsc =>{
                            keyOsc.stop();
                        });
                        delete activeOscillators[k];
                        delete activeGainNodes[k];
                    }, 70)
                }
            }

            else {
                activeGainNodes[key].forEach(keyGain => {
                    keyGain.gain.cancelScheduledValues(audioCtx.currentTime);
                    keyGain.gain.setValueAtTime(keyGain.gain.value, audioCtx.currentTime);
                    keyGain.gain.exponentialRampToValueAtTime(.00001, audioCtx.currentTime + .1);
                });

                setTimeout(function () {
                    activeOscillators[key].forEach(keyOsc => {
                        keyOsc.stop();
                    });
                    delete activeOscillators[key];
                    delete activeGainNodes[key];
                }, 50)
            }
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = waveform //choose your favorite waveform
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination)

        activeOscillators[key] = [osc];
        activeGainNodes[key] = [gainNode];

        if(lfoChoice == 1){
            var lfo = audioCtx.createOscillator();
            lfo.frequency.value = 1;
            var lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 10;
            lfo.connect(lfoGain).connect(osc.frequency);
            lfo.start();
        }

        attack(key);
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.start();
        decaySustain(key);


    }

    function attack(key){
        activeGainNodes[key].forEach(node => {
            node.gain.setValueAtTime(0, audioCtx.currentTime)
            node.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime+0.2);
            node.gain.setTargetAtTime(0.2, audioCtx.currentTime, 1);
        });
    }

    function decaySustain(key){
        activeGainNodes[key].forEach(node => {
            node.gain.setTargetAtTime(0, audioCtx.currentTime + 0.15, 0.15);
            node.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        });
    }

    function initAdditive(key){
        var osc1 = audioCtx.createOscillator();
        var osc2 = audioCtx.createOscillator();
        var osc3 = audioCtx.createOscillator();
        const freq = keyboardFrequencyMap[key];
        const frequencies = [freq, freq*2, freq*3];
        osc1.frequency.value = frequencies[0];
        osc2.frequency.value = frequencies[1];
        osc3.frequency.value = frequencies[2];

        const globalGain = audioCtx.createGain();
        globalGain.gain.value = 0.0001;

        osc1.type = waveform //choose your favorite waveform
        osc2.type = waveform
        osc3.type = waveform

        activeOscillators[key] = [osc1, osc2,osc3];
        activeGainNodes[key] = [globalGain];

        osc1.connect(globalGain)
        osc2.connect(globalGain);
        osc3.connect(globalGain);
        globalGain.connect(audioCtx.destination);

        if(lfoChoice==1){
            var lfo = audioCtx.createOscillator();
            var lfo2 = audioCtx.createOscillator();
            var lfoGain = audioCtx.createGain();
            var lfoGain2 = audioCtx.createGain();
            lfo.frequency.value = 0.5;
            lfoGain.gain.value = 8;
            lfo.connect(lfoGain).connect(osc2.frequency);
            lfo.start();

            lfo2.frequency.value = 0.7;
            lfoGain2.gain.value = 10;
            lfo2.connect(lfoGain).connect(osc3.frequency);
            lfo2.start();
        }

        attack(key)
        osc1.start();
        osc2.start();
        osc3.start();
        decaySustain(key);
    }

    function initAM(key){
        var carrier = audioCtx.createOscillator();
        modulatorFreq = audioCtx.createOscillator();
        modulatorFreq.frequency.value = 100;
        carrier.frequency.value = keyboardFrequencyMap[key];

        const modulated = audioCtx.createGain();
        const depth = audioCtx.createGain();
        depth.gain.value = 0.5 //scale modulator output to [-0.5, 0.5]
        modulated.gain.value = 1.0 - depth.gain.value; //a fixed value of 0.5

        carrier.type = waveform //choose your favorite waveform
        modulatorFreq.type = waveform

        activeOscillators[key] = [carrier, modulatorFreq];
        activeGainNodes[key] = [modulated, depth];

        modulatorFreq.connect(depth).connect(modulated.gain); //.connect is additive, so with [-0.5,0.5] and 0.5, the modulated signal now has output gain at [0,1]
        carrier.connect(modulated)
        modulated.connect(audioCtx.destination);

        if(lfoChoice == 1){
            var lfo = audioCtx.createOscillator();
            lfo.frequency.value = 2;
            var lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 50;
            lfo.connect(lfoGain).connect(modulatorFreq.frequency);
            lfo.start();
        }

        attack(key)
        carrier.start();
        modulatorFreq.start();
        decaySustain(key)
    }

    function initFM(key){
        console.log('fm')
        var carrier = audioCtx.createOscillator();
        modulatorFreq = audioCtx.createOscillator();
        modulationIndex = audioCtx.createGain();
        // modulationIndex.gain.value = 100;
        // modulatorFreq.frequency.value = 500;
        carrier.frequency.value = keyboardFrequencyMap[key];

        carrier.type = waveform
        modulatorFreq.type = waveform
        activeOscillators[key] = [carrier, modulatorFreq];
        activeGainNodes[key] = [modulationIndex];

        modulatorFreq.connect(modulationIndex);
        modulationIndex.connect(carrier.frequency)
        carrier.connect(audioCtx.destination);

        if(lfoChoice == 1){
            var lfo = audioCtx.createOscillator();
            lfo.frequency.value = 2;
            var lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 300;
            lfo.connect(lfoGain).connect(modulatorFreq.frequency);
            lfo.start();
        }

        attack(key);
        carrier.start();
        modulatorFreq.start();
        decaySustain(key);
    }

    function playChord(keys){
        keys.forEach((key) => {
            console.log(keys)
            if(synthesis=="none"){
                playNote(key);
            }
            else if(synthesis=="additive"){
                initAdditive(key);
            }
            else if(synthesis=="AM"){
                initAM(key);
            }
            else if(synthesis=="FM"){
                initFM(key);
            }
            else if(synthesis=="combo"){
                combo(key);
            }
        })
        // var osc1 = audioCtx.createOscillator();
        // var osc2 = audioCtx.createOscillator();
        // var osc3 = audioCtx.createOscillator();
        //
        // const frequencies = [keyboardFrequencyMap[keys[0]], keyboardFrequencyMap[keys[1]], keyboardFrequencyMap[keys[2]]];
        // osc1.frequency.value = frequencies[0];
        // osc2.frequency.value = frequencies[1];
        // osc3.frequency.value = frequencies[2];
        //
        // const globalGain = audioCtx.createGain();
        // globalGain.gain.value = 0.0001;
        //
        // osc1.type = waveform //choose your favorite waveform
        // osc2.type = waveform
        // osc3.type = waveform
        //
        // activeOscillators[keys[0]] = [osc1, osc2,osc3];
        // activeGainNodes[keys[0]] = [globalGain];
        //
        // osc1.connect(globalGain)
        // osc2.connect(globalGain);
        // osc3.connect(globalGain);
        // globalGain.connect(audioCtx.destination);
        //
        // if(lfoChoice==1){
        //     var lfo = audioCtx.createOscillator();
        //     var lfo2 = audioCtx.createOscillator();
        //     var lfoGain = audioCtx.createGain();
        //     var lfoGain2 = audioCtx.createGain();
        //     lfo.frequency.value = 0.5;
        //     lfoGain.gain.value = 8;
        //     lfo.connect(lfoGain).connect(osc2.frequency);
        //     lfo.start();
        //
        //     lfo2.frequency.value = 0.7;
        //     lfoGain2.gain.value = 10;
        //     lfo2.connect(lfoGain).connect(osc3.frequency);
        //     lfo2.start();
        // }
        //
        // attack(keys[0])
        // osc1.start();
        // osc2.start();
        // osc3.start();
        // decaySustain(keys[0]);
    }

    function playChords(key) {
        playChord(chordFrequencyMap[key])
    }

    function combo(key){
        var osc1 = audioCtx.createOscillator();
        var osc2 = audioCtx.createOscillator();
        var osc3 = audioCtx.createOscillator();
        var carrier = audioCtx.createOscillator();
        modulatorFreq = audioCtx.createOscillator();

        const freq = keyboardFrequencyMap[key];
        modulatorFreq.frequency.value = 100;
        carrier.frequency.value = freq;

        const frequencies = [freq*-1, freq*2, freq*3];
        osc1.frequency.value = frequencies[0];
        osc2.frequency.value = frequencies[1];
        osc3.frequency.value = frequencies[2];

        const globalGain = audioCtx.createGain();
        globalGain.gain.value = 0.0001;
        const modulated = audioCtx.createGain();
        const depth = audioCtx.createGain();
        depth.gain.value = 0.5 //scale modulator output to [-0.5, 0.5]
        modulated.gain.value = 1.0 - depth.gain.value; //a fixed value of 0.5

        carrier.type = waveform //choose your favorite waveform
        modulatorFreq.type = waveform
        osc1.type = waveform //choose your favorite waveform
        osc2.type = waveform
        osc3.type = waveform

        activeOscillators[key] = [osc1, osc2,osc3, carrier, modulatorFreq];
        activeGainNodes[key] = [globalGain, modulated, depth];

        modulatorFreq.connect(depth).connect(modulated.gain); //.connect is additive, so with [-0.5,0.5] and 0.5, the modulated signal now has output gain at [0,1]
        carrier.connect(modulated)
        modulated.connect(audioCtx.destination);

        osc1.connect(globalGain)
        osc2.connect(globalGain);
        osc3.connect(globalGain);
        globalGain.connect(audioCtx.destination);

        if(lfoChoice==1){
            var lfo = audioCtx.createOscillator();
            var lfo2 = audioCtx.createOscillator();
            var lfoGain = audioCtx.createGain();
            var lfoGain2 = audioCtx.createGain();
            lfo.frequency.value = 0.5;
            lfoGain.gain.value = 8;
            lfo.connect(lfoGain).connect(osc2.frequency);
            lfo.start();

            lfo2.frequency.value = 0.7;
            lfoGain2.gain.value = 10;
            lfo2.connect(lfoGain).connect(modulatorFreq.frequency);
            lfo2.start();
        }

        attack(key)
        osc1.start();
        osc2.start();
        osc3.start();
        carrier.start();
        modulatorFreq.start();
        decaySustain(key);
    }
});

function updateFreq(val) {
    modulatorFreq.frequency.value = val;
};
function updateIndex(val) {
    modulationIndex.gain.value = val;
};