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

Currently this extension doesn't know anything about an opened project, so before running any ADB command an app package name (application id, i.e. `com.example.application`, usually placed in module-level `build.gradle` file) should be set. This can be done with *Set App Package Name* command. *Show Current App Package Name* displays the app package name previously set for current workspace. Selected app package name can be changed at any moment.

## Known Issues

Wasn't tested on Windows yet, so if you encounter any issues, feel free to report [through Github](https://github.com/Bringoff/adb-command-launcher-vs-code/issues)

## Release Notes

## [0.1.0] - 2021-10-28
### Added
- "*Uninstall App*", "*Kill App*", "*Start App*", "*Restart App*", "*Clear App Data*", "*Clear App Data and Restart*", "*Revoke permissions*" commands.
- "Set App Package Name" and "Show Current App Package Name" commands to manage current app package (manually at the moment, automatic grabbing it from gradle files to come)
