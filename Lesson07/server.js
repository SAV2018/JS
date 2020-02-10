const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/goods', (req, res) => {
    console.log(`GetGoods: ${req.header('origin')} | ${JSON.stringify(req.headers)}\n`);
    fs.readFile('./data/goods.json', 'utf-8', (err, data) => {
        res.status(200).header('Access-Control-Allow-Origin', 'null').send(data);
    });
});

app.get('/api/cart', (req, res) => {
    console.log(`GetCart: ${JSON.stringify(req.headers)}\n`);
    fs.readFile('./data/cart.json', 'utf-8', (err, data) => {
        res.status(200).header('Access-Control-Allow-Origin', 'null').send(data);
    });
});

app.post('/api/cart', (req, res) => {
    console.log(`Post: `+JSON.stringify(req.body)+'\n'+JSON.stringify(req.headers));
    fs.writeFile('./data/cart.json', JSON.stringify(req.body), (err) => {
        if (err) {
            res.status(500).end(1); return;
        }
        res.status(200).header({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type, Charset, Origin, Accept'
        }).end('0');
    })
});

const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}!`);
});