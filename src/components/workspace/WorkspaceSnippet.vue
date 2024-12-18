<script setup lang="ts">
import api from '@/api';
import Snippet from '../layout/Snippet.vue';
import LoadApi from '../functional/LoadApi.vue';
import LinkVue from '../general/LinkVue.vue';


const props = defineProps<{
    id: number
}>()

</script>

<template>

    <LoadApi :api-method="api.workspace.get" :params="{workspaceId: props.id}" v-slot="scope">
        <Snippet :min-height="100" :min-width="100" centered :to-url="'/workspace/' + props.id">
            <LinkVue>{{ scope.data.name }}</LinkVue>
        </Snippet>
    </LoadApi>

</template>


<style lang="scss" scoped>

</style>