import * as path from 'path';
import { Uri } from 'vscode';
import * as fs from 'fs';
import { promisify } from 'util';
import { VALID_APPLICATION_ID_MATCHER } from '../util/app_identifier_validator';

const POSSIBLE_BUILD_GRADLE_FILES = [
  'app/build.gradle',
  'android/app/build.gradle',
];

export const findProjectAndroidApplicationId = async (workspaceFolders: Array<Uri>): Promise<string> => {
  let foldersToCheck = workspaceFolders.filter((uri) => uri.scheme === 'file');

  const readFile = promisify(fs.readFile);

  for (let folder of foldersToCheck) {
    for (let possibleFile of POSSIBLE_BUILD_GRADLE_FILES) {
      let possiblePath = path.join(folder.fsPath, possibleFile);
      try {
        let openedFile = await readFile(possiblePath, { encoding: 'utf8' });
        let possibleLines = openedFile.split('\n')
          .filter((line) => line.indexOf('applicationId ') >= 0)
          .map((line) => {
            const appIdMatch = line.match(VALID_APPLICATION_ID_MATCHER);
            if (appIdMatch === null || appIdMatch.length === 0) { return ''; }
            return appIdMatch[0];
          })
          .filter((appId) => appId.length > 0);

        if (possibleLines.length > 0) {
          return possibleLines[0];
        };
      } catch (err) {
        console.log(`Cannot open file ${possiblePath}, will not get application id from it: ${err}`);
        continue;
      }
    }
  }

  return '';
};