const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

const app = new Vue({
    el: '#app',
    data: {
        cart: [],           // список товаров в корзине
        goods: [],          // список всех товаров
        filteredGoods: [],  // список вывода товаров
        pattern: ''         // шаблон поиска
    },
    computed: {
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
        },
        
        emptyGoodsList() {
            return !(this.filteredGoods.length > 0);
        },
        
        emptyCart() {
            return !(this.cart.length > 0)
        }
    },
    methods: { 
        makeXHRequest(url) {
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
                
                xhr.open('GET', url);
                xhr.send();
            });
        },
 
        async fetchGoods() { // получение списка товаров
            try {
                this.goods = await this.makeXHRequest(`${API_URL}/catalogData.json`)
                this.filteredGoods = [...this.goods];
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
    
            this.update();
        },
        
        decGood(id) { // уменьшение кол-ва товара в корзине
            let index = this.cart.findIndex(good => good.id === id);
            if (index >= 0) { // товар найден (товара в корзине)
                this.cart[index].n -= 1; // уменьшаем кол-во товара на 1
                if (this.cart[index].n === 0) { // если кол-во товара = 0
                    this.removeGood(id); // удаляем товар из корзины
                }
            }
            
            this.update();
        },
    
        removeGood(id) { // удаление товара из корзины
            let index = this.cart.findIndex(good => good.id === id);
            
            if (index >= 0) { // товар найден (товара в корзине)
                this.cart.splice(index, 1); // удаляем товар
            }
            
            this.update();
        },
          
        update() { // сохранение корзины
            localStorage.setItem('cart', JSON.stringify(this.cart));   
        },
    
        sum() { // подсчёт стоимости товаров в корзине
            let sum = 0;
            
            for (let item of this.cart) {
                let good = this.fetchGood(item.id);
                sum += item.n * good.price;
            }
            return sum;
        },
        
        findGood() { // поиск товара
            if (this.pattern !== '') this.filterGoods(this.pattern);
        },
        
        filterGoods(pattern) { // получение списка товаров по шаблону
            const rex = new RegExp(pattern, 'i');
            this.filteredGoods = this.goods.filter((good) => {
                return rex.test(good.product_name, pattern);                                  
            });
        }
    },
    mounted() {
        this.fetchGoods();
        
        if (localStorage.getItem('cart') !== null) {
            this.cart = JSON.parse(localStorage.getItem('cart'));
        }
    }
});