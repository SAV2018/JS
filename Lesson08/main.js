import goods from './modules/goods.vue'
import search from './modules/search.vue'
import cart from './modules/cart.vue'
import log from './modules/log.vue'

const API_URL ='http://localhost:3000/api';

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
    components: {
        search,
        goods,
        cart, 
        log
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