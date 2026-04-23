<script setup lang="ts" generic="T extends Record<string, any>, C extends {[key: string]: any, params: Record<string, any>}, AM extends ((config: C) => Promise<T>), PROPS extends {apiMethod: AM, config: Parameters<AM>[0], idParams: string[]}">
import LoadApi from '@/components/functional/LoadApi.vue';
import { getIdParamFromRoute } from '@/util/url';
import { updateObject } from '@/util/vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { useRoute } from 'vue-router';


const props = defineProps<{
    apiMethod: PROPS['apiMethod'],
    config: PROPS['config'],
    idParams: PROPS['idParams']
}>()

const emit = defineEmits<{
    (e: 'change', v: C['params']): void
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

const params = reactive({} as Record<string, number>)

const paramsValid = ref(false)

async function init(){
    if(props.idParams instanceof Object === false){
        return
    }

    const newParams: Record<string, any> = {}

    for(const paramName of props.idParams){
        const id = getIdParamFromRoute(paramName, route)
        if(id < 0){
            paramsValid.value = false
            return
        }

        newParams[paramName] = id
    }

    paramsValid.value = true

    updateObject(params, newParams)

    emit('change', params)
}

const filledConfig = computed(()=>{
    const baseConfig = JSON.parse(JSON.stringify(props.config)) as PROPS['config']

    Object.assign(baseConfig.params, params)

    return baseConfig
})


</script>

<template>

    <!-- @vue-ignore -->
    <LoadApi v-if="paramsValid" :api-method="props.apiMethod" :config="filledConfig" v-slot="scope">

        <slot :data="scope.data"></slot>

    </LoadApi>

</template>

<style scoped lang="scss">

</style>

