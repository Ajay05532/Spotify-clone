console.log("Let's get started!");
let currentSong = new Audio();
let songs;
let currFolder;

// seconds to minutes and seconds

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// get the list of songs from the server

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //   show all the songs in the library

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> <img class="invert" src="img/music.svg" alt="">
                         <div class="info">
                             <div>${song.replaceAll("%20", " ")}</div>
                             <div>Ajay</div>
                         </div>
                         <div class="playnow">
                             <img class="invert" src="img/playSong.svg" alt="">
                             <span>play now</span>
                         </div> </li>`;
  }

  // attach event listener to each song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerText.trim());
    });
  });
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/playSong.svg";
    }
  });
  return songs;
}

// play the song
const playMusic = (track, pause = false) => {
  //   let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songInfo").innerText = decodeURI(track);
  document.querySelector(".songTime").innerText = "00:00 / 00:00";
};

// displayAlbums function

async function displayAlbums() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
        let folder = e.href.split("/").slice(-1)[0];
        //   get meta data of the folder
        let b = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        let response = await b.json();
        cardContainer.innerHTML = cardContainer.innerHTML +
            `<div data-folder = ${folder} class="card">
                <div class="play">
                    <img src="img/play.svg" alt="">
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
             </div>`;
    }
  }
  // load the playlist when card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

// main function

async function main() {
  // get the list of songs

  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  //   display all the albums
  displayAlbums();

  // listen for time update

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerText = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add event listener to the seek bar

  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = e.offsetX / e.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = percent * 100 + "%";
    currentSong.currentTime = currentSong.duration * percent;
  });

  // add event listener to the hamburger menu

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listener to the close button

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //  add event listener to the previous button

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  //  add event listener to the next song button

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  // add event listener to the volume bar

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listener to mute the track
  document.querySelector(".volumn>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("img/volumn.svg")){
        e.target.src = e.target.src.replace("img/volumn.svg", "img/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("img/mute.svg", "img/volumn.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

});

}

main();
