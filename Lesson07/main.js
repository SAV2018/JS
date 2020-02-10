const API_URL ='http://localhost:3000/api';

Vue.component('search-container', {
    props: ['pattern'],
    template:
        `<div class="search-container">
            <form id="search-form" @submit.prevent="findGood">
                <input type="text" id="search-pattern" v-model.trim="pattern"/>
                <button id="search-button">Искать</button>
            </form>
        </div>`,
    methods: {
        findGood() {
            app.findGood(this.pattern);
        }
    }
});

Vue.component('goods-item', {
    props: ['good'],
    template:
        `<div class="goods-item">
            <img :src="good.img ? good.img : 'https://via.placeholder.com/150'"
                 :alt="good.product_name" :title="good.product_name">
            <h3>{{ good.product_name }}</h3>
            <p>Цена: <b>{{ good.price.toLocaleString('ru-RU') }} ₽</b></p>
            <button class="add-button" title="Добавить товар в корзину"
                    @click="onClickAddGoodButton">Добавить</button>
        </div>`,
    methods: {
        onClickAddGoodButton() {
            app.addGood(this.good.id_product);
        }
    }    
});

Vue.component('goods-list', {
    props: ['goods'],
    computed: {   
        isEmptyGoodsList() {
            return !(this.goods.length > 0);
        },
    },
    template:
        `<div class="goods-list">
            <div v-if="!isEmptyGoodsList">
                <goods-item v-for="good in goods" :key="good.id_product" :good="good"></goods-item>
            </div>
            <div v-else><br />Не найдено товаров.<br /><br /></div>
        </div>`
});

Vue.component('cart-item', {
    props: ['good'],
     template:
        `<div class="cart-item">
            <button class="cart-button" title="Увеличить кол-во товара в корзине"
                    @click="addGood">+</button>
            <button class="cart-button" title="Уменьшить кол-во товара в корзине"
                    @click="decGood">-</button>
            <button class="cart-button-red" title="Удалить товар из корзины"
                    @click="removeGood">х</button>
            <b>{{ good.name }}</b> - {{ good.n }} шт. * {{ good.price.toLocaleString('ru-RU') }} ₽ = {{ (good.price * good.n).toLocaleString('ru-RU') }}  ₽ 
        </div>`,
    methods: {
        addGood() {
            app.addGood(this.good.id);
        },        
        decGood() {
            app.decGood(this.good.id);
        },
        removeGood() {
            app.removeGood(this.good.id);
        },        
    }
});
  
Vue.component('cart', {
    props: ['goods', 'sum'],
    computed: {
        isEmptyCart() {
            return !(this.goods.length > 0)
        },
    },
    template:
        `<div class="cart">
            <h2>Корзина:</h2><hr />
            <div v-if="!isEmptyCart">
                <cart-item v-for="good in goods" :key="good.id" :good="good"></cart-item>
             <hr /><div class="cart-cost">Итого: {{ sum }}</div>   
            </div>
            <div v-else><br />Не найдено товаров.<br /><br /></div><hr />
            <div>
                <a href="index.html" style="margin: 5px 0; font-weight:bold">« Вернуться к товарам</a>
            </div>                
        </div>`,
    methods: {
        getSum() {
            app.getSum();
        }
    }
});

