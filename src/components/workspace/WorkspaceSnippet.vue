<script setup lang="ts">
import api from '@/api';
import { ApiResponse_WorkspaceGet } from '@/api/openflighthub-api'
import { updateObject } from '@/util/vue';
import { ref, onMounted, watch, reactive } from 'vue';
import Snippet from '../layout/Snippet.vue';


const props = defineProps<{
    id: number
}>()

const isLoading = ref(true)

const workspace = reactive({} as ApiResponse_WorkspaceGet)

onMounted(load)

watch(()=>{
    return props.id
}, load)

async function load(){
    isLoading.value = true

    updateObject(workspace, await api.workspace.get({
        workspaceId: props.id
    }))

    isLoading.value = false
}

</script>

<template>

    <Snippet>
        <RouterLink :to="'/hub/workspace/' + props.id">{{ workspace.name }}</RouterLink>
    </Snippet>

</template>

<style scoped lang="scss">


</style>
