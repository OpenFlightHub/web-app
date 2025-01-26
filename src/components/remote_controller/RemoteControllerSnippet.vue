<script setup lang="ts">
import api from '@/api';
import SnippetWithImage from '../layout/SnippetWithImage.vue';
import LoadApi from '../functional/LoadApi.vue';
import RemoteControllerType from './RemoteControllerType.vue';


const props = defineProps<{
    id: number
}>()

</script>

<template>

    <LoadApi :api-method="api.rest.remoteController.get" :params="{remoteControllerId: props.id}" v-slot="scope">
        <SnippetWithImage :image-url="'/images/remote_controller/type/' + scope.data.type + '.png'">
            <h3><RemoteControllerType :type="scope.data.type"></RemoteControllerType></h3>
            <h4>SN: {{ scope.data.serial_number }}</h4>
        </SnippetWithImage>
    </LoadApi>

</template>
