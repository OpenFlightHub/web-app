<script setup lang="ts">

const props = defineProps<{
    noNavBar?: boolean
}>()

</script>

<template>

    <div id="content" :class="{no_navbar: props.noNavBar}">

        <div id="inner">
            <slot></slot>
        </div>

    </div>

</template>

<style scoped lang="scss">

#content {
    min-height: calc(100vh - var(--navbar-size));
    overflow-y: auto;
    position: relative;

    &.no_navbar {
        min-height: 100vh;
    }

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
        min-height: 100%;
        min-width: 100%;
        z-index: 2;
    }
}

</style>
