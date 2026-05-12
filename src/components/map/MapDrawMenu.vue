<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'primevue';
import MapDrawPoint from '../map/draw/MapDrawPoint.vue';
import ImageVue from '../general/ImageVue.vue';

const props = defineProps<{
    workspaceId: number
    taskId?: number
}>()

type ShowingType = 'none' | 'draw-point'
const showing = ref<ShowingType>('none')

function select(showingType: ShowingType){
    if(showing.value === showingType){
        showing.value = 'none'
    } else {
        showing.value = showingType
    }
}

</script>

<template>

    <div id="draw-menu">
        <Button @click="select('draw-point')" :severity="showing === 'draw-point' ? 'secondary' : undefined"><ImageVue url="/images/geo_objects/markings/0.png" :size="{em: 0.8}"></ImageVue></Button>
    </div>

    <template v-if="showing === 'draw-point'">
        <MapDrawPoint :workspace-id="props.workspaceId" @created="select('none')"></MapDrawPoint>
    </template>

</template>

<style scoped lang="scss">

#draw-menu {
    position: absolute;
    top: 50%;
    left: 5px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    transform: translateY(-50%);
}

</style>
