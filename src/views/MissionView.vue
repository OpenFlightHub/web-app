<script setup lang="ts">
import api from '@/api';
import List from '@/components/layout/List.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import Padding from '@/components/layout/Padding.vue';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import ApiForm from '@/components/functional/form/ApiForm.vue';
import TaskSnippet from '@/components/task/TaskSnippet.vue';
import ModalVue from '@/components/display/ModalVue.vue';
import { ref } from 'vue';
import SplitVue from '@/components/layout/SplitVue.vue';
import Map from '@/components/map/Map.vue';
import TaskGeoObjects from '@/components/task/TaskGeoObjects.vue';
import LoadApi from '@/components/functional/LoadApi.vue';
import IconVue from '@/components/general/IconVue.vue';
import { Button } from 'primevue';

const showCreateTaskModal = ref(false)

const mapContainer = ref<HTMLDivElement>()

</script>

<template>

    <LoadApiWithIdParamInUrl :api-method="api.rest.mission.get" :config="{params: {}}" :id-params="['missionId']" v-slot="mission">
        <Padding>
            <h1>Mission: {{ mission.data.name }}</h1>

            <LoadApi :api-method="api.rest.workspace.get" :config="{params: {workspaceId: mission.data.workspace_id}}" v-slot="workspace">
                <LoadApiArrayWithIdParamInUrl :api-method="api.rest.mission.tasks.get" :config="{params: {}}" :id-params="['missionId']" v-slot="tasks">

                    <SplitVue>
                        <template #left_or_top>

                            <div ref="mapContainer" style="max-height: 80vh;">
                                <Map v-if="mapContainer" :map-container="mapContainer!" :start-point="{longitude: workspace.data.longitude, latitude: workspace.data.latitude}" :start-height="10000" :start-camera-heading="0" :start-camera-pitch="-90"><!-- implement calculating start point from task geoobjects -->

                                    <TaskGeoObjects v-for="task of tasks.data" :key="task.id" :workspace-id="mission.data.workspace_id" :task="task"></TaskGeoObjects>

                                </Map>
                            </div>

                        </template>
                        <template #right_or_bottom>
                            <Padding>
                                <div style="display: flex;  flex-direction: column;">
                                    <h2>Tasks</h2>
                                    <Button @click="showCreateTaskModal = true"><IconVue name="plus-lg"></IconVue> Create Task</Button>

                                    <List>
                                        <TaskSnippet v-for="task in tasks.data.sort((a, b) => a.id - b.id)" :key="task.id" :task="task" show-geo-objects></TaskSnippet>
                                    </List>

                                    <ModalVue :visible="showCreateTaskModal" @close="showCreateTaskModal = false">
                                        <ApiForm :apiMethod="api.rest.task.post" type="create" :params="{}"
                                        :initial-values="{
                                        mission_id: mission.data.id,
                                        state: 0
                                        }"
                                        :fields="{
                                        name: {type: 'text', required: true},
                                        description: {type: 'textarea', required: true},
                                        mission_id: {type: 'number', required: true},
                                        state: {type: 'number', required: true}
                                        }"
                                        :editable-fields="['name', 'description']"
                                        title="Create Task"
                                        @created="showCreateTaskModal = false"></ApiForm>
                                    </ModalVue>
                                </div>
                            </Padding>
                        </template>
                    </SplitVue>
                </LoadApiArrayWithIdParamInUrl>
            </LoadApi>
        </Padding>
    </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

