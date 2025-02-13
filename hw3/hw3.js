
var audioCtx;
var audioCtx2;
var brownNoise;
var lpf1;
var lpf2;
var rhpf;

var osc;


const playBabble = document.getElementById('babble')
playBabble.addEventListener('click', function(){
    if(!audioCtx){
        babble();
        return;
    }
    if(audioCtx.state == 'suspended'){
        audioCtx.resume();
    }
    if(audioCtx.state == 'running'){
        audioCtx.suspend();
    }
}, false);


let sounds = {'meet': [280, 2250, 2900],
    'ship': [400,1900,2550],
    'pet': [550,1770,2490],
    'cat': [690,1660,2490],
    'love': [640,1190,2390],
    'root': [310,870,2250],
    'hook': [450,1030,2380],
    'about': [500,1500,2500],
    'father': [710,1100,2640]};
let words = ['meet', 'ship', 'pet', 'cat', 'love', 'root', 'hook', 'about', 'father'];
buttons = [];

for(let i = 0; i < 9; i++){
    const button= document.getElementById(words[i]);
    buttons[i] = button;
    button.addEventListener('click', function(){
        if(!audioCtx2){
            vowels(i);
            return;
        }
        if(audioCtx2.state == 'suspended'){
            // audioCtx2.resume();
            vowels(i);
        }
        if(audioCtx2.state == 'running'){
            audioCtx2.suspend();
            vowels(i);
        }
    }, false);
};

const stop = document.getElementById('stop');
stop.addEventListener('click', function(){
    if(audioCtx2.state == 'running'){
        audioCtx2.suspend();
    }
}, false);


function initBrownNoise() {
    var bufferSize = 10 * audioCtx.sampleRate,
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
        output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;

        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    // noise.start();
    return noise;
}

function babble(){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.1;

    brownNoise = initBrownNoise();

    lpf1 = audioCtx.createBiquadFilter();
    lpf2 = audioCtx.createBiquadFilter();
    rhpf = audioCtx.createBiquadFilter();

    lpf1.type = "lowpass";
    lpf2.type = "lowpass";
    rhpf.type = "highpass";

    lpf1.frequency.value= 400;
    lpf2.frequency.value = 14;

    rhpf.Q.value = 1/0.03;

    brownNoise.connect(lpf1);
    brownNoise.connect(lpf2);

    // lpf2 * 400 + 500
    // add = connected both to dest gain
    // mult = connected/layered gain nodes
    var lpf2_mult = audioCtx.createGain();
    lpf2_mult.gain.value = 400;

    var lpf2_add = audioCtx.createConstantSource();
    lpf2_add.offset.value = 500;

    lpf2.connect(lpf2_mult).connect(rhpf.frequency);

    lpf2_add.connect(rhpf.frequency);

    lpf1.connect(rhpf);
    rhpf.connect(gainNode).connect(audioCtx.destination);
    brownNoise.start();
}

function vowels(word_idx){
    let word = words[word_idx]
    let frequencies = sounds[word]

    audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
    var filters = []
    var gains = []

    var filterNode = audioCtx2.createBiquadFilter();
    filterNode.type = "bandpass";
    var gainNode = audioCtx2.createGain();
    gainNode.gain.value = 0.5

    osc = audioCtx2.createOscillator();
    freq = document.getElementById('freq').value
    console.log(freq)
    osc.frequency.value = freq;
    osc.type = "sawtooth";

    for (var i = 0; i < 3; i++) {
        filters[i] = audioCtx2.createBiquadFilter();
        filters[i].type = 'bandpass';
        filters[i].frequency.value = frequencies[i];
        filters[i].Q.value = 10;
        filterNode.connect(filters[i]);

        gains[i] = audioCtx2.createGain();
        filters[i].connect(gains[i]);
        gains[i].connect(gainNode);
    }
    osc.connect(filterNode);
    gainNode.connect(audioCtx2.destination)

    osc.start();

}

function updateFreq(val) {
    osc.frequency.value = val;

};





