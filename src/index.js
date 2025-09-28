require('dotenv').config();
const express = require('express');
const cors = require('cors');
const designRoutes = require('./routes/design_route');
const figmaExportRoutes = require('./routes/figma_export_routes');
const userRoutes = require('./routes/user_routes');
const projectRoutes = require('./routes/project_routes');
const cookieParser = require('cookie-parser');
const middleware = require('./middleware/auth_from_cookie')
const connectDB = require('./config/database');

const app = express();

connectDB();

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
    res.send('API is running. Try /api endpoints.');
});


// routes
app.use('/api', designRoutes);
app.use('/api', figmaExportRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

