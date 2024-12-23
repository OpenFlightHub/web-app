<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import api from '@/api';
import { OpenFlightHubConnectLinkClient_DjiPilot2, OpenFlightHubConnectLinkManager, ConnectionState } from '@/sdks/openflighthub-connect-link-sdk';
import LoginAndComeBackButton from '@/components/general/LoginAndComeBackButton.vue';
import List from '@/components/layout/List.vue';
import { ApiResponse_WorkspaceGet } from '@/api/openflighthub-api';
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

    let connect = await connectLinkManager.deviceIsLinked()

    if(connect === false){
        if(!connectLinkManager.deviceCanBeLinked()){
            mustLoginFirst.value = true
            return
        }

        updateArray(availableWorkspaces, await connectLinkManager.getLinkableWorkspaces())

        mustLinkFirst.value = true
    } else {
        initConnectLinkClient(connect as OpenFlightHubConnectLinkClient_DjiPilot2)
    }

})


const selectedWorkspaceToLinkTo = ref(-1)
const connectionName = ref('')

async function linkToWorkspace(){

    const ret = await api.workspace.connections.post({
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

    refreshConnectionState()
}

async function unlinkWorkspace(){
    connectLinkClient.unlink()
}

function todo(){
    /*
    const validLicense = sdk.verifyLicense()

    const apiComponentIsLoaded = sdk.api_moduleIsLoaded()

    if(!apiComponentIsLoaded){
        await sdk.api_loadModule('https://dev.openflighthub.org/api', 'test')
    }

    sdk.setWorkspaceId(PLATFORM_UUID)

    sdk.setPlatformInformation('OpenFlightHub', 'Alex Workspace', 'Description of alex workspace on openflighthub.org')

    remoteControllerSerialNumber.value = sdk.getRemoteControllerSN()



    const mqttComponentIsLoaded = sdk.mqtt_moduleIsLoaded()


    if(!mqttComponentIsLoaded){
        await sdk.mqtt_loadModule('tcp://217.92.71.192:9002', 'test', 'test')
    }

    sdk.addListener('mqtt_connection_state', state=>{
        console.log('connnect-state', state)
        logs.push('mqtt state changed:', '' + state)
        mqttConnectState.value = state
    })

    const mqttConnected = sdk.mqtt_isConnected()

    mqttConnectState.value = mqttConnected

    if(!mqttConnected){
        sdk.mqtt_startWithExistingConfig('test', 'test').then(res => {
            console.log('start with existing worked', res)
        }).catch(err => {
            console.error('start with existing failed', err)
        })
    }

    */
};


const remoteControllerSerialNumber = ref('')
const aircraftSerialNumber = ref('')


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

                    <h3>State: <span v-if="connectionState.connected">{{ $t("link.is_connected") }}</span><span v-else>{{ $t("link.is_not_connected") }}</span></h3>
                    <div class="connection_state">
                        <div v-for="module_state of connectionState.modules" :key="module_state.name" :class="['module_state', {connected: module_state.connected}]">{{ module_state.name }}</div>
                    </div>

                    <Button @click="unlinkWorkspace" severity="danger">{{ $t("link.unlink_workspace") }}</Button>
                </template>
                <template v-else>
                    Loading ...
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
