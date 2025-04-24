<script setup lang="ts">

import { setSetting } from '@/util/settings';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import { Button } from 'primevue';

</script>

<template>

    <Padding>

        <h3>Settings:</h3>

        <List>
            <div>
                <label>Allow Bing Maps Terrain</label><Button @click="setSetting('allow-bing-maps', true)">Allow</Button>
            </div>
        </List>

    </Padding>

</template>

<style lang="scss" scoped>


</style>
