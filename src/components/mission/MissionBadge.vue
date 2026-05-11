<script setup lang="ts">
import MappedBadge from '../display/MappedBadge.vue';
import MissionState from './MissionState.vue';


const props = defineProps<{
    state: number
}>()

const COLOR_MAP = [{
    value: 0, color: '#bcbcbc'
}, {
    value: 1, color: '#6fa8dc'
}, {
    value: 2, color: '#ffd966'
}, {
    value: 3, color: '#38761d'
}, {
    value: 4, color: '#a22f85'
}, {
    value: 5, color: '#a00'
}, {
    value: 6, color: '#9f580d'
}]


</script>

<template>

    <MappedBadge :value="props.state" :color-map="COLOR_MAP">
        <MissionState :state="props.state"></MissionState>
    </MappedBadge>

</template>
