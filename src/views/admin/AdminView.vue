<script setup lang="ts">
import IconVue from '@/components/general/IconVue.vue';
import Padding from '@/components/layout/Padding.vue';
import Spacing from '@/components/layout/Spacing.vue';

</script>

<template>
    <Padding>
        <h1>Admin Area</h1>

        <Spacing></Spacing>

        <RouterLink to="/admin/system" class="link"><IconVue name="server"></IconVue> System Dashboard</RouterLink>

        <RouterView/>
    </Padding>

</template>
