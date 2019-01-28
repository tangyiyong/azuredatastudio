/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { SqlOpsDataClient, SqlOpsFeature } from 'dataprotocol-client';
import { ClientCapabilities, StaticFeature, RPCMessageType, ServerCapabilities } from 'vscode-languageclient';
import * as UUID from 'vscode-languageclient/lib/utils/uuid';
import { Disposable } from 'vscode';
import * as sqlops from 'sqlops';

import { Telemetry } from './telemetry';
import * as serviceUtils from './serviceUtils';
import { CreateDataCatalogParams, TelemetryNotification, DataCatalogCreateSessionRequest,
    ExplorerExpandRequest, ExplorerRefreshRequest, ExplorerCloseSessionRequest,
    ExplorerCreateSessionCompleteNotification, ExplorerExpandCompleteNotification,
    DataSourceWizardCreateSessionRequest, DataSourceWizardConfigInfoResponse, ExplorerProvider,
    DataSourceWizardService, DisposeWizardSessionRequest, VirtualizeDataInput,
    ValidateVirtualizeDataInputResponse, GetDatabaseInfoRequestParams, GetDatabaseInfoResponse,
    ProcessVirtualizeDataInputResponse, GenerateScriptResponse, ValidateVirtualizeDataInputRequest,
    GetDatabaseInfoRequest, ProcessVirtualizeDataInputRequest, GenerateScriptRequest, GetSourceDatabasesResponse,
    GetSourceDatabasesRequest, GetSourceTablesResponse, GetSourceTablesRequestParams, GetSourceTablesRequest,
    GetSourceColumnDefinitionsRequestParams, GetSourceColumnDefinitionsResponse, GetSourceColumnDefinitionsRequest,
    ProseDiscoveryParams, ProseDiscoveryResponse, ProseDiscoveryRequest, DataSourceBrowsingParams, ExecutionResult, SchemaTables, GetSourceViewListRequest, SchemaViews } from './contracts';
import { IServiceApi, managerInstance, ApiType } from './serviceApiManager';
export class TelemetryFeature implements StaticFeature {

    constructor(private _client: SqlOpsDataClient) { }

    fillClientCapabilities(capabilities: ClientCapabilities): void {
        serviceUtils.ensure(capabilities, 'telemetry')!.telemetry = true;
    }

    initialize(): void {
        this._client.onNotification(TelemetryNotification.type, e => {
            Telemetry.sendTelemetryEvent(e.params.eventName, e.params.properties, e.params.measures);
        });
    }
}

