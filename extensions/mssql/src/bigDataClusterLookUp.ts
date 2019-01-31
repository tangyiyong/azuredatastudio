/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as sqlops from 'sqlops';
import * as constants from './constants';
import * as UUID from 'vscode-languageclient/lib/utils/uuid';

export class BigDataClusterLookUp {
	public static async getBigDataClusterConnection(sqlMasterConnectionProfile: sqlops.IConnectionProfile): Promise<sqlops.connection.Connection> {
		if (!sqlMasterConnectionProfile) { return undefined; }

		if (sqlMasterConnectionProfile.providerName === constants.mssqlClusterProviderName) {
			return <sqlops.connection.Connection>{
				providerName: sqlMasterConnectionProfile.providerName,
				connectionId: sqlMasterConnectionProfile.id,
				options: sqlMasterConnectionProfile.options
			};
		}

		let connection: sqlops.connection.Connection;
		connection = await BigDataClusterLookUp.findExistingBigDataClusterConnection(sqlMasterConnectionProfile);
		if (!connection) {
			connection = await BigDataClusterLookUp.createBigDataClusterConnection(sqlMasterConnectionProfile);
		}

		return connection;
	}

	private static async createBigDataClusterConnection(sqlMasterConnectionProfile: sqlops.IConnectionProfile): Promise<sqlops.connection.Connection> {
		if (!sqlMasterConnectionProfile || !sqlMasterConnectionProfile.id || !sqlMasterConnectionProfile.userName) { return undefined; }

		let serverInfo = await sqlops.connection.getServerInfo(sqlMasterConnectionProfile.id);
		if (!serverInfo || !serverInfo.options) { return undefined; }

		let endpoints: IEndpoint[] = serverInfo.options[constants.clusterEndpointsProperty];
		if (!endpoints || endpoints.length === 0) { return undefined; }

		let index = endpoints.findIndex(ep => ep.serviceName === constants.hadoopKnoxEndpointName);
		if (index < 0) { return undefined; }

		let credentials = await sqlops.connection.getCredentials(sqlMasterConnectionProfile.id);
		if (!credentials) { return undefined; }

		return <sqlops.connection.Connection>{
			options: {
				'host': endpoints[index].ipAddress,
				'groupId': sqlMasterConnectionProfile.options.groupId,
				'knoxport': endpoints[index].port,
				'user': 'root', //connectionProfile.options.userName cluster setup has to have the same user for master and big data cluster
				'password': credentials.password,
			},
			providerName: constants.mssqlClusterProviderName,
			connectionId: UUID.generateUuid()
		};
	}

	private static async findExistingBigDataClusterConnection(sqlMasterConnectionProfile: sqlops.IConnectionProfile): Promise<sqlops.connection.Connection> {
		if (!sqlMasterConnectionProfile || !sqlMasterConnectionProfile.id || !sqlMasterConnectionProfile.userName) { return undefined; }

		let serverInfo = await sqlops.connection.getServerInfo(sqlMasterConnectionProfile.id);
		if (!serverInfo || !serverInfo.options) { return undefined; }

		let endpoints: IEndpoint[] = serverInfo.options[constants.clusterEndpointsProperty];
		if (!endpoints || endpoints.length === 0) { return undefined; }

		let index = endpoints.findIndex(ep => ep.serviceName === constants.hadoopKnoxEndpointName);
		if (index < 0) { return undefined; }

		let connectionList: sqlops.connection.Connection[] = await sqlops.connection.getActiveConnections();
		if (!connectionList || connectionList.length === 0) { return undefined; }

		return connectionList.find(conn =>
			conn.providerName === constants.mssqlClusterProviderName &&
			conn.options &&
			conn.options['host'] && conn.options['host'] === endpoints[index].ipAddress &&
			conn.options['knoxport'] && conn.options['knoxport'] === endpoints[index].port &&
			conn.options['user'] && conn.options['user'] === 'root'
		);
	}
}

interface IEndpoint {
	serviceName: string;
	ipAddress: string;
	port: number;
}