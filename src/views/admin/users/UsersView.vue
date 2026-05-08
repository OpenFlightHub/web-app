<script setup lang="ts">
import api from '@/api';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import Spacing from '@/components/layout/Spacing.vue';
import UserSnippet from '@/components/user/UserSnippet.vue';

</script>

<template>
    <Padding>
        <h1>Users</h1>

        <Spacing></Spacing>

        <List horizontal>
            <LoadApiArray :api-method="api.rest.admin.users.get" :config="{}" v-slot="users">
                <UserSnippet v-for="user of users.data" :key="user.id" :user="user"></UserSnippet>
            </LoadApiArray>
        </List>

    </Padding>

</template>
