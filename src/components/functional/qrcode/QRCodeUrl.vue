<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import QRCode from 'qrcode-generator'

const baseImage = ref<HTMLImageElement | null>(null)

const props = defineProps<{
    url: string
    withLogo?: boolean
}>()

const dataUrl = computed(() => {

    const qr = QRCode(0, 'M')
    qr.addData(props.url)
    qr.make()
    return qr.createDataURL(20)
})

watch(()=>{
    if(props.withLogo){
        addLogoOntopOfImage()
    }
})

function addLogoOntopOfImage(){

}

</script>

<template>

    <div>

        <img ref="baseImage" :src="dataUrl" alt="QR Code" />

    </div>

</template>

<style scoped lang="scss">

img {
    width: 300px;
}

</style>
