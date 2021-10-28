import * as vscode from 'vscode';
import { clearAppData, clearAppDataAndRestart, getAppPackageName, killApp, restartApp, revokeAppPermissions, setAppPackageName, startApp, uninstallApp } from './commands';

export function activate(context: vscode.ExtensionContext) {
  let getPackageDisposable = vscode.commands.registerCommand('adb-command-launcher.get-app-package-name',
    () => getAppPackageName(context));
  context.subscriptions.push(getPackageDisposable);

  let setPackageDisposable = vscode.commands.registerCommand('adb-command-launcher.set-app-package-name',
    () => setAppPackageName(context));
  context.subscriptions.push(setPackageDisposable);

  let uninstallDisposable = vscode.commands.registerCommand('adb-command-launcher.uninstall-app',
    () => uninstallApp(context));
  context.subscriptions.push(uninstallDisposable);

  let killDisposable = vscode.commands.registerCommand('adb-command-launcher.kill-app',
    () => killApp(context));
  context.subscriptions.push(killDisposable);

  let startDisposable = vscode.commands.registerCommand('adb-command-launcher.start-app',
    () => startApp(context));
  context.subscriptions.push(startDisposable);

  let restartDisposable = vscode.commands.registerCommand('adb-command-launcher.restart-app',
    () => restartApp(context));
  context.subscriptions.push(restartDisposable);

  let clearDataDisposable = vscode.commands.registerCommand('adb-command-launcher.clear-app-data',
    () => clearAppData(context));
  context.subscriptions.push(clearDataDisposable);

  let clearDataRestartDisposable = vscode.commands.registerCommand('adb-command-launcher.clear-app-data-restart',
    () => clearAppDataAndRestart(context));
  context.subscriptions.push(clearDataRestartDisposable);

  let revokePermissionsDisposable = vscode.commands.registerCommand('adb-command-launcher.revoke-permissions',
    () => revokeAppPermissions(context));
  context.subscriptions.push(revokePermissionsDisposable);
}

export function deactivate() { }
