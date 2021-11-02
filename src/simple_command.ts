import * as vscode from 'vscode';
import { getCurrentAndroidApplicationId } from './app_identifier_provider';
import { warnAboutMissingAppId } from './common_commands';
import { executeCommand } from './util/exec_runner';

export type ChooseDeviceFunction = () => Promise<string>;
export type GetAppIdFunction = (storage: vscode.Memento) => string;
export type AdbCommandFunction = (appId: string, targetDeviceId: string) => string;
export type BuildSuccessMessageFunction = (appId: string) => string;
export type BuildErrorMessageFunction = (appId: string) => string;

export interface SimpleCommandArgs {
  isConnectedDeviceExpected: boolean,
  commands: Array<AdbCommandFunction>,
  successMessage: BuildSuccessMessageFunction,
  errorMessage: BuildErrorMessageFunction,
}

export const executeSimpleCommand = async (context: vscode.ExtensionContext,
  chooseDeviceToRunOn: ChooseDeviceFunction,
  getAppId: GetAppIdFunction,
  args: SimpleCommandArgs) => {
  let currentAppId = getAppId(context.workspaceState);

  if (args.isConnectedDeviceExpected && warnAboutMissingApplicationId(context)) { return; }

  let targetDeviceId = await chooseDeviceToRunOn();
  if (args.isConnectedDeviceExpected && targetDeviceId.length === 0) {
    vscode.window.showErrorMessage('Cannot choose target device to run command on');
    return;
  }

  await tryExecuteCommands(args.commands.map((fn) => fn(currentAppId, targetDeviceId)),
    args.successMessage(currentAppId),
    args.errorMessage(currentAppId));
};

export const warnAboutMissingApplicationId = (context: vscode.ExtensionContext) =>
  warnAboutMissingAppId(() => getCurrentAndroidApplicationId(context.workspaceState));

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