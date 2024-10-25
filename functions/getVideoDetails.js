// Route to get video details by movie ID
app.post('/getVideoDetails', async (req, res) => {
  const { id } = req.body; // Get ID from request body

  if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
  }

  try {
      const pool = await sql.connect(dbConfig);
      const query = 'SELECT title, source FROM movies WHERE id = @id';
      const result = await pool.request()
          .input('id', sql.Int, id)
          .query(query);

      if (result.recordset.length > 0) {
          return res.json(result.recordset[0]); // Return the first result
      } else {
          return res.status(404).json({ error: 'Movie not found' });
      }
  } catch (err) {
      console.error('Error fetching video details:', err);
      return res.status(500).json({ error: 'Database query error' });
  }
});
