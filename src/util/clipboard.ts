import { showToast } from "./toast"

import {i18nInstance} from "../main"

export function writeToClipboard(text: string){
    const i18n = i18nInstance.global

    showToast(i18n.t("clipboard.added_to"))
    return navigator.clipboard.writeText(text)
}

export function readFromClipboard(){
    return navigator.clipboard.readText()
}