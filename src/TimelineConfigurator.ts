import { WorkspaceConfiguration, workspace } from 'vscode';

export class TimelineConfigurator {
    localHistoryConfig: WorkspaceConfiguration;
    TimelineConfig: WorkspaceConfiguration;

    constructor() {
        this.localHistoryConfig = workspace.getConfiguration('workbench.localHistory');
        this.TimelineConfig = workspace.getConfiguration('betterTimeline');
    }

    isLocalHistoryEnabled() {
        return this.localHistoryConfig.get('enabled');
    }

    getMaxEntrySize(): number {
        return parseInt(this.TimelineConfig.get('maxEntrySize') ?? "256");
    }

    getMaxAllowedEntries() {
        return this.TimelineConfig.get('maxAllowedEntries');
    }

    getInsertingDelayEntry() {
        return this.TimelineConfig.get('insertingDelayEntry');
    }

}