<script setup lang="ts">

const props = defineProps<{
    animated?: boolean
}>()

import BackgroundVue from '../branding/BackgroundVue.vue';
</script>

<template>

    <BackgroundVue id="background" :animated="props.animated" :style="!props.animated ? 'opacity: 0.05' : ''">
    </BackgroundVue>

</template>

<style scoped lang="scss">

#background {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100vw;
    height: 100vh;
}

</style>
