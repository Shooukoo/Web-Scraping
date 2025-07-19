import fs from 'fs/promises';
import puppeteer from 'puppeteer';

export async function obtenerTelefonosTelcel() {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.goto("https://www.telcel.com/tienda/categoria/telefonos-y-smartphones", {
            waitUntil: "domcontentloaded",
        });

        await page.waitForSelector("cx-custom-product-grid-item.cx-grid-item", { timeout: 15000 });

        const data = await page.evaluate(() => {
            const items = document.querySelectorAll("cx-custom-product-grid-item.cx-grid-item");
            return [...items].map(item => {
                const description = item.querySelector("h2.a-product-name")?.innerText.trim() || "Sin nombre";
                const price = item.querySelector(".cx-product-price")?.innerText.trim() || "Sin precio";
                return { description, price };
            });
        });

        console.log(data);
        await fs.writeFile("telcel.json", JSON.stringify(data, null, 2));
        await browser.close();
        await browser.close();
        
        return data;
    } catch (error) {
        console.error("❌ Error en el scraper:", error);
        return []; // evita que el servidor explote
    }
}