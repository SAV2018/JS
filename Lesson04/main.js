const API_URL = "https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses";

function makeXMLHttpRequest(url, callback) {
    let xhr;
     
    if (window.XMLHttpRequest) {
        xhr = new window.XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
    }
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //alert('readyState = '+xhr.readyState+' xhr.status = '+ xhr.status+' responseText = '+xhr.responseText);
            callback(xhr.responseText);
        }
    }
    
    xhr.timeout = 5000;
    xhr.ontimeout = function () {
        alert('Timeout');
    }

    xhr.open('GET', url);
    xhr.send();
}

const callback = function viewResponse(text) {
    let goods= JSON.parse(text);

    let s = 'Ответ сервера:\n\nID | Название товара | Цена\n--------------------------------\n';
    for (let item of goods) {
        const good = list.fetchGood(item.id_product);
        s += `${good.id_product} | ${good.product_name} | ${good.price.toLocaleString('ru-RU')} ₽\n`;
    }
    s += '--------------------------------\n';
    alert(s);
}

//------------------------------------------------------------------------------

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
    
        xhr.onreadystatechange = function() {            
            if (xhr.readyState === 4) {
                //alert('readyState = '+xhr.readyState+' xhr.status = '+ xhr.status+' responseText = '+xhr.responseText);
                if (xhr.status === 200) {                    
                    resolve(xhr.responseText)
                } else {
                    reject(xhr.status)
                }
            }
        }
        
        xhr.timeout = 5000;
        xhr.ontimeout = function () {
            reject('Timeout');
        }
        xhr.open('GET', url);
        xhr.send();
    });
}

function usePromise() {
    const request = makeRequest(`${API_URL}/catalogData.json`);
    request
        .then((response) => callback(response))
        .catch((error) => reject(error))
}

const reject = function rejectResponse(error) {
    alert(error);
}


//------------------------------------------------------------------------------

class GoodsItem {
    constructor(id, name, price, img = 'https://via.placeholder.com/150') {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img = img;
    }

    render() {
        return `<div class="goods-item" data-id="${this.id}"><img src="${this.img}" alt="${this.name}" title="${this.name}">
                <h3>${this.name}</h3><p>Цена: <b>${this.price.toLocaleString('ru-RU')} ₽</b></p>
                <button class="add-button" title="Добавить товар в корзину"
                    onclick="addGoodToCart(${this.id})">Добавить</button></div>`;
    }
}

class GoodsList {
    constructor(container) {
        this.container = document.querySelector(container);        
        this.goods = [];
    }
    
    fetchGoods() {
        this.goods = [
            { id_product:1, product_name: "Товар 1", price: 20000},
            { id_product:2, product_name: "Товар 2", price: 21500},
            { id_product:3, product_name: "Товар 3", price: 32000},
            { id_product:4, product_name: "Товар 4", price: 26000},
            { id_product:5, product_name: "Товар 5", price: 18000},
            { id_product:6, product_name: "Товар 6", price: 34500},
            { id_product:7, product_name: "Товар 7", price: 10000},
            { id_product:8, product_name: "Товар 8", price: 25000},
            { id_product:9, product_name: "Товар 9", price: 20000},
            { id_product:10, product_name: "Товар 10", price: 5500},
            { id_product:11, product_name: "Товар 11", price: 8000},
            { id_product: 123, product_name: "Ноутбук", price: 45600 },
            { id_product: 456, product_name: "Мышка", price: 1000 },
        ];
    }
    
    fetchGood(id) {
        return this.goods.find(good => good.id_product === id);
    }
    
    render() {
        let goodsList = '';
        this.goods.forEach(good => {
            const goodsItem = new GoodsItem(good.id_product, good.product_name, good.price, good.img);
            goodsList += goodsItem.render();
        });
        this.container.innerHTML = goodsList;
    }  
}

class Cart {
    constructor(container) {
        this.container = document.querySelector(container);
        
        this.goods = [];
        if (localStorage.getItem('cart') !== null) {
            this.goods = JSON.parse(localStorage.getItem('cart'));
        }
        this.renderCartButton();
    }
    
    renderCartButton() {
        let button = document.getElementById('cart-button');
        
        button.innerHTML = `Корзина (${this.goods.length})`;
        button.title = `${this.sum()} ₽`; // пересчитываем стоимость корзины
        return this.goods.length;
    }
    
    addGood(id) {
        //alert('goods(1): ' + JSON.stringify(this.goods));
        let index = this.goods.findIndex(good => good.id === id);
        if (index < 0) { // товар не найден (товара нет в корзине)
            this.goods.push({id: id, n: 1}); // добавляем товар в корзину
        } else { // товар уже есть в корзине
            this.goods[index].n += 1; // увеличиваем кол-во товара на 1
        }

        this.update();
    }
    
    decGood(id) {
        let index = this.goods.findIndex(good => good.id === id);
        if (index >= 0) { // товар найден (товара в корзине)
            this.goods[index].n -= 1; // уменьшаем кол-во товара на 1
            if (this.goods[index].n === 0) { // если кол-во товара = 0
                this.removeGood(id); // удаляем товар из корзины
            }
        }
        
        this.update();
    }
    
    removeGood(id) {
        let index = this.goods.findIndex(good => good.id === id);
        
        if (index >= 0) { // товар найден (товара в корзине)
            this.goods.splice(index, 1); // удаляем товар
        }
        
        this.update();
    }
    
    update() {
        localStorage.setItem('cart', JSON.stringify(this.goods));
        this.renderCartButton(); // обновляем кол-во товаров в корзине (надпись на кнопке)
        if (isCartMode()) { // если режим просмотра корзины
            this.render(); // перерисовываем корзину
        }        
    }
        
    render() {
        let s = '<h2>Корзина:</h2><hr />';
        for (let item of this.goods) {
            const good = list.fetchGood(item.id);
            s += `<div class="cart-item"><button class="cart-button" title="Увеличить кол-во товара в корзине"
                    onclick="addGoodToCart(${item.id})">+</button><button class="cart-button" title="Уменьшить кол-во товара в корзине"
                    onclick="cart.decGood(${item.id})">-</button><button class="cart-button-red" title="Удалить товар из корзины"
                    onclick="cart.removeGood(${item.id})">х</button> <b>${good.product_name}</b> - ${item.n} шт. * ${good.price.toLocaleString('ru-RU')} ₽ = ${(good.price * item.n).toLocaleString('ru-RU')}  ₽</div>`;
        }
        s += `<hr /><div class="cart-cost">Итого: ${this.sum().toLocaleString('ru-RU')} ₽</div><div><a href="index.html" style="margin: 5px 0; font-weight:bold">« Вернуться к товарам</a></div>`;
        this.container.innerHTML = s;
    }
    
    sum() { // подсчёт стоимости корзины
        let sum = 0;
        for (let item of this.goods) {
            let good = list.fetchGood(item.id);
            sum += item.n * good.price;
        }
        return sum;
    }
}

function addGoodToCart(id) {    
    cart.addGood(id); // добавляем товар в корзину
    const good = list.fetchGood(id);
    document.getElementById('msg-line').innerHTML=`${good.product_name} добавлен в корзину!`;
    let div = document.getElementById('msg-line');
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 5000);
}

function isCartMode() {
    return (window.location.search.lastIndexOf('cart') !== -1)
}



const list = new GoodsList('.goods-list');
list.fetchGoods();
const cart = new Cart('.goods-list');

if (isCartMode()) {
    cart.render();
} else {
    list.render();
}