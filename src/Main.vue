<script lang="ts">

import { defineComponent } from 'vue';
import { RouterView } from 'vue-router'

export default defineComponent({

    components: { RouterView }

})


// fix cesium static url
//@ts-ignore
window.CESIUM_BASE_URL = '/cesiumStatic'

</script>

<template>

    <RouterView/>

</template>
