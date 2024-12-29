<script setup lang="ts">
import { computed, inject, provide, ref, reactive, onMounted } from 'vue';
import * as ovenplayer from 'ovenplayer'


const props = defineProps<{
    wsUrl: string // e.g. ws://stream.rocks:3333/app/key
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

function setupPlayer(){

    if(player.value){
        player.value.remove()
    }

    isPlaying.value = false

    player.value = ovenplayer.create(myId, {
        autoStart: true,
        autoFallback: true,
        mute: true,
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

    setTimeout(()=>{
        if(!isPlaying.value){
            setupPlayer()//retry
        }
    }, 1000 * 5)
}

</script>

<template>

    <template v-if="notSupported">Your device does not support WebRTC!</template>
    <template v-else>
        <div class="video" ref="video">

        </div>
    </template>

</template>

<style scoped lang="scss">


</style>
