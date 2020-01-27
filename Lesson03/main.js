  

class GoodsItem {
    constructor(id, name, price, img = 'https://via.placeholder.com/150') {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img = img;
    }

    render() {
        const formatter = new Intl.NumberFormat('ru'); // форматирование цены
        return `<div class="goods-item" data-id="${this.id}"><img src="${this.img}" alt="${this.name}" title="${this.name}">
                <h3>${this.name}</h3><p>Цена: <b>${formatter.format(this.price)} ₽</b></p>
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
            { id:1, name: "Товар 1", price: 20000},
            { id:2, name: "Товар 2", price: 21500},
            { id:3, name: "Товар 3", price: 32000},
            { id:4, name: "Товар 4", price: 26000},
            { id:5, name: "Товар 5", price: 18000},
            { id:6, name: "Товар 6", price: 34500},
            { id:7, name: "Товар 7", price: 10000},
            { id:8, name: "Товар 8", price: 25000},
            { id:9, name: "Товар 9", price: 20000},
            { id:10, name: "Товар 10", price: 5500},
            { id:11, name: "Товар 11", price: 8000},
            { id:12, name: "Товар 12", price: 12000},
            { id:13, name: "Товар 13", price: 11700},
        ];  
    }
    
    fetchGood(id) {
        return this.goods.find(good => good.id === id);
    }
    
    render() {
        let goodsList = '';
        this.goods.forEach(good => {
            const goodsItem = new GoodsItem(good.id, good.name, good.price, good.img);
            goodsList += goodsItem.render();
        });
        this.container.innerHTML = goodsList;
    }  
}

class Cart {
    constructor() {
        // ...cookie
        this.goods = []; // {id, n}
    }
    
    renderCartButton() {
        let button = document.getElementById('cart-button');
        button.innerHTML = `Корзина (${this.goods.length})` 
        button.title = `${this.sum()} ₽`; // пересчитываем стоимость корзины
        return this.goods.length;
    }
    
    addGood(id) {
        //alert('goods(1): ' + JSON.stringify(this.goods));
        let index = this.goods.findIndex(good => good.id === id);
        if (index < 0) { // товар не найден (товара нет в корзине)
            this.goods.push({id: id, n: 1}); // добавляем товар в корзину
        } else { // товар уже есть в корзине
            this.goods[index].n += 1; // увеличиваем кол-во товара
        } 

        this.renderCartButton(); // обновляем кол-во товаров в корзине (надпись на кнопке)
        //alert('goods(2): ' + JSON.stringify(this.goods));  
    }
    
    viewCart() { // просмотр корзины   
        let s = 'Корзина:\n';
        for (let item of this.goods) {
            let good = list.fetchGood(item.id);
            s += `${good.name} - ${item.n} шт. * ${good.price} ₽ = ${good.price * item.n}  ₽\n`;
        }
        s += `-------------------------\nИтого: ${this.sum()} ₽`;
        alert(s);        
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
    let good = list.fetchGood(id);
    document.getElementById('msg-line').innerHTML=`${good.name} добавлен в корзину!`;
    let div = document.getElementById('msg-line');
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 5000);
}


const list = new GoodsList('.goods-list');
const cart = new Cart();
list.fetchGoods();
list.render();