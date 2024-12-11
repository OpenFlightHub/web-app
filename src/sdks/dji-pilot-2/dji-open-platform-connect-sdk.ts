import { ComponentName, DjiBridge, DjiBridgeResponse, DjiBridgeResponseFail, DjiBridgeResponseSuccess, EmptyObject } from "./DjiBridge"


type ModuleName = ComponentName

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

    addListenOnce<E extends keyof M>(eventName: E, callback: (data: M[E]) => void) {

        const funcOnce = (...args)=>{
            try {
                this.removeListener(eventName, funcOnce)
            } catch (err){
                console.error('failed to remove funcOnce after dispatched once', err)
            }

            callback.apply(null, args)
        }

        this.addListener(eventName, funcOnce)
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
    mqtt_connection_state: boolean
}

const JS_CALLBACK_PREFIX = 'dji_open_platform_connect_sdk_js_callback_'
const JS_CALLBACK_MQTT_CONNECTION_STATE = JS_CALLBACK_PREFIX + 'mqtt_connection_state'


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

        // setup callbacks

        this.registerJsCallback(JS_CALLBACK_MQTT_CONNECTION_STATE, (connectState: boolean)=>{
            this.dispatch('mqtt_connection_state', connectState)
        })
    }

    // -- GENERAL --

    verifyLicense = this.wrapWithLog('verifyLicense', ()=>{
        const ret = this.unwrapResponse(this.djiBridge.platformVerifyLicense(this.appId, this.appKey, this.appLicense))

        this.licenseIsVerified = ret

        return ret
    })

    setWorkspaceId = this.wrapWithLog('setWorkspaceId', (uuid: string)=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.platformSetWorkspaceId(uuid)
        )
    })

    setPlatformInformation = this.wrapWithLog('setPlatformInformation', (platformName: string, workspaceName: string, description: string)=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.platformSetInformation(platformName, workspaceName, description)
        )
    })

    getRemoteControllerSN = this.wrapWithLog('getRemoteControllerSN', ()=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.platformGetRemoteControllerSN()
        )
    })

    getAircraftSN = this.wrapWithLog('getAircraftSN', ()=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.platformGetAircraftSN()
        )
    })


    // -- MQTT --

    /**
     * don't immediately call this after you verified the license the first time, the dji pilot app will not be ready and throw an error!
     *
     * @param host url of our platforms api e.g. tcp://123.123.123.123:8080
     * @param token this one will be transmitted by the remote controll when doing api request in the X-Auth-Token HTTP header
     */
    mqtt_loadModule(host: string, username: string, password: string){
        return this.loadModule('thing', {
            host,
            connectCallback: JS_CALLBACK_MQTT_CONNECTION_STATE,
            username,
            password
        })
    }

    mqtt_moduleIsLoaded(){
        return this.moduleIsLoaded('thing')
    }

    mqtt_unloadModule(){
        return this.unloadModule('thing')
    }

    mqtt_isConnected = this.wrapWithLog('mqtt_isConnected', ()=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.thingGetConnectState()
        )
    })

    /**
     * requires the mqtt module to be loaded already
     * @see mqtt_startWithExistingConfig()
     */
    mqtt_start = this.wrapWithLog('mqtt_start', (username: string, password: string)=>{
        return new Promise((resolve, reject)=>{

            this.guardModuleLoaded('thing')

            let promiseIsDone = false

            this.addListenOnce('mqtt_connection_state', (connectState: boolean)=>{

                if(!promiseIsDone){

                    promiseIsDone = true

                    if(connectState){
                        resolve(true)
                    } else {
                        reject('could not connect')
                    }
                }
            })

            this.djiBridge.thingConnect(username, password, JS_CALLBACK_MQTT_CONNECTION_STATE)
        })
    })

    /**
     * requires the mqtt module to be loaded already
     *
     * @see mqtt_start()
     */
    mqtt_startWithExistingConfig = this.wrapWithLog('mqtt_startWithExistingConfig', ()=>{
        return new Promise<boolean>((resolve, reject)=>{

            this.guardModuleLoaded('thing')

            let promiseIsDone = false

            const config = this.mqtt_GetCurrentConfig()

            this.addListenOnce('mqtt_connection_state', (connectState: boolean)=>{

                if(!promiseIsDone){

                    promiseIsDone = true

                    if(connectState){
                        resolve(true)
                    } else {
                        reject('could not connect')
                    }
                }
            })

            this.djiBridge.thingConnect(config.username, config.password, JS_CALLBACK_MQTT_CONNECTION_STATE)
        })
    })


    mqtt_Stop = this.wrapWithLog('mqtt_Stop', ()=>{

        this.guardModuleLoaded('thing')

        this.djiBridge.thingDisconnect()
    })

    mqtt_GetCurrentConfig = this.wrapWithLog('mqtt_GetCurrentConfig', ()=>{

        this.guardModuleLoaded('thing')

        return this.unwrapResponse(
            this.djiBridge.thingGetConfigs()
        )
    })


    // -- API --



    /**
     * don't immediately call this after you verified the license for the first time, the dji pilot app will not be ready and throw an error!
     *
     * @param host url of our platforms api e.g. https://example.org/api
     * @param token this one will be transmitted by the remote controll when doing api request in the X-Auth-Token HTTP header
     */
    api_loadModule(host: string, token: string){//TODO make this a promise that resolves after some time

        if(!host.endsWith('/')){
            host += '/'
        }

        return this.loadModule('api', {
            host,
            token
        })
    }

    api_moduleIsLoaded(){
        return this.moduleIsLoaded('api')
    }

    api_unloadModule(){
        return this.unloadModule('api')
    }


    /**
     *
     * @returns
     */
    api_getCurrentToken = this.wrapWithLog('api_getCurrentToken', ()=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.apiGetToken()
        )
    })

    api_setToken = this.wrapWithLog('api_setToken', (token: string)=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.apiSetToken(token)
        )
    })


    // internal stuff

    private guardLicenseIsVerified(){
        if(!this.licenseIsVerified){
            throw new Error('call verifyLicense() first')
        }
    }

    private guardModuleLoaded(moduleName: ModuleName){
        if(!this.moduleIsLoaded(moduleName)){
            throw new Error('module must be loaded first: ' + moduleName)
        }
    }

    private loadModule = this.wrapWithLog('loadModule', (moduleName: ModuleName, params: object)=>{
        return new Promise<EmptyObject>((resolve)=>{

            this.guardLicenseIsVerified()

            const ret = this.unwrapResponse(
                this.djiBridge.platformLoadComponent(moduleName, JSON.stringify(params))
            )

            setTimeout(()=>{
                resolve(ret)
            }, 100)//wait to give dji app to do some stuff
        })
    })

    private moduleIsLoaded = this.wrapWithLog('moduleIsLoaded', (moduleName: ModuleName)=>{

        this.guardLicenseIsVerified()

        return this.unwrapResponse(
            this.djiBridge.platformIsComponentLoaded(moduleName)
        )
    })

    private unloadModule = this.wrapWithLog('unloadModule', (ModuleName: ModuleName)=>{
        return new Promise<EmptyObject>((resolve)=>{
            this.guardLicenseIsVerified()

            const ret = this.unwrapResponse(
                this.djiBridge.platformUnloadComponent(ModuleName)
            )

            setTimeout(()=>{
                resolve(ret)
            }, 100)//wait to give dji app to do some stuff
        })
    })


    // helpers

    /**
     * basically does window['callbackName'] = function(){} so the dji apps can call this function
     * @see unregisterJsCallback()
     * @param callbackName
     */
    private registerJsCallback(callbackName: string, callback: Function){

        window[callbackName] = callback
    }

    /**
     *
     * @see registerJsCallback()
     * @param callbackName the return value from registerJsCallback()
     */
    private unregisterJsCallback(callbackName: string){
        window[callbackName] = undefined
    }

    /**
     *
     * @see registerJsCallback()
     * @param callbackName the return value from registerJsCallback()
     */
    private executeJsCallback(callbackName: string, args: any[]){
        const cb = window[callbackName]

        if(typeof cb !== 'function'){
            throw new Error('provided callbackName is not a function: ' + callbackName)
        }

        cb.apply(null, args)
    }

    private wrapWithLog<F extends Function>(title: string, func: F){
        const f = (...args)=>{

            try {
                const argString = args.map(a => {
                    return (a instanceof Object) ? JSON.stringify(a) : ('' + a)
                }).join(', ')

                this.log(`running ${title}(${argString}) ...`)


                const result = func.apply(this, args)

                if(typeof result === 'undefined'){
                    this.log('@' + title + '() = success')
                } else {
                    this.log('@' + title + '() = ', JSON.stringify(result, null, 2))
                }

                return result
            } catch (err){
                if(err instanceof Error){
                    this.log('@' + title + '()  ', err.stack || err.message || err.name)
                } else {
                    this.log('@' + title + '()  ERROR:', err)
                }

                throw err
            }
        }

        return f as unknown as F
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
        console.log.apply(null, args)
        this.dispatch('log', args.map(a => '' + a).join(' '))
    }

}
