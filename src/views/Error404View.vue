<script setup lang="ts">

import { Button } from 'primevue';
import { useRouter } from 'vue-router';

const router = useRouter()

</script>

<template>

    <div class="error">
        <h1>Error 404: Not found</h1>

        <Button @click="router.back()">Go Back</Button>
    </div>

</template>

<style scoped lang="scss">

.error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>
