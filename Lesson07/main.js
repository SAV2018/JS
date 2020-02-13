const API_URL ='http://localhost:3000/api';

Vue.component('search-container', {
    props: ['pattern'],
    data() {
        return {
            name: this.pattern
        }
    },
    template:
        `<div class="search-container">
            <form id="search-form" @submit.prevent="findGood">
                <input type="text" id="search-pattern" v-model.trim="name"/>
                <button id="search-button">Искать</button>
            </form>
        </div>`,
    methods: {
        findGood() {
            this.$emit('find-good', this.name);
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
            this.$emit('add-good', this.good.id_product);
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
                <goods-item v-for="good in goods" @add-good="addGood" :key="good.id_product" :good="good"></goods-item>
            </div>
            <div v-else><br />Не найдено товаров.<br /><br /></div>
        </div>`,
    methods: {
        addGood(id) {
            this.$emit('add-good', id);
        }
    } 
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
            this.$root.addGood(this.good.id);
        },        
        decGood() {
            this.$root.decGood(this.good.id);
        },
        removeGood() {
            this.$root.removeGood(this.good.id);
        }
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
            <div v-else><br />Не выбрано товаров.<br /><br /></div><hr />
            <div>
                <button class="cart-button-red" title="Очистить корзину"
                    @click="removeAllGoods">х</button>
                <button class="cart-button" title="Оформить заказ"
                    @click="makeOrder">Оформить заказ</button>
            </div>
            <div class="goods-list-ref">
                <a href="index.html" title="Продолжить выбор товаров">« Вернуться к товарам</a>
            </div>                
        </div>`,
    methods: {
        getSum() {
            app.getSum();
        },
        removeAllGoods() { // очистка корзины
            for (let good of this.goods) {
                app.removeGood(good.id);
            }
        },
        makeOrder() {
            alert('Не сейчас...');
        }
    }
});

Vue.component('log-item', {
    props: ['item'],
    template:
        `<div class="log-item">
            [{{ new Date(item.datetime).toLocaleString('ru-RU') }}] {{ actionName(item.action) }} <b>{{ goodName(item.id) }}</b> (#{{ item.id }}) - <b>{{ item.n }}</b> шт.
        </div>`,
    methods: {
        actionName(code) {
            return ((code === 0) ? 'добавление' : 'удаление');
        },
        goodName(id) {
            return this.$root.fetchGood(id).product_name;
        }
    }
});

Vue.component('log', {
    props: ['ismessage', 'msg', 'islog', 'log'],
    data() {
        return {
            isVisibleLog: this.islog
        }
    },
    computed: {
        getLogButtonTitle() {      
            return (this.isVisibleLog) ? 'Скрыть лог' : 'Показать лог';
        }
    },
    template:
        `<div>
            <transition name="fade">
                <div id="msg-box" v-if="ismessage" v-html="msg"></div>
            </transition>
            <button class="log-button" :title="getLogButtonTitle"
                    @click="switchLog">Лог</button>
            <button class="log-button-red" title="Очистить лог"
                    @click="clearLog">Очистка</button>
            <div class="log-list" v-if="isVisibleLog">
                <log-item v-for="item in log" :item="item"></log-item>
            </div>
        </div>`,
    methods: {
        async switchLog() {
            this.isVisibleLog = !this.isVisibleLog;
            if (this.isVisibleLog) {
                this.$parent.log = await app.makeXHRequest('/log', 'GET');
            }
        },        
        clearLog() { // очитстка лога
            app.makeXHRequest('/log', 'DELETE');
            this.$parent.log = [];
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
        message: '',            // сообщение
        timeoutId: null,    // код таймера
        pattern: '',        // шаблон поиска
        log: [],            // лог действий пользователя
        isVisibleLog: false // признак видимости лога
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

        getCart() { // возвращает дополненный массив данных
            const goods = JSON.parse(JSON.stringify(this.cart));

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
                        if (xhr.status === 200) {
                            resolve(JSON.parse(xhr.responseText)); 
                        } else {
                            reject(xhr.responseText);
                        }
                    }
                }
                
                xhr.timeout = 5000;
                xhr.ontimeout = function () {
                    reject('Timeout');
                }
                
                xhr.onerror = function (err) {
                    reject(err);
                };
  
                xhr.open(http_method, `${API_URL}${url}`);
                if (http_method==='POST') {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Charset', 'utf-8');
                }
                xhr.send(body);
            });
        },
 
        async fetchGoods() { // получение списка товаров
            try {
                this.goods = await this.makeXHRequest('/goods', 'GET')
                this.filteredGoods = [...this.goods];
                
                // загружаем с сервера корзину
                this.cart = await this.makeXHRequest('/cart', 'GET');
                //this.cart = JSON.parse(localStorage.getItem('cart'));
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
            
            const action = {action: 0, id: id, n: 1};
            this.update(action);
        },
        
        decGood(id) { // уменьшение кол-ва товара в корзине
            let index = this.cart.findIndex(good => good.id === id);
            if (index >= 0) { // товар найден (товара в корзине)
                this.cart[index].n -= 1; // уменьшаем кол-во товара на 1
                if (this.cart[index].n === 0) { // если кол-во товара = 0
                    this.removeGood(id); // удаляем товар из корзины
                }
            }
            
            const action = {action: 1, id: id, n: 1};
            this.update(action);
        },
    
        removeGood(id) { // удаление товара из корзины
            const index = this.cart.findIndex(good => good.id === id);
            const n = this.cart[index].n;
            
            if (index >= 0) { // товар найден (товара в корзине)
                this.cart.splice(index, 1); // удаляем товар
            }
            
            const action = {action: 1, id: id, n: n};
            this.update(action);
        },
          
        update(action) { // обновление корзины
            // сохраняем состояние корзины
            //localStorage.setItem('cart', JSON.stringify(this.cart));
            this.makeXHRequest('/cart', 'POST', JSON.stringify(this.cart));
            this.sum(); // пересчитываем стоимость корзины
            this.showMsg(this.getMsg(action)); // выводим сообщение
            
            // сохранение статистики
            const date = new Date();
            action.datetime = date;
            // пишем в лог на сервере
            this.makeXHRequest('/log', 'POST', JSON.stringify(action));
            // добавляем запись в лог
            this.log.push(action);
        },
        
        getMsg(action) {
            let msg = '';
            
            switch (action.action) {
                case 0: // добавление товара в корзину
                    msg = 'В корзину добавлен товар: ' 
                    break;
                case 1: // удаление товара из корзины                    
                    msg = 'Из корзины удалён товар: ';
                    break;
            }
            if (msg !== '') {
                msg = `${msg} ${this.fetchGood(action.id).product_name} (#${action.id}) - ${action.n} шт.`;
            }
            return msg;
        },
       
        showMsg(msg) {
            if (msg === '') return;
            
            if (this.isMsgBox) {
                this.message += `<br />${msg}`;
                clearTimeout(this.timeoutId); // сбрасываем таймаут
                this.isMsgBox = false; // отключаем блок  
            } else {
                this.message = msg;                          
            }
            
            this.isMsgBox = true; // показываем блок
            this.timeoutId = setTimeout(() => { this.isMsgBox = false; }, 3000);            
        },
    
        sum() { // подсчёт стоимости товаров в корзине
            this.cartSum = 0;
            
            for (let item of this.cart) {
                let good = this.fetchGood(item.id);
                this.cartSum += item.n * good.price;
            }
            return this.cartSum;
        },
        
        findGood(pattern) { // поиск товара
            if (pattern === '') {
                this.filteredGoods = [...this.goods];
            } else {
                this.filterGoods(pattern);
            }
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