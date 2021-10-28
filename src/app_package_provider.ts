import * as vscode from 'vscode';

const ENVIRONMENT_APP_PACKAGE_KEY: string = 'app-package-name';

export function getCurrentPackageName(storage: vscode.Memento): string {
  return storage.get(ENVIRONMENT_APP_PACKAGE_KEY) ?? '';
}

export function setCurrentPackageName(storage: vscode.Memento, packageName: string): Thenable<void> {
  return storage.update(ENVIRONMENT_APP_PACKAGE_KEY, packageName);
}

