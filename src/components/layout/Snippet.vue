<script setup lang="ts">
import Padding from './Padding.vue';

const props = defineProps<{
    minWidth?: number
    minHeight?: number
    centered?: boolean
}>()

</script>

<template>

    <div id="snippet" :style="(typeof props.minWidth === 'number' ? 'min-width: ' + props.minWidth + 'px;' : '') + (typeof props.minHeight === 'number' ? 'min-height: ' + props.minHeight + 'px;' : '')" :class="{centered: props.centered}">
        <Padding>
            <slot></slot>
        </Padding>
    </div>

</template>

<style scoped lang="scss">

#snippet {
    display: inline-flex;
    flex-direction: column;
    background: var(--neutral-dark);
    border-radius: 0.3em;
    gap: 0.5em;

    &.centered {
        justify-content: center;
        align-items: center;
    }
}

</style>
