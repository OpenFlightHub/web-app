<script setup lang="ts">
import WIP from '@/components/WIP.vue';
import api from '@/api';
import List from '@/components/layout/List.vue';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import ConnectionSnippet from '@/components/connection/ConnectionSnippet.vue';



</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.workspace.get" :id-params="{workspaceId: undefined}" v-slot="workspace">
      <div>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <h2>Connections</h2>

         <LoadApiWithIdParamInUrl :api-method="api.workspace.connections.get" :id-params="{workspaceId: undefined}" v-slot="connections">

            <List>
               <ConnectionSnippet v-for="connection in connections.data" :workspace-id="workspace.data.id" :connection-id="connection.id"></ConnectionSnippet>
            </List>

         </LoadApiWithIdParamInUrl>

      </div>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

