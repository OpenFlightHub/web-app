<script setup lang="ts" generic="T extends Array<any>, P extends Record<string, any>">
import { updateArray, updateObject } from '@/util/vue';
import { ref, reactive, onMounted, watch, Reactive } from 'vue';


const props = defineProps<{
    apiMethod: (params: P) => Promise<T>
    params: P
}>()

const initialLoadDone = ref(false)
const isLoading = ref(true)

const obj = reactive([] as T)

onMounted(load)

watch(()=>{
    return props.apiMethod
}, load)

watch(()=>{
    return props.params
}, load, {
    deep: true
})

async function load(){
    isLoading.value = true

    const response = await props.apiMethod(props.params)

    updateArray(obj, response)

    isLoading.value = false

    if(!initialLoadDone.value){
        initialLoadDone.value = true
    }
}

</script>

<template>

    <div id="container">
        <slot v-if="initialLoadDone" :data="obj"/>
        <div id="overlay" v-if="isLoading">
            Loading ...
        </div>
    </div>

</template>

<style scoped lang="scss">
    #container {
        position: relative;

        #overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            min-width: 20px;
            min-height: 20px;
            z-index: 1;
            background: #000;
            opacity: 20%;
        }
    }
</style>
