<script setup lang="ts">
import api from '@/api';
import List from '@/components/layout/List.vue';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import ConnectionSnippet from '@/components/connection/ConnectionSnippet.vue';
import HubWorkspaceMap from '@/components/workspace/HubWorkspaceMap.vue';
import { Tabs, TabList, Tab, TabPanels, TabPanel, InputText, FloatLabel, InputNumber, Button, useToast, Divider, IftaLabel } from 'primevue';
import Padding from '@/components/layout/Padding.vue';
import { useRoute, useRouter } from 'vue-router';
import { getIdQueryFromRouteOrUseDefault } from '@/util/url';
import ConnectionLiveStream from '@/components/video/ConnectionLiveStream.vue';
import HubWorkspaceFiles from '@/components/workspace/HubWorkspaceFiles.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import { uniqueProperty } from '@/util/array';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import { Form, FormSubmitEvent } from '@primevue/forms';

const router = useRouter()

const toast = useToast()

async function saveWorkspace(id: number, event: FormSubmitEvent){
   await api.rest.workspace.patch({params: {workspaceId: id}, data: {name: event.values.name}})
   toast.add({severity: 'success', summary: 'Workspace saved', life: 3000})
   //TODO update loadapi data (or implement that loadapi can use live data instead of only loading on mount)
}
</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.workspace.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="workspace">
      <Padding>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.connections.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="connections">

            <Tabs :value="getIdQueryFromRouteOrUseDefault('tab', useRoute(), 0)" @update:value="evt=>{router.push({query: {tab:  '' + evt}})}">
               <TabList>
                  <Tab :value="0">Map</Tab>
                  <Tab :value="1">Drones</Tab>
                  <Tab :value="2">Streams</Tab>
                  <Tab :value="3">Files</Tab>
                  <Tab :value="4">Connections</Tab>
                  <Tab :value="5">Settings</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel :value="0">
                     <HubWorkspaceMap :workspace-id="workspace.data.id" :connections="connections.data" :longitude="workspace.data.longitude" :latitude="workspace.data.latitude" style="width: 100%; height: 70vh;"></HubWorkspaceMap>
                  </TabPanel>
                  <TabPanel :value="1">
                     <List>
                        <DroneSnippet v-for="droneId in uniqueProperty(connections.data, 'drone_id')" :id="droneId!"></DroneSnippet>
                     </List>
                  </TabPanel>
                  <TabPanel :value="2">
                     <List :horizontal="true">
                        <ConnectionLiveStream v-for="connection in connections.data" :key="connection.id" :connectionId="connection.id"></ConnectionLiveStream>
                     </List>
                  </TabPanel>
                  <TabPanel :value="3">
                     <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.files.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="workspaceFiles">
                        <HubWorkspaceFiles :files="workspaceFiles.data"></HubWorkspaceFiles>
                     </LoadApiArrayWithIdParamInUrl>
                  </TabPanel>
                  <TabPanel :value="4">
                     <List>
                        <ConnectionSnippet v-for="connection in connections.data" :workspace-id="workspace.data.id" :connection-id="connection.id"></ConnectionSnippet>
                     </List>
                  </TabPanel>
                  <TabPanel :value="5">
                     <!-- TODO only users that own workspace (team or organization) should be able to edit -->
                     <Form :initial-values="workspace.data" @submit="(evt) => saveWorkspace(workspace.data.id, evt)" style="display: flex; gap: 1em; flex-direction: column;">

                        <IftaLabel>
                           <InputText id="name" name="name"></InputText>
                           <label for="name">Name</label>
                        </IftaLabel>

                        <div style="display: flex; gap: 1em">
                           <IftaLabel>
                              <InputNumber id="latitude" name="latitude"></InputNumber>
                              <label for="latitude">Latitude</label>
                           </IftaLabel>

                           <IftaLabel>
                              <InputNumber id="longitude" name="longitude"></InputNumber>
                              <label for="longitude">Longitude</label>
                           </IftaLabel>
                        </div>

                        <Button type="submit" label="Save"></Button>
                     </Form>
                  </TabPanel>
               </TabPanels>
            </Tabs>

         </LoadApiArrayWithIdParamInUrl>

      </Padding>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

