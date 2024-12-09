export type DjiBridgeResponse<T> = DjiBridgeResponseSuccess<T> | DjiBridgeResponseFail

export type DjiBridgeResponseSuccess<T> = {
    code: 0
    data: T
}

export type DjiBridgeResponseFail = {
    code: number
    message: string
}

export type DjiBridge = {
    /**
     * @param uuid the identifier of the workspace Identifier, the id must be uuid grid format. Example: e3dea0f5-37f2- 4d79-ae58- 490af3228069
     */
    platformSetWorkspaceId: (uuid: string) => DjiBridgeResponse<void>

    /**
     *
     * @param workspaceName the name displayed on the Pilot cloud portal
     * @param desc the description displayed on the Pilot cloud portal
     *
     */
    platformSetInformation: (platformName: string, workspaceName: string, desc: string) => DjiBridgeResponse<void>

    platformGetRemoteControllerSN: () => DjiBridgeResponse<string>

    platformGetAircraftSN: () => DjiBridgeResponse<string>

    /**
     * Close and exit the platform
     */
    platformStopSelf: () => DjiBridgeResponse<void>


    /**
     * the api module must be loaded before it can be used
     */
    apiSetToken: (token: string) => DjiBridgeResponse<void>

    apiGetToken: () => DjiBridgeResponse<string>


    /**
     * The appId and appKey and license need to be requested on the developer website.
     */
    platformVerifyLicense: (appId: string, appKey: string, license: string) => DjiBridgeResponse<boolean>

/*
    onBackClick()	Return key callback	When you click the return key in the upper left corner of the webView page, the interface callback will be triggered. If the return value is true, PILOT will not be processed. if it is false or this function is not implemented, PILOT will exit the WebView page, and the effect will be the same as the return key of the remote control entity. Note: The remote controller back button cannot trigger this callback.
window.djiBridge.onStopPlatform()	Exit cloud platform callback	Before clicking to exit the cloud platform, the js method will be called, and then the APP will continue to perform the action of exiting the platform
window.djiBridge.platformSetLogEncryptKey(String key) 	Set the log encryption key	Set the public key of the pilot log.
window.djiBridge.platformClearLogEncryptKey()	Clear the log encryption key	Clear the log encryption key.
window.djiBridge.platformGetLogPath()	Obtain the log path	Obtain the path for saving pilot logs.
window.open('scheme://host...', arg); 	Launch the third-party App	Using Scheme format
window.djiBridge.platformGetVersion()	Get version	Rreturn modelVersion and appVersion
window.djiBridge.platformIsVerified()	Check if the interface is authenticated	Check whether the certificate has been authenticated before initiating js communication, if there is no authentication case, the communication will fail.
window.djiBridge.platformLoadComponent(String name, String param)	Load Function Module	name: function module param: a json character. See below for details of the function modules:
Cloud Module
Live Stream Module
API Module
WS Module
Map Module
TSA Module
Media Module
Mission Module
window.djiBridge.platformUnloadComponent(String name)	Remove function module	-
window.djiBridge.platformIsComponentLoaded(String name)	Determine if the module is	-
window.djiBridge.platformIsAppInstalled(String pkgName)	Check if the APP is installed	pkgName: App package name
*/
}