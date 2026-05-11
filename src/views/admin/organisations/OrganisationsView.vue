<script setup lang="ts">
import api from '@/api';
import ModalVue from '@/components/display/ModalVue.vue';
import ApiForm from '@/components/functional/form/ApiForm.vue';
import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import IconVue from '@/components/general/IconVue.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import Spacing from '@/components/layout/Spacing.vue';
import OrganisationSnippet from '@/components/organisation/OrganisationSnippet.vue';
import { Button } from 'primevue';
import { ref } from 'vue';

const showCreateModal = ref(false)

</script>

<template>
    <Padding>
        <h1>Organisations</h1>

        <Spacing></Spacing>

        <Button @click="showCreateModal = true"><IconVue name="plus"></IconVue> Add Organisation</Button>

        <Spacing></Spacing>

        <LoadApiArray :api-method="api.rest.admin.organisations.get" :config="{}" v-slot="organisations">
            <List horizontal>
                <OrganisationSnippet v-for="organisation of organisations.data" :key="organisation.id" :organisation="organisation"></OrganisationSnippet>
            </List>
        </LoadApiArray>

    </Padding>

    <LoadApiArray :api-method="api.rest.admin.users.get" :config="{}" v-slot="users">
        <ModalVue :visible="showCreateModal" @close="showCreateModal = false">
            <ApiForm type="create" title="Create Organisation" :api-method="api.rest.admin.organisations.post" :params="{}" :fields="{
                name: {type: 'text', required: true},
                logo_file_id: {type: 'number'},
                owner_user_id: {type: 'select', required: true, options: users.data.map(user => ({value: user.id, label: user.name}))}
            }" :editable-fields="['name', 'owner_user_id']" :initial-values="{}" @created="ref => {showCreateModal = false}"></ApiForm>
        </ModalVue>
    </LoadApiArray>

</template>
