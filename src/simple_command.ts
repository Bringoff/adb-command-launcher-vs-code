import * as vscode from 'vscode';
import { getCurrentPackageName } from './app_package_provider';
import { executeCommand } from './util/exec_runner';

export type AdbCommandFunction = (packageName: string, targetDevice: string) => string;
export type BuildSuccessMessageFunction = (packageName: string) => string;
export type BuildErrorMessageFunction = (packageName: string) => string;

export interface SimpleCommandArgs {
  isConnectedDeviceExpected: boolean,
  commands: Array<AdbCommandFunction>,
  successMessage: BuildSuccessMessageFunction,
  errorMessage: BuildErrorMessageFunction,
}

export const executeSimpleCommand = async (context: vscode.ExtensionContext, args: SimpleCommandArgs) => {
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  if (args.isConnectedDeviceExpected && warnAboutMissingAppPackageName(context)) { return; }

  let targetDevice = await chooseDeviceToRunCommandOn(context);
  if (args.isConnectedDeviceExpected && targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands(args.commands.map((fn) => fn(currentPackageName, targetDevice)),
    args.successMessage(currentPackageName),
    args.errorMessage(currentPackageName));
};

export const warnAboutMissingAppPackageName = (context: vscode.ExtensionContext): boolean => {
  let currentPackageName = getCurrentPackageName(context.workspaceState);

  if (currentPackageName.length === 0) {
    vscode.window.showInformationMessage('No package name currently set');
    return true;
  }

  return false;
};

export const chooseDeviceToRunCommandOn = async (context: vscode.ExtensionContext): Promise<string> => {
  let activeDevices = (await executeCommand(`adb devices`) as string)
    .split('\n')
    .filter((_, index) => index > 0)
    .map((line) => line.split('\t')[0].trim())
    .filter((line) => line.length > 0);
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