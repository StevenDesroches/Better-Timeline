import * as vscode from 'vscode';
import { TimelineNode } from './TimelineNode';
import moment from 'moment';

export class TimelinePanelItem extends vscode.TreeItem {
    constructor(private timelineNode: TimelineNode) {
        super(String(timelineNode.name), vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${moment(timelineNode.timestamp).format('LLLL')}`;
        this.description = `${moment(timelineNode.timestamp).fromNow()}`;
        const command = {
            command: 'bettertimeline.compare',
            title: 'BetterTimeline: Compare',
            tooltip: 'tooltip',
            arguments: [timelineNode]
        }
        this.command = command;
    }

    getTreeNode(): TimelineNode {
        return this.timelineNode;
    }
}