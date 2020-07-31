/**
 * Provides a line count for the provided string.
 *
 * @param multilineString Any string, assumed to be multiline
 */
export default (multilineString: string): number => {
   return multilineString.split(/\r\n|\r|\n/).length;
};
