import * as vscode from 'vscode';
import { findProjectAndroidAppPackageName } from './android/app_package_detector';
import { findProjectIOSAppIdentifier } from './ios/app_package_detector';
import { getCurrentAndroidPackageName, getCurrentIOSPackageName, setCurrentAndroidPackageName, setCurrentIOSPackageName } from './app_package_provider';
import AndroidCommandsExecutor from './android/commands';
import { Uri } from 'vscode';
import IOSCommandsExecutor from './ios/commands';

export async function activate(context: vscode.ExtensionContext) {
  const androidCommandsExecutor = new AndroidCommandsExecutor(context);
  const iOSCommandsExecutor = new IOSCommandsExecutor(context);

  registerAndroidCommands(context, androidCommandsExecutor);
  registerIOSCommands(context, iOSCommandsExecutor);

  await checkAndroidAppPackageName(context, androidCommandsExecutor);
}

const registerAndroidCommands = (context: vscode.ExtensionContext, commandsExecutor: AndroidCommandsExecutor) => {
  let getPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.get-android-app-package-name',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.getAppPackageName()));
  context.subscriptions.push(getPackageDisposable);

  let setPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.set-android-app-package-name',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.setAppPackageName()));
  context.subscriptions.push(setPackageDisposable);

  let uninstallDisposable = vscode.commands.registerCommand('mobile-command-launcher.uninstall-android-app',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.uninstallApp()));
  context.subscriptions.push(uninstallDisposable);

  let killDisposable = vscode.commands.registerCommand('mobile-command-launcher.kill-android-app',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.killApp()));
  context.subscriptions.push(killDisposable);

  let startDisposable = vscode.commands.registerCommand('mobile-command-launcher.start-android-app',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.startApp()));
  context.subscriptions.push(startDisposable);

  let restartDisposable = vscode.commands.registerCommand('mobile-command-launcher.restart-android-app',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.restartApp()));
  context.subscriptions.push(restartDisposable);

  let clearDataDisposable = vscode.commands.registerCommand('mobile-command-launcher.clear-android-app-data',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.clearAppData()));
  context.subscriptions.push(clearDataDisposable);

  let clearDataRestartDisposable = vscode.commands.registerCommand('mobile-command-launcher.clear-android-app-data-restart',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.clearAppDataAndRestart()));
  context.subscriptions.push(clearDataRestartDisposable);

  let revokePermissionsDisposable = vscode.commands.registerCommand('mobile-command-launcher.revoke-android-permissions',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.revokeAppPermissions()));
  context.subscriptions.push(revokePermissionsDisposable);

  let restartAdbServerDisposable = vscode.commands.registerCommand('mobile-command-launcher.restart-android-adb-server',
    () => checkAndroidAppPackageName(context, commandsExecutor).then(() => commandsExecutor.restartAdbServer()));
  context.subscriptions.push(restartAdbServerDisposable);
};

const registerIOSCommands = (context: vscode.ExtensionContext, commandsExecutor: IOSCommandsExecutor) => {
  let getPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.get-ios-app-package-name',
    () => checkIOSAppPackageName(context, commandsExecutor).then(() => commandsExecutor.getAppPackageName()));
  context.subscriptions.push(getPackageDisposable);

  let setPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.set-ios-app-package-name',
    () => checkIOSAppPackageName(context, commandsExecutor).then(() => commandsExecutor.setAppPackageName()));
  context.subscriptions.push(setPackageDisposable);
};

const checkAndroidAppPackageName = async (context: vscode.ExtensionContext, commandsExecutor: AndroidCommandsExecutor) => {
  await checkAppPackageName(context, () => getCurrentAndroidPackageName(context.workspaceState),
    (workspaceFolders) => findProjectAndroidAppPackageName(workspaceFolders),
    (appPackage) => setCurrentAndroidPackageName(context.workspaceState, appPackage),
    commandsExecutor.setAppPackageName);
};

const checkIOSAppPackageName = async (context: vscode.ExtensionContext, commandsExecutor: IOSCommandsExecutor) => {
  await checkAppPackageName(context, () => getCurrentIOSPackageName(context.workspaceState),
    (workspaceFolders) => findProjectIOSAppIdentifier(workspaceFolders),
    (appPackage) => setCurrentIOSPackageName(context.workspaceState, appPackage),
    commandsExecutor.setAppPackageName);
};

const checkAppPackageName = async (context: vscode.ExtensionContext, getCurrentPackage: () => string,
  findAppPackage: (workspaceFolders: Array<Uri>) => Promise<string>,
  saveAppPackage: (appPackage: string) => Thenable<void>,
  askForAppPackage: () => Promise<void>,) => {
  if (getCurrentPackage().length === 0) {
    const detectedAppPackageName = await findAppPackage(
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) ?? []);

    if (detectedAppPackageName.length > 0) {
      await saveAppPackage(detectedAppPackageName);
      vscode.window.showInformationMessage(`ADB Command Launcher: ${detectedAppPackageName} is detected package name`);
    } else {
      askForAppPackage();
    }
  }
};

export function deactivate() { }
