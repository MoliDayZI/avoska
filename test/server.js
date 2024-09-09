// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Разрешаем доступ к статическим файлам (например, изображениям)
app.use(express.static('public'));

// Получение всех товаров
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

// Получение товара по ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    });
});

// Оформление заказа
app.post('/api/orders', (req, res) => {
    const { product_id, quantity, customer_name, customer_email, customer_phone, customer_address } = req.body;

    db.run(`
        INSERT INTO orders (product_id, quantity, status, customer_name, customer_email, customer_phone, customer_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [product_id, quantity, 'new', customer_name, customer_email, customer_phone, customer_address], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ order_id: this.lastID });
    });
});

// Получение всех заказов (например, для администратора)
app.get('/api/orders', (req, res) => {
    db.all(`
        SELECT orders.id, products.name AS product_name, orders.quantity, orders.status,
               orders.customer_name, orders.customer_email, orders.customer_phone, orders.customer_address
        FROM orders
        JOIN products ON orders.product_id = products.id
    `, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ orders: rows });
    });
});

// Обновление статуса заказа
app.put('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes > 0) {
            res.json({ message: "Order updated" });
        } else {
            res.status(404).json({ error: "Order not found" });
        }
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});