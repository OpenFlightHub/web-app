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
    flex-grow: 1;
    background: var(--neutral-darker);

    &:after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 1;
        background-image: url('/images/logo_pattern.png');
        background-size: 100px;
        background-position: center;
        background-repeat: repeat;
        opacity: 0.5%;
    }

    #inner {
        position: relative;
        height: 100%;
        width: 100%;
        z-index: 2;
    }
}

</style>
