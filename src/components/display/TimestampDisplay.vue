<script setup lang="ts">

const props = defineProps<{
    timestamp: string //ISO string
}>()

</script>

<template>

    {{ new Date(props.timestamp).toLocaleString() }}

</template>

<style scoped lang="scss">



</style>
