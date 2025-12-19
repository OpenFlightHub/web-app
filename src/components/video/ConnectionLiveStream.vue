<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import LiveVideo from './LiveVideo.vue';
import api from '@/api';
import IconVue from '../general/IconVue.vue';
import { ApiResponse_ConnectionGet } from 'openflighthub-api-client-sdk';
import { updateObject } from '@/util/vue';
import IconsStacked from '../general/IconsStacked.vue';
import Spacing from '../layout/Spacing.vue';

const props = defineProps<{
    connectionId: number
}>()

const myStreamToken = ref('')

const connection = reactive({} as ApiResponse_ConnectionGet)

onMounted(async()=>{
    myStreamToken.value = (await api.rest.auth.streamToken.get()).token

    api.live.subscribeToDbRowUpdate('connections', props.connectionId, updateConnection)//TODO doesnt work with props.connectionId change

    await updateConnection()
})

async function updateConnection(){
    updateObject(connection, await api.rest.connection.get({connectionId: props.connectionId}))
}

const showFullscreen = ref(false)

</script>

<template>


    <div id="connection-live-stream" :class="{fullscreen: showFullscreen}">
        <div id="top-info">
            <span>Connection {{ props.connectionId }}</span>
        </div>
        <IconVue id="fullscreen-toggle" :name="showFullscreen ? 'x-lg' : 'arrows-fullscreen'" @click="showFullscreen = !showFullscreen"></IconVue><!-- TODO replace this custom solution with Fullscreenable.vue -->

        <div v-if="!myStreamToken">
            Loading ...
        </div>
        <template v-else>
            <LiveVideo v-if="connection.stream_is_alive === true" class="live_video" :ws-url="'wss://stream.openflighthub.org:3334/ofh/' + props.connectionId + '?auth=' + myStreamToken" :hide-controls="true"></LiveVideo>
            <div v-else class="not_live">
                <IconsStacked :names="['broadcast', 'slash-lg']" :colors="['red', undefined]"></IconsStacked><Spacing></Spacing>Stream Not Alive
            </div>
        </template>
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

    .not_live {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
    }
}


</style>
