<script setup lang="ts">

</script>

<template>

    <div id="app">
        <slot></slot>
    </div>

</template>

<style scoped lang="scss">

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow-y: auto;
}

</style>
