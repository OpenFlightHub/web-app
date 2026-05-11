<script setup lang="ts">
import { ApiResponse_WorkspaceGeoObjectsGet } from 'openflighthub-api-client-sdk';
import Snippet from '../layout/Snippet.vue';
import GeoObjectTypeBadge from './GeoObjectTypeBadge.vue';

const props = defineProps<{
    geoObject: ApiResponse_WorkspaceGeoObjectsGet[number]
}>()

</script>

<template>

    <Snippet>
        <h3 id="title">{{ props.geoObject.name }} <GeoObjectTypeBadge :type="props.geoObject.type"></GeoObjectTypeBadge></h3>
    </Snippet>

</template>

<style scoped lang="scss">

#title {
    display: flex;
    gap: 0.5em;
}

</style>
