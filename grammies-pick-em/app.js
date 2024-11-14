const awsSpotifyFunctionUrl =
	"https://mmjwhf9u0l.execute-api.us-east-2.amazonaws.com/202409181151/search"; // Your Spotify search function URL

const scraperLambdaUrl =
	"https://o87toyrqdb.execute-api.us-east-2.amazonaws.com/main/scrape";

// Load Grammy nominees data from AWS Lambda Scraper
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

// Display categories and nominees on the page
function displayCategories(data) {
	const categoriesDiv = document.getElementById("categories");
	categoriesDiv.innerHTML = ""; // Clear previous content

	data.forEach((category) => {
		// Create a container for each category
		const categoryDiv = document.createElement("div");
		categoryDiv.classList.add("category");
		categoryDiv.innerHTML = `<h2>${category.category}</h2>`;

		// Add category description if available
		if (category.description) {
			const descriptionDiv = document.createElement("p");
			descriptionDiv.classList.add("category-description");
			descriptionDiv.textContent = category.description;
			categoryDiv.appendChild(descriptionDiv);
		}

		// Display each nominee within the category
		category.nominees.forEach((nominee) => {
			const nomineeDiv = document.createElement("div");
			nomineeDiv.classList.add("nominee");

			// Add nominee name and details
			nomineeDiv.innerHTML = `
							<p><strong>${nominee.name}</strong> - ${nominee.details}</p>
					`;

			// Create the search button
			const searchButton = document.createElement("button");
			searchButton.classList.add("search-button");
			searchButton.textContent = "Search on Spotify";

			// Add event listener for search functionality with song and artist name as arguments
			searchButton.addEventListener("click", () => {
				searchAndPlaySong(nominee.name, nominee.details);
			});

			nomineeDiv.appendChild(searchButton);

			// Add credits if available
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

// Function to search for a song by interacting with your Lambda function via API Gateway
async function searchAndPlaySong(songName, artistName) {
	const query = `${songName} ${artistName}`; // Use both song name and artist to improve search accuracy
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

		// Display the first track from the search results
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
// Variables to hold the current song details
let currentSong = null;

// Function to display song metadata in the fixed player overlay
function displaySongMetadata(song) {
	currentSong = song; // Save the current song details for the modal

	const trackName = document.getElementById("track-name");
	const trackArtist = document.getElementById("track-artist");
	const trackImage = document.getElementById("track-image");
	const spotifyEmbed = document.getElementById("spotify-embed");
	const audioPlayer = document.getElementById("audioPlayer");

	// Stop and reset any currently playing preview
	audioPlayer.pause();
	audioPlayer.currentTime = 0;

	// Update track information
	trackName.textContent = song.name;
	trackArtist.textContent = song.artists
		.map((artist) => artist.name)
		.join(", ");
	trackImage.innerHTML = `<img src="${song.album.images[0].url}" alt="Album Artwork" onclick="openDetailsModal()">`;

	// Set up Spotify embed player
	spotifyEmbed.src = `https://open.spotify.com/embed/track/${song.id}`;
	spotifyEmbed.style.display = "block";

	// Set up audio preview (if available)
	if (song.preview_url) {
		audioPlayer.src = song.preview_url;
		audioPlayer.style.display = "block";
		audioPlayer.play();
	} else {
		audioPlayer.style.display = "none"; // Hide preview if not available
	}
}

// Function to open the modal and display extra song details
function openDetailsModal() {
	if (!currentSong) return;

	// Get modal elements
	const modal = document.getElementById("details-modal");
	const modalTrackName = document.getElementById("modal-track-name");
	const modalTrackArtist = document.getElementById("modal-track-artist");
	const modalAlbumName = document.getElementById("modal-album-name");
	const modalReleaseDate = document.getElementById("modal-release-date");
	const modalPopularity = document.getElementById("modal-popularity");
	const modalTrackImage = document.getElementById("modal-track-image");

	// Populate modal with current song details
	modalTrackName.textContent = currentSong.name;
	modalTrackArtist.textContent = currentSong.artists
		.map((artist) => artist.name)
		.join(", ");
	modalAlbumName.textContent = currentSong.album.name;
	modalReleaseDate.textContent = currentSong.album.release_date;
	modalPopularity.textContent = currentSong.popularity;
	modalTrackImage.src = currentSong.album.images[0].url;

	// Show the modal
	modal.style.display = "flex";
}

// Function to close the modal
function closeDetailsModal() {
	const modal = document.getElementById("details-modal");
	modal.style.display = "none";
}

// Add event listener to close modal when clicking outside of it
window.onclick = function (event) {
	const modal = document.getElementById("details-modal");
	if (event.target === modal) {
		modal.style.display = "none";
	}
};

// Load data on page load
document.addEventListener("DOMContentLoaded", loadGrammyData);
