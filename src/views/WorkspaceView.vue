<script setup lang="ts">
import api from '@/api';
import List from '@/components/layout/List.vue';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import ConnectionSnippet from '@/components/connection/ConnectionSnippet.vue';
import HubWorkspaceMap from '@/components/workspace/HubWorkspaceMap.vue';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button } from 'primevue';
import Padding from '@/components/layout/Padding.vue';
import { useRoute, useRouter } from 'vue-router';
import { getIdQueryFromRouteOrUseDefault } from '@/util/url';
import ConnectionLiveStream from '@/components/video/ConnectionLiveStream.vue';
import HubWorkspaceFiles from '@/components/workspace/HubWorkspaceFiles.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import { uniqueProperty } from '@/util/array';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import ApiForm from '@/components/functional/form/ApiForm.vue';
import MissionSnippet from '@/components/mission/MissionSnippet.vue';
import ModalVue from '@/components/display/ModalVue.vue';
import { ref } from 'vue';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import IconVue from '@/components/general/IconVue.vue';
import TeamSnippet from '@/components/team/TeamSnippet.vue';
import {DataTable, Column} from 'primevue';

const router = useRouter()

const showCreateMissionModal = ref(false)

const showInviteTeamModal = ref(false)

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.workspace.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="workspace">
      <Padding>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.connections.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="connections">

            <Tabs :value="getIdQueryFromRouteOrUseDefault('tab', useRoute(), 0)" @update:value="evt=>{router.push({query: {tab:  '' + evt}})}">
               <TabList>
                  <Tab :value="0">Map</Tab>
                  <Tab :value="1">Missions</Tab>
                  <Tab :value="2">Drones</Tab>
                  <Tab :value="3">Streams</Tab>
                  <Tab :value="4">Files</Tab>
                  <Tab :value="5">Connections</Tab>
                  <Tab :value="6">Settings</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel :value="0">
                     <HubWorkspaceMap :workspace-id="workspace.data.id" :connections="connections.data" :longitude="workspace.data.longitude" :latitude="workspace.data.latitude" style="width: 100%; height: 70vh;"></HubWorkspaceMap>
                  </TabPanel>
                  <TabPanel :value="1">
                     <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.missions.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="missions">

                        <Button @click="showCreateMissionModal = true"><IconVue name="plus-lg"></IconVue> Create Mission</Button>
                        <List>
                           <MissionSnippet v-for="mission of missions.data.sort((a, b) => a.id - b.id)" :mission="mission" show-tasks></MissionSnippet>
                        </List>

                        <LoadApiArray :api-method="api.rest.team.allTeams.get" :config="{}" v-slot="teams">
                           <ModalVue :visible="showCreateMissionModal" @close="showCreateMissionModal = false">
                              <ApiForm :apiMethod="api.rest.mission.post" type="create" :params="{}"
                                 :initial-values="{
                                    workspace_id: workspace.data.id,
                                    state: 0
                                 }"
                                 :fields="{
                                    name: {type: 'text', required: true},
                                    assigned_to_team_id: {type: 'select', required: false, options: teams.data.map(team => ({ label: team.name, value: team.id }))},
                                    description: {type: 'textarea', required: false},
                                    state: {type: 'number', required: true},
                                    workspace_id: {type: 'number', required: true}
                                 }"
                                 :editable-fields="['name', 'assigned_to_team_id', 'description']"
                                 title="Create Mission" @created="showCreateMissionModal = false"></ApiForm>
                           </ModalVue>
                        </LoadApiArray>

                     </LoadApiArrayWithIdParamInUrl>
                  </TabPanel>
                  <TabPanel :value="2">
                     <List>
                        <DroneSnippet v-for="droneId in uniqueProperty(connections.data, 'drone_id').sort()" :id="droneId!"></DroneSnippet>
                     </List>
                  </TabPanel>
                  <TabPanel :value="3">
                     <List :horizontal="true">
                        <ConnectionLiveStream v-for="connection in connections.data.sort((a, b) => a.id - b.id)" :key="connection.id" :connectionId="connection.id"></ConnectionLiveStream>
                     </List>
                  </TabPanel>
                  <TabPanel :value="4">
                     <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.files.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="workspaceFiles">
                        <HubWorkspaceFiles :files="workspaceFiles.data"></HubWorkspaceFiles>
                     </LoadApiArrayWithIdParamInUrl>
                  </TabPanel>
                  <TabPanel :value="5">
                     <List>
                        <ConnectionSnippet v-for="connection in connections.data.sort((a, b) => a.id - b.id)" :workspace-id="workspace.data.id" :connection-id="connection.id"></ConnectionSnippet>
                     </List>
                  </TabPanel>
                  <TabPanel :value="6">
                     <!-- TODO only users that own workspace (team or organization) should be able to edit -->

                     <ApiForm :apiMethod="api.rest.workspace.patch" :params="{workspaceId: workspace.data.id}" type="edit"
                        :initial-values="workspace.data"
                        :fields="{
                           name: {type: 'text', required: true},
                           latitude: {type: 'map-location', required: true, latitudeField: 'latitude', longitudeField: 'longitude', defaultValue: 48.1},
                           longitude: {type: 'map-location', required: true, latitudeField: 'latitude', longitudeField: 'longitude', defaultValue: 11.6}
                        }"
                        :editable-fields="['name', 'latitude', 'longitude']"
                        title="Edit Workspace"
                        @created="(updatedWorkspace) => workspace.data = updatedWorkspace"></ApiForm>

                        <h3>Access</h3>

                        <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.permissions.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="permissions">

                           <Button @click="showInviteTeamModal = true"><IconVue name="plus-lg"></IconVue>Invite Team</Button>

                           <LoadApiArray :api-method="api.rest.team.allTeams.get" :config="{}" v-slot="allTeams">
                                 <ModalVue :visible="showInviteTeamModal" @close="showInviteTeamModal = false">
                                    <ApiForm type="action" title="Invite Team" :api-method="api.rest.workspace.inviteTeam.post" :params="{
                                       workspaceId: workspace.data.id
                                    }" :fields="{
                                       team_id: {type: 'select', required: true, options: allTeams.data.filter(team => !permissions.data.find(permission => permission.team_id === team.id)).map(team => ({value: team.id, label: team.name}))}
                                    }" :initial-values="{}" :editable-fields="['team_id']" @created="ref => {showInviteTeamModal = false}"></ApiForm>
                                 </ModalVue>
                           </LoadApiArray>

                           <DataTable :value="permissions.data" show-gridlines striped-rows sort-field="team_id" :sort-order="1">
                              <Column field="team_id" hidden sortable></Column>
                              <Column field="team" header="Team" sortable>
                                 <template #body="slotProps">
                                    <TeamSnippet :id="slotProps.data.team_id"></TeamSnippet>
                                 </template>
                              </Column>
                              <Column field="actions" header="">
                                 <template #body="slotProps">
                                       <Button severity="danger" @click="api.rest.workspace.kickTeam.post({
                                          params: {workspaceId: workspace.data.id},
                                          data: {team_id: slotProps.data.team_id}
                                          })"><IconVue name="x-lg"></IconVue>Kick Team</Button>
                                 </template>
                              </Column>
                        </DataTable>

                        </LoadApiArrayWithIdParamInUrl>

                  </TabPanel>
               </TabPanels>
            </Tabs>

         </LoadApiArrayWithIdParamInUrl>

      </Padding>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

