import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import { basename, extname } from 'path';
import { TimelineNode } from './TimelineNode';
import { TimelinePanel } from './TimelinePanel';

const base32 = require('base32');

enum TextDocumentChangeReason {
	Undo = 1,
	Redo = 2,
}

let timelineStorageUri: vscode.Uri;


export function activate(context: vscode.ExtensionContext) {
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
	const commandTimelineCompareHandler = (timelineNode: TimelineNode) => {
		vscode.commands.executeCommand("vscode.diff", vscode.Uri.file(timelineNode.originalFilePath), vscode.Uri.file(timelineNode.snapshotPath));
	};
	let subscriptions = context.subscriptions;
	context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.compare', commandTimelineCompareHandler));

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
	context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.clear', commandBetterTimelineClearHandler));

	const commandTimelineClearAllHandler = () => {
		vscode.workspace.fs.delete(timelineStorageUri, { recursive: true });
		currentArray = [];
		timelineDataProvider.setTimelineArray(currentArray);
		timelineDataProvider.refresh();
	};
	context.subscriptions.push(vscode.commands.registerCommand('bettertimeline.clear.all', commandTimelineClearAllHandler));
	// END - COMMANDS HANDLER



	// START - EVENTS HANDLER
	vscode.workspace.onDidChangeTextDocument(function (event: vscode.TextDocumentChangeEvent) {
		let document: vscode.TextDocument = event.document;
		switch (event.reason) {
			case TextDocumentChangeReason.Redo:
			case TextDocumentChangeReason.Undo:

				let timelineNode = createTimelineNode(document.fileName, timelineStorageUri, currentSnapshot, TextDocumentChangeReason[event.reason]);
				currentArray.push(timelineNode);
				checkIfTimelineArrayReachedMaxAndFixIt(currentArray);
				let timelinePath = [timelineStorageUri.path, base32.encode(document.fileName), 'timeline.json'].join('\\')

				vscode.workspace.fs.writeFile(vscode.Uri.file(timelinePath), new TextEncoder().encode(JSON.stringify(currentArray)));

				if (!timelineDataProvider.hasTimelineArray())
					timelineDataProvider.setTimelineArray(currentArray);
				setTimeout(() => {
					timelineDataProvider.refresh();
				}, 500);
				break;
		}
		currentSnapshot = document.getText();
	});


	vscode.workspace.onWillSaveTextDocument(function (event) {
		let document = event.document;
		if (!document.isDirty)
			return;

		let timelineNode = createTimelineNode(document.fileName, timelineStorageUri, currentSnapshot, 'Save');
		currentArray.push(timelineNode);
		checkIfTimelineArrayReachedMaxAndFixIt(currentArray);
		let timelinePath = [timelineStorageUri.path, base32.encode(document.fileName), 'timeline.json'].join('\\')

		vscode.workspace.fs.writeFile(vscode.Uri.file(timelinePath), new TextEncoder().encode(JSON.stringify(currentArray)));

		if (!timelineDataProvider.hasTimelineArray())
			timelineDataProvider.setTimelineArray(currentArray);
		setTimeout(() => {
			timelineDataProvider.refresh();
		}, 500);

		currentSnapshot = document.getText();
	})

	vscode.window.onDidChangeActiveTextEditor(function (event) {
		if (vscode.window.tabGroups.activeTabGroup?.activeTab?.label.includes('↔'))
			return;//dirty way to check if the tab is an diff view

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
	// END - EVENTS HANDLER
}

function createTimelineNode(filename: string, storageUri: vscode.Uri, currentSnapshot: string, name: string = 'undefined'): TimelineNode {
	let filename32: string = base32.encode(filename);
	let snapshopFileName = randomUUID();
	let folderPath = storageUri.path + '\\' + filename32;
	let snapshotPath = folderPath + '\\' + snapshopFileName + extname(filename);
	vscode.workspace.fs.writeFile(vscode.Uri.file(snapshotPath), new TextEncoder().encode(currentSnapshot));
	let timelineNode = new TimelineNode(filename, snapshotPath, name);
	return timelineNode;
}

function checkIfTimelineArrayReachedMaxAndFixIt(timelineArray: TimelineNode[]) {
	const timelineArrayMax = 5;
	if (timelineArray.length > timelineArrayMax) {
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
