/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as sqlops from 'sqlops';
import * as nls from 'vscode-nls';
import * as vscode from 'vscode';
const localize = nls.loadMessageBundle();

import { ICommandViewContext, Command, ICommandObjectExplorerContext, ICommandUnknownContext } from '../command';
import { SparkJobSubmissionDialog } from './sparkJobSubmission/sparkJobSubmissionDialog';
import { AppContext } from '../appContext';
import { getErrorMessage } from '../utils';
import * as constants from '../constants';
import { HdfsFileSourceNode } from '../hdfsProvider';
import { getNode } from '../hdfsCommands';
import * as LocalizedConstants from '../localizedConstants';

export class OpenSparkJobSubmissionDialogCommand extends Command {
    constructor(appContext: AppContext, private outputChannel: vscode.OutputChannel) {
        super(constants.livySubmitSparkJobCommand, appContext);
    }

    protected async preExecute(context: ICommandUnknownContext | ICommandObjectExplorerContext, args: object = {}): Promise<any> {
        return this.execute(context, args);
    }

    async execute(context: ICommandUnknownContext | ICommandObjectExplorerContext, ...args: any[]): Promise<void> {
        try {
            let connection: sqlops.connection.Connection;
            if (context && context.type === constants.ObjectExplorerService && context.explorerContext && context.explorerContext.connectionProfile) {
                let connProfile = context.explorerContext.connectionProfile;
                connection = {
                    providerName: connProfile.providerName,
                    connectionId: connProfile.id,
                    options: connProfile.options
                };

                // Check whether the connection is active.
                let credentials = await sqlops.connection.getCredentials(connProfile.id);
                if (!credentials) {
                    throw new Error(localize('sparkJobSubmission_ConnectionIsNotActive', 'Submit Spark Job requires a connection to be active. Please click the cluster node in the left tree to activate. '));
                }
            } else {
                connection = await this.selectConnection();
            }

            let dialog = new SparkJobSubmissionDialog(connection, this.appContext, this.outputChannel);
            await dialog.openDialog();
        } catch (error) {
            this.appContext.apiWrapper.showErrorMessage(getErrorMessage(error));
        }
    }

    private async selectConnection(): Promise<sqlops.connection.Connection> {
        let connectionList: sqlops.connection.Connection[] = await this.apiWrapper.getActiveConnections();
        let displayList: string[] = new Array();
        let connectionMap: Map<string, sqlops.connection.Connection> = new Map();
        if (connectionList && connectionList.length > 0) {
            connectionList.forEach(conn => {
                if (conn.providerName === constants.hadoopKnoxProviderName) {
                    displayList.push(conn.options.host);
                    connectionMap.set(conn.options.host, conn);
                }
            });
        }

        if (displayList.length === 0) {
            throw new Error(localize('sparkJobSubmission_NoActiveHadoopConnection', 'Spark Job submission failed: No active Hadoop connection. Please click the cluster node in the left tree to activate. '));
        }

        let selectHost: string = await vscode.window.showQuickPick(displayList, { placeHolder: localize('sparkJobSubmission_PleaseSelectAClusterConnection', 'Please select a cluster connection. ') });
        if (!selectHost) {
            throw new Error(localize('sparkJobSubmission_NoConnectionSelected', 'Submit Spark Job requires a connection to be selected.'));
        }

        return connectionMap.get(selectHost);
    }
}

// Open the submission dialog for a specific file path.
export class OpenSparkJobSubmissionDialogFromFileCommand extends Command {
    constructor(appContext: AppContext, private outputChannel: vscode.OutputChannel) {
        super(constants.livySubmitSparkJobFromFileCommand, appContext);
    }

    protected async preExecute(context: ICommandViewContext | ICommandObjectExplorerContext, args: object = {}): Promise<any> {
        return this.execute(context, args);
    }

    async execute(context: ICommandViewContext | ICommandObjectExplorerContext, ...args: any[]): Promise<void> {
        let path: string = undefined;
        try {
            let node = await getNode<HdfsFileSourceNode>(context, this.appContext);
            if (node && node.hdfsPath) {
                path = node.hdfsPath;
            } else {
                this.apiWrapper.showErrorMessage(LocalizedConstants.msgMissingNodeContext);
                return;
            }
        } catch (err) {
            this.apiWrapper.showErrorMessage(localize('sparkJobSubmission_GetFilePathFromSelectedNodeFailed', 'Error Get File Path: {0}', err));
            return;
        }

        try {
            let connection: sqlops.connection.Connection;
            if (context && context.type === constants.ObjectExplorerService && context.explorerContext && context.explorerContext.connectionProfile) {
                let connProfile = context.explorerContext.connectionProfile;
                connection = {
                    providerName: connProfile.providerName,
                    connectionId: connProfile.id,
                    options: connProfile.options
                };
            } else {
                connection = await this.apiWrapper.getCurrentConnection();
                if (!connection) {
                    this.appContext.apiWrapper.showErrorMessage(localize('sparkJobSubmission_PleaseConnectToClusterBeforeSubmission', 'Please connect to the Spark cluster before submitting Spark job. '));
                    return;
                }
            }

            let dialog = new SparkJobSubmissionDialog(connection, this.appContext, this.outputChannel);
            await dialog.openDialog(path);
        } catch (error) {
            this.appContext.apiWrapper.showErrorMessage(getErrorMessage(error));
        }
    }
}

export class OpenSparkJobSubmissionDialogTask {
    constructor(private appContext: AppContext, private outputChannel: vscode.OutputChannel) {
    }

    async execute(profile: sqlops.IConnectionProfile, ...args: any[]): Promise<void> {
        try {
            let connection: sqlops.connection.Connection;
            if (profile) {
                connection = {
                    providerName: profile.providerName,
                    connectionId: profile.id,
                    options: profile.options
                };
            } else {
                connection = await sqlops.connection.getCurrentConnection();
                if (!connection) {
                    this.appContext.apiWrapper.showErrorMessage(localize('sparkJobSubmission_PleaseConnectToClusterBeforeSubmission', 'Please connect to the Spark cluster before submitting Spark job. '));
                    return;
                }
            }

            let dialog = new SparkJobSubmissionDialog(connection, this.appContext, this.outputChannel);
            await dialog.openDialog();
        } catch (error) {
            this.appContext.apiWrapper.showErrorMessage(getErrorMessage(error));
        }
    }
}
