<script setup lang="ts">
import LoadApi from '../functional/LoadApi.vue';
import api from '@/api';
import Padding from '../layout/Padding.vue';
import { Button } from 'primevue';
import IconVue from '../general/IconVue.vue';
import { downloadUrl } from '@/util/download';


const props = defineProps<{
    id: number
}>()

</script>

<template>

    <LoadApi :api-method="api.rest.file.get" :params="{fileId: props.id}" v-slot="file">

        <div id="file">
            <div id="view" :style="'background-image: url(\'/api/file/data/' + props.id + '\')'"></div>
            <div id="actions">
                <Padding>
                    <Button><IconVue name="download" @click="downloadUrl('/api/file/data/' + props.id, file.data.name)"></IconVue></Button>
                </Padding>
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
        width: 20em;
        height: 20em;

        #view {
            width: 100%;
            height: 100%;
            background: var(--neutral-darkest);
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }

        #actions {
            display: none;
            position: absolute;
            top: 0;
            width: 100%;
            background: #0006;
            flex-direction: row;
            justify-content: flex-end;
        }

        &:hover #actions {
            display: flex;
        }

        #info {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: #0006;
        }
    }

</style>
