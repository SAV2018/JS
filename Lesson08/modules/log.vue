<template>
    <div>
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
    </div> 
</template>

<script>
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

    export default {
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
        methods: {
            async switchLog() {
                this.isVisibleLog = !this.isVisibleLog;
                if (this.isVisibleLog) {
                    this.$root.log = await this.$root.makeXHRequest('/log', 'GET');
                }
            },        
            clearLog() { // очитстка лога
                this.$root.makeXHRequest('/log', 'DELETE');
                this.$root.log = [];
            }      
        }
    }    
</script>