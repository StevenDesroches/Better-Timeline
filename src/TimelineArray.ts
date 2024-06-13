import { TimelineNode } from "./TimelineNode";

export class TimelineArray {
    array: TimelineNode[];

    constructor() {
        this.array = [];
    }

    length() {
        return this.array.length;
    }

    push(timelineNode: TimelineNode) {
        this.array.push(timelineNode);
    }

    set(array: TimelineNode[]) {
        this.array = array;
    }

    replace(array: TimelineArray) {
        this.array = array.array;
    }

    get() {
        return this.array;
    }

    at(index: number) {
        return this.array[index];
    }

    splice(start: number, deleteCount: number | undefined) {
        return this.array.splice(start, deleteCount);
    }
}