const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // ייבוא פונקציית החיבור למסד הנתונים

dotenv.config(); // טעינת משתני סביבה
connectDB(); // חיבור למסד הנתונים

const app = express();

app.use(cors()); // מאפשר Cross-Origin Resource Sharing
app.use(express.json()); // מאפשר לשרת לנתח בקשות עם גוף JSON
app.use(express.urlencoded({ extended: false })); // מאפשר לשרת לנתח בקשות עם גוף URL-encoded

// תיקון הנתיב: שינוי מ-'/api/homes' ל-'/api/home' כדי להתאים לצד הלקוח
app.use('/api/home', require('./routes/homeRoutes')); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});