import * as vscode from 'vscode';
import { executeSimpleCommand } from '../simple_command';
import { getCurrentIOSApplicationId, setCurrentIOSApplicationId } from '../app_identifier_provider';
import { getApplicationId as commonGetApplicationId, setApplicationId as commonSetApplicationId } from '../common_commands';
import { executeCommand } from '../util/exec_runner';

export default class IOSCommandsExecutor {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getApplicationId = () => commonGetApplicationId(() => getCurrentIOSApplicationId(this.context.workspaceState));

  setApplicationId = async () => commonSetApplicationId((appId) => setCurrentIOSApplicationId(this.context.workspaceState, appId));

  uninstallApp = async () =>
    executeSimpleCommand(this.context, this.chooseDeviceToRunCommandOn, getCurrentIOSApplicationId, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildUninstallCommand,
      ],
      successMessage: (currentAppId) => `Uninstalled ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to uninstall ${currentAppId}`,
    });

  killApp = async () =>
    executeSimpleCommand(this.context, this.chooseDeviceToRunCommandOn, getCurrentIOSApplicationId, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildKillCommand,
      ],
      successMessage: (currentAppId) => `Killed ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to kill ${currentAppId}`,
    });

  startApp = async () =>
    executeSimpleCommand(this.context, this.chooseDeviceToRunCommandOn, getCurrentIOSApplicationId, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildStartCommand,
      ],
      successMessage: (currentAppId) => `Started ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to start ${currentAppId}`,
    });

  restartApp = async () =>
    executeSimpleCommand(this.context, this.chooseDeviceToRunCommandOn, getCurrentIOSApplicationId, {
      isConnectedDeviceExpected: true,
      commands: [
        this.buildKillCommand,
        this.buildStartCommand,
      ],
      successMessage: (currentAppId) => `Restarted ${currentAppId} successfuly`,
      errorMessage: (currentAppId) => `Failed to restart ${currentAppId}`,
    });

  private buildUninstallCommand = (appId: string, targetDevice: string): string => {
    return `idb connect ${targetDevice} && idb uninstall ${appId}`;
  };

  private buildKillCommand = (appId: string, targetDevice: string): string => {
    return `idb connect ${targetDevice} && idb terminate ${appId}`;
  };

  private buildStartCommand = (appId: string, targetDevice: string): string => {
    return `idb connect ${targetDevice} && idb launch ${appId}`;
  };

  private chooseDeviceToRunCommandOn = async (): Promise<string> => {
    let devices = (await executeCommand('idb list-targets') as string)
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        const values = line.split('|').map((value) => value.trim());

        return {
          uuid: values[1],
          name: values[0],
          isBooted: values[2] === 'Booted',
          isPhysical: values[3] === 'device',
          osVersion: values[4],
        } as Device;
      }).sort((deviceLeft, deviceRight) => {
        if (deviceLeft.isPhysical && !deviceRight.isPhysical) { return -1; }
        if (deviceLeft.isBooted && !deviceRight.isBooted) { return -1; };
        return deviceLeft.name.localeCompare(deviceRight.name);
      });

    const userSelectedDeviceLabel = await vscode.window.showQuickPick(
      devices.map((device) => `${device.name} | ${device.osVersion} ${device.isBooted ? '| connected' : ''}`),
      {
        title: 'Choose target device',
        canPickMany: false,
      }
    );

    if (!userSelectedDeviceLabel) { return ''; }
    const userSelectedDeviceName = userSelectedDeviceLabel.substring(0, userSelectedDeviceLabel.indexOf('|')).trim();

    const userSelectedDevice = devices.filter((device) => device.name === userSelectedDeviceName)[0];
    return userSelectedDevice.uuid;
  };
}

interface Device {
  uuid: string,
  name: string,
  isBooted: boolean,
  isPhysical: boolean,
  osVersion: string,
}