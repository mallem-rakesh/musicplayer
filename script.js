const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 200;

    const songDetails = [
      { name: "Sulthana", artist: "Future ft. The Weeknd", src: "audio/Sulthana.mp3", cover: "images/rocky.jpg" },
      { name: "Fire", artist: "Artist Name", src: "audio/Fire.mp3", cover: "images/kanguva.jpg" },
      { name: "Psycho Saiyaan", artist: "Artist Name", src: "audio/Psycho Saiyaan.mp3", cover: "images/psycho.jpg" }
    ];

    let currentIndex = 0;
    let currentAudio = null;
    let currentSource = null;

    const songname = document.getElementById("song-name");
    const artist = document.getElementById("song-artist");
    const currentTimeElement = document.getElementById("current-time");
    const totalTimeElement = document.getElementById("total-time");
    const progressBar = document.getElementById("progress-bar");
    const albumCover = document.getElementById("album-cover");

    updateSongDetails();

    function updateSongDetails() {
      songname.textContent = songDetails[currentIndex].name;
      artist.textContent = songDetails[currentIndex].artist;
      totalTimeElement.textContent = "2:46"; 
      progressBar.style.width = '0%';
      albumCover.src = songDetails[currentIndex].cover; 
    }

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        ctx.fillStyle = '#eff302';
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    }

    function connectAudio() {
      if (currentSource) {
        currentSource.disconnect();
      }
      currentSource = audioContext.createMediaElementSource(currentAudio);
      currentSource.connect(analyser);
      analyser.connect(audioContext.destination);
    }

    function loadAudio() {
      if (currentAudio) {
        currentAudio.pause();
      }
      currentAudio = new Audio(songDetails[currentIndex].src);
      connectAudio();
      currentAudio.addEventListener('loadedmetadata', () => {
        totalTimeElement.textContent = formatTime(currentAudio.duration);
        progressBar.style.width = '0%'; // Reset progress bar to 0
      });
      currentAudio.addEventListener('timeupdate', () => {
        currentTimeElement.textContent = formatTime(currentAudio.currentTime);
        const progressPercentage = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = progressPercentage + '%'; 
      });
      currentAudio.addEventListener('ended', () => {
        nextSong();
      });
    }

    const playbtn = document.querySelector(".big_play_pause");
    playbtn.addEventListener('click', () => {
      if (currentAudio.paused) {
        audioContext.resume().then(() => {
          currentAudio.play().catch(error => {
            console.error("Error playing audio:", error);
          });
          draw();
        });
      } else {
        currentAudio.pause();
      }
    });

    const nextbtn = document.querySelector(".bignext");
    nextbtn.addEventListener('click', () => {
      nextSong();
    });

    const prebtn = document.querySelector(".big");
    prebtn.addEventListener('click', () => {
      previousSong();
    });

    function nextSong() {
      currentIndex = (currentIndex + 1) % songDetails.length;
      loadAudio();
      currentAudio.play();
      updateSongDetails();
    }

    function previousSong() {
      currentIndex = (currentIndex - 1 + songDetails.length) % songDetails.length;
      loadAudio();
      currentAudio.play();
      updateSongDetails();
    }


    const progressContainer = document.querySelector('.progress-container');
    progressContainer.addEventListener('click', (event) => {
      const totalWidth = progressContainer.offsetWidth;
      const clickX = event.clientX - progressContainer.getBoundingClientRect().left;
      const percentage = clickX / totalWidth;
      currentAudio.currentTime = percentage * currentAudio.duration; 
    });

    loadAudio();