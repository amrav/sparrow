class Timer {
    constructor() {
        this.elapsed = 0;
        this.startedAt = null;
    }
    start() {
        if (this.startedAt !== null) {
            throw 'Timer already started';
        }
        this.startedAt = Date.now();
    }
    stop() {
        if (this.startedAt === null) {
            throw 'Timer already stopped';
        }
        this.elapsed += Date.now() - this.startedAt;
        this.startedAt = null;
    }
    reset() {
        if (this.startedAt !== null) {
            throw 'Timer not stopped, cannot reset';
        }
        this.elapsed = 0;
    }
}

class Profiler {
    constructor() {
        this.profiles = new Map();
    }
    start(funcName) {
        if (!this.profiles.has(funcName)) {
            this.profiles.set(funcName, 0);
        }
        let timer = new Timer();
        timer.start();
        let that = this;
        return {stop: () => {
            timer.stop();
            let elapsed = that.profiles.get(funcName);
            that.profiles.set(funcName, elapsed + timer.elapsed);
        }};
        return timer;
    }
    reset() {
        this.profiles.clear();
    }
    print() {
        this.profiles.forEach((t, f) => console.log(f, ':', t));
    }
}

export const profiler = new Profiler();
