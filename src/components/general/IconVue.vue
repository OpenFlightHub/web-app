<script setup lang="ts">


/**
 * Button with icon on a specific position:
 *
 * <Button :label="Label">
        <template #icon>
            <IconVue name="arrow-right" buttonIconPos="right"></IconVue>
        </template>
    </Button>
 *
 */

const props = defineProps<{
    name: string,
    buttonIconPos?: 'right' | 'left' | 'top' | 'bottom'
}>()

</script>

<template>

    <span :class="['bi', 'bi-' + props.name, {
        'p-button-icon': props.buttonIconPos
    }, props.buttonIconPos ? ('p-button-icon-' + props.buttonIconPos) : '']"></span>

</template>
