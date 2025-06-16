// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// 1. כאן אנחנו "מזמינים" את מנהל המחלקה של הבתים
const homeRoutes = require('./routes/homeRoutes');

// טוען את משתני הסביבה מהקובץ הסודי .env
dotenv.config();

// מתחבר למסד הנתונים
connectDB();

const app = express();

// Middleware - כללי הבית
app.use(cors()); // מאפשר ללקוח (שירוץ מכתובת אחרת) לדבר עם השרת
app.use(express.json()); // מאפשר לשרת להבין בקשות שמגיעות בפורמט JSON

// --- כאן קורה הקסם ---
// 2. כאן "מנהל המשמרת" אומר:
// "כל בקשה שמגיעה לכתובת שמתחילה ב- /api/homes,
// אני לא מטפל בה בעצמי. אני מעביר אותה ישירות לטיפולו של homeRoutes".
app.use('/api/homes', homeRoutes);

// בדיקה בסיסית שהשרת חי ונושם
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

// "פותח את המסעדה" - השרת מתחיל להאזין לבקשות
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});