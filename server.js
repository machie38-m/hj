const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

let db;

(async () => {
    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT,
                type TEXT,
                prompt TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization failed', err);
    }
})();

app.post('/api/history', async (req, res) => {
    try {
        const { url, type, prompt } = req.body;
        const result = await db.run(
            'INSERT INTO history (url, type, prompt) VALUES (?, ?, ?)',
            [url, type, prompt]
        );
        res.json({ id: result.lastID, url, type, prompt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await db.all('SELECT * FROM history ORDER BY timestamp DESC LIMIT 50');
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/history/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM history WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
