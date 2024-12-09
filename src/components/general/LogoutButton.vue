<script setup lang="ts">
import api from '@/api';
import { Button } from 'primevue';

async function logout(){
    await api.auth.logout.post().then(()=>{
        document.location = '/'
    }).catch(()=>{
        //TODO
        document.location = '/'
    })
}

</script>

<template>

    <Button @click="logout">{{ $t("logout.logout") }}</Button>

</template>

<style scoped lang="scss">


</style>
