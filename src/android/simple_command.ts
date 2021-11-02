import * as vscode from 'vscode';
import { getCurrentAndroidApplicationId } from '../app_identifier_provider';
import { warnAboutMissingAppId } from '../common_commands';
import { executeCommand } from '../util/exec_runner';

export type AdbCommandFunction = (appId: string, targetDevice: string) => string;
export type BuildSuccessMessageFunction = (appId: string) => string;
export type BuildErrorMessageFunction = (appId: string) => string;

export interface SimpleCommandArgs {
  isConnectedDeviceExpected: boolean,
  commands: Array<AdbCommandFunction>,
  successMessage: BuildSuccessMessageFunction,
  errorMessage: BuildErrorMessageFunction,
}

export const executeSimpleCommand = async (context: vscode.ExtensionContext, args: SimpleCommandArgs) => {
  let currentAppId = getCurrentAndroidApplicationId(context.workspaceState);

  if (args.isConnectedDeviceExpected && warnAboutMissingApplicationId(context)) { return; }

  let targetDevice = await chooseDeviceToRunCommandOn();
  if (args.isConnectedDeviceExpected && targetDevice.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands(args.commands.map((fn) => fn(currentAppId, targetDevice)),
    args.successMessage(currentAppId),
    args.errorMessage(currentAppId));
};

export const warnAboutMissingApplicationId = (context: vscode.ExtensionContext) =>
  warnAboutMissingAppId(() => getCurrentAndroidApplicationId(context.workspaceState));

export const chooseDeviceToRunCommandOn = async (): Promise<string> => {
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