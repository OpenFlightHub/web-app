import { Reactive } from "vue"

/**
 * deletes all existing properties of object, adds all properties from new object
 */
export function updateObject(current: object, update: object){

    if(update instanceof Promise){
        throw new Error('update parameter is a promise, have you forgot await?')
    }

    if(current instanceof Array && update instanceof Array){
        updateArray(current, update)
        return
    }

    for(const key of Object.keys(current)){
        if(!update.hasOwnProperty(key)){
            delete current[key]
        }
    }

    Object.assign(current, update)
}

/**
 * deletes all existing items in array and ads the new ones
 */
export function updateArray(current: Reactive<Array<any>> | Array<any>, update: Array<any>){

    if(update instanceof Promise){
        throw new Error('update parameter is a promise, have you forgot await?')
    }

    current.splice(0, current.length)

    current.push(...update)
}

export function cloneObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}
