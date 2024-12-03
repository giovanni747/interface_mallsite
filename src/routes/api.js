router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;
        // Replace this with your actual database query
        const results = await db.collection('stores').find({
            name: { $regex: searchTerm, $options: 'i' }
        }).toArray();
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
}); 