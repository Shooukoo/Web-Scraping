import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { obtenerTelefonosTelcel } from './scraper.js';

const app = express();
const PORT = 3000;

app.use(cors());

// 👇 Esto permite servir archivos estáticos como index.html, CSS, JS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/scrape-telcel', async (req, res) => {
    try {
        const data = await obtenerTelefonosTelcel();
        res.json(data);
    } catch (error) {
        console.error('Scraping fallido:', error);
        res.status(500).json({ error: 'No se pudo hacer scraping' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
