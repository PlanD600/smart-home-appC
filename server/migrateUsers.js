// migrateUsers.js
require('dotenv').config(); // טען משתני סביבה (למשל, MONGO_URI)
const mongoose = require('mongoose');
const Home = require('./models/Home'); // וודא שהנתיב למודל Home נכון

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // ללא useNewUrlParser, useUnifiedTopology
        console.log('MongoDB Connected for migration...');
    } catch (err) {
        console.error(`MongoDB connection error during migration: ${err.message}`);
        process.exit(1);
    }
};

const migrateUsers = async () => {
    await connectDB();

    try {
        console.log('Starting user data migration...');

        // מצא את כל הבתים
        const homes = await Home.find({});

        for (const home of homes) {
            let changesMade = false;
            let updatedUsers = [];

            // אם activeHome.users קיים ובנוי ממערך של מחרוזות, המר אותו
            if (home.users && home.users.length > 0 && typeof home.users[0] === 'string') {
                console.log(`Migrating users for home: ${home.name} (${home._id})`);
                updatedUsers = home.users.map((userName, index) => ({
                    name: userName,
                    isAdmin: index === 0 ? true : false // קבע את הראשון כ-Admin, השאר כ-false
                }));
                changesMade = true;
            } else if (home.users && home.users.length > 0 && typeof home.users[0] === 'object') {
                // אם זה כבר מערך של אובייקטים, וודא שכל אובייקט תקין
                updatedUsers = home.users.map(user => {
                    // וודא ששדה 'name' קיים ואם לא, נסה לשחזר או לתקן
                    if (!user.name) {
                        console.warn(`User object in home ${home.name} (${home._id}) is missing 'name' field. Attempting to set default.`);
                        changesMade = true;
                        // אפשרות 1: להגדיר שם ברירת מחדל או למחוק
                        return { name: user._id.toString(), isAdmin: user.isAdmin || false }; // שימוש ב-ID כגיבוי לשם
                        // אפשרות 2: אם אתה יודע שיש שדה אחר ששימש כשם, השתמש בו
                        // return { name: user.oldNameField, isAdmin: user.isAdmin || false };
                    }
                    // וודא ש-isAdmin הוא בוליאני
                    if (typeof user.isAdmin === 'undefined') {
                        changesMade = true;
                        return { name: user.name, isAdmin: false };
                    }
                    return user;
                });
            } else {
                // אם המערך ריק או לא קיים, אתחל אותו (אולי לא נחוץ אם createHome מטפל בזה)
                updatedUsers = []; // או הגדר כאן משתמשי ברירת מחדל אם צריך
            }

            if (changesMade) {
                home.users = updatedUsers;
                await home.save();
                console.log(`Successfully migrated users for home: ${home.name}`);
            }
        }

        console.log('User data migration complete.');
    } catch (error) {
        console.error('Error during user data migration:', error);
    } finally {
        mongoose.disconnect();
    }
};

migrateUsers();