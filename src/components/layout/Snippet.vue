<script setup lang="ts">

</script>

<template>

    <div id="snippet">
        <slot></slot>
    </div>

</template>

<style scoped lang="scss">

#snippet {
    display: flex;
    flex-direction: column;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    background: var(--neutral-dark);
}

</style>
