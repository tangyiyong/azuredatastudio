/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as sqlops from 'sqlops';
import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();

import { ApiWrapper } from '../apiWrapper';
import * as constants from '../constants';
import { ProviderBase } from './providerBase';
import { HadoopConnectionProvider } from './connectionProvider';
import { HadoopObjectExplorerProvider } from './objectExplorerProvider';
import { AppContext } from '../appContext';

export class DataProtocolServer {

    constructor(private appContext: AppContext) {
    }

    public registerProviders(): void {
        let subscriptions = this.appContext.extensionContext.subscriptions;
        subscriptions.push(this.appContext.apiWrapper.registerCapabilitiesServiceProvider(new CapabilitiesProvider()));
        let connectionProvider = new HadoopConnectionProvider();
        subscriptions.push(this.appContext.apiWrapper.registerConnectionProvider(connectionProvider));
        subscriptions.push(this.appContext.apiWrapper.registerObjectExplorerProvider(new HadoopObjectExplorerProvider(connectionProvider, this.appContext)));
    }
}

class CapabilitiesProvider extends ProviderBase implements sqlops.CapabilitiesProvider {
    getServerCapabilities(client: sqlops.DataProtocolClientCapabilities): Thenable<sqlops.DataProtocolServerCapabilities> {
        let capabilities: sqlops.DataProtocolServerCapabilities = {
            protocolVersion: constants.protocolVersion,
            providerName: this.providerId,
            providerDisplayName: localize('providerDisplayName', 'SQL Server big data cluster'),
            connectionProvider: undefined,
            adminServicesProvider: undefined,
            features: undefined
        };
        return Promise.resolve(capabilities);
    }
}

