import * as vscode from 'vscode';
import { getCurrentIOSPackageName, setCurrentIOSPackageName } from '../app_package_provider';
import { getAppPackageName as commonGetAppPackageName, setAppPackageName as commonSetAppPackageName } from '../common_commands';

export default class IOSCommandsExecutor {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getAppPackageName = () => commonGetAppPackageName(() => getCurrentIOSPackageName(this.context.workspaceState));

  setAppPackageName = async () => commonSetAppPackageName((appPackageName) => setCurrentIOSPackageName(this.context.workspaceState, appPackageName));
}