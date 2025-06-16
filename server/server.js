const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const homeRoutes = require('./routes/homeRoutes');
const cors = require('cors');

// טעינת משתני סביבה מקובץ .env
// ודא שיצרת קובץ .env בתיקיית server עם המשתנה MONGO_URI
dotenv.config();

// התחברות למסד הנתונים
// אם החיבור נכשל, התהליך יסתיים והודעת שגיאה תוצג בטרמינל
connectDB();

const app = express();

// Middleware-ים בסיסיים
app.use(cors()); // מאפשר בקשות ממקורות שונים (חשוב לפיתוח)
app.use(express.json()); // מאפשר קריאת גוף בקשה בפורמט JSON

// Middleware לתיעוד בקשות נכנסות (למטרות דיבאגינג)
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  next(); // המשך לראוטר או ל-middleware הבא
});

// הגדרת נתיב ה-API הראשי
app.use('/api/homes', homeRoutes); // הגדרת נתיב בסיס לכל הראוטים
// Middleware לטיפול בנתיבים שלא נמצאו (שגיאת 404)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware כללי לטיפול בשגיאות
// יתפוס שגיאות שנזרקות מכל מקום באפליקציה
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Error:', err.message); // הדפסת השגיאה ללוג השרת
  res.status(statusCode);
  res.json({
    message: err.message,
    // בסביבת פיתוח, נחזיר גם את פרטי השגיאה המלאים
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
