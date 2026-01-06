const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const schemaPath = path.resolve(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    db.exec(schemaSql, (err) => {
        if (err) {
            console.error("Error initializing database:", err.message);
        } else {
            console.log("Database initialized successfully.");
            console.log("Tables created: Users, Products, Orders, Order_Items");
        }
    });
});

db.close();