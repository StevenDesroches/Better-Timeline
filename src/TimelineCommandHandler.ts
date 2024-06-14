import * as vscode from 'vscode';
import { TimelineNode } from './TimelineNode';
import { TimelinePanel } from './TimelinePanel';
import { TimelineArray } from './TimelineArray';

const base32 = require('base32');



export class TimelineCommandHandler {
    context: vscode.ExtensionContext
    timelineArray: TimelineArray
    timelineStorageUri: vscode.Uri;
    timelineDataProvider: TimelinePanel;

    constructor(context: vscode.ExtensionContext, timelineArray: TimelineArray, timelineStorageUri: vscode.Uri, timelineDataProvider: TimelinePanel) {
        this.context = context;
        this.timelineArray = timelineArray;
        this.timelineStorageUri = timelineStorageUri;
        this.timelineDataProvider = timelineDataProvider;

        this.createTimelineCompareHandler();
        this.createTimelineClearHandler();
        this.createTimelineClearAllHandler();
    }

    createTimelineCompareHandler() {
        const commandTimelineCompareHandler = (timelineNode: TimelineNode) => {
            vscode.commands.executeCommand("vscode.diff", vscode.Uri.file(timelineNode.originalFilePath), vscode.Uri.file(timelineNode.snapshotPath));
        };
        let subscriptions = this.context.subscriptions;
        this.context.subscriptions.push(vscode.commands.registerCommand('smoothertimeline.compare', commandTimelineCompareHandler));
    }
    createTimelineClearHandler() {
        const commandsmootherTimelineClearHandler = () => {
            if (this.timelineArray.length() <= 0)
                return;
            let timelineNode: TimelineNode | undefined = this.timelineArray.at(0);
            if (timelineNode !== undefined) {
                let currentTimelineFolderPath = this.timelineStorageUri.path + '\\' + base32.encode(timelineNode.originalFilePath);
                if (currentTimelineFolderPath) {
                    vscode.workspace.fs.delete(vscode.Uri.file(currentTimelineFolderPath), { recursive: true });
                    this.timelineArray.set([]);
                    // timelineDataProvider.setTimelineArray(this.timelineArray);
                    this.timelineDataProvider.refresh();
                }
            }
        }
        this.context.subscriptions.push(vscode.commands.registerCommand('smoothertimeline.clear', commandsmootherTimelineClearHandler));
    }

    createTimelineClearAllHandler() {
        const commandTimelineClearAllHandler = () => {
            vscode.workspace.fs.delete(this.timelineStorageUri, { recursive: true });
            this.timelineArray.set([]);
            // timelineDataProvider.setTimelineArray(this.timelineArray);
            this.timelineDataProvider.refresh();
        };
        this.context.subscriptions.push(vscode.commands.registerCommand('smoothertimeline.clear.all', commandTimelineClearAllHandler));
    }

}