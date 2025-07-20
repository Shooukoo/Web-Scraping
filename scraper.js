import puppeteer from 'puppeteer';
import fs from 'fs/promises';

export async function obtenerTelefonosTelcel() {
    try {
        const browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();

        const maxPages = 15;
        let currentPage = 0;
        const allData = [];

        while (currentPage < maxPages) {
            const url = `https://www.telcel.com/tienda/categoria/telefonos-y-smartphones?currentPage=${currentPage}`;
            console.log(`Visitando página ${currentPage + 1}: ${url}`);

            await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

            try {
                await page.waitForSelector("cx-custom-product-grid-item.cx-grid-item", { timeout: 6000 });

                const data = await page.evaluate(() => {
                    const items = document.querySelectorAll("cx-custom-product-grid-item.cx-grid-item");
                    return [...items].map(item => {
                        const description = item.querySelector("h2.a-product-name")?.innerText.trim() || "Sin nombre";
                        const price = item.querySelector(".cx-product-price")?.innerText.trim() || "Sin precio";
                        const image = item.querySelector("img")?.getAttribute("src") || "";
                        const model = item.querySelector(".cx-product-model")?.innerText.trim() || "Sin modelo";
                        return { description, price, image, model };
                    });
                });

                if (data.length === 0) {
                    console.log("No hay más productos, finalizando...");
                    break;
                }

                allData.push(...data);
                console.log(` Página ${currentPage + 1}: ${data.length} productos`);

                currentPage++;

            } catch (innerErr) {
                console.warn(`Problema al obtener datos en página ${currentPage + 1}: ${innerErr.message}`);
                break;
            }
        }

        await browser.close();

        await fs.writeFile("telcel.json", JSON.stringify(allData, null, 2));
        console.log(`Total productos guardados: ${allData.length}`);

        return allData;

    } catch (error) {
        console.error("Error general en el scraper:", error);
        return [];
    }
}
