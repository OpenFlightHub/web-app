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

const showFullscreen = ref(false)

function handleClick(){
    showFullscreen.value = !showFullscreen.value
}

function closeFullScreen(){
    showFullscreen.value = false
}

</script>

<template>

    <LoadApi :api-method="api.rest.file.get" :params="{fileId: props.id}" v-slot="file">

        <div id="file" :class="{fullscreen: showFullscreen}">
            <div id="view" :style="'background-image: url(\'/api/file/data/' + props.id + '\')'" @click.self.stop="handleClick"></div>
            <div id="actions">
                <Padding>
                    <div>
                        <Button><IconVue name="download" @click="downloadUrl(api.getFileDataUrl(props.id), file.data.name)"></IconVue></Button>
                        <Button v-show="showFullscreen"><IconVue name="x-lg" @click.self.stop="closeFullScreen"></IconVue></Button>
                    </div>
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
        width: 15em;
        height: 15em;
        cursor: pointer;

        &.fullscreen {
            position: fixed;
            z-index: 10;
            top: 0;
            left: 0;
            height: 100vh;
            width: 100vw;
            background: #000;

            #view {
                background-size: contain;
            }
        }

        #view {
            width: 100%;
            height: 100%;
            background: var(--neutral-darkest);
            background-size: cover;
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

            div {
                display: flex;
                gap: 1em
            }
        }

        &:hover #actions {
            display: flex;
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
