<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{
    type: number
}>()

const name = computed(()=>{
    switch(props.type){
        case 0: return 'DJI RC Pro Enterprise'
        case 0: return 'DJI RC Plus'

        default: return 'unknown'
    }
})

</script>

<template>

    {{ name }}

</template>
