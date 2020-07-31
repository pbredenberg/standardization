import fs from 'fs';
import { promisify } from 'util';

/**
 * Gets the contents of the file at the provided path as
 * a string.
 *
 * @param filePath The filesystem path to the desired file.
 */
export default async (filePath: string): Promise<string> => {
   const readFile = promisify(fs.readFile);

   let fileContents: Buffer;

   try {
      fileContents = await readFile(filePath);
   } catch(error) {
      return Promise.reject(`Error getting file contents: ${error}`);
   }

   return Promise.resolve(fileContents.toString());
};
