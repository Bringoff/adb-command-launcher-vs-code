import * as vscode from 'vscode';
import { getCurrentPackageName, setCurrentPackageName } from './app_package_provider';
import { isValidPackageName } from './util/app_package_validator';
import { executeCommand } from './util/exec_runner';

const warnAboutMissingAppPackageName = (context: vscode.ExtensionContext): boolean => {
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  if (currentPackageName.length === 0) {
    vscode.window.showInformationMessage('No package name currently set');
    return true;
  }

  return false;
};

const tryExecuteCommands = async (
  commands: Array<string>, successMessage: string, errorMessage: string) => {
  try {
    for (let command of commands) {
      await executeCommand(command);
    }
    vscode.window.showInformationMessage(successMessage);
  } catch (err) {
    vscode.window.showErrorMessage(`${errorMessage} : ${err}`);
  }
};

const buildClearDataCommand = (packageName: string): string => {
  return `adb shell pm clear ${packageName}`;
};

const buildKillCommand = (packageName: string): string => {
  return `adb shell am force-stop ${packageName}`;
};

const buildStartCommand = (packageName: string): string => {
  return `adb shell monkey - p ${packageName} -c android.intent.category.LAUNCHER 1`;
};

export const getAppPackageName = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }

  let currentPackageName = getCurrentPackageName(context.workspaceState);
  vscode.window.showInformationMessage(currentPackageName);
};

export const setAppPackageName = async (context: vscode.ExtensionContext) => {
  let inputPackage = await vscode.window.showInputBox() ?? '';

  if (inputPackage.length > 0 && !isValidPackageName(inputPackage)) {
    await vscode.window.showErrorMessage('Invalid Android app Package Name');
    return;
  }

  await setCurrentPackageName(context.workspaceState, inputPackage);
};

export const uninstallApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  await tryExecuteCommands([`adb uninstall ${currentPackageName} `],
    `Uninstalled ${currentPackageName} successfuly`,
    `Failed to uninstall ${currentPackageName}`);
};

export const killApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  await tryExecuteCommands([buildKillCommand(currentPackageName)],
    `Killed ${currentPackageName} successfuly`,
    `Failed to kill ${currentPackageName}`);
};

export const startApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  await tryExecuteCommands([buildStartCommand(currentPackageName)],
    `Started ${currentPackageName} successfuly`,
    `Failed to start ${currentPackageName}`);
};

export const restartApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  await tryExecuteCommands([
    buildKillCommand(currentPackageName),
    buildStartCommand(currentPackageName),
  ],
    `Restarted ${currentPackageName} successfuly`,
    `Failed to restart ${currentPackageName}`);
};

export const clearAppData = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  await tryExecuteCommands([buildClearDataCommand(currentPackageName)],
    `Cleared ${currentPackageName} data successfuly`,
    `Failed to clear ${currentPackageName} data`);
};

export const clearAppDataAndRestart = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  await tryExecuteCommands([
    buildClearDataCommand(currentPackageName),
    buildKillCommand(currentPackageName),
    buildStartCommand(currentPackageName),
  ],
    `Cleared ${currentPackageName} data and restarted successfuly`,
    `Failed to clear ${currentPackageName} data and restart`);
};

export const revokeAppPermissions = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let grantedPermissions = (await executeCommand(`adb shell dumpsys package ${currentPackageName}`) as string)
    .split('\n')
    .filter((line) => line.indexOf('permission') >= 0 && line.indexOf('granted=true') >= 0)
    .map((line) => line.split(':')[0].trim());

  let revokeCommands = grantedPermissions.map(
    (permission) => `adb shell pm revoke ${currentPackageName} ${permission}`);

  let failedRevokes = 0;
  for (let command of revokeCommands) {
    try {
      await executeCommand(command);
    } catch (err) {
      failedRevokes++;
    }
  }

  if (failedRevokes === revokeCommands.length) {
    vscode.window.showErrorMessage(
      `Failed revoke ${currentPackageName} permissions, probably no runtime permission was granted`);
  } else {
    vscode.window.showInformationMessage(`Revoked ${currentPackageName} permissions successfuly`);
  }
};
