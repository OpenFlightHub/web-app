<script setup lang="ts">
import api from '@/api';

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

    <v-btn @click="logout">{{ $t("logout.logout") }}</v-btn>

</template>

<style scoped lang="scss">


</style>
