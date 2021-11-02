import * as vscode from 'vscode';

const ENVIRONMENT_ANDROID_APP_ID_KEY: string = 'app-application-id';
const ENVIRONMENT_IOS_APP_ID_KEY: string = 'app-application-id-ios';

export function getCurrentAndroidApplicationId(storage: vscode.Memento): string {
  return storage.get(ENVIRONMENT_ANDROID_APP_ID_KEY) ?? '';
}

export function setCurrentAndroidApplicationId(storage: vscode.Memento, applicationId: string): Thenable<void> {
  return storage.update(ENVIRONMENT_ANDROID_APP_ID_KEY, applicationId);
}

export function getCurrentIOSApplicationId(storage: vscode.Memento): string {
  return storage.get(ENVIRONMENT_IOS_APP_ID_KEY) ?? '';
}

export function setCurrentIOSApplicationId(storage: vscode.Memento, applicationId: string): Thenable<void> {
  return storage.update(ENVIRONMENT_IOS_APP_ID_KEY, applicationId);
}

