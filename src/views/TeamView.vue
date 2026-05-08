<script setup lang="ts">
import api from '@/api'
import FileImageOrIconVue from '@/components/general/FileImageOrIconVue.vue';
import Spacing from '@/components/layout/Spacing.vue';
import UserSnippet from '@/components/user/UserSnippet.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import LoadApi from '@/components/functional/LoadApi.vue';

</script>

<template>

    <LoadApiWithIdParamInUrl :api-method="api.rest.team.get" :config="{params: {}}" :id-params="['teamId']" v-slot="team">
        <Padding>
            <div id="top">
                <h1>Team: {{ team.data.name }}</h1>
                <FileImageOrIconVue :file-id="team.data.logo_file_id" :icon-name="'person-square'" :size="{em: 2}" :thumbnail="true"></FileImageOrIconVue>
            </div>

            <Spacing></Spacing>

            <h2>Owner</h2>
            <LoadApi :api-method="api.rest.user.get" :config="{params: {userId: team.data.owner_user_id}}" v-slot="owner">
                <UserSnippet :user="owner.data"></UserSnippet>
            </LoadApi>

            <Spacing></Spacing>

            <h2>Members</h2>
            <LoadApiArrayWithIdParamInUrl :api-method="api.rest.team.members.get" :config="{params: {}}" :id-params="['teamId']" v-slot="members">
                <List>
                    <LoadApi v-for="member in members.data" :key="member.id" :api-method="api.rest.user.get" :config="{params: {userId: member.id}}" v-slot="user">
                        <UserSnippet :user="user.data"></UserSnippet>
                    </LoadApi>
                </List>
                <span v-if="members.data.length === 0">None</span>
            </LoadApiArrayWithIdParamInUrl>
        </Padding>
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
