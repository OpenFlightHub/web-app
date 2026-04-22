<script setup lang="ts">
import api from '@/api';
import Snippet from '../layout/Snippet.vue';
import LoadApi from '../functional/LoadApi.vue';
import LinkVue from '../general/LinkVue.vue';
import ImageVue from '../general/ImageVue.vue';
import IconVue from '../general/IconVue.vue';


const props = defineProps<{
    id: number
}>()

</script>

<template>

    <LoadApi :api-method="api.rest.team.get" :params="{teamId: props.id}" v-slot="scope">
        <Snippet :min-height="100" :min-width="100" centered horizontal :to-url="'/team/' + props.id">
            <ImageVue v-if="typeof scope.data.logo_file_id === 'number'" :url="api.getFileThumbnailUrl(scope.data.logo_file_id)" :size="{em: 3}"></ImageVue>
            <IconVue v-else name="person-square"></IconVue>

            <LinkVue>{{ scope.data.name }}</LinkVue>
        </Snippet>
    </LoadApi>

</template>
