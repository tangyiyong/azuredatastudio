/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ClientCapabilities as VSClientCapabilities, RequestType, NotificationType } from 'vscode-languageclient';
import * as types from 'dataprotocol-client/lib/types';
import * as sqlops from 'sqlops';

/**
 * @interface IMessage
 */
export interface IMessage {
    jsonrpc: string;
}

// ------------------------------- < Telemetry Sent Event > ------------------------------------

/**
 * Event sent when the language service send a telemetry event
 */
export namespace TelemetryNotification {
    export const type = new NotificationType<TelemetryParams, void>('telemetry/sqlevent');
}

/**
 * Update event parameters
 */
export class TelemetryParams {
    public params: {
        eventName: string;
        properties: ITelemetryEventProperties;
        measures: ITelemetryEventMeasures;
    };
}

export interface ITelemetryEventProperties {
    [key: string]: string;
}

export interface ITelemetryEventMeasures {
    [key: string]: number;
}


// ------------------------------- </ Telemetry Sent Event > ----------------------------------

// ------------------------------- < Explorer Methods > ------------------------------------

export namespace DataCatalogCreateSessionRequest {
    export const type = new RequestType<CreateDataCatalogParams, types.CreateSessionResponse, void, void>('datacatalog/createsession');
}

export namespace ExplorerExpandRequest {
    export const type = new RequestType<types.ExpandParams, boolean, void, void>('explorer/expand');
}

export namespace ExplorerRefreshRequest {
    export const type = new RequestType<types.ExpandParams, boolean, void, void>('explorer/refresh');
}

export namespace ExplorerCloseSessionRequest {
    export const type = new RequestType<types.CloseSessionParams, types.CloseSessionResponse, void, void>('explorer/closesession');
}

// ------------------------------- < Explorer Events > ------------------------------------


export namespace ExplorerCreateSessionCompleteNotification {
    export const type = new NotificationType<types.SessionCreatedParameters, void>('explorer/sessioncreated');
}

export namespace ExplorerExpandCompleteNotification {
    export const type = new NotificationType<types.ExpandResponse, void>('explorer/expandCompleted');
}


export interface CreateDataCatalogParams {
    catalogName: string;
    connections: sqlops.ConnectionInfo[];
}


// ------------------------------- < Explorer API definition > ------------------------------------

export interface ExplorerProvider {
    providerId?: string;

    createNewDataCatalogSession(catalogParams: CreateDataCatalogParams): Thenable<sqlops.ObjectExplorerSessionResponse>;

    expandNode(nodeInfo: sqlops.ExpandNodeInfo): Thenable<boolean>;

    refreshNode(nodeInfo: sqlops.ExpandNodeInfo): Thenable<boolean>;

    closeSession(closeSessionInfo: sqlops.ObjectExplorerCloseSessionInfo): Thenable<sqlops.ObjectExplorerCloseSessionResponse>;

    findNodes(findNodesInfo: sqlops.FindNodesInfo): Thenable<sqlops.ObjectExplorerFindNodesResponse>;

    registerOnSessionCreated(handler: (response: sqlops.ObjectExplorerSession) => any): void;

    registerOnExpandCompleted(handler: (response: sqlops.ObjectExplorerExpandInfo) => any): void;
}

// ------------------------------- < Data Source Wizard Methods > ------------------------------------

/*
* DataSourceWizardCreateSessionRequest
*/
export namespace DataSourceWizardCreateSessionRequest {
    export const type = new RequestType<sqlops.ConnectionInfo, DataSourceWizardConfigInfoResponse, void, void>('datasourcewizard/createsession');
}

export interface DataSourceWizardConfigInfoResponse {
    sessionId: string;
    supportedSourceTypes: DataSourceType[];
    databaseNames: string[];
}

// Defines the important information about a type of data source - its name, configuration properties, etc.
export interface DataSourceType {
    typeName: string;
    authenticationTypes: string[];
}


