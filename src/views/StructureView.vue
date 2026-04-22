<script setup lang="ts">

import WorkspaceSnippet from '@/components/workspace/WorkspaceSnippet.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import LinkableDeviceInfo from '@/components/link/LinkableDeviceInfo.vue';
import useMainStore from '@/stores/main';
import { onMounted, reactive } from 'vue';
import api from '@/api';
import { ApiResponse_UserMyOrganisationsGet, ApiResponse_UserMyTeamsGet } from 'openflighthub-api-client-sdk';
import { updateArray } from '@/util/vue';
import OrganisationSnippet from '@/components/organisation/OrganisationSnippet.vue';
import TeamSnippet from '@/components/team/TeamSnippet.vue';

const myOrganisations = reactive<ApiResponse_UserMyOrganisationsGet>([])
const myTeams = reactive<ApiResponse_UserMyTeamsGet>([])

onMounted(async ()=>{
    updateArray(myOrganisations, await api.rest.user.myOrganisations.get())
    updateArray(myTeams, await api.rest.user.myTeams.get())
})

</script>

<template>

    <LinkableDeviceInfo></LinkableDeviceInfo>

    <Padding>

        <h3>Your Organisations:</h3>

        <List>
            <OrganisationSnippet v-for="organisation in myOrganisations" :key="organisation.id" :id="organisation.id"></OrganisationSnippet>
            <i v-if="myOrganisations.length === 0">None</i>
        </List>

        <br>

        <h3>Your Teams:</h3>

        <List>
            <TeamSnippet v-for="team in myTeams" :key="team.id" :id="team.id"></TeamSnippet>
            <i v-if="myTeams.length === 0">None</i>
        </List>

    </Padding>

</template>

<style lang="scss" scoped>


</style>
