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

export enum attributeName {
	Name = 'Name',
	Value = 'Value',
	Type = 'Type',
	Id = 'Id'
}

export class TableObject {
	object: string;
	type: string;
	dataloss: boolean;
}

export class DeployPlanPage extends DacFxConfigPage {

	protected readonly wizardPage: sqlops.window.modelviewdialog.WizardPage;
	protected readonly instance: DataTierApplicationWizard;
	protected readonly model: DacFxDataModel;
	protected readonly view: sqlops.ModelView;
	private formBuilder: sqlops.FormBuilder;
	private form: sqlops.FormContainer;
	private table: sqlops.TableComponent;
	private loader: sqlops.LoadingComponent;
	private dataLossComponent: sqlops.FormComponent;

	public constructor(instance: DataTierApplicationWizard, wizardPage: sqlops.window.modelviewdialog.WizardPage, model: DacFxDataModel, view: sqlops.ModelView) {
		super(instance, wizardPage, model, view);
	}

	async start(): Promise<boolean> {
		this.table = this.view.modelBuilder.table().component();
		this.loader = this.view.modelBuilder.loadingComponent().withItem(this.table).component();
		this.dataLossComponent = await this.createDataLossCheckbox();

		this.formBuilder = this.view.modelBuilder.formContainer()
			.withFormItems(
				[
					{
						component: this.loader,
						title: ''
					}
				], {
					horizontal: true,
				});
		this.form = this.formBuilder.component();
		await this.view.initializeModel(this.form);

		return true;
	}

	async onPageEnter(): Promise<boolean> {
		this.table.data = [];
		this.formBuilder.removeFormItem(this.dataLossComponent);

		this.loader.loading = true;
		await this.populateTable();
		this.loader.loading = false;
		return true;
	}

	private async populateTable() {
		let data = [];

		let report = await this.instance.upgradePlan();

		data = [];
		let dataLossAlerts = new Map<string, string>();
		let currentOperation = '';
		let dataIssueAlert = false;
		let issue = '';
		let currentTag: tagName;
		let currentTableObj: TableObject;

		let p = new parser.Parser({
			onopentagname(name) {
				if (name === 'Alert') {
					currentTag = tagName.Alert;
				} else if (name === 'Operation') {
					currentTag = tagName.Operation;
					currentTableObj = new TableObject();
				}
			},
			onattribute: function (name, value) {
				if (currentTag === tagName.Alert) {
					switch (name) {
						case attributeName.Name: {
							// only care about showing data loss alerts
							if (value === 'DataIssue') {
								dataIssueAlert = true;
							}
							break;
						}
						case attributeName.Value: {
							if (dataIssueAlert) {
								issue = value;
							}
						}
						case attributeName.Id: {
							if (dataIssueAlert) {
								dataLossAlerts.set(value, issue);
							}
							break;
						}
					}
				} else if (currentTag === tagName.Operation) {
					switch (name) {
						case attributeName.Name: {
							currentOperation = value;
							break;
						}
						case attributeName.Value: {
							currentTableObj.object = value;
							break;
						}
						case attributeName.Type: {
							currentTableObj.type = value;
							break;
						}
						case attributeName.Id: {
							if (dataLossAlerts.get(value)) {
								currentTableObj.dataloss = true;
							}
							break;
						}
					}
				}
			},
			onclosetag: function (name) {
				// add table entry for the operation item
				if (name === 'Item') {
					let isDataLoss = currentTableObj.dataloss ? '✔' : '';
					let operation = 'Operation: ' + currentOperation;
					let objtype = 'Type: ' + currentTableObj.type;
					let obj = 'Object: ' + currentTableObj.object;
					data.push([isDataLoss, operation + ', ' + objtype + ', ' + obj]);
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

		if (dataLossAlerts.size > 0) {
			this.formBuilder.addFormItem(this.dataLossComponent, { horizontal: true });
		}
	}

	private async createDataLossCheckbox(): Promise<sqlops.FormComponent> {
		let dataLossCheckbox = this.view.modelBuilder.checkBox()
			.withProperties({
				label: localize('dacFx.dataLossCheckbox', 'Proceed despite possible data loss'),
			}).component();

		dataLossCheckbox.onChanged(() => {
		});

		dataLossCheckbox.checked = true;
		return {
			component: dataLossCheckbox,
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
