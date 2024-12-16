<script setup lang="ts">
import { ApiResponse_ConnectionGet } from '@/api/openflighthub-api';
import HubWorkspaceMapConnectionDroneMarker from './HubWorkspaceMapConnectionDroneMarker.vue';
import HubWorkspaceMapConnectionRemoteControllerMarker from './HubWorkspaceMapConnectionRemoteControllerMarker.vue';
import { Viewer } from 'cesium';

const props = defineProps<{
    viewer: Viewer
    connection: ApiResponse_ConnectionGet
}>()

</script>

<template>

    <HubWorkspaceMapConnectionDroneMarker v-if="typeof props.connection.drone_id === 'number'" :drone-id="props.connection.drone_id" :viewer="props.viewer"></HubWorkspaceMapConnectionDroneMarker>

    <HubWorkspaceMapConnectionRemoteControllerMarker v-if="typeof props.connection.remote_controller_id === 'number'" :remote-controller-id="props.connection.remote_controller_id" :viewer="props.viewer"></HubWorkspaceMapConnectionRemoteControllerMarker>

</template>

<style scoped lang="scss">



</style>
