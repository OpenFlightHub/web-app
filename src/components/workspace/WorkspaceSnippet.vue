<script setup lang="ts">
import api from '@/api';
import Snippet from '../layout/Snippet.vue';
import LoadApi from '../functional/LoadApi.vue';


const props = defineProps<{
    id: number
}>()

</script>

<template>

    <LoadApi :api-method="api.workspace.get" :params="{workspaceId: props.id}" v-slot="scope">
        <Snippet>
            <RouterLink :to="'/hub/workspace/' + props.id">{{ scope.data.name }}</RouterLink>
        </Snippet>
    </LoadApi>

</template>
