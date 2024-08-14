
let songs = []; // Initialize songs array
let currFolder;
let currentSong = new Audio();

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}

let play = document.getElementById("play");

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    
    let div = document.createElement("div");
    div.innerHTML = response;
    let names = div.getElementsByTagName("a");

    songs = []; // Clear and repopulate the songs array
    for (let index = 0; index < names.length; index++) {
        const element = names[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1].trim());
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear existing songs in the list
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("-", " ")}</div>
                    <div>JessicaB.</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach click listeners to each song in the list
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info").firstElementChild.innerHTML.replaceAll(" ", "-");
            playMusic(track);
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.getElementsByClassName("songinfo")[0].innerHTML = track.replaceAll("-", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function loadSongsAndPlay(folder) {
    await getSongs(folder); // Ensure songs array is populated with the current folder's songs
    playMusic(songs[0], true); // Play the first song, but paused
}

async function main() {
    await loadSongsAndPlay("songs/ncs"); // Load the initial playlist and play the first song

    // Attach event listeners for play, previous, next, etc.
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-700%";
    });

    previous.addEventListener("click", async () => {
        if (!songs.length) return;

        let index = songs.indexOf(currentSong.src.split("/").pop().trim());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });
// 
    next.addEventListener("click", async () => {
        if (!songs.length) return;

        let index = songs.indexOf(currentSong.src.split("/").pop().trim());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
// Add an event listener to mute the track
document.querySelector(".volume>img").addEventListener("click",e=>{
    if(e.target.src.includes("volume.svg")){
        // e.target.src =e.target.src.replace("volume.svg","mute.svg")
        e.target.src="mute.svg";
        currentSong.volume =0;
        document.querySelector(".range input").value = 0;
    }
    else{
        e.target.src =e.target.src.replace("mute.svg","volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range input").value = 10;
    }
})
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await loadSongsAndPlay(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

main();
