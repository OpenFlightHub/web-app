<script setup lang="ts">
import LogoutButton from '@/components/general/LogoutButton.vue';
import IconVue from '@/components/general/IconVue.vue';
import WIP from '@/components/WIP.vue';


</script>

<template>
    <v-app>

        <v-app-bar title="OpenFlightHub"></v-app-bar>

        <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
            Welcome to OpenFlightHub!

            <WIP></WIP>
        </v-main>

    </v-app>

</template>

<style lang="scss" scoped>

.container {
    padding: 15vh;
    height: 100%;

    .container_inner {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #0004;
        border-radius: 3em;
        padding: 2em;
        height: 100%;

        .background_image {
            z-index: 1;
            width: calc(100% - 2em);
            height: calc(100% - 2em);
            position: absolute;
            top: 1em;
            left: 1em;
            background-image: url('/images/logo.png');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 10%;
        }

        .foreground {
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .links {
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 2em;

                .link {
                    color: #fff;
                    transition: all 0.2s ease;

                    &:hover {
                        color: var(--neutral-light);
                    }
                }
            }

            .bottom {
                position: absolute;
                bottom: 2em;
            }
        }
    }
}
</style>
