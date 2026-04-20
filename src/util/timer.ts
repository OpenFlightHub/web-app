export class Timer {
    private startedAt: number | null = null

    start(): void {
        this.startedAt = performance.now()
    }

    stop(): number {
        if(this.startedAt === null){
            throw new Error('Timer has not been started. Call start() before stop().')
        }

        const elapsedMs = performance.now() - this.startedAt
        this.startedAt = null
        return elapsedMs
    }
}
