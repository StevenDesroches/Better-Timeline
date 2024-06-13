import * as vscode from 'vscode';
import { basename } from 'path';
import { TimelineNode } from './TimelineNode';
import { TimelinePanel } from './TimelinePanel';


export class TimelineCommandHandler {
    context: vscode.ExtensionContext
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    createTimelineCompareHandler() {
        const commandTimelineCompareHandler = (timelineNode: TimelineNode) => {
            vscode.commands.executeCommand("vscode.diff", vscode.Uri.file(timelineNode.originalFilePath), vscode.Uri.file(timelineNode.snapshotPath));
        };
        let subscriptions = this.context.subscriptions;
        this.context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.compare', commandTimelineCompareHandler));
    }
    createTimelineClearHandler(timelineStorageUri: vscode.Uri, currentArray: TimelineNode[], timelineDataProvider: TimelinePanel) {
        const commandBetterTimelineClearHandler = () => {
            if (currentArray.length <= 0)
                return;
            let timelineNode: TimelineNode | undefined = currentArray.at(0);
            if (timelineNode !== undefined) {
                let currentTimelineFolderPath = timelineStorageUri.path + '\\' + basename(timelineNode.originalFilePath);
                if (currentTimelineFolderPath) {
                    vscode.workspace.fs.delete(vscode.Uri.file(currentTimelineFolderPath), { recursive: true });
                    currentArray = [];
                    timelineDataProvider.setTimelineArray(currentArray);
                    timelineDataProvider.refresh();
                }
            }
        }
        this.context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.clear', commandBetterTimelineClearHandler));
    }

    createTimelineClearAllHandler(timelineStorageUri: vscode.Uri, currentArray: TimelineNode[], timelineDataProvider: TimelinePanel) {
        const commandTimelineClearAllHandler = () => {
            vscode.workspace.fs.delete(timelineStorageUri, { recursive: true });
            currentArray = [];
            timelineDataProvider.setTimelineArray(currentArray);
            timelineDataProvider.refresh();
        };
        this.context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.clear.all', commandTimelineClearAllHandler));
    }

}