const default_image = 'https://via.placeholder.com/150'; // фото товара по умолчанию
const goods = [
    { title: "Товар 1", price: 20000},
    { title: "Товар 2", price: 21500},
    { title: "Товар 3", price: 32000},
    { title: "Товар 4", price: 26000},
    { title: "Товар 5", price: 18000},
    { title: "Товар 6", price: 34500},
    { title: "Товар 7", price: 10000},
    { title: "Товар 8", price: 25000},
    { title: "Товар 9", price: 20000},
    { title: "Товар 10", price: 5500},
    { title: "Товар 11", price: 8000},
    { title: "Товар 12", price: 12000},
    { title: "Товар 13", price: 11700},
];

function addGoodToCart() {
    alert('Товар добавлен в корзину!');
}

const renderGoodsItem = (title, price, img = default_image) => {
    const formatter = new Intl.NumberFormat('ru'); // форматирование цены
    return `<div class="good-item"><img src="${img}" alt="${title}" title="${title}">
            <h3>${title}</h3><p>Цена: <b>${formatter.format(price)} ₽</b></p>
            <button class="add-button" title="Добавить товар в корзину"
                    onclick="addGoodToCart()">Добавить</button></div>`;
};

const renderGoodsList = (list, container) => {
    const goodsList = list.map(good => renderGoodsItem(good.title, good.price, good.img));
    document.querySelector(container).innerHTML = goodsList.join('');
};

renderGoodsList(goods, '.good-list');