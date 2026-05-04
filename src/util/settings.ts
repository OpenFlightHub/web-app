const LOCAL_STORAGE_ITEM_NAME = 'ofh_settings'

const SETTINGS = {
    'allow-bing-maps': false,
    'use-dev-terrain': false
}


export function getSetting<N extends keyof typeof SETTINGS>(name: N): (typeof SETTINGS)[N] {
    if(!SETTINGS.hasOwnProperty(name as PropertyKey)){
        throw new Error('invalid setting name: ' + name)
    }

    const storedSettings = loadStoredSettings()

    if(storedSettings.hasOwnProperty(name as PropertyKey)){
        const storedSettingValue = storedSettings[name as string]

        if(typeof storedSettingValue !== typeof SETTINGS[name]){
            console.error('storedSetting has invalid type', name, storedSettingValue)
        }

        return storedSettingValue
    } else {
        return SETTINGS[name]
    }

}

export function setSetting<N extends keyof typeof SETTINGS>(name: N, value: (typeof SETTINGS)[N]) {
    const storedSettings = loadStoredSettings()

    storedSettings[name] = value

    saveStoredSettings(storedSettings)
}

function loadStoredSettings(): Record<string, any>{
    const storedSettingsString = localStorage.getItem(LOCAL_STORAGE_ITEM_NAME)

    if(typeof storedSettingsString !== 'string'){
        return {}
    }

    try {
        const parsed = JSON.parse(storedSettingsString)

        if(parsed instanceof Array){
            console.error('ofh_settings has invalid structure: Array', parsed)
            return {}
        }

        if(parsed instanceof Object === false){
            console.error('ofh_settings has invalid structure:', parsed)
            return {}
        }

        return parsed
    } catch (err){
        console.error('failed to parse ofh_settings', err)
    }

    return {}
}


function saveStoredSettings(settings: Partial<typeof SETTINGS>){
    localStorage.setItem(LOCAL_STORAGE_ITEM_NAME, JSON.stringify(settings))
}

export function resetSettings(){
    localStorage.removeItem(LOCAL_STORAGE_ITEM_NAME)
}