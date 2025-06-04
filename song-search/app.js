const apiGatewayUrl =
	"https://mmjwhf9u0l.execute-api.us-east-2.amazonaws.com/202409181151/search";

async function searchSong() {
	try {
		const songName = document.getElementById("songName").value;
		console.log("Searching for song:", songName);

		const response = await fetch(
			`${apiGatewayUrl}?q=${encodeURIComponent(songName)}`
		);

		if (!response.ok) {
			console.error("Error response from API:", response.statusText);
			document.getElementById("results").innerHTML =
				"<p>Error fetching song data. Please try again.</p>";
			return;
		}

		const data = await response.json();
		console.log("API response data:", data);

		if (
			data.tracks &&
			Array.isArray(data.tracks.items) &&
			data.tracks.items.length > 0
		) {
			const song = data.tracks.items[0];
			console.log("First song data:", song);
			displaySongMetadata(song);
		} else {
			console.warn("No tracks found in API response:", data);
			document.getElementById("results").innerHTML =
				"<p>No results found. Please try a different search.</p>";
		}
	} catch (error) {
		console.error("Error during song search:", error);
		document.getElementById("results").innerHTML =
			"<p>An error occurred while searching for the song. Please try again later.</p>";
	}
}

function displaySongMetadata(song) {
	const resultsDiv = document.getElementById("results");

	const trackUrl = song.external_urls.spotify;
	const previewUrl = song.preview_url;

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
