const express = require('express');
const cors = require('cors')
const { Pool } = require('pg');


const app = express();
app.use(express.json());
app.use(cors())

const pool = new Pool({
    connectionString: 'postgresql://postgress:KQGMMpbmyKdtPXzzQKbq3167tLNH6cdQ@dpg-d184u5adbo4c73dah1fg-a.frankfurt-postgres.render.com/dbbibliotec',
    ssl: {
        rejectUnauthorized: false, // важливо для Render або Railway
    },
});

app.get('/', (req, res) => {
    res.send('server ok!')
})

app.get('/movies', async (req, res) => {
    try {
        const books = await pool.query(`SELECT * FROM films`)
        res.status(200).send(books.rows)
    } catch (error) {

    }
})

app.get('/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const books = await pool.query(`SELECT * FROM films WHERE id = $1`, [id])
        res.status(200).send(books.rows)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/movies', async (req, res) => {
    const { title, director, year, genre, rating } = req.body
    try {
        const book = await pool.query(`INSERT INTO films (title, director, year, genre, rating ) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [title,  director, year, genre, rating])
        res.status(200).send(book.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`DELETE FROM films WHERE id = $1`, [id])
        if (result.rowCount === 0) {
            return res.status(404).send({ error: 'Фільм не знайдено' });
        }

        res.status(200).send('movie is deleted');
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.put('/movies/:id', async (req, res)=>{
    const { id } = req.params;
    const { title, director, year, genre, rating } = req.body
    try {
        const result = await pool.query(`
            UPDATE films
            SET title = $1,
            director = $2,
            year = $3,
            genre = $4,
            rating = $5
            WHERE id = $6 RETURNING *
            `, [title, director, year, genre, rating, id])
            res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.listen(3000, () => {
    console.log('server is listened with port: 3000');

})