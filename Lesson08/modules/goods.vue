<template>
    <div class="goods-list">
        <div v-if="!isEmptyGoodsList">
            <goods-item v-for="good in goods" @add-good="addGood" :key="good.id_product" :good="good"></goods-item>
        </div>
        <div v-else><br />Не найдено товаров.<br /><br /></div>
    </div>
</template>

<script>
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

    export default {
        props: ['goods'],
        computed: {   
            isEmptyGoodsList() {
                return !(this.goods.length > 0);
            },
        },
        methods: {
            addGood(id) {
                this.$emit('add-good', id);
            }
        } 
    }
</script>