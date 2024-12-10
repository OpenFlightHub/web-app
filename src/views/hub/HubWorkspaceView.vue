<script setup lang="ts">
import WIP from '@/components/WIP.vue';
import api from '@/api';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';


</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.workspace.get" :id-params="{workspaceId: undefined}" v-slot="scope">
      <div>
         <h1>Workspace {{ scope.data.name }}</h1>

         <WIP></WIP>
      </div>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

