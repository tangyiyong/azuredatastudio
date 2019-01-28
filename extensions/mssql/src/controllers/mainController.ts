/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as sqlops from 'sqlops';
import * as vscode from 'vscode';

import * as constants from '../constants';
import * as utils from '../utils';
import ControllerBase from './controllerBase';
import { UploadFilesCommand, MkDirCommand, SaveFileCommand, PreviewFileCommand, DeleteFilesCommand, CopyPathCommand } from '../hdfsCommands';
import { ServiceClient } from '../services/serviceClient';
import { OpenSparkJobSubmissionDialogCommand, OpenSparkJobSubmissionDialogFromFileCommand, OpenSparkJobSubmissionDialogTask } from '../dialog/dialogCommands';
import { DataProtocolServer } from '../dataprotocol/dataProtocolServer';
import { OpenSparkYarnHistoryTask } from '../dashboard/historyTask';

/**
 * The main controller class that initializes the extension
 */
export default class MainController extends ControllerBase {
    // PUBLIC METHODS //////////////////////////////////////////////////////
    /**
     * Deactivates the extension
     */
    public deactivate(): void {
        utils.logDebug('Main controller deactivated');
    }

    public activate(): Promise<boolean> {
        // TODO  #671 add back in some services UI for the dashboard, or remove the ServicesTab fully
        // this._apiWrapper.registerModelViewProvider('sql-vnext-services', view => {
        //     new ServicesTab(view, this._apiWrapper).display();
        // });
        // TODO add back in some Spark UI section. Need to show the direct jobs page if possible

        this.configureCommands();
        this.registerFeatureHandlers();

        let dmpServer = new DataProtocolServer(this.appContext);
        dmpServer.registerProviders();

        return Promise.resolve(true);
    }

    private registerFeatureHandlers(): void {
        this.hookSparkJobSubmissionDialog(this.outputChannel);
        const outputChannel = this.apiWrapper.createOutputChannel(constants.serviceName);
        let serviceClient = new ServiceClient(this.apiWrapper, outputChannel);
        serviceClient.startService(this.extensionContext).then(success => undefined, err => {
            this.apiWrapper.showErrorMessage(utils.getErrorMessage(err));
        });
        this.hookSparkYarnHistory();
    }

    private hookSparkJobSubmissionDialog(outputChannel: vscode.OutputChannel): void {
        this.extensionContext.subscriptions.push(new OpenSparkJobSubmissionDialogCommand(this.appContext, outputChannel));
        this.extensionContext.subscriptions.push(new OpenSparkJobSubmissionDialogFromFileCommand(this.appContext, outputChannel));
        this.apiWrapper.registerTaskHandler(constants.livySubmitSparkJobTask, (profile: sqlops.IConnectionProfile) => {
            new OpenSparkJobSubmissionDialogTask(this.appContext, outputChannel).execute(profile);
        });
    }

    private hookSparkYarnHistory(): void {
        this.apiWrapper.registerTaskHandler(constants.livyOpenSparkHistory, (profile: sqlops.IConnectionProfile) => {
            new OpenSparkYarnHistoryTask(this.appContext).execute(profile, true);
        });
        this.apiWrapper.registerTaskHandler(constants.livyOpenYarnHistory, (profile: sqlops.IConnectionProfile) => {
            new OpenSparkYarnHistoryTask(this.appContext).execute(profile, false);
        });//
    }


    // PRIVATE HELPERS /////////////////////////////////////////////////////
    private configureCommands(): void {
        this.extensionContext.subscriptions.push(new UploadFilesCommand(this.prompter, this.appContext));
        this.extensionContext.subscriptions.push(new MkDirCommand(this.prompter, this.appContext));
        this.extensionContext.subscriptions.push(new SaveFileCommand(this.prompter, this.appContext));
        this.extensionContext.subscriptions.push(new PreviewFileCommand(this.prompter, this.appContext));
        this.extensionContext.subscriptions.push(new CopyPathCommand(this.appContext));
        this.extensionContext.subscriptions.push(new DeleteFilesCommand(this.prompter, this.appContext));
    }

    // Keeping this code for now - we should consider removing once we verified we have no need for webview-based dashboard UI ever
    // private createTabForPort(webview: sqlops.DashboardWebview, port: string): void {
    //     let self = this;

    //     // TODO need profile access to detect correct IP for connection
    //     // for now, assume active connection is correct
    //     // long term, should be able to query DMV for all endpoints and use those instead
    //     sqlops.connection.getCurrentConnection()
    //         .then(connection => {
    //             if (connection.providerName === 'MSSQL' && connection.options['server']) {
    //                 // Put together the template variables and render the template
    //                 let serverAddr = Utils.getServerAddressFromName(connection);
    //                 let templateValues = { url: `http://${serverAddr}:${port}` };
    //                 return Utils.renderTemplateHtml(self.extensionContext.extensionPath, constants.htmlClusterWebTab, templateValues);
    //             } else {
    //                 let templateValues = {
    //                     message: LocalizedConstants.msgMissingSqlConnection
    //                 };
    //                 return Utils.renderTemplateHtml(self.extensionContext.extensionPath, constants.htmlEmptyTab, templateValues);
    //             }
    //         })
    //         .then(html => { webview.html = html; });
    // }
}
