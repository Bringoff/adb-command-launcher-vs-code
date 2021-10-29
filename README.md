Adds the following ADB commands to VS Code:
- Uninstall App
- Kill App
- Start App
- Restart App
- Clear App Data
- Clear App Data and Restart
- Revoke permissions

And more to come.

The primary way to invoke a command is searching for "*ADB Command*" in [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) (macOS: **Cmd+Shift+P**, Windows/Linux: **Ctrl+Shift+P**)

## Requirements

[ADB](https://developer.android.com/studio/command-line/adb) should be downloaded and added to the PATH environment variable.

This extension tries to detect application package name on first activation. But if you have custom Android project structure, you may need to set package name manually. This can be done with *Set App Package Name* command. Package name will be persisted for a workspace. *Show Current App Package Name* displays the app package name previously set for current workspace. Selected app package name can be changed at any moment.

## Known Issues

Wasn't tested on Windows yet, so if you encounter any issues, feel free to report [through Github](https://github.com/Bringoff/adb-command-launcher-vs-code/issues)

## Release Notes

## [0.2.0] - 2021-10-29
### Added
- Package name now can be detected automatically in simple cases

## [0.1.1] - 2021-10-28
### Added
- Package name prompt on first extension activation in a workspace

## [0.1.0] - 2021-10-28
### Added
- "*Uninstall App*", "*Kill App*", "*Start App*", "*Restart App*", "*Clear App Data*", "*Clear App Data and Restart*", "*Revoke permissions*" commands.
- "Set App Package Name" and "Show Current App Package Name" commands to manage current app package (manually at the moment, automatic grabbing it from gradle files to come)
