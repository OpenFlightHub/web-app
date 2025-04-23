<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LiveVideo from './LiveVideo.vue';
import api from '@/api';
import IconVue from '../general/IconVue.vue';

const props = defineProps<{
    connectionId: number
}>()

const myStreamToken = ref('')

onMounted(async()=>{
    myStreamToken.value = (await api.rest.auth.streamToken.get()).token
})

const showFullscreen = ref(false)

</script>

<template>


    <div id="connection-live-stream" :class="{fullscreen: showFullscreen}">
        <div id="top-info">
            <span>Connection {{ props.connectionId }}</span>
        </div>
        <IconVue id="fullscreen-toggle" :name="showFullscreen ? 'x-lg' : 'arrows-fullscreen'" @click="showFullscreen = !showFullscreen"></IconVue>
        <LiveVideo v-if="myStreamToken" class="live_video" :ws-url="'wss://stream.openflighthub.org:3334/ofh/' + props.connectionId + '?auth=' + myStreamToken" :hide-controls="true"></LiveVideo>
    </div>

</template>

<style scoped lang="scss">

#connection-live-stream {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 300px;
    height: calc( 200px + 3em);
    cursor: pointer;
    background-color: var(--neutral-darkest);

    #fullscreen-toggle {
        position: absolute;
        font-size: 1.3em;
        top: 0.5em;
        right: 0.5em;
        color: var(--primary);

        &:hover {
            color: var(--neutral-light);
        }
    }

    #top-info {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1em;
        flex-grow: 0;
    }

    .live_video {
        flex-grow: 1;
    }

    &.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10000;
        width: 100vw;
        height: 100vh;
    }
}


</style>
