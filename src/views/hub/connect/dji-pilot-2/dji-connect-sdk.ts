import { DjiBridge, DjiBridgeResponse, DjiBridgeResponseFail, DjiBridgeResponseSuccess } from "./DjiBridge"


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
}

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
    }


    verifyLicense(){
        return this.wrapWithLog('verifyLicense', ()=>{
            const ret = this.unwrapResponse(this.djiBridge.platformVerifyLicense(this.appId, this.appKey, this.appLicense))

            this.licenseIsVerified = ret

            return ret
        })
    }

    guardLicenseIsVerified(){
        if(!this.licenseIsVerified){
            throw new Error('call verifyLicense() first')
        }
    }

    platformSetWorkspaceId(uuid: string){
        return this.wrapWithLog('platformSetWorkspaceId', ()=>{

            this.guardLicenseIsVerified()

            return this.unwrapResponse(
                this.djiBridge.platformSetWorkspaceId(uuid)
            )
        })
    }

    platformSetInformation(platformName: string, workspaceName: string, description: string){

        return this.unwrapResponse(this.djiBridge.platformSetInformation(platformName, workspaceName, description))
    }

    private wrapWithLog<T>(title: string, func: ()=>T){
        try {
            this.log(`running ${title}() ...`)

            const result = func()

            if(typeof result === 'undefined'){
                this.log('  success')
            } else {
                this.log('  = ', JSON.stringify(result, null, 2))
            }

            return result
        } catch (err){
            if(err instanceof Error){
                this.log('  ERROR:', err.name, err.message, err.stack)
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
            throw new Error('Failed: ' + (parsed as DjiBridgeResponseFail).message)
        }
    }

    private log(...args){
        this.dispatch('log', args.map(a => '' + a).join(' '))
    }

}
