<script setup lang="ts">
import WIP from '@/components/WIP.vue';

import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter()

const isMainView = computed(()=>{
    return router.currentRoute.value.name === 'hub'
})

</script>

<template>

   <div v-if="isMainView">
      <h1>Hub Connect</h1>

      <RouterLink to="/hub/connect/dji-pilot-2">Connect your DJI Remote Controller now</RouterLink>

      <WIP></WIP>
   </div>
   <RouterView v-else>

   </RouterView>

</template>

<style scoped lang="scss">

</style>

