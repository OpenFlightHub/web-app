<script setup lang="ts">
import * as maplibregl from 'maplibre-gl'
import { ApiResponse_ConnectionGet } from '@/api/openflighthub-api';
import HubWorkspaceMapConnectionDroneMarker from './HubWorkspaceMapConnectionDroneMarker.vue';
import HubWorkspaceMapConnectionRemoteControllerMarker from './HubWorkspaceMapConnectionRemoteControllerMarker.vue';

const props = defineProps<{
    map: maplibregl.Map
    connection: ApiResponse_ConnectionGet
}>()

</script>

<template>

    <HubWorkspaceMapConnectionDroneMarker v-if="typeof props.connection.drone_id === 'number'" :drone-id="props.connection.drone_id" :map="props.map"></HubWorkspaceMapConnectionDroneMarker>

    <HubWorkspaceMapConnectionRemoteControllerMarker v-if="typeof props.connection.remote_controller_id === 'number'" :remote-controller-id="props.connection.remote_controller_id" :map="props.map"></HubWorkspaceMapConnectionRemoteControllerMarker>

</template>

<style scoped lang="scss">



</style>
