<script lang="ts">

import { defineComponent } from 'vue';
import { RouterView } from 'vue-router'

export default defineComponent({

    components: { RouterView }

})

</script>

<script lang="ts" setup>
    import useMainStore from "@/stores/main"
    const store = useMainStore()

</script>

<template>

    <RouterView/>

</template>

<style scoped lang="scss">

</style>

<style lang="scss">

html {
    overflow: auto !important;//fix vuetify
}

</style>
