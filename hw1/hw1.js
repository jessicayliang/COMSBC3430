
document.addEventListener("DOMContentLoaded", function(event) {
    const waveformOptions = document.getElementById("waveform")
    const chordsOptions = document.getElementById("chords")
    var waveform ="sine"
    var chords = 0

    waveformOptions.addEventListener("change", function (event) {
        waveform = event.target.value
    });

    chordsOptions.addEventListener("change", function(event){
        chords = event.target.value
    });

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
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
            else{
                playNote(key);
            }

        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            // release
            activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
            activeGainNodes[key].gain.setValueAtTime(activeGainNodes[key].gain.value, audioCtx.currentTime)
            activeGainNodes[key].gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .1);

            setTimeout(function(){
                activeOscillators[key].stop();
                delete activeOscillators[key];
                delete activeGainNodes[key];
            }, 70)

        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = waveform //choose your favorite waveform
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination)

        activeOscillators[key] = osc;
        activeGainNodes[key] = gainNode;

        Object.keys(activeGainNodes).forEach(function(key) {
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime+0.2);
            gainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 1);
        });

        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.start();
        // decay and sustain
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.15, 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0, audioCtx.currentTime + 1);

    }

    function playNote2(key){
        const osc = audioCtx.createOscillator();

        const gainNode = audioCtx.createGain();

        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.type = waveform //choose your favorite waveform
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination)

        activeOscillators[key] = osc
        activeGainNodes[key] = gainNode;


        gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime+0.2);
        gainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 1);

        // osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.start();

        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.15, 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0, audioCtx.currentTime + 1);
        // gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.15, 1);
        // gainNode.gain.exponentialRampToValueAtTime(0, audioCtx.currentTime + 1);


            // activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
            // activeGainNodes[key].gain.setValueAtTime(activeGainNodes[key].gain.value, audioCtx.currentTime)

        //
        setTimeout(function(){
            activeOscillators[key].stop();
            delete activeOscillators[key];
            delete activeGainNodes[key];
        }, 950)
    }

    function playChord(keys){
        for (const key of keys){
            const osc = audioCtx.createOscillator();
            var gainNode = audioCtx.createGain();

            osc.frequency.setValueAtTime(keyboardFrequencyMap[key],audioCtx.currentTime);
            osc.type=waveform;

            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            osc.connect(gainNode).connect(audioCtx.destination);
            osc.start(audioCtx.currentTime)
            gainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 1);
            gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.setTargetAtTime(0.001, audioCtx.currentTime + 0.15, 0.15);

            setTimeout(function(){
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0);
                activeOscillators[key].stop();
                delete activeOscillators[key];
                delete activeGainNodes[key];
            }, 950)

        }


    }

    function playChords(key) {
        // chordFrequencyMap[key].forEach(playNote2)
        playChord(chordFrequencyMap[key])
    }
});