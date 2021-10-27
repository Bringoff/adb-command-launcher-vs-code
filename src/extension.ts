import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "adb-command-launcher" is now active!');

	let uninstallDisposable = vscode.commands.registerCommand('adb-command-launcher.uninstall-app', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(uninstallDisposable);

	let killDisposable = vscode.commands.registerCommand('adb-command-launcher.kill-app', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(killDisposable);

	let startDisposable = vscode.commands.registerCommand('adb-command-launcher.start-app', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(startDisposable);

	let restartDisposable = vscode.commands.registerCommand('adb-command-launcher.restart-app', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(restartDisposable);

	let clearDataDisposable = vscode.commands.registerCommand('adb-command-launcher.clear-app-data', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(clearDataDisposable);

	let clearDataRestartDisposable = vscode.commands.registerCommand('adb-command-launcher.clear-app-data-restart', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(clearDataRestartDisposable);

	let revokePermissionsDisposable = vscode.commands.registerCommand('adb-command-launcher.revoke-permissions', () => {
		vscode.window.showInformationMessage('Hello World from ADB Command Launcher!');
	});
	context.subscriptions.push(revokePermissionsDisposable);
}

export function deactivate() {}