const app = new Vue({
    el: '#app',
    data: {
        cart: [],           // список товаров в корзине
        goods: [],          // список всех товаров
        filteredGoods: [],  // список вывода товаров
        cartSum: 0,         // стоимость корзины
        isMsgBox: false,    // признак вывода окна сообщения
        msg: '',            // сообщение
        timeoutId: null,    // код таймера
        pattern: ''         // шаблон поиска
    },
    computed: {
        getSum() {
            return `${this.cartSum.toLocaleString('ru-RU')} ₽`;
        },
        
        getImage(good) {
            if (!good.img) {
                good.img = 'https://via.placeholder.com/150';
            }
            return good.img;
        },
        
        isCartMode() { // режим корзины
            return (window.location.search.lastIndexOf('cart') !== -1)
        },
        
        cartSize() { // кол-во товаров в корзине (разных наименований)
            return this.cart.length;
        },
        
        getCart() {
            let goods = this.cart;

            goods.forEach((good, index) => {
                const item = this.fetchGood(good.id);
                goods[index].price = item.price;
                goods[index].name = item.product_name;
            });
            return goods;            
        }
    },
    methods: { 
        makeXHRequest(url, http_method, body = null) {
            return new Promise((resolve, reject) => {
                let xhr;
                if (window.XMLHttpRequest) {
                    xhr = new window.XMLHttpRequest();
                } else  {
                    xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
                }
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
//alert(xhr.readyState + ' | ' + xhr.status + ' | '+ xhr.responseText);
                        if (xhr.status === 200) {
                            resolve(JSON.parse(xhr.responseText)); 
                        } else {
//alert(`http Ошибка: ${xhr.status} : ${xhr.statusText}`);
                            reject(xhr.responseText);
                        }
                    }
                }
                
                xhr.timeout = 5000;
                xhr.ontimeout = function () {
                    reject('Timeout');
                }
                
                xhr.onerror = function (err) {
//alert(`Ошибка соединения: ${xhr.status} : ${xhr.statusText}`);
                    reject(err);
                };
  
                xhr.open(http_method, `${API_URL}${url}`);
                if (http_method === 'POST') {
                    //xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8;');
                    xhr.setRequestHeader('Content-Type', 'application/json');
                }
//alert(http_method + url + body);
                xhr.send(body);
            });
        },
 
        async fetchGoods() { // получение списка товаров
            try {
                this.goods = await this.makeXHRequest('/goods', 'GET')
                this.filteredGoods = [...this.goods];
                
                // загружаем с сервера корзину
                this.cart = await this.makeXHRequest('/cart', 'GET');
                this.cart = JSON.parse(localStorage.getItem('cart'));
                this.sum();               
            } catch (e) {
                console.error(e);
            }
        },
 
        fetchGood(id) { // получение товара по id
            return this.goods.find(good => good.id_product === id);
        },

        addGood(id) { // добавление товара в корзину
            let index = this.cart.findIndex(good => good.id === id);

            if (index < 0) { // товар не найден (товара нет в корзине)
                this.cart.push({id: id, n: 1}); // добавляем товар в корзину
            } else { // товар уже есть в корзине
                this.cart[index].n += 1; // увеличиваем кол-во товара на 1
            }
            this.update(`В корзину добавлен товар: ${this.fetchGood(id).product_name} (${id}) - 1 шт.`);
        },
        
        decGood(id) { // уменьшение кол-ва товара в корзине
            let index = this.cart.findIndex(good => good.id === id);
            if (index >= 0) { // товар найден (товара в корзине)
                this.cart[index].n -= 1; // уменьшаем кол-во товара на 1
                if (this.cart[index].n === 0) { // если кол-во товара = 0
                    this.removeGood(id); // удаляем товар из корзины
                }
            }            
            this.update(`Из корзины удалён товар: ${this.fetchGood(id).product_name} (${id}) - 1 шт.`);
        },
    
        removeGood(id) { // удаление товара из корзины
            const index = this.cart.findIndex(good => good.id === id);
            const n = this.cart[index].n;
            
            if (index >= 0) { // товар найден (товара в корзине)
                this.cart.splice(index, 1); // удаляем товар
            }
            this.update(`Из корзины удалён товар: ${this.fetchGood(id).product_name} (${id}) - ${n} шт.`);
        },
          
        update(msg = '') { // обновление корзины
            // сохраняем состояние корзины
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.makeXHRequest('/cart', 'POST', JSON.stringify(this.cart));
            this.sum(); // пересчитываем стоимость корзины
            this.showMsg(msg); // выводим сообщение
        },
        
        showMsg(msg) {
            if (msg === '') return;
            
            if (this.isMsgBox) {
                this.msg += `<br />${msg}`;
                clearTimeout(this.timeoutId); // сбрасываем таймаут
                this.isMsgBox = false; // отключаем блок  
            } else {
                this.msg = msg;                          
            }
            
            this.isMsgBox = true; // показываем блок
            this.timeoutId = setTimeout(() => { this.isMsgBox = false; }, 4000);            
        },
    
        sum() { // подсчёт стоимости товаров в корзине
            for (let item of this.cart) {
                let good = this.fetchGood(item.id);
                this.cartSum += item.n * good.price;
            }
            return this.cartSum;
        },
        
        findGood(pattern) { // поиск товара
            if (pattern !== '') this.filterGoods(pattern);
        },
        
        filterGoods(pattern) { // получение списка товаров по шаблону
            const rex = new RegExp(pattern, 'i');
            this.filteredGoods = this.goods.filter((good) => {
                return rex.test(good.product_name, pattern);                                  
            });
        },
        
        intoCart() { // переход к просмотру корзины
            document.location='index.html?cart';
        }
    },
    mounted() {
        this.fetchGoods();
    }
});