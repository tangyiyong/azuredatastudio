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

export enum tagName {
	Alert = 'Alert',
	Operation = 'Operation',
}

export class DeployPlanPage extends DacFxConfigPage {

	protected readonly wizardPage: sqlops.window.modelviewdialog.WizardPage;
	protected readonly instance: DataTierApplicationWizard;
	protected readonly model: DacFxDataModel;
	protected readonly view: sqlops.ModelView;
	private form: sqlops.FormContainer;
	private table: sqlops.TableComponent;
	private loader: sqlops.LoadingComponent;
	private dataLossCheckbox: sqlops.CheckBoxComponent;

	public constructor(instance: DataTierApplicationWizard, wizardPage: sqlops.window.modelviewdialog.WizardPage, model: DacFxDataModel, view: sqlops.ModelView) {
		super(instance, wizardPage, model, view);
	}

	async start(): Promise<boolean> {
		this.table = this.view.modelBuilder.table().component();
		this.loader = this.view.modelBuilder.loadingComponent().withItem(this.table).component();
		let dataLossCheckboxComponent = await this.createDataLossCheckbox();

		this.form = this.view.modelBuilder.formContainer()
			.withFormItems(
				[
					{
						component: this.loader,
						title: ''
					},
					dataLossCheckboxComponent
				], {
					horizontal: true,
				}).component();
		await this.view.initializeModel(this.form);

		return true;
	}

	async onPageEnter(): Promise<boolean> {
		this.dataLossCheckbox.enabled = false;
		await this.populateTable();
		this.loader.loading = false;
		this.dataLossCheckbox.enabled = true;
		return true;
	}

	private async populateTable() {
		let data = [];

		let report = await this.instance.upgradePlan();
		console.error('report is ' + report);

		data = [];
		let alerts = new Map<string, string>();
		let currentOperation = '';
		let object = '';
		let type = '';
		let dataIssueAlert = false;
		let issue = '';
		let dataloss = false;
		let currentTag: tagName;

		let p = new parser.Parser({
			onopentagname(name) {
				if (name === 'Alert') {
					currentTag = tagName.Alert;
				} else if (name === 'Operation') {
					currentTag = tagName.Operation;
				}
			},
			onattribute: function (name, value) {
				if (name === 'Name') {
					if (currentTag === tagName.Alert) {
						if (value === 'DataIssue') {
							dataIssueAlert = true;
						}
					} else {
						currentOperation = value;
					}
				} else if (name === 'Value') {
					if (currentTag === tagName.Alert && dataIssueAlert) {
						issue = value;
					} else {
						object = value;
					}
				} else if (name === 'Type') {
					type = value;
				} else if (name === 'Id') {
					if (currentTag === tagName.Alert && dataIssueAlert) {
						alerts.set(value, issue);
					} else if (currentTag === tagName.Operation) {
						if (alerts.get(value)) {
							dataloss = true;
						}
					}
				}
			},
			onclosetag: function (name) {
				if (name === 'Item') {
					let isDataLoss = dataloss ? 'true' : '';
					let op = 'Operation: ' + currentOperation;
					let objtype = 'Type: ' + type;
					let obj = 'Object: ' + object;
					data.push([isDataLoss, op + ', ' + objtype + ', ' + obj]);

					dataloss = false;
				}
			}
		}, { xmlMode: true, decodeEntities: true });

		p.parseChunk(report);

		this.table.updateProperties({
			data: data,
			columns: ['Data Loss', 'Action'],
			width: 700,
			height: 300
		});
	}

	private async createDataLossCheckbox(): Promise<sqlops.FormComponent> {
		this.dataLossCheckbox = this.view.modelBuilder.checkBox()
			.withProperties({
				label: localize('dacFx.dataLossCheckbox', 'Proceed despite possible data loss'),
			}).component();

		this.dataLossCheckbox.onChanged(() => {

		});

		return {
			component: this.dataLossCheckbox,
			title: '',
			required: true
		};
	}


	public setupNavigationValidator() {
		this.instance.registerNavigationValidator(() => {
			return true;
		});
	}
}