export class DataCatalogFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes: RPCMessageType[] = [
        DataCatalogCreateSessionRequest.type,
        ExplorerExpandRequest.type,
        ExplorerRefreshRequest.type,
        ExplorerCloseSessionRequest.type,
        ExplorerCreateSessionCompleteNotification.type,
        ExplorerExpandCompleteNotification.type
    ];

    constructor(client: SqlOpsDataClient) {
        super(client, DataCatalogFeature.messagesTypes);
    }

    public fillClientCapabilities(capabilities: ClientCapabilities): void {
        // ensure(ensure(capabilities, 'connection')!, 'objectExplorer')!.dynamicRegistration = true;
    }

    public initialize(capabilities: ServerCapabilities): void {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }

    protected registerProvider(options: undefined): Disposable {
        const client = this._client;
        let createNewDataCatalogSession = (catalogParams: CreateDataCatalogParams): Thenable<sqlops.ObjectExplorerSessionResponse> => {
            return client.sendRequest(DataCatalogCreateSessionRequest.type, catalogParams).then(
                r => r,
                e => {
                    client.logFailedRequest(DataCatalogCreateSessionRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let expandNode = (nodeInfo: sqlops.ExpandNodeInfo): Thenable<boolean> => {
            return client.sendRequest(ExplorerExpandRequest.type, nodeInfo).then(
                r => r,
                e => {
                    client.logFailedRequest(ExplorerExpandRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let refreshNode = (nodeInfo: sqlops.ExpandNodeInfo): Thenable<boolean> => {
            return client.sendRequest(ExplorerRefreshRequest.type, nodeInfo).then(
                r => r,
                e => {
                    client.logFailedRequest(ExplorerRefreshRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let closeSession = (closeSessionInfo: sqlops.ObjectExplorerCloseSessionInfo): Thenable<any> => {
            return client.sendRequest(ExplorerCloseSessionRequest.type, closeSessionInfo).then(
                r => r,
                e => {
                    client.logFailedRequest(ExplorerCloseSessionRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let registerOnSessionCreated = (handler: (response: sqlops.ObjectExplorerSession) => any): void => {
            client.onNotification(ExplorerCreateSessionCompleteNotification.type, handler);
        };

        let registerOnExpandCompleted = (handler: (response: sqlops.ObjectExplorerExpandInfo) => any): void => {
            client.onNotification(ExplorerExpandCompleteNotification.type, handler);
        };

        return managerInstance.registerApi<ExplorerProvider>(ApiType.ExplorerProvider, {
            providerId: client.providerId,
            closeSession,
            createNewDataCatalogSession,
            expandNode,
            findNodes: undefined,
            refreshNode,
            registerOnExpandCompleted,
            registerOnSessionCreated
        });
    }
}


export class DataSourceWizardFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes: RPCMessageType[] = [
        DataSourceWizardCreateSessionRequest.type
    ];

    constructor(client: SqlOpsDataClient) {
        super(client, DataSourceWizardFeature.messagesTypes);
    }

    public fillClientCapabilities(capabilities: ClientCapabilities): void {
        // ensure(ensure(capabilities, 'connection')!, 'objectExplorer')!.dynamicRegistration = true;
    }

    public initialize(capabilities: ServerCapabilities): void {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }

    protected registerProvider(options: undefined): Disposable {
        const client = this._client;
        let createDataSourceWizardSession = (requestParams: sqlops.ConnectionInfo): Thenable<DataSourceWizardConfigInfoResponse> => {
            return client.sendRequest(DataSourceWizardCreateSessionRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(DataSourceWizardCreateSessionRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let disposeWizardSession = (sessionId: string): Thenable<boolean> => {
            return client.sendRequest(DisposeWizardSessionRequest.type, sessionId).then(
                r => r,
                e => {
                    client.logFailedRequest(DisposeWizardSessionRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let validateVirtualizeDataInput = (requestParams: VirtualizeDataInput): Thenable<ValidateVirtualizeDataInputResponse> => {
            return client.sendRequest(ValidateVirtualizeDataInputRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(ValidateVirtualizeDataInputRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let getDatabaseInfo = (requestParams: GetDatabaseInfoRequestParams): Thenable<GetDatabaseInfoResponse> => {
            return client.sendRequest(GetDatabaseInfoRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(GetDatabaseInfoRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let processVirtualizeDataInput = (requestParams: VirtualizeDataInput): Thenable<ProcessVirtualizeDataInputResponse> => {
            return client.sendRequest(ProcessVirtualizeDataInputRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(ProcessVirtualizeDataInputRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let generateScript = (requestParams: VirtualizeDataInput): Thenable<GenerateScriptResponse> => {
            return client.sendRequest(GenerateScriptRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(GenerateScriptRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let getSourceDatabases = (requestParams: VirtualizeDataInput): Thenable<GetSourceDatabasesResponse> => {
            return client.sendRequest(GetSourceDatabasesRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(GetSourceDatabasesRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let getSourceTables = (requestParams: GetSourceTablesRequestParams): Thenable<GetSourceTablesResponse> => {
            return client.sendRequest(GetSourceTablesRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(GetSourceTablesRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let getSourceViewList = (requestParams: DataSourceBrowsingParams<string>): Thenable<ExecutionResult<SchemaViews[]>> => {
            return client.sendRequest(GetSourceViewListRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(GetSourceViewListRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let getSourceColumnDefinitions = (requestParams: GetSourceColumnDefinitionsRequestParams): Thenable<GetSourceColumnDefinitionsResponse> => {
            return client.sendRequest(GetSourceColumnDefinitionsRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(GetSourceColumnDefinitionsRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        let sendProseDiscoveryRequest = (requestParams: ProseDiscoveryParams): Thenable<ProseDiscoveryResponse> => {
            return client.sendRequest(ProseDiscoveryRequest.type, requestParams).then(
                r => r,
                e => {
                    client.logFailedRequest(ProseDiscoveryRequest.type, e);
                    return Promise.reject(e);
                }
            );
        };

        return managerInstance.registerApi<DataSourceWizardService>(ApiType.DataSourceWizard, {
            providerId: client.providerId,
            createDataSourceWizardSession,
            disposeWizardSession,
            validateVirtualizeDataInput,
            getDatabaseInfo,
            processVirtualizeDataInput,
            generateScript,
            getSourceDatabases,
            getSourceTables,
            getSourceViewList,
            getSourceColumnDefinitions,
            sendProseDiscoveryRequest
        });
    }
}
