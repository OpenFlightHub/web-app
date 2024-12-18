<script setup lang="ts">

const props = defineProps<{
    horizontal?: boolean
}>()

</script>

<template>

    <div id="list" :style="'flex-direction: ' + (props.horizontal ? 'row' : 'column')">
        <slot></slot>
    </div>

</template>

<style scoped lang="scss">

#list {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
}

</style>
