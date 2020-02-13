<template>
    <div class="search-container">
        <form id="search-form" @submit.prevent="findGood">
            <input type="text" id="search-pattern" v-model.trim="name"/>
            <button id="search-button">Искать</button>
        </form>
    </div>
</template>

<script>
    export default {
        props: ['pattern'],
        data() {
            return {
                name: this.pattern
            }
        },
        methods: {
            findGood() {
                this.$emit('find-good', this.name);
            }
        }
    }
</script>