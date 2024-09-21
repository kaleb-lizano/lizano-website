const playlistId = "37qhCGDnFrNZXblgdsTWOz"; // Replace with the ID of the playlist you want to use
const apiGatewayUrl =
	"https://mmjwhf9u0l.execute-api.us-east-2.amazonaws.com/202409181151/search"; // Replace with your API Gateway URL

let playlistTracks = [];
let usedSongs = new Set();
let lastSelectedSong = null; // To keep track of the last selected song
let currentPlayingAudio = null; // Track which audio is currently playing

// Fetch songs from the Spotify playlist
async function fetchPlaylistSongs() {
	const response = await fetch(
		`${apiGatewayUrl}?action=playlist&playlistId=${playlistId}`
	);

	if (!response.ok) {
		document.getElementById("results").innerHTML =
			"<p>Error fetching playlist data.</p>";
		return;
	}

	const data = await response.json();
	console.log(data); // Log to check if data is correct
	playlistTracks = data.items.map((item) => item.track); // Extract only the track objects

	if (playlistTracks.length < 2) {
		document.getElementById("results").innerHTML =
			"<p>Not enough songs for battle.</p>";
		return;
	}

	showBattle();
}

// Get a random unused song from the playlist
function getRandomSong(excludeSongId = null) {
	let song;
	let attempts = 0; // Avoid infinite loops in case of errors
	do {
		const randomIndex = Math.floor(Math.random() * playlistTracks.length);
		song = playlistTracks[randomIndex];
		attempts++;
		// Avoid selecting the same song or songs already used
	} while (
		(excludeSongId && song.id === excludeSongId) ||
		(usedSongs.has(song.id) && attempts < 100)
	);

	usedSongs.add(song.id);
	return song;
}

// Use getRandomSong with exclusion to avoid duplicate songs
function showBattle() {
	if (playlistTracks.length - usedSongs.size < 2) {
		declareWinner(lastSelectedSong);
		return;
	}

	const song1 = getRandomSong();
	const song2 = getRandomSong(song1.id); // Ensure song2 is different from song1

	const songsContainer = document.getElementById("songs");
	songsContainer.innerHTML = `
			<div class="song" id="song1">
					${generateSongMetadata(song1, "audio1")}
					<button onclick="selectSong('song1', '${song1.id}')">Select This Song</button>
					<button onclick="showFullSong('${
						song1.id
					}', 'song1')">Listen to full song</button>
					<div id="embed-song1"></div>
			</div>
			<div class="song" id="song2">
					${generateSongMetadata(song2, "audio2")}
					<button onclick="selectSong('song2', '${song2.id}')">Select This Song</button>
					<button onclick="showFullSong('${
						song2.id
					}', 'song2')">Listen to full song</button>
					<div id="embed-song2"></div>
			</div>
	`;

	addAudioListeners("audio1", "audio2");
	addAudioListeners("audio2", "audio1");
}
// Add listeners to check if the other song is playing
function addAudioListeners(audioId, otherAudioId) {
	const audioElement = document.getElementById(audioId);
	const otherAudioElement = document.getElementById(otherAudioId);

	if (!audioElement || !otherAudioElement) {
		console.error(`Audio elements not found: ${audioId}, ${otherAudioId}`);
		return;
	}

	audioElement.addEventListener("play", () => {
		if (!otherAudioElement.paused) {
			otherAudioElement.pause(); // Pause the other audio if it's playing
		}
	});
}

// Generate song metadata for display
function generateSongMetadata(song, audioId) {
	const previewUrl = song.preview_url
		? `
        <audio id="${audioId}" controls>
            <source src="${song.preview_url}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    `
		: `<p>No preview available.</p>`;

	return `
        <h3>${song.name}</h3>
        <p><strong>Artist:</strong> ${song.artists[0].name}</p>
        <p><strong>Album:</strong> ${song.album.name}</p>
        <p><strong>Release Date:</strong> ${song.album.release_date}</p>
        <p><strong>Popularity:</strong> ${song.popularity}</p>
        <img src="${song.album.images[0].url}" alt="Album Artwork" width="200">
        ${previewUrl}
    `;
}

// Handle when the user selects a song
function selectSong(selectedSongId, songId) {
	const otherSongId = selectedSongId === "song1" ? "song2" : "song1";
	const otherSongElement = document.getElementById(otherSongId);

	lastSelectedSong = songId; // Store the ID of the last selected song

	// Replace the non-selected song with a new random song, unless there are no more songs
	if (playlistTracks.length - usedSongs.size >= 1) {
		const newSong = getRandomSong();
		otherSongElement.innerHTML = `
            ${generateSongMetadata(
							newSong,
							otherSongId === "song1" ? "audio1" : "audio2"
						)}
            <button onclick="selectSong('${otherSongId}', '${
			newSong.id
		}')">Select This Song</button>
            <button onclick="showFullSong('${
							newSong.id
						}', '${otherSongId}')">Listen to full song</button>
            <div id="embed-${otherSongId}"></div>
        `;
	} else {
		// If there are no more songs left, declare the winner
		declareWinner(songId);
	}
}

// Declare the winner when no more songs are left
function declareWinner(songId) {
	const song = playlistTracks.find((track) => track.id === songId);
	const songsContainer = document.getElementById("songs");

	if (!song) {
		songsContainer.innerHTML = "<p>No winner could be determined.</p>";
		return;
	}

	songsContainer.innerHTML = `
			<h2>🎉 The Winner is: ${song.name} by ${song.artists[0].name} 🎉</h2>
			<p><strong>Album:</strong> ${song.album.name}</p>
			<p><strong>Release Date:</strong> ${song.album.release_date}</p>
			<img src="${song.album.images[0].url}" alt="Album Artwork" width="200">
	`;
}

// Show full song embed when user clicks the "Listen to full song" button
function showFullSong(songId, songContainerId) {
	const song = playlistTracks.find((track) => track.id === songId);
	const embedDiv = document.getElementById(`embed-${songContainerId}`);

	// Generate the Spotify embed player
	embedDiv.innerHTML = `
        <iframe src="https://open.spotify.com/embed/track/${songId}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    `;
}

// Start the battle when the page loads
fetchPlaylistSongs();
