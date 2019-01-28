/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import * as sqlops from 'sqlops';

/**
 * Wrapper class to act as a facade over VSCode and Data APIs and allow us to test / mock callbacks into
 * this API from our code
 *
 * @export
 * @class ApiWrapper
 */
export class ApiWrapper {
	// Data APIs
	public registerConnectionProvider(provider: sqlops.ConnectionProvider): vscode.Disposable {
		return sqlops.dataprotocol.registerConnectionProvider(provider);
	}

	public registerObjectExplorerProvider(provider: sqlops.ObjectExplorerProvider): vscode.Disposable {
        return sqlops.dataprotocol.registerObjectExplorerProvider(provider);
    }

	public registerObjectExplorerNodeProvider(provider: sqlops.ObjectExplorerNodeProvider): vscode.Disposable {
		return sqlops.dataprotocol.registerObjectExplorerNodeProvider(provider);
	}

	public registerTaskServicesProvider(provider: sqlops.TaskServicesProvider): vscode.Disposable {
		return sqlops.dataprotocol.registerTaskServicesProvider(provider);
	}

	public registerFileBrowserProvider(provider: sqlops.FileBrowserProvider): vscode.Disposable {
		return sqlops.dataprotocol.registerFileBrowserProvider(provider);
	}

	public registerCapabilitiesServiceProvider(provider: sqlops.CapabilitiesProvider): vscode.Disposable {
        return sqlops.dataprotocol.registerCapabilitiesServiceProvider(provider);
    }

	public registerModelViewProvider(widgetId: string, handler: (modelView: sqlops.ModelView) => void): void {
        return sqlops.ui.registerModelViewProvider(widgetId, handler);
    }

	public createDialog(title: string): sqlops.window.modelviewdialog.Dialog {
        return sqlops.window.modelviewdialog.createDialog(title);
	}

	public openDialog(dialog: sqlops.window.modelviewdialog.Dialog): void {
        return sqlops.window.modelviewdialog.openDialog(dialog);
    }

	public registerTaskHandler(taskId: string, handler: (profile: sqlops.IConnectionProfile) => void): void {
		sqlops.tasks.registerTask(taskId, handler);
	}

	public startBackgroundOperation(operationInfo: sqlops.BackgroundOperationInfo): void {
        sqlops.tasks.startBackgroundOperation(operationInfo);
	}

	public getActiveConnections(): Thenable<sqlops.connection.Connection[]> {
        return sqlops.connection.getActiveConnections();
	}

	public getCurrentConnection(): Thenable<sqlops.connection.Connection> {
        return sqlops.connection.getCurrentConnection();
    }

	// VSCode APIs
	public executeCommand(command: string, ...rest: any[]): Thenable<any> {
		return vscode.commands.executeCommand(command, ...rest);
	}

	public registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable {
		return vscode.commands.registerCommand(command, callback, thisArg);
	}

	/**
     * Get the configuration for a extensionName
     * @param extensionName The string name of the extension to get the configuration for
     * @param resource The optional URI, as a URI object or a string, to use to get resource-scoped configurations
     */
    public getConfiguration(extensionName?: string, resource?: vscode.Uri | string): vscode.WorkspaceConfiguration {
        if (typeof resource === 'string') {
            try {
                resource = this.parseUri(resource);
            } catch (e) {
                resource = undefined;
            }
        } else if (!resource) {
            // Fix to avoid adding lots of errors to debug console. Expects a valid resource or null, not undefined
            resource = null;
        }
        return vscode.workspace.getConfiguration(extensionName, resource as vscode.Uri);
	}

	/**
     * Parse uri
     */
    public parseUri(uri: string): vscode.Uri {
        return vscode.Uri.parse(uri);
    }

	public showOpenDialog(options: vscode.OpenDialogOptions): Thenable<vscode.Uri[] | undefined> {
		return vscode.window.showOpenDialog(options);
	}

	public showSaveDialog(options: vscode.SaveDialogOptions): Thenable<vscode.Uri> {
		return vscode.window.showSaveDialog(options);
	}

	public openTextDocument(uri: vscode.Uri): Thenable<vscode.TextDocument>;
	public openTextDocument(options: { language?: string; content?: string; }): Thenable<vscode.TextDocument>;
	public openTextDocument(uriOrOptions): Thenable<vscode.TextDocument> {
		return vscode.workspace.openTextDocument(uriOrOptions);
	}

	public showTextDocument(document: vscode.TextDocument, column?: vscode.ViewColumn, preserveFocus?: boolean, preview?: boolean): Thenable<vscode.TextEditor> {
		let options: vscode.TextDocumentShowOptions = {
			viewColumn: column,
			preserveFocus: preserveFocus,
			preview: preview
		};
		return vscode.window.showTextDocument(document, options);
	}

	public showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		return vscode.window.showErrorMessage(message, ...items);
	}

	public showWarningMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		return vscode.window.showWarningMessage(message, ...items);
	}

	public showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		return vscode.window.showInformationMessage(message, ...items);
	}

	public createStatusBarItem(alignment?: vscode.StatusBarAlignment, priority?: number): vscode.StatusBarItem {
		return vscode.window.createStatusBarItem(alignment, priority);
	}

	public get workspaceFolders(): vscode.WorkspaceFolder[] {
		return vscode.workspace.workspaceFolders;
	}

	public createOutputChannel(name: string): vscode.OutputChannel {
        return vscode.window.createOutputChannel(name);
	}

	public createTab(title: string): sqlops.window.modelviewdialog.DialogTab {
        return sqlops.window.modelviewdialog.createTab(title);
    }
}
