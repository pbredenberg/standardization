import getMultilineStringLineCount from './get-multiline-string-line-count';

/**
 * Returns the first line of a multiline string.
 *
 * @param multineString Any string, assumed to be multiline.
 */
export default (multineString: string): string | undefined => {
   if (getMultilineStringLineCount(multineString) <= 0) {
      return multineString;
   }

   return multineString.split('\n').find((line) => { return line !== ''; });
};
