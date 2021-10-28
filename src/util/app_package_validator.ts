export function isValidPackageName(packageName: string): boolean {
  return !!packageName.match('^([A-Za-z]{1}[A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_]*$');
}