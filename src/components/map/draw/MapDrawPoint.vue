<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import MapClickListener from '../MapClickListener.vue';
import { updateObject } from '@/util/vue';
import MapMarker from '../MapMarker.vue';
import ApiForm from '@/components/functional/form/ApiForm.vue';
import api from '@/api';
import { useToast, IftaLabel, Select, Button } from 'primevue';
import Padding from '@/components/layout/Padding.vue';
import { getGeoObjectColorSelectOptions } from '@/util/api';
import SelectApiColor from '@/components/functional/form/SelectApiColor.vue';
import { Color } from 'cesium';
import IconVue from '@/components/general/IconVue.vue';

const props = defineProps<{
    workspaceId: number
    taskId?: number
}>()

const hasLocation = ref(false)
const locationData = reactive({
    longitude: 0,
    latitude: 0,
    height: 0
})

const emit = defineEmits<{
    click: [value:undefined]
}>()

const toast = useToast()

const config = reactive({
    point: [locationData.longitude, locationData.latitude, locationData.height] as [number, number, number],
    color: api.CONSTANTS.GEO_OBJECT_COLORS.BLUE
})

</script>

<template>

    <MapClickListener @click="(loc)=>{
        hasLocation = true
        updateObject(locationData, loc)
        config.point[0] = loc.longitude
        config.point[1] = loc.latitude
        config.point[2] = loc.height
    }"></MapClickListener>

    <MapMarker v-if="hasLocation" :position="[locationData.longitude, locationData.latitude, locationData.height]" icon-url="/images/geo_objects/markings/0.png" :icon-width="32" :icon-height="32" :color="Color.fromCssColorString(config.color)">
    </MapMarker>

    <div id="form">
        <Padding>
            <ApiForm :api-method="api.rest.workspace.geoObjects.post" type="create" title="Create Point" :params="{workspaceId: props.workspaceId}" :fields="{
                name: {type: 'text', required: true},
                type:  {type: 'number', required: true},
                sub_type:  {type: 'number', required: true},
                uuid: {type: 'text', required: false},
                config: {type: 'raw', required: true}
            }" :editable-fields="['name']" :initial-values="{
                type: 0,
                sub_type: 0,
                config
            }" @created="(ref) => {
                if(typeof props.taskId === 'number'){
                    api.rest.task.linkGeoObject.post({
                        params: {
                            taskId: props.taskId
                        },
                        data: {
                            geo_object_id: ref.id
                        }
                    }).then(()=>{
                        toast.add({severity: 'success', summary: 'Success', detail: 'Point linked to task'})
                    }).catch(err=>{
                        toast.add({severity: 'error', summary: 'Error', detail: 'Could not link point to task: ' + err})
                    })
                }
            }" :watch-initial-values="['config']">

                <IftaLabel>
                    <SelectApiColor field-name="color" @change="newColor => config.color = newColor" initial-color="BLUE"></SelectApiColor>
                    <label for="color">Color</label>
                </IftaLabel>

            </ApiForm>
        </Padding>
    </div>

</template>

<style scoped lang="scss">
#form {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
}
</style>
