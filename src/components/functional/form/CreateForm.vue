<script setup lang="ts" generic="
    T extends Record<string, any>,
    C extends {data: Record<string, any>, params?: Record<string, any>}, AM extends ((config: C) => Promise<T>),
    PROPS extends {apiMethod: AM, config: Parameters<AM>[0]},
    EF extends (keyof PROPS['config']['data'])[]">
import { FormSubmitEvent } from '@/util/primevue';
import { Form } from '@primevue/forms';
import { Button, Checkbox, Select, InputNumber, IftaLabel, InputText, Message, useToast  } from 'primevue';
import { ref } from 'vue';

export type Field<FieldType> = FieldType extends 'select' ? FieldTypeSelect : FieldBase<FieldType>

export type FieldType = 'text' | 'number' | 'select' | 'checkbox'

export type FieldBase<FieldType> = {
    type: FieldType
    required?: boolean
}

export interface FieldTypeText extends FieldBase<'text'> {
}

export interface FieldTypeNumber extends FieldBase<'number'> {
}

export interface FieldTypeCheckbox extends FieldBase<'checkbox'> {
}

export interface FieldTypeSelect extends FieldBase<'select'> {
    options: {value: string, label: string}[]
}

const toast = useToast()

const props = defineProps<{
    title: string
    showCancelButton?: boolean
    createApiMethod: PROPS['apiMethod']
    params: PROPS['config'] extends Record<string, any> ? PROPS['config']['params'] : never
    fieldTypes: Record<keyof PROPS['config']['data'], Field<FieldType>>
    editableFields: EF
    initialValues: Omit<PROPS['config']['data'], EF[number]> & Partial<PROPS['config']['data']>
}>()//TODO implement nice readable labels for field names

const emit = defineEmits<{
    created: [createdObject: T]
    cancel: []
}>()

const isSending = ref(false)
const errorMessage = ref('')

async function save(evt: FormSubmitEvent){
    isSending.value = true
    errorMessage.value = ''

    const cleanData = evt.values as PROPS['config']['data']

    try {
        const response = await props.createApiMethod({params: props.params, data: cleanData} as PROPS['config'])

        emit('created', response)

        toast.add({severity: 'success', summary: 'Created successfully', life: 3000})
    } catch (err){
        errorMessage.value = '' + err
    }

    isSending.value = false
}

</script>

<template>

    <h2>{{ props.title }}</h2>

    <Form v-slot="$form" :initial-values="props.initialValues" @submit="save" :validate-on-mount="true" :validate-on-value-update="true" :validate-on-blur="true">

        <template v-if="props.fieldTypes">
            <div id="fields">

                <template v-for="fieldName of Object.keys(props.fieldTypes)">

                    <template v-if="props.fieldTypes[fieldName].type === 'text'">
                        <IftaLabel>
                            <InputText :id="fieldName" :name="fieldName" :required="props.fieldTypes[fieldName].required" :minlength="props.fieldTypes[fieldName].required ? 1 : undefined"></InputText>
                            <label :for="fieldName">{{ fieldName }}</label>
                        </IftaLabel>
                    </template>
                    <template v-else-if="props.fieldTypes[fieldName].type === 'number'">
                        <IftaLabel>
                            <InputNumber :id="fieldName" :name="fieldName" :required="props.fieldTypes[fieldName].required"></InputNumber>
                            <label :for="fieldName">{{ fieldName }}</label>
                        </IftaLabel>
                    </template>
                    <template v-else-if="props.fieldTypes[fieldName].type === 'checkbox'">
                        <IftaLabel>
                            <Checkbox :id="fieldName" :name="fieldName" :required="props.fieldTypes[fieldName].required"></Checkbox>
                            <label :for="fieldName">{{ fieldName }}</label>
                        </IftaLabel>
                    </template>
                    <template v-else-if="props.fieldTypes[fieldName].type === 'select'">
                        <IftaLabel>
                            <Select :id="fieldName" :name="fieldName" :options="props.fieldTypes[fieldName].options" option-value="value" option-label="label" :required="props.fieldTypes[fieldName].required"></Select>
                            <label :for="fieldName">{{ fieldName }}</label>
                        </IftaLabel>
                    </template>
                    <template v-else>
                        Unsupported field type {{ props.fieldTypes[fieldName] }} for field {{ fieldName }}.
                    </template>

                </template>
            </div>
        </template>

        <div id="buttons">
            <Button type="submit" label="Create" :disabled="isSending"></Button>
            <Button v-if="showCancelButton" label="Cancel" class="p-button-secondary" @click="$form.reset(); emit('cancel')"></Button>
        </div>

        <div v-if="errorMessage" id="error">
            <h3>Error:</h3>
            <p>{{ errorMessage }}</p>
        </div>
    </Form>

</template>

<style scoped lang="scss">

#fields {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 1em 0
}
#buttons {
    display: flex;
    justify-content: center;
    gap: 1em;
}

#error {
    color: var(--error);
}

</style>