/*
* DisposeWizardSessionRequest
*/
export namespace DisposeWizardSessionRequest {
    export const type = new RequestType<string, boolean, void, void>('datasourcewizard/disposewizardsession');
}


/*
* ValidateVirtualizeDataInputRequest
*/
export namespace ValidateVirtualizeDataInputRequest {
    export const type = new RequestType<VirtualizeDataInput, ValidateVirtualizeDataInputResponse, void, void>('datasourcewizard/validatevirtualizedatainput');
}

export interface ValidateVirtualizeDataInputResponse {
    isValid: boolean;
    errorMessages: string[];
}

export interface VirtualizeDataInput {
    sessionId: string;
    destDatabaseName: string;
    sourceServerType: string;
    destDbMasterKeyPwd: string;
    existingDataSourceName: string;
    newDataSourceName: string;
    sourceServerName: string;
    sourceDatabaseName: string;
    sourceAuthenticationType: string;
    existingCredentialName: string;
    newCredentialName: string;
    sourceUsername: string;
    sourcePassword: string;
    externalTableInfoList: ExternalTableInfo[];
    newSchemas: string[];
}

export interface FileFormat {
    formatType: string;
    fieldTerminator: string; // string token that separates columns on each line of the file
    stringDelimiter: string; // string token that marks beginning/end of strings in the file
    firstRow: number;
}

export interface ExternalTableInfo {
    externalTableName: string[];
    columnDefinitionList: ColumnDefinition[];
    sourceTableLocation: string[];
    fileFormat?: FileFormat;
}

export interface ColumnDefinition {
    columnName: string;
    dataType: string;
    collationName: string;
    isNullable: boolean;
    isSupported?: boolean;
}

// TODO: All response objects for data-source-browsing request have this format, and can be formed with this generic class.
//       Replace response objects with this class.
export interface ExecutionResult<T> {
    isSuccess: boolean;
    returnValue: T;
    errorMessages: string[];
}

// TODO: All parameter objects for querying list of database, list of tables, and list of column definitions have this format,
//       and can be formed with this generic class. Replace parameter objects with this class for those query requests.
export interface DataSourceBrowsingParams<T> {
    virtualizeDataInput: VirtualizeDataInput;
    querySubject: T;
}

export namespace GetSourceViewListRequest {
    export const type = new RequestType<DataSourceBrowsingParams<string>, ExecutionResult<SchemaViews[]>, void, void>('datasourcewizard/getsourceviewlist');
}

/*
* GetDatabaseInfoRequest
*/
export namespace GetDatabaseInfoRequest {
    export const type = new RequestType<GetDatabaseInfoRequestParams, GetDatabaseInfoResponse, void, void>('datasourcewizard/getdatabaseinfo');
}

export interface GetDatabaseInfoResponse {
    isSuccess: boolean;
    errorMessages: string[];
    databaseInfo: DatabaseInfo;
}

export interface DatabaseInfo {
    hasMasterKey: boolean;
    defaultSchemaName: string;
    schemaNames: string[];
    existingCredentials: CredentialInfo[];
    existingSources: DataSourceInstance[];
}

export interface CredentialInfo {
    credentialName: string;
    username: string;
}

export interface GetDatabaseInfoRequestParams {
    sessionId: string;
    databaseName: string;
}


// Defines the important information about an external data source that has already been created.
export interface DataSourceInstance {
    name: string;
    location: string;
    authenticationType: string;
    userName?: string;
}


/*
* ProcessVirtualizeDataInputRequest
*/
export namespace ProcessVirtualizeDataInputRequest {
    export const type = new RequestType<VirtualizeDataInput, ProcessVirtualizeDataInputResponse, void, void>('datasourcewizard/processvirtualizedatainput');
}

export interface ProcessVirtualizeDataInputResponse {
    isSuccess: boolean;
    errorMessages: string[];
}

export namespace GenerateScriptRequest {
    export const type = new RequestType<VirtualizeDataInput, GenerateScriptResponse, void, void>('datasourcewizard/generatescript');
}

export interface GenerateScriptResponse {
    isSuccess: boolean;
    errorMessages: string[];
    script: string;
}


