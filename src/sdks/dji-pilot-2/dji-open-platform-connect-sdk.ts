import { ComponentName, DjiBridge, DjiBridgeResponse, DjiBridgeResponseFail, DjiBridgeResponseSuccess } from "./DjiBridge"


export function deviceSupportsSDK(){
    return !!window['djiBridge']
}


class EventManager<M extends { [key: string]: any }> {
    private listeners = new Map<String, Function[]>()

    addListener<E extends keyof M>(eventName: E, callback: (data: M[E]) => void) {
        if (!this.listeners.has(eventName as string)) {
            this.listeners.set(eventName as string, [])
        }

        this.listeners.get(eventName as string)!.push(callback)
    }

    removeListener<E extends keyof M>(eventName: E, callback: (data: M[E]) => void) {
        if (this.listeners.has(eventName as string)) {
            const list = this.listeners.get(eventName as string)

            const index = list!.findIndex(c => c === callback)

            if (index !== -1) {
                list!.splice(index, 1)
            }

        }
    }

    protected dispatch<E extends keyof M>(eventName: E, data: M[E]) {
        if (this.listeners.has(eventName as string)) {
            const list = this.listeners.get(eventName as string)

            for (const l of list!) {
                l(data)
            }

        }
    }
}


interface DjiOpenPlatformConnectSDKEvents {
    log: string
    unlinked: undefined //cloud platform connection is disabled and all config is reset
}

const JS_CALLBACK_PREFIX = 'dji_open_platform_connect_sdk_js_callback'

export class DjiOpenPlatformConnectSDK extends EventManager<DjiOpenPlatformConnectSDKEvents> {

    private appId: string
    private appKey: string
    private appLicense: string

    private licenseIsVerified = false

    private djiBridge: DjiBridge

    constructor(appId: string, appKey: string, appLicense: string){
        super()

        this.appId = appId
        this.appKey = appKey
        this.appLicense = appLicense

        this.djiBridge = window['djiBridge']

        this.djiBridge.onStopPlatform = ()=>{
            this.dispatch('unlinked', undefined)
        }
    }


    verifyLicense(){
        return this.wrapWithLog('verifyLicense', [], ()=>{
            const ret = this.unwrapResponse(this.djiBridge.platformVerifyLicense(this.appId, this.appKey, this.appLicense))

            this.licenseIsVerified = ret

            return ret
        })
    }

    private guardLicenseIsVerified(){
        if(!this.licenseIsVerified){
            throw new Error('call verifyLicense() first')
        }
    }

    setWorkspaceId(uuid: string){
        return this.wrapWithLog('platformSetWorkspaceId', [uuid], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformSetWorkspaceId(uuid)
            )
        })
    }

    setPlatformInformation(platformName: string, workspaceName: string, description: string){
        return this.wrapWithLog('platformSetInformation', [platformName, workspaceName, description], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformSetInformation(platformName, workspaceName, description)
            )
        })
    }

    getRemoteControllerSN(){
        return this.wrapWithLog('getRemoteControllerSN', [], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformGetRemoteControllerSN()
            )
        })
    }

    getAircraftSN(){
        return this.wrapWithLog('getAircraftSN', [], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformGetAircraftSN()
            )
        })
    }

    private loadComponent(componentName: ComponentName, params: object){
        return this.wrapWithLog('loadComponent', [componentName, params], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformLoadComponent(componentName, JSON.stringify(params))
            )
        })
    }

    private componentIsLoaded(componentName: ComponentName){
        return this.wrapWithLog('componentIsLoaded', [componentName], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformIsComponentLoaded(componentName)
            )
        })
    }

    private unloadComponent(componentName: ComponentName){
        return this.wrapWithLog('unloadComponent', [componentName], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformUnloadComponent(componentName)
            )
        })
    }

    /**
     * don't immediately call this for api component after you loaded the page or verified the license (i dont know which creates the problems), but the dji pilot app will not be ready and throw an error!
     *
     * @param host url of our platforms api e.g. https://example.org/api
     * @param token this one will be transmitted by the remote controll when doing api request in the X-Auth-Token HTTP header
     */
    loadComponentApi(host: string, token: string){//TODO make this a promise that resolves after some time

        if(!host.endsWith('/')){
            host += '/'
        }

        return this.loadComponent('api', {
            host,
            token
        })
    }

    componentApiIsLoaded(){
        return this.componentIsLoaded('api')
    }

    unloadComponentApi(){
        return this.unloadComponent('api')
    }

    /**
     * don't immediately call this for api component after you loaded the page or verified the license (i dont know which creates the problems), but the dji pilot app will not be ready and throw an error!
     *
     * @param host url of our platforms api e.g. tcp://123.123.123.123:8080
     * @param token this one will be transmitted by the remote controll when doing api request in the X-Auth-Token HTTP header
     */
    loadComponentMqtt(host: string, connectionStateCallback: (connectState: boolean)=>void, username: string, password: string){

        const connectCallback = this.registerJsCallback(connectionStateCallback)

        return this.loadComponent('thing', {
            host,
            connectCallback,
            username,
            password
        })
    }

    componentMqttIsLoaded(){
        return this.componentIsLoaded('thing')
    }

    unloadComponentMqtt(){
        return this.unloadComponent('thing')
    }


    /**
     *
     * @returns
     */
    getApiToken(){
        return this.wrapWithLog('getApiToken', [], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.apiGetToken()
            )
        })
    }

    setApiToken(token: string){
        return this.wrapWithLog('setApiToken', [token], ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.apiSetToken(token)
            )
        })
    }



    // helpers

    private jsCallbackIdCounter = 0

    /**
     * basically does window['callbackname'] = function(){} soe the dji apps can call this function
     * @see unregisterJsCallback()
     * @param callbackName
     */
    private registerJsCallback(callback: Function){
        const myId = this.jsCallbackIdCounter++

        const callbackName = JS_CALLBACK_PREFIX + '_' + myId
        window[callbackName] = callback

        return callbackName
    }

    /**
     *
     * @see registerJsCallback()
     * @param callbackName the return value from registerJsCallback()
     */
    private unregisterJsCallback(callbackName: string){
        window[callbackName] = undefined
    }


    private wrapWithLog<T>(title: string, args: any[], func: ()=>T){
        try {
            const argString = args.map(a => {
                return (a instanceof Object) ? JSON.stringify(a) : ('' + a)
            }).join(', ')

            this.log(`running ${title}(${argString}) ...`)

            const result = func()

            if(typeof result === 'undefined'){
                this.log('  success')
            } else {
                this.log('  = ', JSON.stringify(result, null, 2))
            }

            return result
        } catch (err){
            if(err instanceof Error){
                this.log('  ', err.stack || err.message || err.name)
            } else {
                this.log('  ERROR:', err)
            }

            throw err
        }
    }

    /**
     *
     * @param response is actually a string, but we hack something togethere here ok?
     */
    private unwrapResponse<T>(response: DjiBridgeResponse<T>): T {

        const parsed = JSON.parse(response as unknown as string) as DjiBridgeResponse<T>

        if(parsed.code === 0){
            return (parsed as DjiBridgeResponseSuccess<T>).data
        } else {
            throw new Error('Failed with code ' + parsed.code +  ': ' + (parsed as DjiBridgeResponseFail).message)
        }
    }

    private log(...args){
        this.dispatch('log', args.map(a => '' + a).join(' '))
    }

}
