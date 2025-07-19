import fs from 'fs/promises';
import puppeteer from 'puppeteer';

async function obtenerTelefonosTelcel() {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 200,
    });

    const page = await browser.newPage();
    await page.goto("https://www.telcel.com/tienda/categoria/telefonos-y-smartphones", {
        waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("cx-custom-product-grid-item.cx-grid-item", { timeout: 15000 });

    const data = await page.evaluate(() => {
        const items = document.querySelectorAll("cx-custom-product-grid-item.cx-grid-item");
        const data = [...items].map(item => {
            const description = item.querySelector("h2.a-product-name").innerText.trim();
            const price = item.querySelector(".cx-product-price").innerText.trim();
            return {
                description,
                price
            };
        });
        return data;
    });

    console.log(data);
    await fs.writeFile("telcel.json", JSON.stringify(data, null, 2));
    await browser.close();
}

obtenerTelefonosTelcel();