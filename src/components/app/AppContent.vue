<script setup lang="ts">

</script>

<template>

    <div id="content">

        <div id="inner">
            <slot></slot>
        </div>

    </div>

</template>

<style scoped lang="scss">

#content {
    position: relative;
    display: flex;
    min-height: 100vh;
    overflow-y: auto;
    z-index: 2;

    #inner {
        position: relative;
        min-height: 100%;
        min-width: 100%;
    }
}


</style>
