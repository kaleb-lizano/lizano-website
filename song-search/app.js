// Replace with your Spotify API credentials
const apiGatewayUrl =
	"https://mmjwhf9u0l.execute-api.us-east-2.amazonaws.com/202409181151/search";

// Function to search for a song by interacting with your Lambda function via API Gateway
async function searchSong() {
	const songName = document.getElementById("songName").value;
	const response = await fetch(
		`${apiGatewayUrl}?q=${encodeURIComponent(songName)}`
	);

	if (!response.ok) {
		document.getElementById("results").innerHTML =
			"<p>Error fetching song data.</p>";
		return;
	}

	const data = await response.json();
	if (data.tracks && data.tracks.items.length > 0) {
		const song = data.tracks.items[0];
		displaySongMetadata(song);
	} else {
		document.getElementById("results").innerHTML = "<p>No results found.</p>";
	}
}

// Function to display song metadata in the DOM
function displaySongMetadata(song) {
	const resultsDiv = document.getElementById("results");

	// Get the Spotify track URL
	const trackUrl = song.external_urls.spotify;
	const previewUrl = song.preview_url; // This is the 30-second preview MP3

	resultsDiv.innerHTML = `
        <div class="metadata">
            <h3>${song.name}</h3>
            <p><strong>Artist:</strong> ${song.artists[0].name}</p>
            <p><strong>Album:</strong> ${song.album.name}</p>
            <p><strong>Release Date:</strong> ${song.album.release_date}</p>
            <p><strong>Popularity:</strong> ${song.popularity}</p>
            <img src="${
							song.album.images[0].url
						}" alt="Album Artwork" width="200">
            
            <!-- Embed Spotify Player -->
            <hr>
            <p>Play this song</p>
            <iframe src="https://open.spotify.com/embed/track/${
							song.id
						}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            <hr>
            
            <!-- Custom audio player for the 30-second preview -->
            ${
							previewUrl
								? `
            <audio controls>
                <source src="${previewUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            `
								: `<p>No preview available.</p>`
						}

        </div>
    `;
}
