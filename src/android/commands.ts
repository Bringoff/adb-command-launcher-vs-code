import * as vscode from 'vscode';
import { getCurrentAndroidApplicationId, setCurrentAndroidApplicationId } from '../app_identifier_provider';
import { chooseDeviceToRunCommandOn, executeSimpleCommand, warnAboutMissingApplicationId } from './simple_command';
import { executeCommand } from '../util/exec_runner';
import { getApplicationId as commonGetApplicationId, setApplicationId as commonSetApplicationId } from '../common_commands';


export default class AndroidCommandsExecutor {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getApplicationId = () => commonGetApplicationId(() => getCurrentAndroidApplicationId(this.context.workspaceState));

  setApplicationId = async () => commonSetApplicationId((appId) => setCurrentAndroidApplicationId(this.context.workspaceState, appId));

  uninstallApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildUninstallCommand,
      ],
      successMessage: (currentAppId) => `Uninstalled ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to uninstall ${currentAppId}`,
    });

  killApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildKillCommand,
      ],
      successMessage: (currentAppId) => `Killed ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to kill ${currentAppId}`,
    });

  startApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildStartCommand,
      ],
      successMessage: (currentAppId) => `Started ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to start ${currentAppId}`,
    });

  restartApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildKillCommand,
        this.buildStartCommand,
      ],
      successMessage: (currentAppId) => `Restarted ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to restart ${currentAppId}`,
    });

  clearAppData = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildClearDataCommand,
      ],
      successMessage: (currentAppId) => `Cleared ${currentAppId} data successfuly`,
      errorMessage: (currentAppId) => `Failed to clear ${currentAppId} data`,
    });

  clearAppDataAndRestart = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildClearDataCommand,
        this.buildKillCommand,
        this.buildStartCommand
      ],
      successMessage: (currentAppId) => `Cleared ${currentAppId} data and restarted successfuly`,
      errorMessage: (currentAppId) => `Failed to clear ${currentAppId} data and restart`,
    });

  revokeAppPermissions = async () => {
    if (warnAboutMissingApplicationId(this.context)) { return; }
    let currentAppId = getCurrentAndroidApplicationId(this.context.workspaceState);

    let targetDevice = await chooseDeviceToRunCommandOn();
    if (targetDevice.length === 0) {
      vscode.window.showErrorMessage('Cannot choose target device to run command on');
      return;
    }

    let grantedPermissions = (await executeCommand(`adb -s ${targetDevice} shell dumpsys package ${currentAppId}`) as string)
      .split('\n')
      .filter((line) => line.indexOf('permission') >= 0 && line.indexOf('granted=true') >= 0)
      .map((line) => line.split(':')[0].trim());

    let revokeCommands = grantedPermissions.map(
      (permission) => `adb -s ${targetDevice} shell pm revoke ${currentAppId} ${permission}`);

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
        `Failed revoke ${currentAppId} permissions, probably no runtime permission was granted`);
    } else {
      vscode.window.showInformationMessage(`Revoked ${currentAppId} permissions successfuly`);
    }
  };

  restartAdbServer = async () => {
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: false,
      commands: [
        this.buildKillAdbServerCommand,
        this.buildStartAdbServerCommand
      ],
      successMessage: () => `Restarted ADB Server successfuly`,
      errorMessage: () => `Failed to restart ADB Server`,
    });
  };

  private buildUninstallCommand = (appId: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} uninstall ${appId}`;
  };

  private buildClearDataCommand = (appId: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} shell pm clear ${appId}`;
  };

  private buildKillCommand = (appId: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} shell am force-stop ${appId}`;
  };

  private buildStartCommand = (appId: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} shell monkey - p ${appId} -c android.intent.category.LAUNCHER 1`;
  };

  private buildKillAdbServerCommand = (): string => 'adb kill-server';

  private buildStartAdbServerCommand = (): string => 'adb start-server';
}