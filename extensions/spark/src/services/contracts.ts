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
