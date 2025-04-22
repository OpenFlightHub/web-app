<script setup lang="ts">
import LoadApi from '../functional/LoadApi.vue';
import api from '@/api';
import Padding from '../layout/Padding.vue';
import { Button } from 'primevue';
import IconVue from '../general/IconVue.vue';
import { downloadUrl } from '@/util/download';
import { ref } from 'vue';
import { ApiResponse_FileGet } from 'openflighthub-api-client-sdk';


const props = defineProps<{
    file: ApiResponse_FileGet
}>()

const showFullscreen = ref(false)

function handleClick(){
    showFullscreen.value = !showFullscreen.value
}

function closeFullScreen(){
    showFullscreen.value = false
}

</script>

<template>

    <div id="file" :class="{fullscreen: showFullscreen}">
        <div id="view" @click.stop="handleClick">
            <img v-show="showFullscreen || !props.file.has_thumbnail" :src="api.getFileDataUrl(props.file.id)" loading="lazy" fetchpriority="low">
            <img v-show="!showFullscreen && props.file.has_thumbnail" :src="api.getFileThumbnailUrl(props.file.id)" loading="lazy" fetchpriority="low">
        </div>
        <div id="actions">
            <Padding>
                <div>
                    <Button><IconVue name="download" @click="downloadUrl(api.getFileDataUrl(props.file.id), file.name)"></IconVue></Button>
                    <Button v-show="showFullscreen"><IconVue name="x-lg" @click.self.stop="closeFullScreen"></IconVue></Button>
                </div>
            </Padding>
        </div>
        <div id="info">
            <Padding>
                {{ props.file.name }}
            </Padding>
        </div>
    </div>

</template>

<style scoped lang="scss">

    #file {
        position: relative;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;

        &.fullscreen {
            position: fixed;
            z-index: 100000;
            top: 0;
            left: 0;
            height: 100vh !important;
            width: 100vw !important;
            background: #000;

            #info {
                position: absolute;
                bottom: 0;
                left: 0;
            }
        }

        #view {
            width: 100%;
            height: 100%;
            flex-grow: 1;
            background: var(--neutral-darkest);

            img {
                object-fit: contain;
                object-position: center;
                margin: auto;
                width: 100%;
                height: 100%;
                background-color: #000;
            }
        }

        #actions {
            display: none;
            position: absolute;
            top: 0;
            width: 100%;
            background: #0006;
            flex-direction: row;
            justify-content: flex-end;

            div {
                display: flex;
                gap: 1em
            }
        }

        &:hover #actions {
            display: flex;
        }

        #info {
            width: 100%;
            background: #0006;
            font-size: 0.8em;
            flex-grow: 0;
        }
    }

</style>
