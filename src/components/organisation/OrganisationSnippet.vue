<script setup lang="ts">
import api from '@/api';
import Snippet from '../layout/Snippet.vue';
import LoadApi from '../functional/LoadApi.vue';
import LinkVue from '../general/LinkVue.vue';
import FileImageOrIconVue from '../general/FileImageOrIconVue.vue';


const props = defineProps<{
    id: number
}>()

</script>

<template>

    <LoadApi :api-method="api.rest.organisation.get" :params="{organisationId: props.id}" v-slot="scope">
        <Snippet :min-width="100" centered horizontal :to-url="'/organisation/' + props.id">
            <FileImageOrIconVue :file-id="scope.data.logo_file_id" :icon-name="'buildings-fill'" :size="{em: 2}" :thumbnail="true"></FileImageOrIconVue>

            <LinkVue>{{ scope.data.name }}</LinkVue>
        </Snippet>
    </LoadApi>

</template>
