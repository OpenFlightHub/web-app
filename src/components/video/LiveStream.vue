<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LiveVideo from './LiveVideo.vue';
import api from '@/api';

const props = defineProps<{
    id: string | number
}>()

const myStreamToken = ref('')

onMounted(async()=>{
    myStreamToken.value = (await api.auth.streamToken.get()).token
})

</script>

<template>

    <LiveVideo v-if="myStreamToken" :ws-url="'wss://stream.openflighthub.org:3334/ofh/' + props.id + '?auth=' + myStreamToken" :hide-controls="true"></LiveVideo>

</template>

<style scoped lang="scss">



</style>
