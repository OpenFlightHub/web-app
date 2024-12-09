<script setup lang="ts">
import LogoVue from '../branding/LogoVue.vue';

const props = defineProps<{
    showLogo?: boolean
}>()

</script>

<template>

    <div id="content">

        <div id="inner">

            <LogoVue v-if="props.showLogo" id="logo" size1em></LogoVue>

            <div id="slot">
                <slot></slot>
            </div>
        </div>

    </div>

</template>

<style scoped lang="scss">

#content {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background: var(--neutral-darker);
    padding: 10vh 10vw;

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
        opacity: 0.5%;
    }

    #inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        height: 100%;
        width: 100%;
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

        #slot {
            flex-shrink: 1;
        }

    }
}

</style>
