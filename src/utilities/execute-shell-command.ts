import { exec } from 'child_process';

/**
 * Executes the provided CLI command in the current working directory.
 *
 * @param command The command to run in shell
 * @param logMessage Message to print before command execution
 */
export default (command: string, logMessage?: string): Promise<string> => {

   if (logMessage) {
      console.log(`${logMessage}:`, command); // eslint-disable-line
   }

   return new Promise((resolve, reject) => {
      exec(
         command,
         { cwd: process.cwd() },
         (error, stdout) => {

            if (error) {
               reject(error);
            }

            // Return the output, removing any newlines/whitepsace at beginning
            // of string, newlines at end.
            resolve(stdout.replace(/^\n|\n$/g, ''));
         }
      );
   });
};
