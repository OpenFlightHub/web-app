
/**
 * deletes all existing properties of object, adds all properties from new object
 */
export function updateObject(current: object, update: object){
    for(const key of Object.keys(current)){
        if(!update.hasOwnProperty(key)){
            delete current[key]
        }
    }

    Object.assign(current, update)
}