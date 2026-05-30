export class GeoObjectEditEvent extends CustomEvent<void> {

    static EVENT_NAME = 'geo-object-edit'

    readonly geoObjectId: number

    constructor(geoObjectId: number) {
        super('geo-object-edit')
        this.geoObjectId = geoObjectId
    }

}

export class GeoObjectFocusEvent extends CustomEvent<void> {

    static EVENT_NAME = 'geo-object-focus'

    readonly geoObjectId: number

    constructor(geoObjectId: number) {
        super('geo-object-focus')
        this.geoObjectId = geoObjectId
    }

}

export class GeoObjectShowInfoEvent extends CustomEvent<void> {

    static EVENT_NAME = 'geo-object-show-info'

    readonly geoObjectId: number

    constructor(geoObjectId: number) {
        super('geo-object-show-info')
        this.geoObjectId = geoObjectId
    }

}
