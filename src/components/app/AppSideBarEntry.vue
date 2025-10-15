<script setup lang="ts">
import IconVue from '../general/IconVue.vue';

const props = defineProps<{
    icon: string
    to: string
}>()
</script>

<template>

    <RouterLink :to="props.to" id="link">
        <IconVue :name="props.icon"></IconVue>&nbsp;<slot></slot>
    </RouterLink>

</template>

<style scoped lang="scss">

#link {
    white-space: nowrap;
}

</style>
