export class GeoObjectEditEvent extends CustomEvent<void> {

    static EVENT_NAME = 'geo-object-edit'

    readonly geoObjectId: number

    constructor(geoObjectId: number) {
        super('geo-object-edit')
        this.geoObjectId = geoObjectId
    }

}