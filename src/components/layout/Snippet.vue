<script setup lang="ts">
import { computed } from 'vue';
import Padding from './Padding.vue';

const props = defineProps<{
    minWidth?: number
    minHeight?: number
    centered?: boolean
    toUrl?: string
}>()

const style = computed(()=>{
    return (typeof props.minWidth === 'number' ? 'min-width: ' + props.minWidth + 'px;' : '') + (typeof props.minHeight === 'number' ? 'min-height: ' + props.minHeight + 'px;' : '')
})

const clazz = computed(()=>{
    return {centered: props.centered}
})

</script>

<template>

    <RouterLink v-if="props.toUrl" id="router_link" :style="style" :class="clazz" :to="props.toUrl">
        <Padding>
            <slot></slot>
        </Padding>
    </RouterLink>

    <div v-else id="snippet" :style="style" :class="clazz">
        <Padding>
            <slot></slot>
        </Padding>
    </div>

</template>

<style scoped lang="scss">

#router_link, #snippet {
    display: inline-flex;
    flex-direction: column;
    background: var(--neutral-darker);
    border-radius: 0.3em;
    gap: 0.5em;

    &.centered {
        justify-content: center;
        align-items: center;
    }

}

#router_link {
    transition: all 0.2s ease;
    color: var(--text-color);

    &:hover {
        filter: brightness(90%) saturate(90%);
    }

    &:visited {
        color: var(--text-color);
    }
}

</style>
