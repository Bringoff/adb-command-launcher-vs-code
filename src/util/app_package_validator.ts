export const VALID_PACKAGE_NAME_MATCHER = /([A-Za-z]{1}[A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_]*/gm;

export function isValidPackageName(packageName: string): boolean {
  let matches = packageName.match(VALID_PACKAGE_NAME_MATCHER);
  return matches !== null && matches.length === 1 && matches[0] === packageName;
}