/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';
import * as sqlops from 'sqlops';
import * as nls from 'vscode-nls';
import * as parser from 'htmlparser2';
import { DacFxDataModel } from '../api/models';
import { DataTierApplicationWizard } from '../dataTierApplicationWizard';
import { DacFxConfigPage } from '../api/dacFxConfigPage';

const localize = nls.loadMessageBundle();

export class DeployPlanPage extends DacFxConfigPage {

	protected readonly wizardPage: sqlops.window.modelviewdialog.WizardPage;
	protected readonly instance: DataTierApplicationWizard;
	protected readonly model: DacFxDataModel;
	protected readonly view: sqlops.ModelView;
	private form: sqlops.FormContainer;
	private table: sqlops.TableComponent;
	private loader: sqlops.LoadingComponent;

	public constructor(instance: DataTierApplicationWizard, wizardPage: sqlops.window.modelviewdialog.WizardPage, model: DacFxDataModel, view: sqlops.ModelView) {
		super(instance, wizardPage, model, view);
	}

	async start(): Promise<boolean> {
		this.table = this.view.modelBuilder.table().component();
		this.loader = this.view.modelBuilder.loadingComponent().withItem(this.table).component();

		this.form = this.view.modelBuilder.formContainer()
			.withFormItems(
				[
					{
						component: this.loader,
						title: ''
					}
				]).component();
		await this.view.initializeModel(this.form);

		return true;
	}

	async onPageEnter(): Promise<boolean> {
		await this.populateTable();
		this.loader.loading = false;
		return true;
	}

	private async populateTable() {
		let data = [];

		let report = await this.instance.upgradePlan();

		data = [];
		let currentOperation = '';
		let object = '';
		let p = new parser.Parser({
			onattribute: function (name, value) {
				if (name === 'Name') {
					currentOperation = value;
				} else if (name === 'Value') {
					object = value;
				} else if (name === 'Type') {
					let type = 'Type: ' + value;
					let obj = 'Object: ' + object;
					data.push([currentOperation, type + ', ' + obj]);
				}
			}
		}, { xmlMode: true, decodeEntities: true });

		p.parseChunk(report);

		this.table.updateProperties({
			data: data,
			columns: ['Operation', 'Action'],
			width: 700,
			height: 300
		});
	}

	public setupNavigationValidator() {
		this.instance.registerNavigationValidator(() => {
			return true;
		});
	}
}
