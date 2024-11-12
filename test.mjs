import puppeteer from "puppeteer";
import fs from "fs";

const scrapeGrammyData = async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Load the Grammy nominations page
	await page.goto(
		"https://www.grammy.com/news/2024-grammys-nominations-full-winners-nominees-list",
		{
			waitUntil: "networkidle2",
		}
	);

	// Scrape the data
	const data = await page.evaluate(() => {
		const result = [];

		const categorySections = document.querySelectorAll(".category"); // Modify based on HTML structure

		categorySections.forEach((categorySection) => {
			const categoryName = categorySection
				.querySelector("h3")
				?.textContent?.trim();
			console.log("Category:", categoryName); // Log category for debugging
			const nominees = [];

			categorySection.querySelectorAll(".nominee").forEach((nomineeSection) => {
				const nomineeName = nomineeSection
					.querySelector("h4")
					?.textContent?.trim();
				const workTitle =
					nomineeSection.querySelector(".work")?.textContent?.trim() || "N/A";
				const contributors = Array.from(
					nomineeSection.querySelectorAll(".contributor")
				).map((contrib) => contrib.textContent?.trim());
				const status = nomineeSection.classList.contains("winner")
					? "Winner"
					: "Nominee";

				console.log("Nominee:", nomineeName); // Log nominee details for debugging
				nominees.push({
					name: nomineeName,
					work: workTitle,
					contributors,
					status,
				});
			});

			result.push({
				category: categoryName,
				nominees,
			});
		});

		return result;
	});

	// Log entire data object to confirm contents before writing
	console.log("Extracted Data:", JSON.stringify(data, null, 2));

	// Save to JSON file
	fs.writeFileSync("grammy_nominations.json", JSON.stringify(data, null, 2));

	await browser.close();
	console.log("Data saved to grammy_nominations.json");
};

scrapeGrammyData().catch(console.error);
