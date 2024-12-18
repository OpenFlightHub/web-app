<script setup lang="ts">

import LogoVue from '@/components/branding/LogoVue.vue';

</script>

<template>
    <div id="out">

        <div id="in">

            <LogoVue id="logo" size1em></LogoVue>

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
    padding: 10vh 10vw;
    min-height: calc(100vh - var(--navbar-size));
    width: 100vw;

    &:after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 1;
        background-image: url('/images/logo_pattern.png');
        background-size: 100px;
        background-position: center;
        background-repeat: repeat;
        opacity: 7%;
    }

    #in {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding: 2em;
        overflow-y: auto;
        z-index: 90;
        background-color: var(--neutral-darkest);
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        color: var(--neutral-lighter);

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

</style>
