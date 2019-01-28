/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as sqlops from 'sqlops';

const _typeof = {
	number: 'number',
	string: 'string',
	undefined: 'undefined',
	object: 'object',
	function: 'function'
};

/**
 * @returns whether the provided parameter is undefined or null.
 */
export function isUndefinedOrNull(obj: any): boolean {
	return isUndefined(obj) || obj === null;
}

/**
 * @returns whether the provided parameter is undefined.
 */
export function isUndefined(obj: any): boolean {
	return typeof (obj) === _typeof.undefined;
}

/**
 * A tree node in the object explorer tree
 *
 * @export
 * @interface ITreeNode
 */
export interface ITreeNode {
    getNodeInfo(): sqlops.NodeInfo;
    getChildren(refreshChildren: boolean): ITreeNode[] | Promise<ITreeNode[]>;
}

/**
 * A HDFS file node. This is a leaf node in the object explorer tree, and its contents
 * can be queried
 *
 * @export
 * @interface IFileNode
 * @extends {ITreeNode}
 */
export interface IFileNode extends ITreeNode {
    getFileContentsAsString(maxBytes?: number): Promise<string>;
}
