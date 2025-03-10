window.addEventListener('load', function() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
  
    // Main oscillator and the modulator oscillator.
    const carrierOsc = audioCtx.createOscillator();
    const modulatorOsc = audioCtx.createOscillator();
  
    // Gain node to control the modulation depth.
    const modulationGain = audioCtx.createGain();
  
    // Master gain node to control overall volume.
    const masterGainNode = audioCtx.createGain();
  
    // Analyser node for visualization.
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
  
    // Setting initial values based on the input controls.
    carrierOsc.frequency.value = document.getElementById('carrierFreq').value;
    modulatorOsc.frequency.value = document.getElementById('modulatorFreq').value;
    modulationGain.gain.value = document.getElementById('modulationIndex').value;
    masterGainNode.gain.value = document.getElementById('masterGain').value;
    
    // Setting default waveform type.
    carrierOsc.type = document.getElementById('waveformSelect').value;
    modulatorOsc.connect(modulationGain);
    modulationGain.connect(carrierOsc.frequency);
    carrierOsc.connect(masterGainNode);
    masterGainNode.connect(audioCtx.destination);
    masterGainNode.connect(analyser);
  
    // Start the oscillators when the start button is clicked.
    document.getElementById('startButton').addEventListener('click', function() {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      try {
        carrierOsc.start();
        modulatorOsc.start();
      } catch (e) {
        console.log("Oscillators already started.");
      }
    });
  
    // Toggle button: Pause/Resume AudioContext without stopping oscillators.
    document.getElementById('toggleButton').addEventListener('click', function() {
      if (audioCtx.state === 'running') {
        audioCtx.suspend().then(() => {
          document.getElementById('toggleButton').textContent = 'Resume Audio';
        });
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          document.getElementById('toggleButton').textContent = 'Pause Audio';
        });
      }
    });
  
    // Event listener: update carrier frequency.
    document.getElementById('carrierFreq').addEventListener('input', function() {
      const val = this.value;
      carrierOsc.frequency.setValueAtTime(val, audioCtx.currentTime);
      document.getElementById('carrierFreqValue').innerText = val + " Hz";
    });
  
    // Event listener: update modulator frequency.
    document.getElementById('modulatorFreq').addEventListener('input', function() {
      const val = this.value;
      modulatorOsc.frequency.setValueAtTime(val, audioCtx.currentTime);
      document.getElementById('modulatorFreqValue').innerText = val + " Hz";
    });
  
    // Event listener: update modulation index (depth).
    document.getElementById('modulationIndex').addEventListener('input', function() {
      const val = this.value;
      modulationGain.gain.setValueAtTime(val, audioCtx.currentTime);
      document.getElementById('modulationIndexValue').innerText = val;
    });
  
    // Event listener: update master gain.
    document.getElementById('masterGain').addEventListener('input', function() {
      const val = this.value;
      masterGainNode.gain.setValueAtTime(val, audioCtx.currentTime);
      document.getElementById('masterGainValue').innerText = val;
    });
  
    // Event listener: update waveform type.
    document.getElementById('waveformSelect').addEventListener('change', function() {
      const selectedWaveform = this.value;
      carrierOsc.type = selectedWaveform;
      // Optionally, update modulatorOsc type as well:
      // modulatorOsc.type = selectedWaveform;
    });
  
    // Setup canvas for visualization.
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');
  
    // Function to draw the waveform on the canvas.
    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
  
      // Clear canvas
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Draw waveform
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx.beginPath();
  
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
  
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
  
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
  
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }
  
    // Visualization loop.
    draw();
  });
  