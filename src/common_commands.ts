import * as vscode from 'vscode';
import { isValidPackageName } from './util/app_package_validator';


export const getAppPackageName = async (getAppPackageName: () => string) => {
  if (warnAboutMissingAppPackageName(getAppPackageName)) { return; }

  let currentPackageName = getAppPackageName();
  vscode.window.showInformationMessage(currentPackageName);
};

export const setAppPackageName = async (setAppPackageName: (appPackageName: string) => Thenable<void>) => {
  let inputPackage = await vscode.window.showInputBox({ placeHolder: 'Type your application id (package name)' }) ?? '';

  if (inputPackage.length > 0 && !isValidPackageName(inputPackage)) {
    await vscode.window.showErrorMessage('Invalid App Package Name');
    return;
  }

  await setAppPackageName(inputPackage);
  if (inputPackage.length > 0) {
    await vscode.window.showInformationMessage(`${inputPackage} package name selected`);
  }
};

const warnAboutMissingAppPackageName = (getAppPackageName: () => string): boolean => {
  let currentPackageName = getAppPackageName();

  if (currentPackageName.length === 0) {
    vscode.window.showInformationMessage('No package name currently set');
    return true;
  }

  return false;
};