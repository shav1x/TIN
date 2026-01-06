const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const saltRounds = 10;

const users = [
    { username: 'admin', password: 'admin', role: 'Admin' },
    { username: 'arnold', password: 'arnold', role: 'Customer' },
    { username: 'customer', password: 'customer', role: 'Customer' }
];

const products = [
    { name: 'Gaming Laptop', description: 'High performance laptop with RTX 4060', price: 1299.99, stock: 5 },
    { name: 'Wireless Mouse', description: 'Ergonomic 2.4GHz mouse', price: 25.50, stock: 50 },
    { name: 'Mechanical Keyboard', description: 'RGB Backlit Blue Switches', price: 79.99, stock: 0 },
    { name: 'Thermal Paste', description: 'High quality thermal paste', price: 36.00, stock: 4 },
    { name: 'PC build', description: 'Ready-to-play gaming PC', price: 5500.00, stock: 2 },
    { name: 'Headset', description: 'Gaming headset. You will hear everything!', price: 200.00, stock: 0 },
    { name: 'RTX 5090', description: 'High-end graphic card for any purpose possible', price: 3750.00, stock: 21 }
];

db.serialize(() => {
    console.log("Cleaning old data...");
    db.run("DELETE FROM Order_Items");
    db.run("DELETE FROM Orders");
    db.run("DELETE FROM Products");
    db.run("DELETE FROM Users");

    db.run("DELETE FROM sqlite_sequence WHERE name='Users'");
    db.run("DELETE FROM sqlite_sequence WHERE name='Products'");
    db.run("DELETE FROM sqlite_sequence WHERE name='Orders'");

    console.log("Inserting Users...");
    const userStmt = db.prepare("INSERT INTO Users (UserName, Password_Hash, Role) VALUES (?, ?, ?)");
    users.forEach(user => {
        const hash = bcrypt.hashSync(user.password, saltRounds);
        userStmt.run(user.username, hash, user.role);
    });
    userStmt.finalize();

    console.log("Inserting Products...");
    const prodStmt = db.prepare("INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?)");
    products.forEach(prod => {
        prodStmt.run(prod.name, prod.description, prod.price, prod.stock);
    });
    prodStmt.finalize();

    console.log("Inserting Sample Orders...");

    db.run("INSERT INTO Orders (ID, User_ID, Status) VALUES (1, 2, 'pending')");

    const itemStmt = db.prepare("INSERT INTO Order_Items (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)");
    itemStmt.run(1, 1, 1);
    itemStmt.run(1, 2, 2);
    itemStmt.finalize((err) => {
        if (err) {
            console.error("Error during seeding:", err);
        } else {
            console.log("Seeding completed successfully.");
        }
        db.close();
    });
});