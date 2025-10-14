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
    z-index: 2;

    &.no_navbar {
        --navbar-size: 0px;
    }

    #inner {
        position: relative;
        min-height: 100%;
        min-width: 100%;
    }
}


</style>
