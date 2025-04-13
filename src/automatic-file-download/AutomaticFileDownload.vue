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


const filesThatAreBeingDownloaded = ref(0)

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
                filesThatAreBeingDownloaded.value ++

                console.log('new drone media', data)

                try {

                    const media = await api.rest.media.get({mediaId: data.id})

                    const file = await api.rest.file.get({fileId: media.file_id})

                    await filesDownloader.saveFileToWorkspace(data.workspace_id, '/api/file/data/' + media.file_id, file.name)
                } catch (err){
                    console.error('failed to download media', data, err)
                } finally {
                    filesThatAreBeingDownloaded.value --
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

                        const file = api.rest.file.get({fileId: media.file_id}).then(async(file) => {

                            if(await filesDownloader.fileExists(workspace.id, file.name) === false){
                                filesThatAreBeingDownloaded.value++
                                try {
                                    filesDownloader.saveFileToWorkspace(workspace.id, '/api/file/data/' + file.id, file.name)
                                } catch (err){
                                    console.warn('failed to download media', workspace.id, file.id, err)
                                } finally {
                                    filesThatAreBeingDownloaded.value--
                                }
                            }

                        })
                    }

                }).catch(err => {
                    console.error('failed to get media for drone', err)
                })
            }
        }
    }
}

const state = computed(()=>{
    if(isSetup.value){
        if(filesThatAreBeingDownloaded.value > 0){
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
            <span v-if="state === 'is_downloading'" id="download-count">{{ filesThatAreBeingDownloaded }}</span><IconVue :name="statusIconName"></IconVue>
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
