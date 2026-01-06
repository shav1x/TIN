const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.resolve(__dirname, 'database/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    if (username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters long." });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    const sql = "INSERT INTO Users (UserName, Password_Hash, Role) VALUES (?, ?, 'Customer')";

    db.run(sql, [username, hash], function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: "Username already exists." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "User registered successfully!", userId: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    const sql = "SELECT * FROM Users WHERE UserName = ?";
    db.get(sql, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const match = bcrypt.compareSync(password, user.Password_Hash);
        if (match) {
            res.json({
                message: "Login successful",
                user: {
                    id: user.ID,
                    username: user.UserName,
                    role: user.Role
                }
            });
        } else {
            res.status(401).json({ error: "Invalid credentials." });
        }
    });
});

app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM Products WHERE ID = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Product not found" });
        res.json({ data: row });
    });
});

app.post('/api/products', (req, res) => {
    const { name, description, price, stock } = req.body;

    if (!name || !price || !stock) {
        return res.status(400).json({ error: "Name, Price, and Stock are required." });
    }

    const sql = "INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?)";
    const params = [name, description, price, stock];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product created successfully", id: this.lastID });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, description, price, stock } = req.body;
    const { id } = req.params;

    if (!name || !price || !stock || !description) {
        return res.status(400).json({ error: "Name, Price, Stock and Description are required." });
    }

    if (price < 0 || stock < 0) {
        return res.status(400).json({ error: "Price and Stock must be positive numbers." });
    }

    const sql = "UPDATE Products SET Name = ?, Description = ?, Price = ?, Stock = ? WHERE ID = ?";
    const params = [name, description, price, stock, id];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product updated successfully" });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM Products WHERE ID = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    });
});

app.get('/api/products', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (!page || !limit) {
        const sql = "SELECT * FROM Products";
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({
                message: "success",
                data: rows
            });
        });
    } else {
        const offset = (page - 1) * limit;

        db.get("SELECT COUNT(*) as count FROM Products", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            const totalItems = row.count;
            const totalPages = Math.ceil(totalItems / limit);

            const sql = "SELECT * FROM Products LIMIT ? OFFSET ?";
            db.all(sql, [limit, offset], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({
                    message: "success",
                    data: rows,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalItems: totalItems
                    }
                });
            });
        });
    }
});

app.get('/api/my-orders', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const sql = `
        SELECT 
            o.ID as OrderID, o.Status, o.Created_At,
            p.Name as ProductName, p.Price,
            oi.Quantity
        FROM Orders o
        JOIN Order_Items oi ON o.ID = oi.Order_ID
        JOIN Products p ON oi.Product_ID = p.ID
        WHERE o.User_ID = ?
        ORDER BY o.Created_At DESC
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const orders = {};
        rows.forEach(row => {
            if (!orders[row.OrderID]) {
                orders[row.OrderID] = {
                    id: row.OrderID,
                    status: row.Status,
                    date: row.Created_At,
                    items: [],
                    total: 0
                };
            }
            orders[row.OrderID].items.push({
                name: row.ProductName,
                price: row.Price,
                quantity: row.Quantity
            });
            orders[row.OrderID].total += row.Price * row.Quantity;
        });

        res.json({ data: Object.values(orders) });
    });
});

app.post('/api/orders', (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid order data." });
    }

    db.serialize(() => {
        let errorOccurred = false;

        const checkPromises = items.map(item => {
            return new Promise((resolve, reject) => {
                db.get("SELECT Stock, Name FROM Products WHERE ID = ?", [item.productId], (err, row) => {
                    if (err) reject(err);
                    else if (!row || row.Stock < item.quantity) {
                        reject(new Error(`Not enough stock for ${row ? row.Name : 'Product'}`));
                    } else {
                        resolve();
                    }
                });
            });
        });

        Promise.all(checkPromises)
            .then(() => {
                db.run("INSERT INTO Orders (User_ID) VALUES (?)", [userId], function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    const orderId = this.lastID;
                    const orderItemsStmt = db.prepare("INSERT INTO Order_Items (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)");
                    const updateStockStmt = db.prepare("UPDATE Products SET Stock = Stock - ? WHERE ID = ?");

                    items.forEach(item => {
                        orderItemsStmt.run(orderId, item.productId, item.quantity);
                        updateStockStmt.run(item.quantity, item.productId);
                    });

                    orderItemsStmt.finalize();
                    updateStockStmt.finalize(err => {
                        if (err) return res.status(500).json({ error: "Error finalizing order" });
                        res.json({ message: "Order placed successfully!", orderId: orderId });
                    });
                });
            })
            .catch(err => {
                res.status(400).json({ error: err.message });
            });
    });
});

app.get('/api/admin/orders', (req, res) => {
    const sql = `
        SELECT 
            o.ID as OrderID, o.Status, o.Created_At,
            u.UserName,
            p.Name as ProductName, p.Price,
            oi.Quantity
        FROM Orders o
        JOIN Users u ON o.User_ID = u.ID
        JOIN Order_Items oi ON o.ID = oi.Order_ID
        JOIN Products p ON oi.Product_ID = p.ID
        ORDER BY o.Created_At DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const orders = {};
        rows.forEach(row => {
            if (!orders[row.OrderID]) {
                orders[row.OrderID] = {
                    id: row.OrderID,
                    customer: row.UserName,
                    status: row.Status,
                    date: row.Created_At,
                    items: [],
                    total: 0
                };
            }
            orders[row.OrderID].items.push({
                name: row.ProductName,
                price: row.Price,
                quantity: row.Quantity
            });
            orders[row.OrderID].total += row.Price * row.Quantity;
        });

        res.json({ data: Object.values(orders) });
    });
});

app.patch('/api/orders/:id/cancel', (req, res) => {
    const orderId = req.params.id;
    const requestingUserId = req.headers['x-user-id'];

    db.serialize(() => {
        db.get("SELECT Status, User_ID FROM Orders WHERE ID = ?", [orderId], (err, order) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!order) return res.status(404).json({ error: "Order not found" });

            if (requestingUserId && parseInt(requestingUserId) !== order.User_ID) {
                return res.status(403).json({ error: "You do not have permission to cancel this order." });
            }

            if (order.Status !== 'pending') {
                return res.status(400).json({ error: "Only 'pending' orders can be cancelled." });
            }

            db.run("UPDATE Orders SET Status = 'cancelled' WHERE ID = ?", [orderId], function(err) {
                if (err) return res.status(500).json({ error: err.message });

                db.all("SELECT Product_ID, Quantity FROM Order_Items WHERE Order_ID = ?", [orderId], (err, items) => {
                    if (err) return;
                    const restoreStmt = db.prepare("UPDATE Products SET Stock = Stock + ? WHERE ID = ?");
                    items.forEach(item => {
                        restoreStmt.run(item.Quantity, item.Product_ID);
                    });
                    restoreStmt.finalize();
                    res.json({ message: "Order cancelled successfully." });
                });
            });
        });
    });
});

app.patch('/api/orders/:id/complete', (req, res) => {
    const orderId = req.params.id;

    db.get("SELECT Status FROM Orders WHERE ID = ?", [orderId], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.Status !== 'pending') {
            return res.status(400).json({ error: "Only 'pending' orders can be completed." });
        }

        db.run("UPDATE Orders SET Status = 'completed' WHERE ID = ?", [orderId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Order marked as completed." });
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(/.*/, (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});