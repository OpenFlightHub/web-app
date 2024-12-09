<script setup lang="ts">

const props = defineProps<{
    name: string
}>()

</script>

<template>

    <span :class="['bi', 'bi-' + props.name]"></span>

</template>
