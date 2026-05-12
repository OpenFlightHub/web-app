<script setup lang="ts">
import { Select } from 'primevue';
import { getGeoObjectColorSelectOptions } from '@/util/api';
import api from '@/api';


const props = defineProps<{
    fieldName: string
    initialColor?: keyof typeof api.CONSTANTS.GEO_OBJECT_COLORS
}>()

const emit = defineEmits<{
    change: [value: string]
}>()

const options = getGeoObjectColorSelectOptions().map(opt => ({label: opt.label.toLowerCase(), value: opt.value}))

function getColorNameForValue(value: string){
    const option = options.find(opt => opt.value === value)
    return option ? option.label : value
}

</script>

<template>

    <Select :id="props.fieldName" :name="props.fieldName" :options="options" option-value="value" option-label="label" @change="evt => emit('change', evt.value)" :default-value="options.find(opt => opt.label === props.initialColor?.toLowerCase())?.value">
        <template #value="selected">
            <div v-if="selected.value" class="entry">
                <span class="image_circle" :style="{background: selected.value}" />
                <div>{{ getColorNameForValue(selected.value) }}</div>
            </div>
            <span v-else>
                {{ selected.placeholder }}
            </span>
        </template>
        <template #option="option">
            <div class="entry">
                <span class="image_circle" :style="{background: option.option.value}" />
                <div>{{ option.option.label }}</div>
            </div>
        </template>
    </Select>

</template>

<style scoped lang="scss">
.entry {
    display: flex;
    align-items: center;
    gap: 0.5em;

    .image_circle {
        display: block;
        border-radius: 50%;
        overflow: hidden;
        width: 0.8em;
        height: 0.8em;
    }
}
</style>
