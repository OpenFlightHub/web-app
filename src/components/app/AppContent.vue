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
    position: relative;
    display: flex;
    min-height: calc(100vh - var(--navbar-size));
    overflow-y: auto;

    background-image: url('/images/logo_pattern_grey_semitransparent.png');
    background-size: 100px;
    background-position: center;
    background-repeat: repeat;

    &.no_navbar {
        --navbar-size: 0px;
    }

    #inner {
        position: relative;
        min-height: 100%;
        min-width: 100%;
        z-index: 2;
    }
}

</style>
