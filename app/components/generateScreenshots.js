import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Walk-Up Songs page
  await page.goto("http://localhost:3000/walkup", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "public/images/walkup-songs-example.png", fullPage: true });

  // Player Manager page
  await page.goto("http://localhost:3000/player-manager", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "public/images/player-manager-example.png", fullPage: true });

  // Sound Effects page
  await page.goto("http://localhost:3000/sound-effects", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "public/images/sound-effects-example.png", fullPage: true });

  // Edit Sound Effects page
  await page.goto("http://localhost:3000/edit-sound-effects", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "public/images/edit-sound-effects-example.png", fullPage: true });

  // Optionally: Add more pages, e.g., documentation, edit player, etc.
  // Documentation page
  await page.goto("http://localhost:3000/documentation", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "public/images/documentation-example.png", fullPage: true });

  await browser.close();
})();