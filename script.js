let songs;
let currentSong = new Audio()
let currFolder;
function secondsToMinutesAndSeconds(timestamp) {
    // Ensure the input is a positive number
    if (typeof timestamp !== 'number' || timestamp < 0) {
        return 'Invalid input';

    }

    // Extract only the whole seconds part
    const seconds = Math.floor(timestamp);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format the result with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine minutes and seconds with a colon
    const result = `${formattedMinutes}:${formattedSeconds}`;

    return result;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <div class="song-card flex">
        <img src="svgs/music.svg" class="invert" alt="music icon">
        <div class="song-info">
        <div class="song-name">${decodeURI(song)}</div>
        </div>
        <div class="more-buttons flex items-center ">
        <img src="svgs/play.svg" class="invert" alt="">
        <img src="svgs/like.svg" class="invert" alt="">
        </div>
        </div>
        </li>`;
    }

    //play the song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".song-info").firstElementChild.innerHTML)

        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "svgs/pause.svg"
    }
    document.querySelector(".song-inform").innerHTML = decodeURI(track)

}
async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folders = (e.href.split("/").slice(-2)[0]);

            //get the metadata of the folder
            let a = await fetch(`/songs/${folders}/info.json`)
            let response = await a.json()
            let cardContainer = document.querySelector(".card-container")
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folders}" class="card ">
            <img src="songs/${folders}/cover.jpg" alt="">
            <div class="playbtn">
                <img src="svgs/playbtn.svg" alt="">
            </div>
            <h3>${response.title}</h3>
            <p>${response.description}</p>
            </div>`

        }

    }
    //add and event listener to load the playlist
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })

    });

}
async function main() {
    await getSongs(`songs/songs1`)
    playMusic(songs[0], true)

    //display all the albums
    await displayAlbums()
    //play button toggle
    var play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svgs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svgs/play.svg"
        }
    })
    //song duration update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration-start").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)}`
        document.querySelector(".duration-end").innerHTML = `${secondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector(".seeker").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //add an eventListener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".seeker").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })
    //add an event listener for the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })
    //Add an event listener for the previous button
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //Add an event listener for the next button
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {

            playMusic(songs[index + 1])
        }
    })
    //add an event listener to the vol range
    document.querySelector("#vol-range").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //add an event listener to mute the volume
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("svgs/volume.svg","svgs/mute.svg")
            currentSong.volume = 0;
            document.querySelector("#vol-range").value = 0;
        }
        else{
            e.target.src = e.target.src.replace("svgs/mute.svg","svgs/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector("#vol-range").value = 10;

        }
    })
}
main()