/*
* GetSourceDatabasesRequest
*/
export namespace GetSourceDatabasesRequest {
    export const type = new RequestType<VirtualizeDataInput, GetSourceDatabasesResponse, void, void>('datasourcewizard/getsourcedatabaselist');
}

export interface GetSourceDatabasesResponse {
    isSuccess: boolean;
    errorMessages: string[];
    databaseNames: string[];
}


/*
* GetSourceTablesRequest
*/
export namespace GetSourceTablesRequest {
    export const type = new RequestType<GetSourceTablesRequestParams, GetSourceTablesResponse, void, void>('datasourcewizard/getsourcetablelist');
}

export interface GetSourceTablesRequestParams {
    sessionId: string;
    virtualizeDataInput: VirtualizeDataInput;
    sourceDatabaseName: string;
}

export interface GetSourceTablesResponse {
    isSuccess: boolean;
    errorMessages: string[];
    schemaTablesList: SchemaTables[];
}

export interface SchemaTables {
    schemaName: string;
    tableNames: string[];
}

export interface SchemaViews {
    schemaName: string;
    viewNames: string[];
}

/*
* GetSourceColumnDefinitionsRequest
*/
export namespace GetSourceColumnDefinitionsRequest {
    export const type = new RequestType<GetSourceColumnDefinitionsRequestParams, GetSourceColumnDefinitionsResponse, void, void>('datasourcewizard/getsourcecolumndefinitionlist');
}

export interface GetSourceColumnDefinitionsRequestParams {
    sessionId: string;
    virtualizeDataInput: VirtualizeDataInput;
    location: string[];
}

export interface GetSourceColumnDefinitionsResponse {
    isSuccess: boolean;
    errorMessages: string[];
    columnDefinitions: ColumnDefinition[];
}

/*
* Prose
*/
export interface ColumnInfo {
    name: string;
    sqlType: string;
    isNullable: boolean;
}

export interface ProseDiscoveryParams {
    filePath: string;
    tableName: string;
    schemaName?: string;
    fileType?: string;
    fileContents?: string;
}

export interface ProseDiscoveryResponse {
    dataPreview: string[][];
    columnInfo: ColumnInfo[];
    columnDelimiter: string;
    firstRow: number;
    quoteCharacter: string;
}

export namespace ProseDiscoveryRequest {
    export const type = new RequestType<ProseDiscoveryParams, ProseDiscoveryResponse, void, void>('flatfile/proseDiscovery');
}

// ------------------------------- < Data Source Wizard API definition > ------------------------------------
export interface DataSourceWizardService {
    providerId?: string;
    createDataSourceWizardSession(requestParams: sqlops.ConnectionInfo): Thenable<DataSourceWizardConfigInfoResponse>;
    disposeWizardSession(sessionId: string): Thenable<boolean>;
    validateVirtualizeDataInput(requestParams: VirtualizeDataInput): Thenable<ValidateVirtualizeDataInputResponse>;
    getDatabaseInfo(requestParams: GetDatabaseInfoRequestParams): Thenable<GetDatabaseInfoResponse>;
    processVirtualizeDataInput(requestParams: VirtualizeDataInput): Thenable<ProcessVirtualizeDataInputResponse>;
    generateScript(requestParams: VirtualizeDataInput): Thenable<GenerateScriptResponse>;
    getSourceDatabases(requestParams: VirtualizeDataInput): Thenable<GetSourceDatabasesResponse>;
    getSourceTables(requestParams: GetSourceTablesRequestParams): Thenable<GetSourceTablesResponse>;
    getSourceViewList(requestParams: DataSourceBrowsingParams<string>): Thenable<ExecutionResult<SchemaViews[]>>;
    getSourceColumnDefinitions(requestParams: GetSourceColumnDefinitionsRequestParams): Thenable<GetSourceColumnDefinitionsResponse>;
    sendProseDiscoveryRequest(requestParams: ProseDiscoveryParams): Thenable<ProseDiscoveryResponse>;
}
