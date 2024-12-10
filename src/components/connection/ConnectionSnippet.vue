<script setup lang="ts">
import api from '@/api';
import Snippet from '../layout/Snippet.vue';
import LoadApi from '../functional/LoadApi.vue';
import RemoteControllerSnippet from '../remote_controller/RemoteControllerSnippet.vue';
import DroneSnippet from '../drone/DroneSnippet.vue';


const props = defineProps<{
    workspaceId: number
    connectionId: number
}>()

</script>

<template>

    <LoadApi :api-method="api.connection.get" :params="{connectionId: props.connectionId}" v-slot="scope">
        <Snippet>
            <div id="inner">
                <RouterLink :to="'/hub/workspace/' + props.workspaceId + '/connnection/' + props.connectionId">Connection #{{ scope.data.id }}</RouterLink>

                <RemoteControllerSnippet v-if="typeof scope.data.remote_controller_id === 'number'" :id="scope.data.remote_controller_id"></RemoteControllerSnippet>

                <DroneSnippet v-if="typeof scope.data.drone_id === 'number'" :id="scope.data.drone_id"></DroneSnippet>
            </div>
        </Snippet>
    </LoadApi>

</template>

<style scoped lang="scss">

#inner {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

</style>
