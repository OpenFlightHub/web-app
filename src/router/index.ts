import { createRouter, createWebHistory, type LocationQuery, type RouteLocationNormalized } from 'vue-router'
import { useMainStore } from '@/stores/main'
import type { Pinia } from 'pinia'



import HomeView from '@/views/HomeView.vue'

//Auth
import AuthView from '@/views/auth/AuthView.vue';
import LoginView from '@/views/auth/LoginView.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue';
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue';
import SetNewPasswordView from '@/views/auth/SetNewPasswordView.vue';
import FinishRegistrationView from '@/views/auth/FinishRegistrationView.vue'

// Hub
import HubView from '@/views/hub/HubView.vue'
import HubWorkspaceView from '@/views/hub/HubWorkspaceView.vue'
import HubConnectView from '@/views/hub/HubConnectView.vue'
import ConnectDJIPilot2 from '@/views/hub/connect/dji-pilot-2/ConnectDJIPilot2.vue';


//Error

import Error404View from '@/views/error/Error404View.vue'




const PATH_NAMES_THAT_DO_NOT_REQUIRE_LOGIN = ['home', 'login', 'password-reset', 'password-set-new'] /* this equals a routes "name" property */
const PATH_NAMES_THAT_DO_NOT_ALLOW_LOGGED_IN = ['password-reset', 'password-set-new'] /* this equals a routes "name" property */


/**
 * modifies in-place
 */
function clearFromQuery(query: LocationQuery, queryName: string){
    delete query[queryName]

    return query
}


function clearQueryParamFromPath(path: string, paramName: string){
    const split = path.split('?')
    const searchParams = new URLSearchParams(split[1])

    searchParams.delete(paramName)

    const searchParamsString = searchParams.toString()

    return split[0] + ((!searchParamsString || searchParamsString === '' || searchParamsString === '?') ? '' : '?' + searchParamsString)
}

function makeLocationFromPathWithRedirect(path: string, hash?: string){
    const goto = clearQueryParamFromPath(clearQueryParamFromPath(path, 'token'), 'redirect')

    return {
        path: goto,
        hash
    }
}

function makeLocationThatRedirectsBackTo(name: string, to: RouteLocationNormalized){

    return {
        name,
        query: {
            redirect: to.path
        },
        hash: to.hash
    }
}


function handleRedirect(to: RouteLocationNormalized){

    if(typeof to.query.redirect === 'string'){
        return makeLocationFromPathWithRedirect(to.query.redirect, to.hash)
    } else {
        return {
            name: 'home'
        }
    }
}

export function makeRouter(pinia: Pinia){

    const BASE_URL = '/'

    const store = useMainStore(pinia)

    const router = createRouter({
        history: createWebHistory(BASE_URL),
        routes: [
            {
                path: '/',
                name: 'home',
                component: HomeView
            },

            {
                path: '/auth',
                name: 'auth',
                component: AuthView,
                beforeEnter: (to, from, next) => {
                    if (to.name === 'auth') {//prevent loading the empty AuthView
                        next(false)
                        router.push('/')
                    } else {
                        next()
                    }
                },
                children: [
                    {
                        path: 'password-change',
                        component: ChangePasswordView
                    },
                    {
                        path: 'password-reset',
                        name: 'password-reset',
                        component: ResetPasswordView
                    },
                    {
                        path: 'finish-registration',
                        name: 'finish-registration',
                        component: FinishRegistrationView
                    },
                    {
                        path: 'password-set-new',
                        name: 'password-set-new',
                        component: SetNewPasswordView
                    },
                    {
                        path: 'login',
                        name: 'login',
                        component: LoginView
                    },
                ]
            },

            {
                path: '/hub',
                name: 'hub',
                component: HubView,
                children: [
                    {
                        path: 'connect',
                        component: HubConnectView,
                        children: [
                            {
                                path: 'dji-pilot-2',
                                component: ConnectDJIPilot2
                            }
                        ]
                    },
                    {
                        path: 'workspace/:workspace_id',
                        component: HubWorkspaceView
                    }
                ]
            },

            {
                path: '/:pathMatch(.*)*',
                name: '404',
                component: Error404View
            }
        ]
    })

    router.beforeEach(async (to, from) => {

        if(!store.loginInitialCheckWasDone){

            store.loginInitialCheckWasDone = true

            console.info('login check')
            if(await store.loginCheck()){
                // user was logged in via cookie
                console.info('login check success')
            } else {
                console.info('login check failed')
            }
        }

        // check if any auto login should be performed

        if(typeof to.query.token === 'string'){
            if(store.isLoggedIn){
                await store.logout()
            }

            try {
                await store.loginWithToken(to.query.token)
            } catch (error) {
                console.error(error)
            }

            clearFromQuery(to.query, 'token')
        }

        // end of auto logins

        if(store.isLoggedIn){

            if(PATH_NAMES_THAT_DO_NOT_ALLOW_LOGGED_IN.includes(to.name as string)){
                return handleRedirect(to)
            }

            if(store.userSelf.registration_incomplete){
                if(to.name !== 'finish-registration'){
                    return makeLocationThatRedirectsBackTo('finish-registration', to)
                }
            } else {
                if(to.name === 'finish-registration'){
                    return handleRedirect(to)
                }
            }

            if(to.name === 'login'){
                return handleRedirect(to)
            }

        } else {

            if(PATH_NAMES_THAT_DO_NOT_REQUIRE_LOGIN.includes(to.name as string) === false){

                return {
                    name: 'login',
                    hash: to.hash,
                    query: {
                        redirect: to.fullPath
                    }
                }
            }
        }


    })


    router.afterEach((to, from, failure)=>{

        setTimeout(()=>{
            if(document.location.hash){
                const startElement = document.getElementById(document.location.hash.substring(1))
                if(!startElement){
                    return
                }
                let currentElement : HTMLElement = startElement

                let y = currentElement.offsetTop

                while(currentElement && currentElement.offsetParent){
                    currentElement = currentElement.offsetParent as HTMLElement
                    y += currentElement.offsetTop
                }

                document.getElementById('app').scrollTo({top: y, behavior: 'smooth'})
            }
        }, 100)
    })

    return router
}
