import * as vscode from 'vscode';

const ENVIRONMENT_ANDROID_APP_PACKAGE_KEY: string = 'app-package-name';
const ENVIRONMENT_IOS_APP_PACKAGE_KEY: string = 'app-package-name-ios';

export function getCurrentAndroidPackageName(storage: vscode.Memento): string {
  return storage.get(ENVIRONMENT_ANDROID_APP_PACKAGE_KEY) ?? '';
}

export function setCurrentAndroidPackageName(storage: vscode.Memento, packageName: string): Thenable<void> {
  return storage.update(ENVIRONMENT_ANDROID_APP_PACKAGE_KEY, packageName);
}

export function getCurrentIOSPackageName(storage: vscode.Memento): string {
  return storage.get(ENVIRONMENT_IOS_APP_PACKAGE_KEY) ?? '';
}

export function setCurrentIOSPackageName(storage: vscode.Memento, packageName: string): Thenable<void> {
  return storage.update(ENVIRONMENT_IOS_APP_PACKAGE_KEY, packageName);
}

