<script setup lang="ts">
import { onMounted, watch } from 'vue';
import * as maplibregl from 'maplibre-gl'


const props = defineProps<{
    map: maplibregl.Map
    position: [number, number]
    markerElement?: HTMLElement
}>()

let marker: maplibregl.Marker
let markerIsAddedToMap = false

onMounted(()=>{

    marker = new maplibregl.Marker({
        element: props.markerElement
    })

})

watch(()=>props.position, updateMarker, {deep: true})

function updateMarker(){

    if(typeof props.position[0] === 'number' && typeof props.position[1] === 'number'){
        marker.setLngLat(props.position)
        showMarker()
    } else {
        hideMarker()
    }
}

function showMarker(){
    if(!markerIsAddedToMap){
        marker.addTo(props.map)
        markerIsAddedToMap = true
    }
}

function hideMarker(){
    if(markerIsAddedToMap){
        marker.remove()
        markerIsAddedToMap = false
    }
}

</script>
