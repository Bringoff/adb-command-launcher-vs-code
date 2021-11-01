import * as vscode from 'vscode';
import { getCurrentAndroidPackageName, setCurrentAndroidPackageName } from '../app_package_provider';
import { chooseDeviceToRunCommandOn, executeSimpleCommand, warnAboutMissingAppPackageName } from './simple_command';
import { executeCommand } from '../util/exec_runner';
import { getAppPackageName as commonGetAppPackageName, setAppPackageName as commonSetAppPackageName } from '../common_commands';


export default class AndroidCommandsExecutor {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getAppPackageName = () => commonGetAppPackageName(() => getCurrentAndroidPackageName(this.context.workspaceState));

  setAppPackageName = async () => commonSetAppPackageName((appPackageName) => setCurrentAndroidPackageName(this.context.workspaceState, appPackageName));

  uninstallApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildUninstallCommand,
      ],
      successMessage: (currentPackageName) => `Uninstalled ${currentPackageName} successfuly`,
      errorMessage: (currentPackageName) => `Failed to uninstall ${currentPackageName}`,
    });

  killApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildKillCommand,
      ],
      successMessage: (currentPackageName) => `Killed ${currentPackageName} successfuly`,
      errorMessage: (currentPackageName) => `Failed to kill ${currentPackageName}`,
    });

  startApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildStartCommand,
      ],
      successMessage: (currentPackageName) => `Started ${currentPackageName} successfuly`,
      errorMessage: (currentPackageName) => `Failed to start ${currentPackageName}`,
    });

  restartApp = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildKillCommand,
        this.buildStartCommand,
      ],
      successMessage: (currentPackageName) => `Restarted ${currentPackageName} successfuly`,
      errorMessage: (currentPackageName) => `Failed to restart ${currentPackageName}`,
    });

  clearAppData = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildClearDataCommand,
      ],
      successMessage: (currentPackageName) => `Cleared ${currentPackageName} data successfuly`,
      errorMessage: (currentPackageName) => `Failed to clear ${currentPackageName} data`,
    });

  clearAppDataAndRestart = async () =>
    executeSimpleCommand(this.context, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildClearDataCommand,
        this.buildKillCommand,
        this.buildStartCommand
      ],
      successMessage: (currentPackageName) => `Cleared ${currentPackageName} data and restarted successfuly`,
      errorMessage: (currentPackageName) => `Failed to clear ${currentPackageName} data and restart`,
    });

  revokeAppPermissions = async () => {
    if (warnAboutMissingAppPackageName(this.context)) { return; }
    let currentPackageName = getCurrentAndroidPackageName(this.context.workspaceState);

    let targetDevice = await chooseDeviceToRunCommandOn(this.context);
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

  private buildUninstallCommand = (packageName: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} uninstall ${packageName}`;
  };

  private buildClearDataCommand = (packageName: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} shell pm clear ${packageName}`;
  };

  private buildKillCommand = (packageName: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} shell am force-stop ${packageName}`;
  };

  private buildStartCommand = (packageName: string, targetDevice: string): string => {
    return `adb -s ${targetDevice} shell monkey - p ${packageName} -c android.intent.category.LAUNCHER 1`;
  };

  private buildKillAdbServerCommand = (): string => 'adb kill-server';

  private buildStartAdbServerCommand = (): string => 'adb start-server';
}