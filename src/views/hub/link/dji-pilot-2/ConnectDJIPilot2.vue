<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { DjiOpenPlatformConnectSDK } from '@/sdks/dji-pilot-2/dji-open-platform-connect-sdk';
import api from '@/api';

const PLATFORM_UUID = 'e97dd32f-5977-44f9-ab4d-e34205012dcd'

const APP_ID = '155101'
const APP_KEY = 'ca6b89a2db4c280e1e93d22fd8e1e8e'
const APP_LICENSE = 'Qf0VAs7wVcuPnz0nbISQQUoQgEBpU6U8w2VMj+u95IpoIK5P7VSxacUNMatWIDlv70h336R3a0bxK4OxOJUnvwzJ19v1MRYcmI6Ni6A56+3DaYKEhtMLsTZN4HwkEmRwTc6OSGMWv6giS/7mvoLS686U2P1/LNwQX0Eo1BCBZmg='


const mqttConnectState = ref(false)

onMounted(()=>{


    const sdk = new DjiOpenPlatformConnectSDK(APP_ID, APP_KEY, APP_LICENSE)

    sdk.addListener('log', msg => {
        logs.push(msg)
    })

    const validLicense = sdk.verifyLicense()

    const apiComponentIsLoaded = sdk.componentApiIsLoaded()

    if(!apiComponentIsLoaded){
        sdk.loadComponentApi('https://dev.openflighthub.org/api', 'test')
    }


    sdk.setWorkspaceId(PLATFORM_UUID)

    sdk.setPlatformInformation('OpenFlightHub', 'Alex Workspace', 'Description of alex workspace on openflighthub.org')

    remoteControllerSerialNumber.value = sdk.getRemoteControllerSN()



    const mqttComponentIsLoaded = sdk.componentMqttIsLoaded()

    if(!mqttComponentIsLoaded){
        sdk.loadComponentMqtt('tcp://217.92.71.192:9002', state=>{
            console.log(state)
            logs.push('mqtt state changed:', '' + state)
            mqttConnectState.value = state
        }, 'test', 'test')
    }

})


const remoteControllerSerialNumber = ref('')
const aircraftSerialNumber = ref('')

const logs = reactive<string[]>([])

/*
function init(){
    const r1 = guardDjiResponseWithLog('verify license', window.djiBridge.platformVerifyLicense(APP_ID, APP_KEY, APP_LICENSE))

    guardDjiResponseWithLog('get remote controller sn', window.djiBridge.platformGetRemoteControllerSN()).then(sn => {
        remoteControllerSerialNumber.value = sn as string
    })

    guardDjiResponseWithLog('platform set information', window.djiBridge.platformSetInformation('Open Flight Hub', 'OFH Workspace', 'Alex Prototype'))

    guardDjiResponseWithLog('platform set workspace id', window.djiBridge.platformSetWorkspaceId(PLATFORM_UUID))

    guardDjiResponseWithLog('platform load component api', window.djiBridge.platformLoadComponent('api', JSON.stringify({
        host: 'https://local.alexh.rocks/api/dji/',
        token: 'mytoken'
    })))

    guardDjiResponseWithLog('platform component is loaded cloud', window.djiBridge.platformIsComponentLoaded('thing')).then(loaded => {
        if(loaded){
            unload
        }
    })


    guardDjiResponseWithLog('platform load component cloud', window.djiBridge.platformLoadComponent('thing', JSON.stringify({
        host: 'tcp://local.alexh.rocks:8081',
        connectCallback: res=>{
            printLog('cloud component is connected', res)
        },
        username: 'abc',
        password: '1234'
    })))

    printLog('init done')
}
    */


</script>

<template>

    <div id="container">
        <div id="left">
            <div>
                <span>Remote Controller SN:</span>
                <span>{{ remoteControllerSerialNumber || '?' }}</span>
            </div>
            <div>
                <span>Aircraft SN:</span>
                <span>{{ aircraftSerialNumber || '?' }}</span>
            </div>

            <div>
                <span>MQTT</span>
                <span id="mqtt-connect-state" :style="'background-color: ' + (mqttConnectState ? 'green' : 'red')">{{ mqttConnectState ? 'connected' : 'disconnected' }}</span>
            </div>
        </div>
        <div id="right">
            <span>Debug Log</span>
            <div id="logs">
                <pre v-for="l of logs">{{l}}</pre>
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">

#container {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 1em;
    gap: 1em;

    #left {
        display: flex;
        flex-direction: column;
        gap: 1em;
        flex-grow: 0;
        flex-shrink: 0;

        div {
            display: flex;
            flex-direction: column;
        }
    }

    #right {
        flex-grow: 1;
        max-height: calc(100vh - var(--navbar-size) - 2em);
        overflow-y: scroll;
    }

    #left, #right {
        background: var(--neutral-dark);
        color: var(--neutral-lighter);
        border-radius: 0.3em;
        padding: 0.5em;
    }
}

#logs {
    display: flex;
    flex-direction: column;
    gap: 0.2em;
    max-height: 100%;
    overflow-y: auto;

    pre {
        padding: 0.2em 0.3em;
        background: var(--neutral-darkest);
        color: var(--neutral-lighter);
        white-space: break-spaces;
        word-break: break-all;
    }
}

#mqtt-connect-state {
    display: block;
    width: 1em;
    height: 1em;
    border-radius: 100%;
}

</style>
