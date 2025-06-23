// A one-time script to migrate the users array in all homes to the new object structure.
// To run this script, execute `node scripts/migrateUsers.js` from the `server` directory.

require('dotenv').config();
const mongoose = require('mongoose');
const Home = require('../models/Home'); 

/**
 * Establishes a connection to the MongoDB database.
 */
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for migration...');
    } catch (err) {
        console.error(`MongoDB connection error during migration: ${err.message}`);
        process.exit(1);
    }
};

/**
 * Migrates the `users` array in all `Home` documents.
 * - Converts arrays of strings to arrays of user objects ({ name, isAdmin }).
 * - Ensures existing user objects have the required fields.
 */
const migrateUsers = async () => {
    await connectDB();

    let migratedCount = 0;
    let alreadyUpToDateCount = 0;

    try {
        console.log('Starting user data migration...');
        
        const homes = await Home.find({});
        console.log(`Found ${homes.length} homes to check.`);

        for (const home of homes) {
            let needsSave = false;
            
            // Skip if users array is missing or empty
            if (!home.users || home.users.length === 0) {
                alreadyUpToDateCount++;
                continue;
            }

            // Case 1: Users are stored as strings, need to convert to objects.
            if (typeof home.users[0] === 'string') {
                console.log(`[MIGRATING] Home: "${home.name}" (ID: ${home._id}) - Converting user strings to objects.`);
                home.users = home.users.map((userName, index) => ({
                    name: userName,
                    isAdmin: index === 0, // Make the first user in the old list an admin
                }));
                needsSave = true;
            } 
            // Case 2: Users are already objects, ensure they are valid.
            else if (typeof home.users[0] === 'object' && home.users[0] !== null) {
                let madeChangesInObjects = false;
                home.users = home.users.map(user => {
                    const newUser = { ...user };
                    // Ensure 'isAdmin' is a boolean
                    if (typeof newUser.isAdmin !== 'boolean') {
                        newUser.isAdmin = false;
                        madeChangesInObjects = true;
                    }
                    // Ensure 'name' exists and is a string
                    if (typeof newUser.name !== 'string' || !newUser.name.trim()) {
                        newUser.name = `user_${new mongoose.Types.ObjectId().toHexString()}`;
                        madeChangesInObjects = true;
                    }
                    return newUser;
                });
                
                if (madeChangesInObjects) {
                    console.log(`[FIXING] Home: "${home.name}" (ID: ${home._id}) - Corrected malformed user objects.`);
                    needsSave = true;
                }
            }

            if (needsSave) {
                await home.save();
                migratedCount++;
            } else {
                alreadyUpToDateCount++;
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`✅ Homes successfully migrated or fixed: ${migratedCount}`);
        console.log(`👍 Homes already up-to-date: ${alreadyUpToDateCount}`);
        console.log('-------------------------');

    } catch (error) {
        console.error('An error occurred during the migration process:', error);
    } finally {
        // Ensure the connection is closed
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

// Run the migration
migrateUsers();
