import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function scrapeTelcelPhones() {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 300,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto('https://www.telcel.com/tienda/categoria/telefonos-y-smartphones', {
        waitUntil: 'domcontentloaded',
    });

    const allProducts = new Set();
    let previousCount = 0;

    while (true) {
        await page.waitForSelector('.cx-product-container');

        // Scroll al final para disparar carga de más productos
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Esperar a que se carguen más productos
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Extraer productos del DOM
        const newProducts = await page.evaluate(() => {
            const items = document.querySelectorAll('.cx-product-container');
            const data = [];

            items.forEach(item => {
                const imageEl = item.querySelector('.product-image-container img');
                const modelEl = item.querySelector('.cx-product-model');
                const priceEl = item.querySelector('.price-disc');
                const discountEl = item.querySelector('.partial-price');

                const image = imageEl ? imageEl.src : null;
                const model = modelEl ? modelEl.innerText.trim() : null;
                const price = priceEl ? priceEl.innerText.trim() : null;
                const discount = discountEl ? discountEl.innerText.trim() : null;

                const key = model + price + discount;
                data.push({ image, model, price, discount, key });
            });

            return data;
        });

        newProducts.forEach(p => {
            allProducts.add(JSON.stringify(p));
        });

        const currentCount = allProducts.size;
        console.log(`Productos capturados: ${currentCount}`);

        if (currentCount === previousCount) {
            console.log('No se detectaron más productos. Finalizando...');
            break;
        }

        previousCount = currentCount;
    }

    const finalData = Array.from(allProducts).map(item => JSON.parse(item));
    await fs.writeFile('telcel_products.json', JSON.stringify(finalData, null, 2));

    await browser.close();
}

scrapeTelcelPhones();
