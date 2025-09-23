require('dotenv').config();
const express = require('express');
const cors = require('cors');
const designRoutes = require('./routes/design_route');

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/api', designRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
