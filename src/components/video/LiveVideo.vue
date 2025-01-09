<script setup lang="ts">
import { computed, inject, provide, ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import * as ovenplayer from 'ovenplayer'
import IconVue from '../general/IconVue.vue';


const props = defineProps<{
    wsUrl: string // e.g. ws://stream.rocks:3333/app/key
    hideControls?: boolean
}>()

const myId = crypto.randomUUID()
const video = ref(null)

const notSupported = ref(false)

const player = ref<ovenplayer.OvenPlayerInstance>(null)
const isPlaying = ref(false)

onMounted(()=>{
    if(!window.RTCPeerConnection){
        notSupported.value = true
    }

    video.value.id = myId

    setupPlayer()
})

onBeforeUnmount(()=>{
    if(player.value){
        player.value.remove()
    }

    clearTimeout(timeoutHandle)
})

let timeoutHandle: any

function setupPlayer(){

    if(player.value){
        player.value.remove()
    }

    isPlaying.value = false

    player.value = ovenplayer.create(myId, {
        autoStart: true,
        autoFallback: true,
        mute: true,
        controls: props.hideControls !== true,
        sources: [{
            type: 'webrtc',
            file: props.wsUrl
        }],
        webrtcConfig: {
            timeoutMaxRetry: 999,
            connectionTimeout: 5000
        }
    })

    player.value.on('stateChanged', evt => {
        isPlaying.value = evt.newstate === 'playing'
    })

    timeoutHandle = setTimeout(()=>{
        if(!isPlaying.value){
            setupPlayer()//retry
        }
    }, 1000 * 5)
}

</script>

<template>

    <template v-if="notSupported">Your device does not support WebRTC!</template>
    <div id="container" v-else :class="[{hide_controls: props.hideControls === true}]">
        <div id="video" ref="video">

        </div>
        <div id="info-overlay" v-if="isPlaying">
            <div id="live">
                <IconVue name="record2"></IconVue>live
            </div>
        </div>
        <div id="disconnected-cover" v-else>
            <IconVue name="arrow-repeat"></IconVue> connecting ...
        </div>
    </div>

</template>

<style scoped lang="scss">

#container {
    position: relative;

    #disconnected-cover, #info-overlay {
        position: absolute;
        z-index: 100;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    #disconnected-cover {
        background: #222;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #info-overlay {
        padding: 0.5em;

        #live {
            font-size: 0.8em;
            display: inline-flex;
            padding: 0.1em 0.4em 0.1em 0.2em;
            color: red;
            border: 0.1em solid red;
            border-radius: 0.2em;
        }
    }
}

</style>

<style lang="scss">

#container.hide_controls .up-ui {
    display: none !important;
}

</style>
