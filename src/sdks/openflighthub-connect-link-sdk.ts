import api from "@/api/index.js";
import { deviceSupportsSDK, DjiOpenPlatformConnectSDK, EventManager } from "./dji-pilot-2/dji-open-platform-connect-sdk.js";
import { ApiResponse_ConnectionlinkConfigGet } from "@/api/openflighthub-api.js";

export function deviceSupportsOpenFlightHubConnectLink(){
    // add more alternatives here once they exist
    return deviceSupportsSDK()
}

export function deviceSupportsOpenFlightHubConnectLink_DJI_Pilot_2(){
    return deviceSupportsSDK()
}

export type OpenFlightHubConnectLinkType = 'dji-pilot-2'

export class OpenFlightHubConnectLinkManager {


    constructor(){
        if(!deviceSupportsSDK()){
            throw new Error('device is not linkable (no dji-pilot-2 sdk support)')
        }
    }

    /**
     * if device is successfully logged in as user on openflighthub.org
     */
    async deviceCanBeLinked(){
        try {
            await api.auth.check.get()

            return true
        } catch (err){//not authorized
            return false
        }
    }

    async deviceIsLinked(): Promise<false | OpenFlightHubConnectLinkType>{
        try {
            await api.connectionLink.auth.check.get()//TODO at least for pilot 2 sdk, read token from api module and try to login with that

            return 'dji-pilot-2'
        } catch (err){
            return false
        }
    }

    async getLink(): Promise<OpenFlightHubConnectLinkClient<string>>{

        if(await this.deviceIsLinked() === false){
            throw new Error('device is not linked')
        }

        return await this.initClient()
    }

    getLinkableWorkspaces(){
        return api.workspace.myWorkspaces.get()
    }

    async linkToOpenFlightHub(connectionId: string, secret: string){
        await api.connectionLink.auth.login.post({
            connection_id: connectionId,
            secret
        })

        return await this.initClient()
    }

    private async initClient(): Promise<OpenFlightHubConnectLinkClient<string>>{
        const client = new OpenFlightHubConnectLinkClient_DjiPilot2(await api.connectionLink.config.get())
        await client.init()
        return client
    }
}


type OpenFlightHubConnectLinkClient_Events = {
    'unlinked': unknown
    'connected-changed': undefined
}

export type ConnectionState<ModuleName extends string> = {
    connected: boolean,
    modules: ModuleConnectionState<ModuleName>[]
}

export type ModuleConnectionState<ModuleName extends string> = {
    name: ModuleName
    connected: boolean
}


export class OpenFlightHubConnectLinkClient<ModuleName extends string> extends EventManager<OpenFlightHubConnectLinkClient_Events> {

    protected platformConfig: ApiResponse_ConnectionlinkConfigGet

    constructor(platformConfig: ApiResponse_ConnectionlinkConfigGet){
        super()

        this.platformConfig = platformConfig
    }

    /**
     * initialize stuff and/or check if stuff is already running
     */
    init(): void | Promise<void>{
        throw new Error('not implemented')
    }

    /**
     * if stuff is connected to the platform
     */
    isConnected(): ConnectionState<ModuleName> | Promise<ConnectionState<ModuleName>>{
        throw new Error('not implemented')
    }

    getPlatformName(){
        return this.platformConfig.platform_name
    }

    getWorkspaceName(){
        return this.platformConfig.workspace_name
    }

    async unlink(){
        //TODO
        //api.connectionLink.
    }
}

export type OpenFlightHubConnectLinkClient_DjiPilot2_ModuleName = 'api' | 'mqtt' | 'stream'

export class OpenFlightHubConnectLinkClient_DjiPilot2 extends OpenFlightHubConnectLinkClient<OpenFlightHubConnectLinkClient_DjiPilot2_ModuleName> {

    protected sdk: DjiOpenPlatformConnectSDK

    protected mqttIsConnected = false
    protected streamIsConnected = false

    async init(){

        console.debug('initializing OpenFlightHubConnectLinkClient_DjiPilot2 ...')

        const sdkConfig = await api.connectionLink.djiPilot2.sdkConfig.get()

        this.sdk = new DjiOpenPlatformConnectSDK(sdkConfig.app_id, sdkConfig.app_key, sdkConfig.app_license)

        this.sdk.verifyLicense()

        this.sdk.setPlatformInformation(this.platformConfig.platform_name, this.platformConfig.workspace_name, 'on ' + this.platformConfig.platform_name)

        this.sdk.setWorkspaceId(parseInt(this.platformConfig.workspace_id))

        console.debug('  setup mqtt ...')

        // MQTT
        this.sdk.addListener('mqtt_connection_state', state => {
            this.mqttIsConnected = state
            this.dispatch('connected-changed', undefined)
        })

        const mqttUsername = 'test' //this.platformConfig.workspace_id
        const mqttPassword = 'test' //this.platformConfig.secret

        if(this.sdk.mqtt_moduleIsLoaded()){
            await this.sdk.mqtt_unloadModule()
        }

        if(!this.sdk.mqtt_moduleIsLoaded()){
            await this.sdk.mqtt_loadModule(sdkConfig.mqtt_url, mqttUsername, mqttPassword)
        }

        if(!this.sdk.mqtt_isConnected()){
            await this.sdk.mqtt_start(mqttUsername, mqttPassword)
        }


        console.debug('  setup live stream ...')

        // Live Stream

        this.sdk.addListener('stream_connection_state', connectState => {
            this.streamIsConnected = connectState
            this.dispatch('connected-changed', undefined)
        })


        if(this.sdk.stream_moduleIsLoaded()){
            this.sdk.stream_getConfig()
            await this.sdk.stream_unloadModule()
        }

        if(!this.sdk.stream_moduleIsLoaded()){
            await this.sdk.stream_loadModule('manual')
        }

        const streamStatus = this.sdk.stream_isStreamRunningAndConnected()
        console.log(streamStatus, typeof streamStatus)
        if(!streamStatus || streamStatus.status === 0){//TODO set stream config
            this.sdk.stream_setConfig_RTMP('rtmp://stream.alexh.rocks/ofh/gurr')//sdkConfig.rtmp_url)
            this.sdk.stream_getConfig()
            this.sdk.stream_start()
        }

        console.debug('init done')
    }

    async isConnected(): Promise<ConnectionState<OpenFlightHubConnectLinkClient_DjiPilot2_ModuleName>>{

        const modules: ModuleConnectionState<OpenFlightHubConnectLinkClient_DjiPilot2_ModuleName>[] = []

        modules.push({
            name: "mqtt",
            connected: this.mqttIsConnected
        })

        modules.push({
            name: 'stream',
            connected: this.streamIsConnected
        })

        //TODO api

        return {
            connected: modules.find(m => !m.connected) ? false : true,
            modules
        }
    }

    getRemoteControllerSerialNumber(){
        return this.sdk.getRemoteControllerSN()
    }

    getAircraftSerialNumber(){
        return this.sdk.getAircraftSN()
    }
}
