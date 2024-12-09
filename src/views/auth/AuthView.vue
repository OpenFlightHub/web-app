<script setup lang="ts">

import LogoVue from '@/components/branding/LogoVue.vue';
import Error404View from '../Error404View.vue';

</script>

<template>

    <v-app id="app">

        <v-main id="main" class="d-flex align-center justify-center">

            <v-container id="inner" class="rounded-xl">
                <RouterView/>
            </v-container>

        </v-main>

    </v-app>

</template>

<style lang="scss" scoped>

#main {
    background-color: var(--neutral-dark);
}

#inner {
    background-color: var(--neutral-darker);
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    color: var(--neutral-lighter);
}

</style>
