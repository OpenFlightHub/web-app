<script setup lang="ts" generic="
    T extends void | Record<string, any>,
    C extends {data: Record<string, any>, params?: Record<string, any>}, AM extends ((config: C) => Promise<T>),
    PROPS extends {apiMethod: AM, config: Parameters<AM>[0]},
    EF extends (keyof PROPS['config']['data'])[]">
import { FormSubmitEvent } from '@/util/primevue';
import { Form } from '@primevue/forms';
import { Button, Checkbox, Select, InputNumber, IftaLabel, InputText, useToast, DatePicker  } from 'primevue';
import { ref } from 'vue';

export type Field<FieldType> = FieldType extends 'text' ? FieldTypeText : FieldType extends 'email' ? FieldTypeEmail : FieldType extends 'number' ? FieldTypeNumber : FieldType extends 'select' ? FieldTypeSelect : FieldType extends 'checkbox' ? FieldTypeCheckbox : FieldType extends 'date-with-time' ? FieldTypeDateWithTime : FieldType extends 'raw' ? FieldTypeRaw : FieldBase<FieldType>

export type FieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'date-with-time' | 'raw'

export type FieldBase<FieldType> = {
    type: FieldType
    required?: boolean
}

export interface FieldTypeText extends FieldBase<'text'> {
}

export interface FieldTypeEmail extends FieldBase<'email'> {
}

export interface FieldTypeNumber extends FieldBase<'number'> {
}

export interface FieldTypeSelect extends FieldBase<'select'> {
    options: {value: any, label: string}[]
}

export interface FieldTypeCheckbox extends FieldBase<'checkbox'> {
}

export interface FieldTypeDateWithTime extends FieldBase<'date-with-time'> {
    onlyDate?: boolean // if true, time will be ignored and set to 00:00:00
    max?: Date // maximum date that can be selected
    noSeconds?: boolean // if true, seconds will be ignored and set to 00
}

export interface FieldTypeRaw extends FieldBase<'raw'> {
}


const toast = useToast()

const props = defineProps<{
    title: string
    showCancelButton?: boolean
    createApiMethod: PROPS['apiMethod']
    params: PROPS['config'] extends Record<string, any> ? PROPS['config']['params'] : never
    fields: Record<keyof PROPS['config']['data'], Field<FieldType>>
    editableFields: EF
    initialValues: Omit<PROPS['config']['data'], EF[number]> & Partial<PROPS['config']['data']>
    readableLabels?: Partial<Record<keyof PROPS['config']['data'], string>>
}>()

const emit = defineEmits<{
    created: [createdObject: T]
    cancel: []
}>()

const isSending = ref(false)
const errorMessage = ref('')

function cleanupData(data: FormSubmitEvent['values']): PROPS['config']['data']{
    const cleanData: Record<string, any> = {}

    for (const fieldName of Object.keys(props.fields)){

        cleanData[fieldName] = props.initialValues[fieldName]

        if(typeof data[fieldName] === 'undefined' || data[fieldName] === null){
            continue
        }

        cleanData[fieldName] = data[fieldName]

        if(props.fields[fieldName].type === 'date-with-time'){
            if(props.fields[fieldName].onlyDate){
                const date = new Date(data[fieldName])
                cleanData[fieldName] = new Date(date.setHours(0, 0, 0, 0)).toISOString()
            } else if (props.fields[fieldName].noSeconds){
                const date = new Date(data[fieldName])
                cleanData[fieldName] = new Date(date.setSeconds(0, 0)).toISOString()
            } else {
                cleanData[fieldName] = new Date(data[fieldName]).toISOString()
            }
        }
    }

    return cleanData
}

async function save(evt: FormSubmitEvent){
    isSending.value = true
    errorMessage.value = ''

    const cleanData = cleanupData(evt.values)

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

        <template v-if="props.fields">
            <div id="fields">

                <template v-for="fieldName of Object.keys(props.fields)">

                    <template v-if="props.editableFields.includes(fieldName)">
                        <template v-if="props.fields[fieldName].type === 'text'">
                            <IftaLabel>
                                <InputText :id="fieldName" :name="fieldName" :required="props.fields[fieldName].required" :minlength="props.fields[fieldName].required ? 1 : undefined"></InputText>
                                <label :for="fieldName">{{ props.readableLabels?.[fieldName] ?? fieldName }}</label>
                            </IftaLabel>
                        </template>

                        <template v-else-if="props.fields[fieldName].type === 'email'">
                            <IftaLabel>
                                <InputText :id="fieldName" :name="fieldName" :required="props.fields[fieldName].required" :minlength="props.fields[fieldName].required ? 1 : undefined" type="email"></InputText>
                                <label :for="fieldName">{{ props.readableLabels?.[fieldName] ?? fieldName }}</label>
                            </IftaLabel>
                        </template>

                        <template v-else-if="props.fields[fieldName].type === 'number'">
                            <IftaLabel>
                                <InputNumber :id="fieldName" :name="fieldName" :required="props.fields[fieldName].required"></InputNumber>
                                <label :for="fieldName">{{ props.readableLabels?.[fieldName] ?? fieldName }}</label>
                            </IftaLabel>
                        </template>

                        <template v-else-if="props.fields[fieldName].type === 'checkbox'">
                            <IftaLabel>
                                <Checkbox :id="fieldName" :name="fieldName" :required="props.fields[fieldName].required"></Checkbox>
                                <label :for="fieldName">{{ props.readableLabels?.[fieldName] ?? fieldName }}</label>
                            </IftaLabel>
                        </template>

                        <template v-else-if="props.fields[fieldName].type === 'select'">
                            <IftaLabel>
                                <Select :id="fieldName" :name="fieldName" :options="props.fields[fieldName].options" option-value="value" option-label="label" :required="props.fields[fieldName].required" filter fluid></Select>
                                <label :for="fieldName">{{ props.readableLabels?.[fieldName] ?? fieldName }}</label>
                            </IftaLabel>
                        </template>

                        <template v-else-if="props.fields[fieldName].type === 'date-with-time'">
                            <IftaLabel>
                                <DatePicker :id="fieldName" :name="fieldName" :required="props.fields[fieldName].required" :show-time="props.fields[fieldName].onlyDate !== true" hour-format="24" :max-date="props.fields[fieldName].max" fluid></DatePicker>
                                <label :for="fieldName">{{ props.readableLabels?.[fieldName] ?? fieldName }}</label>
                            </IftaLabel>
                        </template>

                        <template v-else-if="props.fields[fieldName].type === 'raw'">
                            <!-- hidden -->
                        </template>

                        <template v-else>
                            Unsupported field type "{{ (props.fields[fieldName] as Field<FieldType>).type }}" for field {{ fieldName }}.
                        </template>
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
