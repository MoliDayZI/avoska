// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Инициализация базы данных и создание таблиц
db.serialize(() => {
    db.run(`
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            quantity INTEGER,
            status TEXT,
            customer_name TEXT,
            customer_email TEXT,
            customer_phone TEXT,
            customer_address TEXT,
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    `);

    // Добавление примеров товаров
    const stmt = db.prepare(`
        INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)
    `);
    stmt.run("Чеснок", "Ароматный чеснок для ваших блюд.", 100, "img/vegetables/hesnok.png");
    stmt.run("Морковь", "Свежая морковь из огорода.", 50, "img/vegetables/carrot.png");
    stmt.run("Помидор", "Сочные и свежие помидоры.", 80, "img/vegetables/tomato.png");
    stmt.finalize();
});

module.exports = db;