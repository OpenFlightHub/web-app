<script setup lang="ts">
import api from '@/api';
import ModalVue from '@/components/display/ModalVue.vue';
import CreateForm from '@/components/functional/form/CreateForm.vue';
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

    <ModalVue :visible="showCreateModal" @close="showCreateModal = false">
        <CreateForm title="Create Organisation" :create-api-method="api.rest.admin.organisations.post" :params="{}" :fieldTypes="{
            name: {type: 'text', required: true},
            logo_file_id: {type: 'number'},
            owner_user_id: {type: 'number', required: true}
        }" :editable-fields="['name', 'owner_user_id']" :initial-values="{}" @created="ref => {showCreateModal = false}"></CreateForm>
    </ModalVue>

</template>
