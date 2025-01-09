<script setup lang="ts">
import LiveVideo from './LiveVideo.vue';

const props = defineProps<{
    id: string | number
}>()

</script>

<template>

    <LiveVideo :ws-url="'wss://stream.openflighthub.org:3334/ofh/' + props.id" :hide-controls="true"></LiveVideo>

</template>

<style scoped lang="scss">



</style>
