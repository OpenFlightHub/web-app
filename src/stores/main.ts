import api from '@/api/index';
import { ApiResponse_AuthLoginPost, ApiResponse_UserSelfGet } from '@/api/openflighthub-api';
import { defineStore } from 'pinia'

/**
 * HOW TO USE THIS STORE IN A COMPONENT:
 *
 * <script setup lang="ts">
    import useMainStore from "@/stores/main"
    const store = useMainStore()


    Thats it! The store is reactive
 */

export const useMainStore = defineStore('main', {
    state(){
        return {
            loginInitialCheckWasDone: false,
            apiUnavailable: false,//this is just the initial check and requires a manual page reload
            apiDisconnected: false,//this is used once initial checks are done and login was performed (state is monitored via websocket)
            user: null as ApiResponse_AuthLoginPost,
            userSelf: null as ApiResponse_UserSelfGet,

            isForceLoggedOut: false,//true when someone else has logged into this account
        }
    },

    getters: {
        isLoggedIn: state => !!state.user
    },

    actions:{

        async logout(){
            await api.auth.logout.post()
            this.userSelf = null
            this.user = null
        },

        async login(username: string, password: string){
            const user = await api.auth.login.post({
                username,
                password
            })
            this.userSelf = await api.user.self.get()
            this.user = user
        },

        async loginWithToken(token: string){
            const user = await api.auth.loginWithToken.post({
                token
            })
            this.userSelf = await api.user.self.get()
            this.user = user
        },

        async loginCheck(){
            try {
                const user = await api.auth.check.get()
                this.userSelf = await api.user.self.get()
                this.user = user
                return true
            } catch(err) {
                if((err as Error).message.toLowerCase().trim().startsWith('fatal')){
                    this.apiUnavailable = true
                }

                return false
            }
        }
    }
})

export default useMainStore
