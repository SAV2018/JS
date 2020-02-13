<template>
    <div class="cart">
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
    </div>
</template>
    
<script>
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
      
    export default {
        props: ['goods', 'sum'],
        computed: {
            isEmptyCart() {
                return !(this.goods.length > 0)
            },
        },
        methods: {
            getSum() {
                this.$root.getSum();
            },
            removeAllGoods() { // очистка корзины
                for (let good of this.goods) {
                    this.$root.removeGood(good.id);
                }
            },
            makeOrder() {
                alert('Не сейчас...');
            }    
        }
    }
</script>