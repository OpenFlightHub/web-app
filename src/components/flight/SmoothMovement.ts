import { EventManager } from "@/sdks/dji-pilot-2/dji-open-platform-connect-sdk"
import { along, distance, lineString } from "@turf/turf"

export type Position = {
    longitude: number
    latitude: number
    height: number
}

type PositionWithTime = {
    position: Position
    timeMs: number
}

export default class SmoothMovement extends EventManager<{
    'position-update': Position
}>{

    private positionsPerSecond: number

    private timeoutHandle?: ReturnType<typeof setTimeout> | undefined

    private currentTrackDistance = 0

    private tracks: {from: PositionWithTime, to: PositionWithTime, length3D: number}[] = []

    private lastCalculatedPosition: Position | undefined = undefined

    constructor(positionsPerSecond: number){
        super()

        this.positionsPerSecond = positionsPerSecond
        setTimeout(()=>{
            this.step()
        }, 1)
    }


    private step(){

        const timeUntilNextStep = 1000 / this.positionsPerSecond

        if(this.tracks.length > 0){
            //calculate when we expect the next position to be added (based on last add)
            const timeBetweenLastAdds = this.tracks[this.tracks.length - 1].to.timeMs - this.tracks[this.tracks.length - 1].from.timeMs

            const expectedNextAddTime = this.tracks[this.tracks.length - 1].to.timeMs + timeBetweenLastAdds

            console.log('time until next add', (expectedNextAddTime - Date.now()) / 1000, 's', 'time between last adds', timeBetweenLastAdds / 1000, 's')

            const totalDistanceOfTracks = this.tracks.reduce((sum, track) => sum + track.length3D, 0) - this.currentTrackDistance

            const timeBuffer = timeBetweenLastAdds / 2

            const metersPerMs = Math.max(0, totalDistanceOfTracks / ((expectedNextAddTime + timeBuffer) - Date.now()))

            console.log('meters per s', metersPerMs * 1000)

            this.currentTrackDistance += metersPerMs * timeUntilNextStep

            this.dispatch('position-update', this.calculatePosition())
        } else {
            console.log('no tracks')
        }

        this.timeoutHandle = setTimeout(()=>{
            this.step()
        }, timeUntilNextStep)
    }

    private calculatePosition(): Position {
        if(this.tracks.length === 0){
            throw new Error('no position available')
        }

        while(this.currentTrackDistance >= this.tracks[0].length3D){
            // continue overflowing distance to next track
            if(this.tracks.length > 1){
                this.currentTrackDistance = Math.max(0, this.tracks[0].length3D - this.currentTrackDistance)
                this.tracks.shift()
            } else {
                const ret = this.tracks[0].to.position

                this.currentTrackDistance = 0
                this.tracks.shift()

                this.lastCalculatedPosition = ret
                return ret
            }
        }

        if(!this.tracks[0] || !this.tracks[0].from || !this.tracks[0].to || !this.tracks[0].from.position || !this.tracks[0].to.position){
            console.error(this.tracks[0])
            throw new Error('invalid track data')
        }

        if(this.currentTrackDistance < 0){
            console.error('currentTrackDistance is negative', this.currentTrackDistance)
            this.currentTrackDistance = 0
        }
        //TODO implement 3d length
        const position = along(lineString([this.tracks[0].from.position, this.tracks[0].to.position].map(p => [p.longitude, p.latitude])), this.currentTrackDistance, {units: 'meters'})

        const relativeProgress = this.currentTrackDistance / this.tracks[0].length3D

        const ret = {
            longitude: position.geometry.coordinates[0],
            latitude: position.geometry.coordinates[1],
            height: this.tracks[0].from.position.height + (this.tracks[0].to.position.height - this.tracks[0].from.position.height) * relativeProgress
        }

        this.lastCalculatedPosition = ret
        return ret
    }

    addPosition(position: Position, timeMs: number) {

        const from = this.tracks.length === 0 ? {position: this.lastCalculatedPosition ?? position, timeMs: timeMs - 1} : this.tracks[this.tracks.length - 1].to

        const lengthHorizontal = distance([from.position.longitude, from.position.latitude], [position.longitude, position.latitude], {units: 'meters'})
        const lengthVertical = Math.abs(from.position.height - position.height)

        this.tracks.push({
            from,
            to: {position, timeMs},
            length3D: Math.sqrt(lengthHorizontal ** 2 + lengthVertical ** 2)
        })
    }

    destroy(){
        if(this.timeoutHandle){
            clearTimeout(this.timeoutHandle)
        }
    }

}