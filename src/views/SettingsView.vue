<script setup lang="ts">

import { setSetting } from '@/util/settings';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import { Button } from 'primevue';

import useMainStore from "@/stores/main"
const store = useMainStore()

//TODO automatically generate user inputs from settings and make it reactive

</script>

<template>

    <Padding>

        <h3>Settings:</h3>

        <List>
            <div v-if="store.isAdmin">
                <label>Allow Bing Maps Terrain</label><Button @click="setSetting('allow-bing-maps', true)">Allow</Button>
            </div>
        </List>

    </Padding>

</template>

<style lang="scss" scoped>


</style>
