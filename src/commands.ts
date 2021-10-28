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

const chooseDeviceToRunCommandOn = async (context: vscode.ExtensionContext): Promise<string> => {
  let activeDevices = (await executeCommand(`adb devices`) as string)
    .split('\n')
    .filter((_, index) => index > 0)
    .map((line) => line.split('\t')[0].trim());
  if (activeDevices.length === 0) { return ''; }
  if (activeDevices.length === 1) { return activeDevices[0]; }

  let userSelectedDevice = await vscode.window.showQuickPick(
    activeDevices,
    {
      title: 'Choose target device',
      canPickMany: false,
    }
  );

  return userSelectedDevice ?? '';
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
};

export const uninstallApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands([`adb -s ${targetDevice} uninstall ${currentPackageName} `],
    `Uninstalled ${currentPackageName} successfuly`,
    `Failed to uninstall ${currentPackageName}`);
};

export const killApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands([buildKillCommand(currentPackageName, targetDevice)],
    `Killed ${currentPackageName} successfuly`,
    `Failed to kill ${currentPackageName}`);
};

export const startApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands([buildStartCommand(currentPackageName, targetDevice)],
    `Started ${currentPackageName} successfuly`,
    `Failed to start ${currentPackageName}`);
};

export const restartApp = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands([
    buildKillCommand(currentPackageName, targetDevice),
    buildStartCommand(currentPackageName, targetDevice),
  ],
    `Restarted ${currentPackageName} successfuly`,
    `Failed to restart ${currentPackageName}`);
};

export const clearAppData = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands([buildClearDataCommand(currentPackageName, targetDevice)],
    `Cleared ${currentPackageName} data successfuly`,
    `Failed to clear ${currentPackageName} data`);
};

export const clearAppDataAndRestart = async (context: vscode.ExtensionContext) => {
  if (warnAboutMissingAppPackageName(context)) { return; }
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands([
    buildClearDataCommand(currentPackageName, targetDevice),
    buildKillCommand(currentPackageName, targetDevice),
    buildStartCommand(currentPackageName, targetDevice),
  ],
    `Cleared ${currentPackageName} data and restarted successfuly`,
    `Failed to clear ${currentPackageName} data and restart`);
};

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
