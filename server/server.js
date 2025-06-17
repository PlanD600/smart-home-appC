const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body Parser Middleware
// This is the modern replacement for body-parser
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Mount routes
app.use('/api/homes', require('./routes/homeRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});