
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
                    onclick="addGoodToCart()">Добавить</button></div>`;
    }
}

class GoodsList {
    constructor(container) {
        this.container = document.querySelector(container);
        
        this.goods = [];
    }
    
    fetchGoods() {
        this.goods = [
            { id:1, title: "Товар 1", price: 20000},
            { id:2, title: "Товар 2", price: 21500},
            { id:3, title: "Товар 3", price: 32000},
            { id:4, title: "Товар 4", price: 26000},
            { id:5, title: "Товар 5", price: 18000},
            { id:6, title: "Товар 6", price: 34500},
            { id:7, title: "Товар 7", price: 10000},
            { id:8, title: "Товар 8", price: 25000},
            { id:9, title: "Товар 9", price: 20000},
            { id:10, title: "Товар 10", price: 5500},
            { id:11, title: "Товар 11", price: 8000},
            { id:12, title: "Товар 12", price: 12000},
            { id:13, title: "Товар 13", price: 11700},
        ];  
    }
    
    render() {
        let goodsList = '';
        this.goods.forEach(good => {
            const goodsItem = new GoodsItem(good.id, good.title, good.price, good.img);
            goodsList += goodsItem.render();
        });
        this.container.innerHTML = goodsList;
        //this.initListeners();
    }  
}

function addGoodToCart() {
    alert('Товар добавлен в корзину!');
}


const list = new GoodsList('.goods-list');
list.fetchGoods();
list.render();