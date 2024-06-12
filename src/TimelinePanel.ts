import * as vscode from 'vscode';
import { TimelineNode } from './TimelineNode';

import { TimelinePanelItem } from './TimelinePanelItem';

export class TimelinePanel implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    constructor(private timelineArray: TimelineNode[] | null) { }

    public refresh(): any {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(timelinePanelItem: TimelinePanelItem): vscode.TreeItem {
        return timelinePanelItem;
    }

    async getChildren(timelinePanelItem?: TimelinePanelItem): Promise<TimelinePanelItem[]> {
        if (!this.timelineArray)
            return Promise.resolve([]);
        if (timelinePanelItem)
            return Promise.resolve([]);

        let result: TimelinePanelItem[] = [];

        this.timelineArray.forEach(function (timelineNode) {
            result.push(new TimelinePanelItem(timelineNode));
        });

        return result;
    }

    setTimelineArray(timelineArray: TimelineNode[] | null) {
        this.timelineArray = timelineArray;
    }

    hasTimelineArray(): boolean {
        return this.timelineArray !== null;
    }

}