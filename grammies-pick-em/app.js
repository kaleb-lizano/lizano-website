const awsSpotifyFunctionUrl =
	"https://mmjwhf9u0l.execute-api.us-east-2.amazonaws.com/202409181151/search";

const scraperLambdaUrl =
	"https://o87toyrqdb.execute-api.us-east-2.amazonaws.com/main/scrape";

async function loadGrammyData() {
	try {
		const response = await fetch(scraperLambdaUrl);
		if (!response.ok) {
			throw new Error(`Failed to load Grammy data: ${response.statusText}`);
		}
		const data = await response.json();
		displayCategories(data);
	} catch (error) {
		console.error("Error loading Grammy data:", error);
		alert("Failed to load Grammy data.");
	}
}

function displayCategories(data) {
	const categoriesDiv = document.getElementById("categories");
	categoriesDiv.innerHTML = "";

	data.forEach((category) => {
		const categoryDiv = document.createElement("div");
		categoryDiv.classList.add("category");
		categoryDiv.innerHTML = `<h2>${category.category}</h2>`;

		if (category.description) {
			const descriptionDiv = document.createElement("p");
			descriptionDiv.classList.add("category-description");
			descriptionDiv.textContent = category.description;
			categoryDiv.appendChild(descriptionDiv);
		}

		category.nominees.forEach((nominee) => {
			const nomineeDiv = document.createElement("div");
			nomineeDiv.classList.add("nominee");

			nomineeDiv.innerHTML = `
							<p><strong>${nominee.name}</strong> - ${nominee.details}</p>
					`;

			const searchButton = document.createElement("button");
			searchButton.classList.add("search-button");
			searchButton.textContent = "Search on Spotify";

			searchButton.addEventListener("click", () => {
				searchAndPlaySong(nominee.name, nominee.details);
			});

			nomineeDiv.appendChild(searchButton);

			if (nominee.credits && nominee.credits.length > 0) {
				const creditsDiv = document.createElement("ul");
				creditsDiv.classList.add("credits");
				nominee.credits.forEach((credit) => {
					const creditItem = document.createElement("li");
					creditItem.textContent = credit;
					creditsDiv.appendChild(creditItem);
				});
				nomineeDiv.appendChild(creditsDiv);
			}

			categoryDiv.appendChild(nomineeDiv);
		});

		categoriesDiv.appendChild(categoryDiv);
	});
}

async function searchAndPlaySong(songName, artistName) {
	const query = `${songName} ${artistName}`;
	console.log("Searching for song:", query);

	try {
		const response = await fetch(
			`${awsSpotifyFunctionUrl}?q=${encodeURIComponent(query)}`
		);
		if (!response.ok) {
			throw new Error(`Spotify search failed: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Spotify API response:", data);

		if (data.tracks && data.tracks.items.length > 0) {
			displaySongMetadata(data.tracks.items[0]);
		} else {
			console.warn("No tracks found in Spotify API response.");
			document.getElementById("results").innerHTML =
				"<p>No results found. Please try a different search.</p>";
		}
	} catch (error) {
		console.error("Error during song search:", error);
		document.getElementById("results").innerHTML =
			"<p>An error occurred while searching for the song. Please try again later.</p>";
	}
}

let currentSong = null;

function displaySongMetadata(song) {
	currentSong = song;

	const trackName = document.getElementById("track-name");
	const trackArtist = document.getElementById("track-artist");
	const trackImage = document.getElementById("track-image");
	const spotifyEmbed = document.getElementById("spotify-embed");
	const audioPlayer = document.getElementById("audioPlayer");

	audioPlayer.pause();
	audioPlayer.currentTime = 0;

	trackName.textContent = song.name;
	trackArtist.textContent = song.artists
		.map((artist) => artist.name)
		.join(", ");
	trackImage.innerHTML = `<img src="${song.album.images[0].url}" alt="Album Artwork" onclick="openDetailsModal()">`;

	spotifyEmbed.src = `https://open.spotify.com/embed/track/${song.id}`;
	spotifyEmbed.style.display = "block";

	if (song.preview_url) {
		audioPlayer.src = song.preview_url;
		audioPlayer.style.display = "block";
		audioPlayer.play();
	} else {
		audioPlayer.style.display = "none";
	}
}

function openDetailsModal() {
	if (!currentSong) return;

	const modal = document.getElementById("details-modal");
	const modalTrackName = document.getElementById("modal-track-name");
	const modalTrackArtist = document.getElementById("modal-track-artist");
	const modalAlbumName = document.getElementById("modal-album-name");
	const modalReleaseDate = document.getElementById("modal-release-date");
	const modalPopularity = document.getElementById("modal-popularity");
	const modalTrackImage = document.getElementById("modal-track-image");

	modalTrackName.textContent = currentSong.name;
	modalTrackArtist.textContent = currentSong.artists
		.map((artist) => artist.name)
		.join(", ");
	modalAlbumName.textContent = currentSong.album.name;
	modalReleaseDate.textContent = currentSong.album.release_date;
	modalPopularity.textContent = currentSong.popularity;
	modalTrackImage.src = currentSong.album.images[0].url;

	modal.style.display = "flex";
}

function closeDetailsModal() {
	const modal = document.getElementById("details-modal");
	modal.style.display = "none";
}

window.onclick = function (event) {
	const modal = document.getElementById("details-modal");
	if (event.target === modal) {
		modal.style.display = "none";
	}
};

document.addEventListener("DOMContentLoaded", loadGrammyData);
