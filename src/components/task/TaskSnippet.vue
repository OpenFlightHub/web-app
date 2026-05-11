<script setup lang="ts">
import { ApiResponse_TaskGet } from 'openflighthub-api-client-sdk';
import Snippet from '../layout/Snippet.vue';
import TaskBadge from './TaskBadge.vue';

const props = defineProps<{
    task: ApiResponse_TaskGet
}>()

</script>

<template>

    <Snippet :to-url="'/task/' + props.task.id">
        <h3 id="title">{{ props.task.name }} <TaskBadge :state="props.task.state"></TaskBadge></h3>
        <p id="description">{{ props.task.description }}</p>
    </Snippet>

</template>

<style scoped lang="scss">

#title {
    display: flex;
    gap: 0.5em;
}

#description {
    font-style: italic;
}

</style>
