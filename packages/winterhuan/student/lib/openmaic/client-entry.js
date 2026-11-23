//#region packages/winterhuan/student/src/openmaic/client-entry.ts
/** Loader entry for the generated official browser package; teaching tools belong to the Student preset. */
const name = "student-openmaic-client";
/** Publishing the browser package needs no Host services. */
const inject = [];
/** The browser half registers the official renderers when its Loader entry materializes. */
function apply() {}
//#endregion
export { apply, inject, name };
