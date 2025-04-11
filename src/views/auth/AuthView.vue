<script setup lang="ts">

import LogoVue from '@/components/branding/LogoVue.vue';
import { computed } from 'vue';

const showLogo = computed(()=>{

    if(screen.availHeight < 600){
        return false
    }

    return true
})

</script>

<template>
    <div id="out">

        <div id="in">

            <LogoVue id="logo" size1em v-if="showLogo"></LogoVue>

            <div id="router">
                <RouterView/>
            </div>
        </div>

    </div>

</template>


<style scoped lang="scss">

#out {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 100%;
    width: 100%;

    #in {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding: 2em;
        overflow-y: auto;
        z-index: 90;
        background: var(--neutral-darkest);
        box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.25);
        color: var(--neutral-lighter);
        border-radius: 1em;

        #logo {
            font-size: 50px;
            flex-shrink: 0;
            margin-bottom: 15px;
        }

        #router {
            flex-shrink: 1;
        }

    }
}

@media screen and (max-height: 600px) {
    #out {
        align-items: flex-start;
    }
}

</style>
