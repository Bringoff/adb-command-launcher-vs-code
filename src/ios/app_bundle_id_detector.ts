import * as path from 'path';
import * as fs from 'fs';
import { Uri } from 'vscode';
import { promisify } from 'util';
import { VALID_APPLICATION_ID_MATCHER } from '../util/app_identifier_validator';

export const findProjectIOSBundleIdentifier = async (workspaceFolders: Array<Uri>): Promise<string> => {
  const readFile = promisify(fs.readFile);
  const readdir = promisify(fs.readdir);

  try {
    let dirsToCheck = workspaceFolders.filter((uri) => uri.scheme === 'file');
    let finalDirs = Array<string>();

    for (let dir of dirsToCheck) {
      finalDirs.push(dir.fsPath);
      const openedDir = await readdir(dir.fsPath);
      const iosDir = openedDir.find((folder) => folder === 'ios');
      if (iosDir) { finalDirs.push(path.join(dir.fsPath, iosDir)); }
    }

    for (let possibleDir of finalDirs) {
      try {
        const dir = await readdir(possibleDir);
        const xcodeProjects = dir.filter((name) => name.endsWith('.xcodeproj'));
        for (let projectPackage of xcodeProjects) {
          const projectFiles = await readdir(path.join(possibleDir, projectPackage));
          const project = projectFiles.find((name) => name === 'project.pbxproj');
          if (!project) { continue; }
          const openedProject = await readFile(path.join(possibleDir, projectPackage, project), { encoding: 'utf8' });
          let possibleIds = openedProject.split('\n')
            .filter((line) => line.indexOf('PRODUCT_BUNDLE_IDENTIFIER') >= 0)
            .map((line) => {
              const appIdMatch = line.match(VALID_APPLICATION_ID_MATCHER);
              if (appIdMatch === null || appIdMatch.length === 0) { return ''; }
              return appIdMatch[0];
            });
          if (possibleIds.length > 0) {
            return possibleIds[0];
          }
        }
      } catch (err) {
        console.log(`Cannot work with directory ${possibleDir}, will not get application id from it: ${err}`);
        continue;
      }
    }
  } catch (err) {
    console.log(`Cannot get application id: ${err}`);
  }

  return '';
};