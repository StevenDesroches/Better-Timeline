import { TimelineArray } from "./TimelineArray";
import { TimelinePanel } from "./TimelinePanel";
import * as vscode from "vscode";

export class TimelineEventHandler {
    snapshot: string;
    timelineArray: TimelineArray;
    timelineDataProvider: TimelinePanel;
    context: vscode.ExtensionContext;
    timelineStorageUri: vscode.Uri;

    constructor(timelineArray: TimelineArray, timelineDataProvider: TimelinePanel, context: vscode.ExtensionContext, timelineStorageUri: vscode.Uri) {
        this.snapshot = '';
        this.timelineArray = timelineArray;
        this.timelineDataProvider = timelineDataProvider;
        this.context = context;
        this.timelineStorageUri = timelineStorageUri;
    }

    onDidChangeTextDocumentHandler() {

    }

    onWillSaveTextDocumentHandler() {

    }

    onDidChangeActiveTextEditorHandler() {

    }
}


// function newFunction(currentSnapshot: string, timelineArray: TimelineArray, timelineDataProvider: TimelinePanel, context: vscode.ExtensionContext) {
//     let isOnDidChangeBlocked = false;
//     vscode.workspace.onDidChangeTextDocument(function (event: vscode.TextDocumentChangeEvent) {
//         let document: vscode.TextDocument = event.document;
//         switch (event.reason) {
//             case TextDocumentChangeReason.Redo:
//             case TextDocumentChangeReason.Undo:
//                 if (!isOnDidChangeBlocked) {
//                     isOnDidChangeBlocked = true;
//                     let timelineNode = createTimelineNode(document.fileName, timelineStorageUri, currentSnapshot, TextDocumentChangeReason[event.reason]);
//                     if (timelineNode !== undefined) {
//                         pushTimelineNode(timelineArray, timelineNode, document, timelineDataProvider, isOnDidChangeBlocked);
//                         setTimeout(() => {
//                             isOnDidChangeBlocked = false;
//                         }, timelineConfigurator.getInsertingDelayEntry());
//                     }
//                 }
//                 break;
//         }
//         currentSnapshot = document.getText();
//     });

//     let onWillSaveBlocked = false;
//     vscode.workspace.onWillSaveTextDocument(function (event) {
//         let document = event.document;
//         if (!document.isDirty)
//             return;
//         if (!onWillSaveBlocked) {
//             onWillSaveBlocked = true;
//             let timelineNode = createTimelineNode(document.fileName, timelineStorageUri, currentSnapshot, 'Save');
//             if (timelineNode !== undefined) {
//                 pushTimelineNode(timelineArray, timelineNode, document, timelineDataProvider, isOnDidChangeBlocked);
//                 setTimeout(() => {
//                     onWillSaveBlocked = false;
//                 }, timelineConfigurator.getInsertingDelayEntry());
//             }
//         }
//         currentSnapshot = document.getText();
//     });

//     vscode.window.onDidChangeActiveTextEditor(function (event) {
//         if (vscode.window.tabGroups.activeTabGroup?.activeTab?.label.includes('↔'))
//             return; //dirty way to check if the tab is a diff view

//         currentSnapshot = event?.document.getText() ?? '';
//         if (event?.document.fileName) {
//             let timelinePath = context.storageUri?.path + '\\' + base32.encode(event.document.fileName) + '\\' + 'timeline.json';
//             getTimelineFromPath(timelinePath).then(function (currentTimelineArray) {
//                 if (currentTimelineArray)
//                     timelineArray.set(currentTimelineArray);
//                 timelineDataProvider.refresh();
//             });
//         } else {
//             timelineArray.set([]);
//             timelineDataProvider.refresh();
//         }
//     });

//     vscode.workspace.onDidCloseTextDocument(function (event) {
//         if (!timelineConfigurator.getkeepEntriesWhenClosingFile()) {
//             let currentTimelineFolderPath = timelineStorageUri.path + '\\' + basename(event.fileName);
//             if (currentTimelineFolderPath)
//                 vscode.workspace.fs.delete(vscode.Uri.file(currentTimelineFolderPath), { recursive: true });
//         }
//     });
//     return currentSnapshot;
// }