<script setup lang="ts">

import App from '@/components/app/App.vue';
import AppContentOnly from '@/components/app/AppContentOnly.vue';

</script>

<template>
    <App>
        <AppContentOnly show-logo>

            <RouterView/>

        </AppContentOnly>

    </App>

</template>

