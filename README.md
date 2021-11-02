Adds the following commands to manage mobile applications to VS Code:

- Android (using ADB):
  * Uninstall App
  * Kill App
  * Start App
  * Restart App
  * Clear App Data
  * Clear App Data and Restart
  * Revoke permissions

- iOS (using IDB):
  * Uninstall App
  * Kill App
  * Start App
  * Restart App

And more to come.

The primary way to invoke a command is searching for "*Android ADB Command*" or "*iOS IDB Command*" in [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) (macOS: **Cmd+Shift+P**, Windows/Linux: **Ctrl+Shift+P**)

## Requirements

**For Android commands:** [ADB](https://developer.android.com/studio/command-line/adb) should be downloaded and added to the PATH environment variable.

**For iOS commands:** Xcode, Python 3.6+ and [IDB](https://fbidb.io/docs/installation) should be installed. 
IDB installation should be pretty straightforward with [Homebrew](https://brew.sh/):

```
brew tap facebook/fb

brew install idb-companion

pip3 install fb-idb
```
**Unless** you are on a Mac with **Apple Silicon** chip (M1 and newer). In this case, follow [the issue and proposed solutions](https://github.com/facebook/idb/issues/649#issuecomment-939971092) on Github.
The last working solution is building idb-companion from sources:
```
brew install protobuf 

brew install grpc

git clone git@github.com:facebook/idb.git

cd idb

pod install

./idb_build.sh idb_companion build /opt/homebrew

codesign --force --sign - --timestamp=none /opt/homebrew/Frameworks/FBDeviceControl.framework/Versions/A/Resources/libShimulator.dylib

codesign --force --sign - --timestamp=none /opt/homebrew/Frameworks/FBSimulatorControl.framework/Versions/A/Resources/libShimulator.dylib

codesign --force --sign - --timestamp=none /opt/homebrew/Frameworks/XCTestBootstrap.framework/Versions/A/Resources/libShimulator.dylib

codesign --force --sign - --timestamp=none /opt/homebrew/Frameworks/FBControlCore.framework/Versions/A/Resources/libShimulator.dylib

idb_companion --version
```
</br>
</br>
Bear in mind that the extension tries to detect application package name on first activation. But if you have custom project structure, you may need to set package name manually. This can be done with *Set App Package Name* command. Package name will be persisted for a workspace. *Show Current App Package Name* displays the app package name previously set for current workspace. Selected app package name can be changed at any moment.

## Known Issues

Wasn't tested on Windows yet, so if you encounter any issues, feel free to report [through Github](https://github.com/Bringoff/adb-command-launcher-vs-code/issues)

## Release Notes

## [0.3.0] - 2021-11-02
### Added
- "*Uninstall App*", "*Kill App*", "*Start App*", "*Restart App*", iOS commands ([IDB](https://fbidb.io/docs/installation) installation required)
- iOS bundle identifier can be detected automatically in simple cases

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
