import * as vscode from 'vscode';
import { isValidApplicationId } from './util/app_identifier_validator';


export const getApplicationId = async (getAppId: () => string) => {
  if (warnAboutMissingAppId(getAppId)) { return; }

  let currentAppId = getAppId();
  vscode.window.showInformationMessage(currentAppId);
};

export const setApplicationId = async (setAppId: (appId: string) => Thenable<void>) => {
  let inputAppId = await vscode.window.showInputBox({ placeHolder: 'Type your application id (package name)' }) ?? '';

  if (inputAppId.length > 0 && !isValidApplicationId(inputAppId)) {
    await vscode.window.showErrorMessage('Invalid application id');
    return;
  }

  await setAppId(inputAppId);
  if (inputAppId.length > 0) {
    await vscode.window.showInformationMessage(`${inputAppId} application id selected`);
  }
};

const warnAboutMissingAppId = (getAppId: () => string): boolean => {
  let currentAppId = getAppId();

  if (currentAppId.length === 0) {
    vscode.window.showInformationMessage('No application id currently set');
    return true;
  }

  return false;
};