require('dotenv').config();
const express = require('express');
const cors = require('cors');
const designRoutes = require('./routes/design_route');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
    res.send('API is running. Try /api endpoints.');
});


// routes
app.use('/api', designRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

