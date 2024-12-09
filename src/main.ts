
import { createApp } from 'vue'

import { createPinia } from 'pinia'
import Main from './Main.vue'
import { makeRouter } from '@/router'

import { createI18n } from 'vue-i18n'

import './assets/main.scss'

const pinia = createPinia()
const app = createApp(Main)


const router = makeRouter(pinia)
app.use(router)
app.use(pinia)


import useMainStore from './stores/main'
const store = useMainStore()

import api from './api'

let apiIsReconnected = false

api.status.addListener('connected', ()=>{//TODO when reconneting but not logged in this will flicker
    store.apiDisconnected = false
    apiIsReconnected = true
})

api.status.addListener('disconnected', reason=>{

    if(reason === 'logout'){
        store.isForceLoggedOut = true
    }

    if(reason === 'tcp_reset'){
        reportError('websocket tcp_reset')
    }

    if(apiIsReconnected){
        apiIsReconnected = false
    }

    setTimeout(()=>{
        if(!apiIsReconnected){
            store.apiDisconnected = true
        }
    }, 1000 * 2)//if api is not reconnecting within 2 seconds, set apiDisconnected
})

app.config.globalProperties.window = window
app.config.globalProperties.document = document

// internationalisation

import * as en from './i18n/en.json'
import * as de from './i18n/de.json'

const FALLBACK_LOCALE = 'en'

export const i18nInstance = createI18n({
    locale: FALLBACK_LOCALE,
    fallbackLocale: FALLBACK_LOCALE,
    messages: {
        en, de
    }
})
app.config.globalProperties.i18n = i18nInstance.global

app.use(i18nInstance)

app.provide('i18n', i18nInstance.global)

window.addEventListener('keydown', evt => {
    if(evt.ctrlKey && evt.shiftKey && evt.code === 'KeyD'){
        evt.preventDefault()

        console.info('enabling translation key debugging')
        //@ts-ignore
        i18nInstance.global.locale = 'debug'
        //@ts-ignore
        i18nInstance.global.fallbackLocale = 'debug'
    }
})



//@ts-ignore
import { createVuetify } from 'vuetify';
//@ts-ignore
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import DayJsAdapter from '@date-io/dayjs';


app.use(createVuetify({
    components: {
        VTimePicker
    },
    date: {
      adapter: DayJsAdapter,
    },
  }))

app.mount('#app')


//prevent default drag and drop behaviour (= show file)
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    window.addEventListener(eventName, evt=>{
        evt.preventDefault()
    })
})

