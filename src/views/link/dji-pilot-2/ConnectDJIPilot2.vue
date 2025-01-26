<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import api from '@/api';
import { OpenFlightHubConnectLinkClient_DjiPilot2, OpenFlightHubConnectLinkManager, ConnectionState } from '@/sdks/openflighthub-connect-link-sdk';
import LoginAndComeBackButton from '@/components/general/LoginAndComeBackButton.vue';
import List from '@/components/layout/List.vue';
import { ApiResponse_WorkspaceGet } from 'openflighthub-api-client-sdk';
import { updateArray, updateObject } from '@/util/vue';
import { Button, IftaLabel, InputText } from 'primevue';
import Snippet from '@/components/layout/Snippet.vue';
import Padding from '@/components/layout/Padding.vue';

const mqttConnectState = ref(false)

const mustLoginFirst = ref(false)
const mustLinkFirst = ref(false)

let connectLinkManager: OpenFlightHubConnectLinkManager

let connectLinkClient: OpenFlightHubConnectLinkClient_DjiPilot2
const connectLinkClientIsLoaded = ref(false)

const availableWorkspaces = reactive([] as ApiResponse_WorkspaceGet[])


onMounted(async()=>{

    connectLinkManager = new OpenFlightHubConnectLinkManager()

    let deviceIsLinked = await connectLinkManager.deviceIsLinked()

    if(deviceIsLinked === false){
        if(!connectLinkManager.deviceCanBeLinked()){
            mustLoginFirst.value = true
            return
        }

        updateArray(availableWorkspaces, await connectLinkManager.getLinkableWorkspaces())

        mustLinkFirst.value = true
    } else {
        initConnectLinkClient(await connectLinkManager.getLink() as OpenFlightHubConnectLinkClient_DjiPilot2)
    }

})


const selectedWorkspaceToLinkTo = ref(-1)
const connectionName = ref('')

async function linkToWorkspace(){

    const ret = await api.rest.workspace.connections.post({
        workspaceId: selectedWorkspaceToLinkTo.value
    }, {
        name: connectionName.value
    })

    initConnectLinkClient(await connectLinkManager.linkToOpenFlightHub(ret.connection_id, ret.secret) as OpenFlightHubConnectLinkClient_DjiPilot2)

    //TODO handle and show error
}

function initConnectLinkClient(client: OpenFlightHubConnectLinkClient_DjiPilot2){
    connectLinkClient = client
    connectLinkClientIsLoaded.value = true

    connectLinkClient.addListener('connected-changed', refreshConnectionState)


    remoteControllerSerialNumber.value = connectLinkClient.getRemoteControllerSerialNumber()
    aircraftSerialNumber.value = connectLinkClient.getAircraftSerialNumber()


    refreshConnectionState()//TODO this never triggers to hide the "confirm" button and actually show the "is connected" view, you have to manually reload the page
}

async function unlinkWorkspace(){
    connectLinkClient.unlink()
}

async function resetLink(){
    connectLinkManager.resetClients()
}


const remoteControllerSerialNumber = ref('')
const aircraftSerialNumber = ref<false | string>('')


const connectionState = reactive({} as ConnectionState<string>)

async function refreshConnectionState(){
    updateObject(connectionState, await connectLinkClient.isConnected())
}

</script>

<template>

    <Padding>
        <template v-if="mustLoginFirst">
            {{ $t("link.must_login_before_can_link")}}

            <LoginAndComeBackButton></LoginAndComeBackButton>
        </template>
        <template v-else>

            <template v-if="mustLinkFirst">
                <h2>{{ $t("link.select_workspace")}}</h2>

                <List>
                    <template v-if="selectedWorkspaceToLinkTo === -1">
                        <Snippet v-for="workspace of availableWorkspaces" :key="workspace.id" class="workspace" @click="selectedWorkspaceToLinkTo = workspace.id">
                            <h3>{{ workspace.name }}</h3>
                        </Snippet>
                    </template>
                    <template v-else>
                        <IftaLabel>
                            <InputText id="connection-name" v-model="connectionName"/>
                            <label for="connection-name">{{ $t("link.connection_name")}}</label>
                        </IftaLabel>

                        <Button :disabled="connectionName.length === 0" @click="linkToWorkspace">{{ $t("actions.confirm") }}</Button>
                    </template>
                </List>
            </template>
            <template v-else>
                <template v-if="connectLinkClientIsLoaded">
                    <h2>{{ $t("link.linked_to", {workspace: connectLinkClient.getWorkspaceName(), platform: connectLinkClient.getPlatformName()}) }}</h2>

                    <table>
                        <tbody>
                            <tr>
                                <td>Remote Controller SN</td>
                                <td>{{ remoteControllerSerialNumber || '?' }}</td>
                            </tr>
                            <tr>
                                <td>Aircraft SN</td>
                                <td>{{ aircraftSerialNumber || '?' }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <br>

                    <h3>State: <span v-if="connectionState.connected">{{ $t("link.is_connected") }}</span><span v-else>{{ $t("link.is_not_connected") }}</span></h3>
                    <div class="connection_state">
                        <div v-for="module_state of connectionState.modules" :key="module_state.name" :class="['module_state', {connected: module_state.connected}]">{{ module_state.name }}</div>
                    </div>

                    <Button @click="unlinkWorkspace" severity="danger">{{ $t("link.unlink_workspace") }}</Button>
                </template>
                <template v-else>
                    Loading ...

                    <Button @click="resetLink" severity="danger">{{ $t("link.reset") }}</Button>
                </template>
            </template>

        </template>
    </Padding>

</template>

<style scoped lang="scss">

.connection_state {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;

    .module_state {
        display: flex;
        align-items: center;

        &:before {
            content: '';
            display: block;
            height: 1em;
            width: 1em;
            border-radius: 10000px;
            margin-right: 0.5em;
            background: var(--error);
        }

        &.connected:before {
            background: var(--success);
        }
    }
}

</style>
