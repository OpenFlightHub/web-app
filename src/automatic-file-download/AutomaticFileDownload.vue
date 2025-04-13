<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import IconVue from '../components/general/IconVue.vue';
import FilesDownloader from '../util/files-downloader'

import useMainStore from "@/stores/main"
import api from '@/api';
const store = useMainStore()


const isSupported = ref(false)

onMounted(()=>{
    isSupported.value = FilesDownloader.isSupported()
})

const isSetup = ref(false)


const filesThatAreBeingDownloaded = ref(0)

async function setup(){
    if(isSetup.value){
        return
    }

    const filesDownloader = await FilesDownloader.askUserToSelectFolder('ofh-download', 'desktop')

    const myWorkspaces = await api.rest.workspace.myWorkspaces.get()

    await filesDownloader.setWorkspaces(myWorkspaces)

    // TODO implement reactivity when new workspaces are added
    for(const workspace of myWorkspaces){
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


    isSetup.value = true
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
