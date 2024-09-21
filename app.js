function openProject(url) {
	window.location.href = url;
}

function showCustomAlert(message) {
	const alert = document.getElementById("custom-alert");
	const alertMessage = document.getElementById("alert-message");

	alertMessage.innerHTML = message;

	alert.classList.add("show");

	setTimeout(() => {
		alert.classList.remove("show");
	}, 5000);
}

document.getElementById("close-alert").addEventListener("click", function () {
	const alert = document.getElementById("custom-alert");
	alert.classList.remove("show");
});

document
	.getElementById("project-album-rating")
	.addEventListener("click", function () {
		openProject("/album-rating/");
	});

document
	.getElementById("project-song-battle")
	.addEventListener("click", function () {
		openProject("/song-battle/");
	});

document
	.getElementById("project-song-search")
	.addEventListener("click", function () {
		openProject("/song-search/");
	});

document
	.getElementById("project-art-of-tanks")
	.addEventListener("click", function () {
		showCustomAlert(
			"This project is a Work In Progress.<br />Please check back later!"
		);
	});
