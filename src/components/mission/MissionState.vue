<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{
    state: number
}>()

const label = computed(()=>{
    switch(props.state){
        case 0: return 'planned'
        case 1: return 'accepted'
        case 2: return 'in progress'
        case 3: return 'done'
        case 4: return 'rejected'
        case 5: return 'failed'
        case 6: return 'canceled'

        default: return '?'
    }
})

</script>

<template>

    {{ label }}

</template>
