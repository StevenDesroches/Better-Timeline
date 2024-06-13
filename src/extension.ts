import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import { basename, extname } from 'path';
import { TimelineNode } from './TimelineNode';
import { TimelinePanel } from './TimelinePanel';
import { TimelineConfigurator } from './TimelineConfigurator';
import { utils } from 'mocha';
import { Utils } from './Utils';
import { TimelineCommandHandler } from './TimelineCommandHandler';

const base32 = require('base32');

enum TextDocumentChangeReason {
	Undo = 1,
	Redo = 2,
}

let timelineStorageUri: vscode.Uri;
const timelineConfigurator = new TimelineConfigurator();


export function activate(context: vscode.ExtensionContext) {

	if (timelineConfigurator.isLocalHistoryEnabled()) {
		let localHistoryWarning = `LocalHistory is enabled, you may want to disable it by adding the line "workbench.localHistory.enabled" in your settings.json`;
		vscode.window.showWarningMessage(localHistoryWarning);
	}

	timelineStorageUri = context.storageUri ?? context.globalStorageUri;
	let currentSnapshot: string = '';
	let currentArray: TimelineNode[] = [];

	let timelineDataProvider = new TimelinePanel(currentArray);
	let timelineDataProviderView = vscode.window.createTreeView('betterTimelineTreeView', {
		treeDataProvider: timelineDataProvider
	});


	if (vscode.window.activeTextEditor?.document) {
		currentSnapshot = vscode.window.activeTextEditor.document.getText();

		vscode.window.activeTextEditor.document.fileName;
		let timelinePath = context.storageUri?.path + '\\' + base32.encode(vscode.window.activeTextEditor.document.fileName) + '\\' + 'timeline.json';
		getTimelineFromPath(timelinePath).then(function (timelineArray) {
			if (timelineArray)
				currentArray = timelineArray;
			timelineDataProvider.setTimelineArray(currentArray);
			timelineDataProvider.refresh();
		});
	}


	// START - COMMANDS HANDLER
	let timelineCommandHandler = new TimelineCommandHandler(context);
	timelineCommandHandler.createTimelineCompareHandler();
	timelineCommandHandler.createTimelineClearHandler(timelineStorageUri, currentArray, timelineDataProvider);
	timelineCommandHandler.createTimelineClearAllHandler(timelineStorageUri, currentArray, timelineDataProvider);
	// END - COMMANDS HANDLER



	// START - EVENTS HANDLER
	let isOnDidChangeBlocked = false;
	vscode.workspace.onDidChangeTextDocument(function (event: vscode.TextDocumentChangeEvent) {
		let document: vscode.TextDocument = event.document;
		switch (event.reason) {
			case TextDocumentChangeReason.Redo:
			case TextDocumentChangeReason.Undo:
				if (!isOnDidChangeBlocked) {
					isOnDidChangeBlocked = true;
					let timelineNode = createTimelineNode(document.fileName, timelineStorageUri, currentSnapshot, TextDocumentChangeReason[event.reason]);
					if (timelineNode !== undefined) {
						pushTimelineNode(currentArray, timelineNode, document, timelineDataProvider, isOnDidChangeBlocked);
						setTimeout(() => {
							isOnDidChangeBlocked = false;
						}, timelineConfigurator.getInsertingDelayEntry());
					}
				}
				break;
		}
		currentSnapshot = document.getText();
	});

	let onWillSaveBlocked = false;
	vscode.workspace.onWillSaveTextDocument(function (event) {
		let document = event.document;
		if (!document.isDirty)
			return;
		if (!onWillSaveBlocked) {
			onWillSaveBlocked = true;
			let timelineNode = createTimelineNode(document.fileName, timelineStorageUri, currentSnapshot, 'Save');
			if (timelineNode !== undefined) {
				pushTimelineNode(currentArray, timelineNode, document, timelineDataProvider, isOnDidChangeBlocked);
				setTimeout(() => {
					onWillSaveBlocked = false;
				}, timelineConfigurator.getInsertingDelayEntry());
			}
		}
		currentSnapshot = document.getText();
	})

	vscode.window.onDidChangeActiveTextEditor(function (event) {
		if (vscode.window.tabGroups.activeTabGroup?.activeTab?.label.includes('↔'))
			return;//dirty way to check if the tab is a diff view

		currentSnapshot = event?.document.getText() ?? '';
		if (event?.document.fileName) {
			let timelinePath = context.storageUri?.path + '\\' + base32.encode(event.document.fileName) + '\\' + 'timeline.json';
			getTimelineFromPath(timelinePath).then(function (timelineArray) {
				if (timelineArray)
					currentArray = timelineArray;
				timelineDataProvider.setTimelineArray(currentArray);
				timelineDataProvider.refresh();
			});
		} else {
			currentArray = [];
			timelineDataProvider.setTimelineArray(currentArray);
			timelineDataProvider.refresh();
		}
	});

	vscode.workspace.onDidCloseTextDocument(function (event) {
		if (!timelineConfigurator.getkeepEntriesWhenClosingFile()) {
			let currentTimelineFolderPath = timelineStorageUri.path + '\\' + basename(event.fileName);
			if (currentTimelineFolderPath)
				vscode.workspace.fs.delete(vscode.Uri.file(currentTimelineFolderPath), { recursive: true });
		}
	})
	// END - EVENTS HANDLER
}

