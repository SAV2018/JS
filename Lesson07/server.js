const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('*', (req, res, next) => { // посылаем заголовки для Cross-origin Requests
    res.header("Access-Control-Allow-Origin", 'null'); // origin = null
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Charset');
    next();
});

app.get('/api/goods', (req, res) => { // отдаём полный список товаров
    fs.readFile('./data/goods.json', 'utf-8', (err, data) => {
        res.status(200).send(data);
    });
});

app.get('/api/cart', (req, res) => { // отдаём список товаров в корзине
    fs.readFile('./data/cart.json', 'utf-8', (err, data) => {
        res.status(200).send(data);
    });
});

app.post('/api/cart', (req, res) => { // сохраняем содержимое корзины
    fs.writeFile('./data/cart.json', JSON.stringify(req.body), (err) => {
        if (err) {
            res.status(500).end('1'); return;
        }
        res.status(200).end('0');
    });
});

app.get('/api/log', (req, res) => { // отдаём лог с действиями пользователя
    fs.readFile('./data/log.json', 'utf-8', (err, data) => {
        res.status(200).send(data);
    });
});

app.post('/api/log', (req, res) => { // добавляем новую запись в лог
   fs.readFile('./data/log.json', 'utf-8', (err, data) => {
        const log = JSON.parse(data);
        const item = req.body;

        log.push(item);
        fs.writeFile('./data/log.json', JSON.stringify(log), (err) => {
            if (err) {
                res.status(500).end('1'); return;
            }
            res.status(200).end('0');
        });
    });
});

app.delete('/api/log', (req, res) => { // добавляем новую запись в лог
    fs.writeFile('./data/log.json', JSON.stringify([]), (err) => {
        if (err) {
            res.status(500).end('1'); return;
        }
        res.status(200).end('0');
    });
});


const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}!`);
});