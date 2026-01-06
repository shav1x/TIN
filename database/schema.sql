CREATE TABLE IF NOT EXISTS Users
(
    ID            INTEGER PRIMARY KEY AUTOINCREMENT,
    UserName      TEXT UNIQUE NOT NULL,
    Password_Hash TEXT        NOT NULL,
    Role          TEXT DEFAULT 'Customer'
);

CREATE TABLE IF NOT EXISTS Products
(
    ID          INTEGER PRIMARY KEY AUTOINCREMENT,
    Name        TEXT    NOT NULL,
    Description TEXT,
    Price       REAL    NOT NULL,
    Stock       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Orders
(
    ID         INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID    INTEGER NOT NULL,
    Status     TEXT     DEFAULT 'pending',
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES Users (ID)
);


CREATE TABLE IF NOT EXISTS Order_Items
(
    Order_ID   INTEGER,
    Product_ID INTEGER,
    Quantity   INTEGER NOT NULL,
    PRIMARY KEY (Order_ID, Product_ID),
    FOREIGN KEY (Order_ID) REFERENCES Orders (ID),
    FOREIGN KEY (Product_ID) REFERENCES Products (ID)
);