function pushTimelineNode(currentArray: TimelineNode[], timelineNode: TimelineNode, document: vscode.TextDocument, timelineDataProvider: TimelinePanel, isOnDidChangeBlocked: boolean) {
	currentArray.push(timelineNode);
	checkIfTimelineArrayReachedMaxAndFixIt(currentArray);
	let timelinePath = [timelineStorageUri.path, base32.encode(document.fileName), 'timeline.json'].join('\\');

	vscode.workspace.fs.writeFile(vscode.Uri.file(timelinePath), new TextEncoder().encode(JSON.stringify(currentArray)));

	if (!timelineDataProvider.hasTimelineArray())
		timelineDataProvider.setTimelineArray(currentArray);

	setTimeout(() => {
		timelineDataProvider.refresh();
	}, 250);
}

function createTimelineNode(filename: string, storageUri: vscode.Uri, currentSnapshot: string, name: string = 'undefined'): TimelineNode | undefined {
	let filename32: string = base32.encode(filename);
	let snapshopFileName = randomUUID();
	let folderPath = storageUri.path + '\\' + filename32;
	let snapshotPath = folderPath + '\\' + snapshopFileName + extname(filename);

	if (timelineConfigurator.getMaxEntrySize() >= Utils.getFileKbSizeOfString(currentSnapshot)) {
		vscode.workspace.fs.writeFile(vscode.Uri.file(snapshotPath), new TextEncoder().encode(currentSnapshot));
		let timelineNode = new TimelineNode(filename, snapshotPath, name);
		return timelineNode;
	}
}

function checkIfTimelineArrayReachedMaxAndFixIt(timelineArray: TimelineNode[]) {
	if (timelineArray.length > timelineConfigurator.getMaxAllowedEntries()) {
		let lastTimelineNodeArray: TimelineNode[] = [];
		lastTimelineNodeArray = timelineArray.splice(0, 1);
		lastTimelineNodeArray.forEach(function (timelineNode: TimelineNode) {
			timelineNode.snapshotPath
			vscode.workspace.fs.delete(vscode.Uri.file(timelineNode.snapshotPath));
		})
		return true;
	}
	return false;

}

async function getTimelineFromPath(treePath: string) {
	let result: any = [];
	let treeUri = vscode.Uri.file(treePath);

	try {
		await vscode.workspace.fs.stat(treeUri);
		let treeFile = vscode.workspace.fs.readFile(treeUri);

		let decodedString: string = await treeFile.then(function (encodedString) {
			return new TextDecoder().decode(encodedString);
		});

		let array: {
			originalFilePath: string;
			snapshotPath: string;
			name: string;
			timestamp: number;
		}[] = JSON.parse(decodedString);

		if (array) {
			array.forEach(element => {
				result.push(new TimelineNode(element.originalFilePath, element.snapshotPath, element.name, element.timestamp));
			});
		}

	} catch {
		result = undefined;
	}
	return result;
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (timelineStorageUri)
		vscode.workspace.fs.delete(vscode.Uri.file(timelineStorageUri.path), { recursive: true });
}
