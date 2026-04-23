<script setup lang="ts">
/**
 * @prop decimals The number of decimals to show. default: 2
 */
const props = defineProps<{
    number: number
    decimals?: number
}>()

</script>

<template>

    <span>{{ props.number.toFixed(props.decimals ?? 2) }}</span>

</template>
