<script setup lang="ts">
import Padding from './Padding.vue';


</script>

<template>

    <div id="snippet">
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
}

</style>
