export class TimelineNode {

    originalFilePath: string;
    snapshotPath: string;
    name: string;
    timestamp: number;

    constructor(originalFilePath: string, snapshotPath: string, name: string, timestamp: number = Date.now()) {
        this.originalFilePath = originalFilePath;
        this.snapshotPath = snapshotPath;
        this.name = name;
        this.timestamp = timestamp;
    }
}
