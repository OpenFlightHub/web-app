<script setup lang="ts" generic="T extends Record<string, any>, P extends Record<string, number | undefined>">
import LoadApi from '@/components/functional/LoadApi.vue';
import { getIdParamFromRoute } from '@/util/url';
import { updateObject } from '@/util/vue';
import { onMounted, Reactive, reactive, ref, watch } from 'vue';

import { useRoute } from 'vue-router';


const props = defineProps<{
    apiMethod: (params: P) => Promise<T>
    idParams: P
}>()

const route = useRoute()


watch(()=>{
    return route.params
}, init, {
    deep: true
})

watch(()=>{
    return props.idParams
}, init, {
    deep: true
})

onMounted(init)

const params = reactive({} as Record<keyof P, number>)

const paramsValid = ref(false)

async function init(){
    if(props.idParams instanceof Object === false){
        return
    }

    const newParams = {}

    for(const paramName of Object.keys(props.idParams)){
        const id = getIdParamFromRoute('workspace_id', route)
        if(id <= 0){
            paramsValid.value = false
            return
        }

        newParams[paramName] = id
    }

    paramsValid.value = true

    updateObject(params, newParams)
}

</script>

<template>

    <LoadApi v-if="paramsValid" :api-method="props.apiMethod" :params="(params as Record<keyof P, number>)" v-slot="scope">

        <slot :data="scope.data"></slot>

    </LoadApi>

</template>

<style scoped lang="scss">

</style>

