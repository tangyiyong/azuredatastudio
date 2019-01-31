/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import * as sqlops from 'sqlops';

import ControllerBase from './controllers/controllerBase';
import MainController from './controllers/mainController';
import { ApiWrapper } from './apiWrapper';
import { AppContext } from './appContext';

let controllers: ControllerBase[] = [];

export function activate(extensionContext: vscode.ExtensionContext) {
    sqlops.connection.getActiveConnections().then(cons => cons.forEach(con => console.log(con)));
    console.log('Congratulations, your extension "dummy" is now active!');

    // extensionContext.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', () => {
    //     // The code you place here will be executed every time your command is executed

    //      // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');
    // }));

    // extensionContext.subscriptions.push(vscode.commands.registerCommand('extension.showCurrentConnection', () => {
    //     // The code you place here will be executed every time your command is executed

    //      // Display a message box to the user
    //     sqlops.connection.getCurrentConnection().then(connection => {
    //         let connectionId = connection ? connection.connectionId : 'No connection found!';
    //         vscode.window.showInformationMessage(connectionId);
    //     }, error => {
    //          console.info(error);
    //     });
    // }));

    let appContext = new AppContext(extensionContext, new ApiWrapper());
    let activations: Promise<boolean>[] = [];

    // Start the main controller
    let mainController = new MainController(appContext);
    controllers.push(mainController);
    extensionContext.subscriptions.push(mainController);
    activations.push(mainController.activate());

    // return Promise.all(activations)
    //     .then((results: boolean[]) => {
    //         for (let result of results) {
    //             if (!result) {
    //                 //return false;
    //             }
    //         }
    //         let api: IExtensionApi = {
    //             async getDefaultConnection(): Promise<sqlops.ConnectionInfo> {
    //                 return new ApiWrapper().getCurrentConnection();
    //             },
    //             getObjectExplorerBrowser(): IObjectExplorerBrowser {
    //                 return {
    //                     getNode: (context: sqlops.ObjectExplorerContext) => {
    //                         let oeProvider = appContext.getService<HadoopObjectExplorerProvider>(constants.ObjectExplorerService);
    //                         return <any> oeProvider.findNodeForContext(context);
    //                     }
    //                 };
    //             }
    //         };
    //         return api;
    //     });
}

export function deactivate(): void {
    for (let controller of controllers) {
        controller.deactivate();
    }
}
