<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import IconVue from '../components/general/IconVue.vue';
import FilesDownloader from '../util/files-downloader'

import useMainStore from "@/stores/main"
import api from '@/api';
import { ApiResponse_WorkspaceGet } from 'openflighthub-api-client-sdk';
import { RefSymbol } from '@vue/reactivity';
const store = useMainStore()


const isSupported = ref(false)

onMounted(()=>{
    isSupported.value = FilesDownloader.isSupported()
})

const isSetup = ref(false)


const mediaIdsThatAreBeingDownloaded = ref<number[]>([])

let filesDownloader: FilesDownloader

let fullSyncCheckInterval

async function setup(){
    if(isSetup.value){
        return
    }

    if(typeof fullSyncCheckInterval === 'number'){
        clearInterval(fullSyncCheckInterval)
    }

    fullSyncCheckInterval = setInterval(makeFullSyncCheck, 1000 * 60)

    filesDownloader = await FilesDownloader.askUserToSelectFolder('ofh-download', 'desktop')

    makeFullSyncCheck()


    isSetup.value = true
}

const knownWorkspaceIds: number[] = []

async function makeFullSyncCheck(){
    const myWorkspaces = await api.rest.workspace.myWorkspaces.get()

    await filesDownloader.setWorkspaces(myWorkspaces)

    for(const workspace of myWorkspaces){

        if(knownWorkspaceIds.includes(workspace.id) === false){
            knownWorkspaceIds.push(workspace.id)

            api.live.subscribeToWorkspaceDronesMedia(workspace.id, async (evt, filter, data)=>{

                console.log('new drone media', data)

                try {

                    await downloadMediaIfNotExists(data.id, workspace.id)

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
                            downloadMediaIfNotExists(media.id, workspace.id).catch(err => {
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



async function downloadMediaIfNotExists(mediaId: number, workspaceId: number){

    const media = await api.rest.media.get({mediaId})

    const file = await api.rest.file.get({fileId: media.file_id})

    const cleanFileName = file.name.replace(/\//g, '_')

    if(await filesDownloader.fileExistsOrIsEmpty(workspaceId, cleanFileName) === false){

        try {
            mediaIdsThatAreBeingDownloaded.value.push(media.id)

            await filesDownloader.saveFileToWorkspace(workspaceId, '/api/file/data/' + media.file_id, cleanFileName)

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
            <span v-if="state === 'is_downloading'" id="download-count">{{ mediaIdsThatAreBeingDownloaded }}</span><IconVue :name="statusIconName"></IconVue>
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
