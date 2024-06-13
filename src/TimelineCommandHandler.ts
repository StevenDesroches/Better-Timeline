import * as vscode from 'vscode';
import { TimelineNode } from './TimelineNode';
import { TimelinePanel } from './TimelinePanel';
import { TimelineArray } from './TimelineArray';

const base32 = require('base32');



export class TimelineCommandHandler {
    context: vscode.ExtensionContext
    timelineArray: TimelineArray
    constructor(context: vscode.ExtensionContext, timelineArray: TimelineArray) {
        this.context = context;
        this.timelineArray = timelineArray;
    }

    // setTimelineArray(timelineArray: TimelineArray) {
    //     this.timelineArray.replace(timelineArray);
    // }

    createTimelineCompareHandler() {
        const commandTimelineCompareHandler = (timelineNode: TimelineNode) => {
            vscode.commands.executeCommand("vscode.diff", vscode.Uri.file(timelineNode.originalFilePath), vscode.Uri.file(timelineNode.snapshotPath));
        };
        let subscriptions = this.context.subscriptions;
        this.context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.compare', commandTimelineCompareHandler));
    }
    createTimelineClearHandler(timelineStorageUri: vscode.Uri, timelineDataProvider: TimelinePanel) {
        const commandBetterTimelineClearHandler = () => {
            if (this.timelineArray.length() <= 0)
                return;
            let timelineNode: TimelineNode | undefined = this.timelineArray.at(0);
            if (timelineNode !== undefined) {
                let currentTimelineFolderPath = timelineStorageUri.path + '\\' + base32.encode(timelineNode.originalFilePath);
                if (currentTimelineFolderPath) {
                    vscode.workspace.fs.delete(vscode.Uri.file(currentTimelineFolderPath), { recursive: true });
                    this.timelineArray.set([]);
                    // timelineDataProvider.setTimelineArray(this.timelineArray);
                    timelineDataProvider.refresh();
                }
            }
        }
        this.context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.clear', commandBetterTimelineClearHandler));
    }

    createTimelineClearAllHandler(timelineStorageUri: vscode.Uri, timelineDataProvider: TimelinePanel) {
        const commandTimelineClearAllHandler = () => {
            vscode.workspace.fs.delete(timelineStorageUri, { recursive: true });
            this.timelineArray.set([]);
            // timelineDataProvider.setTimelineArray(this.timelineArray);
            timelineDataProvider.refresh();
        };
        this.context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.clear.all', commandTimelineClearAllHandler));
    }

}