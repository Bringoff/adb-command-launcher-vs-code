import * as vscode from 'vscode';
import { findProjectAndroidApplicationId } from './android/app_package_name_detector';
import { findProjectIOSBundleIdentifier } from './ios/app_bundle_id_detector';
import { getCurrentAndroidApplicationId, getCurrentIOSApplicationId, setCurrentAndroidApplicationId, setCurrentIOSApplicationId } from './app_identifier_provider';
import AndroidCommandsExecutor from './android/commands';
import { Uri } from 'vscode';
import IOSCommandsExecutor from './ios/commands';

export async function activate(context: vscode.ExtensionContext) {
  const androidCommandsExecutor = new AndroidCommandsExecutor(context);
  const iOSCommandsExecutor = new IOSCommandsExecutor(context);

  registerAndroidCommands(context, androidCommandsExecutor);
  registerIOSCommands(context, iOSCommandsExecutor);

  await checkAndroidApplicationId(context, androidCommandsExecutor);
}

const registerAndroidCommands = (context: vscode.ExtensionContext, commandsExecutor: AndroidCommandsExecutor) => {
  let getPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.get-android-app-application-id',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.getApplicationId()));
  context.subscriptions.push(getPackageDisposable);

  let setPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.set-android-app-application-id',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.setApplicationId()));
  context.subscriptions.push(setPackageDisposable);

  let uninstallDisposable = vscode.commands.registerCommand('mobile-command-launcher.uninstall-android-app',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.uninstallApp()));
  context.subscriptions.push(uninstallDisposable);

  let killDisposable = vscode.commands.registerCommand('mobile-command-launcher.kill-android-app',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.killApp()));
  context.subscriptions.push(killDisposable);

  let startDisposable = vscode.commands.registerCommand('mobile-command-launcher.start-android-app',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.startApp()));
  context.subscriptions.push(startDisposable);

  let restartDisposable = vscode.commands.registerCommand('mobile-command-launcher.restart-android-app',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.restartApp()));
  context.subscriptions.push(restartDisposable);

  let clearDataDisposable = vscode.commands.registerCommand('mobile-command-launcher.clear-android-app-data',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.clearAppData()));
  context.subscriptions.push(clearDataDisposable);

  let clearDataRestartDisposable = vscode.commands.registerCommand('mobile-command-launcher.clear-android-app-data-restart',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.clearAppDataAndRestart()));
  context.subscriptions.push(clearDataRestartDisposable);

  let revokePermissionsDisposable = vscode.commands.registerCommand('mobile-command-launcher.revoke-android-permissions',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.revokeAppPermissions()));
  context.subscriptions.push(revokePermissionsDisposable);

  let restartAdbServerDisposable = vscode.commands.registerCommand('mobile-command-launcher.restart-android-adb-server',
    () => checkAndroidApplicationId(context, commandsExecutor).then(() => commandsExecutor.restartAdbServer()));
  context.subscriptions.push(restartAdbServerDisposable);
};

const registerIOSCommands = (context: vscode.ExtensionContext, commandsExecutor: IOSCommandsExecutor) => {
  let getPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.get-ios-app-application-id',
    () => checkIOSApplicationId(context, commandsExecutor).then(() => commandsExecutor.getApplicationId()));
  context.subscriptions.push(getPackageDisposable);

  let setPackageDisposable = vscode.commands.registerCommand('mobile-command-launcher.set-ios-app-application-id',
    () => checkIOSApplicationId(context, commandsExecutor).then(() => commandsExecutor.setApplicationId()));
  context.subscriptions.push(setPackageDisposable);
};

const checkAndroidApplicationId = async (context: vscode.ExtensionContext, commandsExecutor: AndroidCommandsExecutor) => {
  await checkApplicationId(context, () => getCurrentAndroidApplicationId(context.workspaceState),
    (workspaceFolders) => findProjectAndroidApplicationId(workspaceFolders),
    (appId) => setCurrentAndroidApplicationId(context.workspaceState, appId),
    commandsExecutor.setApplicationId);
};

const checkIOSApplicationId = async (context: vscode.ExtensionContext, commandsExecutor: IOSCommandsExecutor) => {
  await checkApplicationId(context, () => getCurrentIOSApplicationId(context.workspaceState),
    (workspaceFolders) => findProjectIOSBundleIdentifier(workspaceFolders),
    (appId) => setCurrentIOSApplicationId(context.workspaceState, appId),
    commandsExecutor.setApplicationId);
};

const checkApplicationId = async (context: vscode.ExtensionContext, getCurrentPackage: () => string,
  findAppId: (workspaceFolders: Array<Uri>) => Promise<string>,
  saveAppId: (appPackage: string) => Thenable<void>,
  askForAppId: () => Promise<void>,) => {
  if (getCurrentPackage().length === 0) {
    const detectedAppId = await findAppId(
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) ?? []);

    if (detectedAppId.length > 0) {
      await saveAppId(detectedAppId);
      vscode.window.showInformationMessage(`Mobile Command Launcher: ${detectedAppId} is detected application id`);
    } else {
      askForAppId();
    }
  }
};

export function deactivate() { }
