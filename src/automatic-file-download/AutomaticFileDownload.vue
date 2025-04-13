<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import IconVue from '../components/general/IconVue.vue';
import { DroneMediaDownloader } from '../util/files-downloader'

import useMainStore from "@/stores/main"
import api from '@/api';
import { ApiResponse_WorkspaceGet } from 'openflighthub-api-client-sdk';
import { RefSymbol } from '@vue/reactivity';
const store = useMainStore()


const isSupported = ref(false)

onMounted(()=>{
    isSupported.value = DroneMediaDownloader.isSupported()
})

const isSetup = ref(false)


const mediaIdsThatAreBeingDownloaded = ref<number[]>([])

let droneMediaDownloader: DroneMediaDownloader

let fullSyncCheckInterval

async function setup(){
    if(isSetup.value){
        return
    }

    if(typeof fullSyncCheckInterval === 'number'){
        clearInterval(fullSyncCheckInterval)
    }

    fullSyncCheckInterval = setInterval(makeFullSyncCheck, 1000 * 60)

    droneMediaDownloader = await DroneMediaDownloader.askUserToSelectFolder('ofh-download', 'desktop')

    makeFullSyncCheck()


    isSetup.value = true
}

const knownWorkspaceIds: number[] = []

async function makeFullSyncCheck(){
    const myWorkspaces = await api.rest.workspace.myWorkspaces.get()

    await droneMediaDownloader.setWorkspaces(myWorkspaces)

    for(const workspace of myWorkspaces){

        if(knownWorkspaceIds.includes(workspace.id) === false){
            knownWorkspaceIds.push(workspace.id)

            api.live.subscribeToWorkspaceDronesMedia(workspace.id, async (evt, filter, data)=>{

                console.log('new drone media', data)

                try {

                    const drone = await api.rest.drone.get({droneId: data.drone_id})
                    const connection = await api.rest.connection.get({connectionId: drone.last_connection_id})

                    await downloadMediaIfNotExists(data.id, workspace.id, workspace.name, data.drone_id, connection.name)

                } catch (err){
                    console.error('failed to download media', data, err)
                }
            })
        }

        const connections = await api.rest.workspace.connections.get({
            workspaceId: workspace.id
        })

        for(const connection of connections){
            if(typeof connection.drone_id === 'number'){
                api.rest.drone.media.get({
                    droneId: connection.drone_id
                }).then(async(allMedia) => {

                    for(const media of allMedia){
                        if(mediaIdsThatAreBeingDownloaded.value.includes(media.id) === false){
                            downloadMediaIfNotExists(media.id, workspace.id, workspace.name, media.drone_id, connection.name).catch(err => {// this should not be the connection.name but drone name (not implemented yet in backend
                                console.error('failed to download media (full sync)', media,  err)
                            })
                        }
                    }

                }).catch(err => {
                    console.error('failed to get media for drone', err)
                })
            }
        }
    }
}



async function downloadMediaIfNotExists(mediaId: number, workspaceId: number, workspaceName: string, droneId: number, droneName: string){

    const media = await api.rest.media.get({mediaId})

    let cleanFileName = media.file_name.replace(/[\/<>:\\\|\?\*]/g, '_')

    if(cleanFileName === '.' || cleanFileName === '.' || ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'].includes(cleanFileName)){
        cleanFileName = '_' + cleanFileName
    }

    if(await droneMediaDownloader.droneFileExistsAndIsNotEmpty(workspaceId, droneId, cleanFileName) === false){

        try {
            mediaIdsThatAreBeingDownloaded.value.push(media.id)

            await droneMediaDownloader.saveDroneFile(workspaceId, workspaceName, droneId, droneName, '/api/file/data/' + media.file_id, cleanFileName)

        } finally {
            mediaIdsThatAreBeingDownloaded.value.splice(mediaIdsThatAreBeingDownloaded.value.indexOf(media.id), 1)
        }
    }
}

const state = computed(()=>{
    if(isSetup.value){
        if(mediaIdsThatAreBeingDownloaded.value.length > 0){
            return 'is_downloading'
        } else {
            return 'synced'
        }
    } else {
        return 'not_setup'
    }
})

const statusIconName = computed(()=>{
    switch(state.value){
        case 'not_setup': return 'ban'
        case 'is_downloading': return 'download'
        case 'synced': return 'arrow-repeat'
    }
})


</script>

<template>

    <div v-if="store.isLoggedIn && isSupported" @click="setup">

        <div id="status" :state="state">
            <span v-if="state === 'is_downloading'" id="download-count">{{ mediaIdsThatAreBeingDownloaded.length }}</span><IconVue :name="statusIconName"></IconVue>
        </div>

    </div>

</template>

<style scoped lang="scss">

#status {
    position: fixed;
    z-index: 2;
    bottom: 0.5em;
    right: 0.5em;
    background: var(--neutral-darker);
    color: var(--neutral-lightest);
    padding: 0.5em;
    border-radius: 0.2em;
    cursor: pointer;

    &[state="not_setup"] {
        background: var(--error);
    }

    &[state="is_downloading"] {
        background: var(--primary);
    }

    &[state="synced"] {
        background: var(--success);
    }

    #download-count {
        margin-right: 0.5em;
    }
}

</style>
