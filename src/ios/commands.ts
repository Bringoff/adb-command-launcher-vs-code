import * as vscode from 'vscode';
import { getCurrentIOSApplicationId, setCurrentIOSApplicationId } from '../app_identifier_provider';
import { getApplicationId as commonGetApplicationId, setApplicationId as commonSetApplicationId } from '../common_commands';

export default class IOSCommandsExecutor {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getApplicationId = () => commonGetApplicationId(() => getCurrentIOSApplicationId(this.context.workspaceState));

  setApplicationId = async () => commonSetApplicationId((appId) => setCurrentIOSApplicationId(this.context.workspaceState, appId));
}