import * as vscode from 'vscode';
import { getCurrentPackageName, setCurrentPackageName } from './app_package_provider';
import { chooseDeviceToRunCommandOn, executeSimpleCommand, warnAboutMissingAppPackageName } from './simple_command';
import { isValidPackageName } from './util/app_package_validator';
import { executeCommand } from './util/exec_runner';

const buildUninstallCommand = (packageName: string, targetDevice: string): string => {
  return `adb -s ${targetDevice} uninstall ${packageName}`;
};

const buildClearDataCommand = (packageName: string, targetDevice: string): string => {
  return `adb -s ${targetDevice} shell pm clear ${packageName}`;
};

const buildKillCommand = (packageName: string, targetDevice: string): string => {
  return `adb -s ${targetDevice} shell am force-stop ${packageName}`;
};

const buildStartCommand = (packageName: string, targetDevice: string): string => {
  return `adb -s ${targetDevice} shell monkey - p ${packageName} -c android.intent.category.LAUNCHER 1`;
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
  await vscode.window.showInformationMessage(`${inputPackage} package name selected`);
};

export const uninstallApp = async (context: vscode.ExtensionContext) =>
  executeSimpleCommand(context, {
    commands: [
      buildUninstallCommand,
    ],
    successMessage: (currentPackageName) => `Uninstalled ${currentPackageName} successfuly`,
    errorMessage: (currentPackageName) => `Failed to uninstall ${currentPackageName}`,
  });

export const killApp = async (context: vscode.ExtensionContext) =>
  executeSimpleCommand(context, {
    commands: [
      buildKillCommand,
    ],
    successMessage: (currentPackageName) => `Killed ${currentPackageName} successfuly`,
    errorMessage: (currentPackageName) => `Failed to kill ${currentPackageName}`,
  });

export const startApp = async (context: vscode.ExtensionContext) =>
  executeSimpleCommand(context, {
    commands: [
      buildStartCommand,
    ],
    successMessage: (currentPackageName) => `Started ${currentPackageName} successfuly`,
    errorMessage: (currentPackageName) => `Failed to start ${currentPackageName}`,
  });

export const restartApp = async (context: vscode.ExtensionContext) =>
  executeSimpleCommand(context, {
    commands: [
      buildKillCommand,
      buildStartCommand,
    ],
    successMessage: (currentPackageName) => `Restarted ${currentPackageName} successfuly`,
    errorMessage: (currentPackageName) => `Failed to restart ${currentPackageName}`,
  });

export const clearAppData = async (context: vscode.ExtensionContext) =>
  executeSimpleCommand(context, {
    commands: [
      buildClearDataCommand,
    ],
    successMessage: (currentPackageName) => `Cleared ${currentPackageName} data successfuly`,
    errorMessage: (currentPackageName) => `Failed to clear ${currentPackageName} data`,
  });

export const clearAppDataAndRestart = async (context: vscode.ExtensionContext) =>
  executeSimpleCommand(context, {
    commands: [
      buildClearDataCommand,
      buildKillCommand,
      buildStartCommand
    ],
    successMessage: (currentPackageName) => `Cleared ${currentPackageName} data and restarted successfuly`,
    errorMessage: (currentPackageName) => `Failed to clear ${currentPackageName} data and restart`,
  });

export const revokeAppPermissions = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  let grantedPermissions = (await executeCommand(`adb -s ${targetDevice} shell dumpsys package ${currentPackageName}`) as string)
    .split('\n')
    .filter((line) => line.indexOf('permission') >= 0 && line.indexOf('granted=true') >= 0)
    .map((line) => line.split(':')[0].trim());

  let revokeCommands = grantedPermissions.map(
    (permission) => `adb -s ${targetDevice} shell pm revoke ${currentPackageName} ${permission}`);

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
