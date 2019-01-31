/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as sqlops from 'sqlops';
import * as constants from './constants';
import * as UUID from 'vscode-languageclient/lib/utils/uuid';

export class EndPointLookUp {
	public static async getEndPointConnection(connectionProfile: sqlops.IConnectionProfile): Promise<sqlops.connection.Connection> {
		if (!connectionProfile) { return undefined; }

		if (connectionProfile.providerName === constants.mssqlClusterProviderName) {
			return <sqlops.connection.Connection>{
				providerName: connectionProfile.providerName,
				connectionId: connectionProfile.id,
				options: connectionProfile.options
			};
		}

		let connection: sqlops.connection.Connection;
		connection = await EndPointLookUp.getExistingEndPointConnection(connectionProfile);
		if (!connection) {
			connection = await EndPointLookUp.createEndPointConnection(connectionProfile);
		}

		return connection;
	}

	public static async createEndPointConnection(connectionProfile: sqlops.IConnectionProfile): Promise<sqlops.connection.Connection> {
		if (!connectionProfile || !connectionProfile.id || !connectionProfile.userName) { return undefined; }

		let serverInfo = await sqlops.connection.getServerInfo(connectionProfile.id);
		if (!serverInfo || !serverInfo.options) { return undefined; }

		let endpoints: IEndpoint[] = serverInfo.options[constants.clusterEndpointsProperty];
		if (!endpoints || endpoints.length === 0) { return undefined; }

		let index = endpoints.findIndex(ep => ep.serviceName === constants.hadoopKnoxEndpointName);
		if (index < 0) { return undefined; }

		let credentials = await sqlops.connection.getCredentials(connectionProfile.id);
		if (!credentials) { return undefined; }

		return <sqlops.connection.Connection>{
			options: {
				'host': endpoints[index].ipAddress,
				'groupId': connectionProfile.options.groupId,
				'knoxport': endpoints[index].port,
				'user': 'root', //connectionProfile.options.userName cluster setup has to have the same user for master and big data cluster
				'password': credentials.password,
			},
			providerName: constants.mssqlClusterProviderName,
			connectionId: UUID.generateUuid()
		};
	}

	public static async getExistingEndPointConnection(connectionProfile: sqlops.IConnectionProfile): Promise<sqlops.connection.Connection> {
		if (!connectionProfile || !connectionProfile.id || !connectionProfile.userName) { return undefined; }

		let serverInfo = await sqlops.connection.getServerInfo(connectionProfile.id);
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