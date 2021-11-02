export const VALID_APPLICATION_ID_MATCHER = /([A-Za-z]{1}[A-Za-z\d_-]*\.)+[A-Za-z][A-Za-z\d_-]*/gm;

export function isValidApplicationId(applicationId: string): boolean {
  let matches = applicationId.match(VALID_APPLICATION_ID_MATCHER);
  return matches !== null && matches.length === 1 && matches[0] === applicationId;
}