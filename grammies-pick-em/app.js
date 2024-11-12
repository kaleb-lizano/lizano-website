const awsSpotifyFunctionUrl =
	"https://mmjwhf9u0l.execute-api.us-east-2.amazonaws.com/202409181151/search"; // Your Spotify search function URL

const grammyLoaderFunctionUrl =
	"https://o87toyrqdb.execute-api.us-east-2.amazonaws.com/main";

// Load Grammy nominees data from AWS Lambda Scraper
async function loadGrammyData() {
	try {
		const response = await fetch(grammyLoaderFunctionUrl);
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
			nomineeDiv.innerHTML = `
                  <p><strong>${nominee.name}</strong> - ${nominee.details}</p>
                  <span class="play-button" onclick="searchAndPlaySong('${nominee.name}')">Play on Spotify</span>
              `;

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

// Search and play functionality
async function searchAndPlaySong(query) {
	console.log(`Searching for: ${query}`);

	try {
		const response = await fetch(
			`${awsSpotifyFunctionUrl}?action=search&q=${encodeURIComponent(query)}`
		);
		if (!response.ok) {
			throw new Error(`Spotify search failed: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("AWS Lambda Spotify response:", data);

		displayMetadata(data);

		if (data.tracks && data.tracks.items.length > 0) {
			const trackUrl = data.tracks.items[0].preview_url;
			if (trackUrl) {
				playTrack(trackUrl);
			} else {
				alert("Preview not available for this song.");
			}
		} else {
			alert("No song found on Spotify.");
		}
	} catch (error) {
		console.error("Error fetching Spotify track:", error);
		alert("Error fetching track from Spotify.");
	}
}

// Display song metadata
function displayMetadata(data) {
	const metadataDiv = document.getElementById("songMetadata");
	metadataDiv.style.display = "block";

	if (data.tracks && data.tracks.items.length > 0) {
		const track = data.tracks.items[0];
		metadataDiv.innerHTML = `
              <h3>Now Playing:</h3>
              <p><strong>Title:</strong> ${track.name}</p>
              <p><strong>Artist:</strong> ${track.artists
								.map((artist) => artist.name)
								.join(", ")}</p>
              <p><strong>Album:</strong> ${track.album.name}</p>
          `;
	} else {
		metadataDiv.innerHTML = "<p>No song metadata available.</p>";
	}
}

// Play the track preview
function playTrack(url) {
	const audioPlayer = document.getElementById("audioPlayer");
	audioPlayer.src = url;
	audioPlayer.style.display = "block";
	audioPlayer.play();
}

// Initiate data load on page load
document.addEventListener("DOMContentLoaded", loadGrammyData);
