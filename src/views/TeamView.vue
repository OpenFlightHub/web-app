<script setup lang="ts">
import api from '@/api'
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue'
import FileImageOrIconVue from '@/components/general/FileImageOrIconVue.vue';
import Spacing from '@/components/layout/Spacing.vue';
import UserSnippet from '@/components/user/UserSnippet.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';

</script>

<template>

    <LoadApiWithIdParamInUrl :api-method="api.rest.team.get" :id-params="{teamId: undefined}" v-slot="team">
        <Padding>
            <div id="top">
                <h1>Team: {{ team.data.name }}</h1>
                <FileImageOrIconVue :file-id="team.data.logo_file_id" :icon-name="'person-square'" :size="{em: 2}" :thumbnail="true"></FileImageOrIconVue>
            </div>

            <Spacing></Spacing>

            <h2>Owner</h2>
            <UserSnippet :id="team.data.owner_user_id"></UserSnippet>

            <Spacing></Spacing>

            <h2>Members</h2>
            <LoadApiArrayWithIdParamInUrl :api-method="api.rest.team.members.get" :id-params="{teamId: undefined}" v-slot="members">
                <List>
                    <UserSnippet v-for="member in members.data" :key="member.id":id="member.id"></UserSnippet>
                </List>
                <span v-if="members.data.length === 0">None</span>
            </LoadApiArrayWithIdParamInUrl>
        </Padding>    </LoadApiWithIdParamInUrl>

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
