<script setup lang="ts">
import api from '@/api'
import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import FileImageOrIconVue from '@/components/general/FileImageOrIconVue.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import Spacing from '@/components/layout/Spacing.vue';
import TeamSnippet from '@/components/team/TeamSnippet.vue';
import UserSnippet from '@/components/user/UserSnippet.vue';
import { ref } from 'vue';
import ModalVue from '@/components/display/ModalVue.vue';
import ApiForm from '@/components/functional/form/ApiForm.vue';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import IconVue from '@/components/general/IconVue.vue';
import { Button } from 'primevue';

const showCreateTeamModal = ref(false)

</script>

<template>

    <LoadApiWithIdParamInUrl :api-method="api.rest.organisation.get" :config="{params: {}}" :id-params="['organisationId']" v-slot="organisation">
        <Padding>
            <div id="top">
                <h1>Organisation: {{ organisation.data.name }}</h1>
                <FileImageOrIconVue :file-id="organisation.data.logo_file_id" :icon-name="'buildings-fill'" :size="{em: 2}" :thumbnail="true"></FileImageOrIconVue>
            </div>

            <Spacing></Spacing>

            <h2>Owner</h2>
            <LoadApi :api-method="api.rest.user.get" :config="{params: {userId: organisation.data.owner_user_id}}" v-slot="owner">
                <UserSnippet :user="owner.data"></UserSnippet>
            </LoadApi>

            <Spacing></Spacing>

            <h2>Teams</h2>

            <Spacing></Spacing>

            <Button @click="showCreateTeamModal = true"><IconVue name="plus"></IconVue> Add Team</Button>

            <Spacing></Spacing>

            <LoadApiArrayWithIdParamInUrl :api-method="api.rest.organisation.teams.get" :config="{params: {}}" :id-params="['organisationId']" v-slot="teams">
                <List>
                    <TeamSnippet v-for="team of teams.data" :id="team.id" :key="team.id"></TeamSnippet>
                </List>
                <span v-if="teams.data.length === 0">None</span>
            </LoadApiArrayWithIdParamInUrl>
        </Padding>


        <LoadApiArray :api-method="api.rest.organisation.users.get" :config="{params: {organisationId: organisation.data.id}}" v-slot="users">
            <ModalVue :visible="showCreateTeamModal" @close="showCreateTeamModal = false">
                <ApiForm type="create" title="Create Team" :api-method="api.rest.team.post" :params="{}" :fields="{
                    name: {type: 'text', required: true},
                    logo_file_id: {type: 'number'},
                    organisation_id: {type: 'number', required: true},
                    owner_user_id: {type: 'select', required: true, options: users.data.map(user => ({value: user.id, label: user.name}))}
                }" :editable-fields="['name', 'owner_user_id']" :initial-values="{organisation_id: organisation.data.id}" @created="ref => {showCreateTeamModal = false}"></ApiForm>
            </ModalVue>
        </LoadApiArray>

    </LoadApiWithIdParamInUrl>



</template>

<style lang="scss" scoped>

#top {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1em;

    h1 {
        margin: 0;
    }
}

</style>
