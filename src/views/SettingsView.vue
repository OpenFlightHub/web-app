<script setup lang="ts">

import { setSetting, resetSettings } from '@/util/settings';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import { Button } from 'primevue';

import useMainStore from "@/stores/main"
const store = useMainStore()

//TODO automatically generate user inputs from settings and make it reactive

function reset(){
    if(!confirm('Are you sure you want to reset all settings? This cannot be undone!')){
        return
    }

    resetSettings()
    document.location.reload()
}

</script>

<template>

    <Padding>

        <h3>Settings:</h3>

        <List>
            <div v-if="store.isAdmin" class="settings">
                <label>Allow Bing Maps Terrain&nbsp;<Button @click="setSetting('allow-bing-maps', true)">Allow</Button></label>
                <label>Use dev Terrain&nbsp;<Button @click="setSetting('use-dev-terrain', true)">Allow</Button></label>
                <label>Reset Settings&nbsp;<Button @click="reset">Reset All Settings</Button></label>
            </div>
        </List>

    </Padding>

</template>

<style lang="scss" scoped>

.settings {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

</style>
