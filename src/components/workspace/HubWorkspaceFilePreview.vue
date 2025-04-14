<script setup lang="ts">
import LoadApi from '../functional/LoadApi.vue';
import api from '@/api';
import Padding from '../layout/Padding.vue';
import { Button } from 'primevue';
import IconVue from '../general/IconVue.vue';
import { downloadUrl } from '@/util/download';
import { ref } from 'vue';


const props = defineProps<{
    id: number // TODO we should not use the name "id" for this prop as this override the html id attribute
}>()

</script>

<template>

    <LoadApi :api-method="api.rest.file.get" :params="{fileId: props.id}" v-slot="file">

        <div id="file" >
            <div id="view">
                <img :src="api.getFileThumbnailUrl(props.id)" loading="lazy" fetchpriority="low">
            </div>
            <div id="info">
                <Padding>
                    {{ file.data.name }}
                </Padding>
            </div>
        </div>
    </LoadApi>

</template>

<style scoped lang="scss">

    #file {
        position: relative;

        #view {
            width: 100%;
            height: 100%;
            background: var(--neutral-darkest);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        #info {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: #0006;
            font-size: 0.8em;
        }
    }

</style>
