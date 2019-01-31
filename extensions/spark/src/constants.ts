'use strict';

export const clusterEndpointsProperty = 'clusterEndpoints';
export const hadoopKnoxEndpointName = 'Knox';
export const mssqlClusterProviderName = 'mssqlCluster';

// CONFIG VALUES ///////////////////////////////////////////////////////////
export const extensionConfigSectionName = 'dataManagement';
export const extensionOutputChannel = 'SQL Server 2019 Preview';
export const configLogDebugInfo = 'logDebugInfo';

// DATA PROTOCOL VALUES ///////////////////////////////////////////////////////////
export const hadoopKnoxProviderName = 'HADOOP_KNOX';
export const protocolVersion = '1.0';
export const hostPropName = 'host';
export const userPropName = 'user';
export const knoxPortPropName = 'knoxport';
export const clusterPropName = 'clustername';
export const passwordPropName = 'password';
export const groupIdPropName = 'groupId';
export const defaultKnoxPort = '30443';
export const groupIdName = 'groupId';
export const sqlProviderName = 'MSSQL';

export const outputChannelName = 'dataManagement';

// TODO update with our own crash link
export const serviceCrashLink = 'https://github.com/Microsoft/vscode-mssql/wiki/SqlToolsService-Known-Issues';

export const hadoopConnectionTimeoutSeconds = 15;
export const hdfsRootPath = '/';

// SPARK JOB SUBMISSION //////////////////////////////////////////////////////////
export const livySubmitSparkJobCommand = 'livy.cmd.submitSparkJob';
export const livySubmitSparkJobFromFileCommand = 'livy.cmd.submitFileToSparkJob';
export const livySubmitSparkJobTask = 'livy.task.submitSparkJob';
export const livyOpenSparkHistory = 'livy.task.openSparkHistory';
export const livyOpenYarnHistory = 'livy.task.openYarnHistory';
export const livySubmitPath = '/gateway/default/livy/v1/batches';
export const livyTimeInMSForCheckYarnApp = 1000;
export const livyRetryTimesForCheckYarnApp = 20;
export const sparkJobFileSelectorButtonWidth = '30px';
export const sparkJobFileSelectorButtonHeight = '30px';

// SERVICE NAMES //////////////////////////////////////////////////////////
export const ObjectExplorerService = 'objectexplorer';
export const ViewType = 'view';

export enum BuiltInCommands {
    SetContext = 'setContext'
}

export enum CommandContext {
    WizardServiceEnabled = 'wizardservice:enabled'
}

export enum HdfsItems {
    Connection = 'hdfs:connection',
    Folder = 'hdfs:folder',
    File = 'hdfs:file',
    Message = 'hdfs:message'
}

export enum HdfsItemsSubType {
    Spark = 'hdfs:spark'
}
