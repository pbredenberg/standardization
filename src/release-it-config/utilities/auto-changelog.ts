import process from 'process';
import fs from 'fs';
import lineReader from 'line-reader';
import { promisify } from 'util';
import { exec } from 'child_process';
import {
   AUTOCHANGELOG_COMMAND,
   CHANGELOG_INFILE,
} from '../index';

const CHANGELOG_HEADER =
`# Changelog

All notable changes to this project will be documented in this file.
See [our coding standards][commit-messages] for commit guidelines.
`;

const CHANGELOG_FOOTER =
`[commit-messages]: https://github.com/silvermine/silvermine-info/blob/master/commit-history.md#commit-messages
`;

const runAutochangelog = (): Promise<unknown> => {
   console.log('Generating changelog:', AUTOCHANGELOG_COMMAND, process.cwd()); // eslint-disable-line
   return new Promise((resolve, reject) => {
      exec(
         AUTOCHANGELOG_COMMAND,
         { cwd: process.cwd() },
         (error, stdout) => {

            if (error) {
               reject(error);
            }

            resolve(stdout);
         }
      );
   });
};

const run = async (): Promise<void> => {
   const stat = promisify(fs.stat),
         writeFile = promisify(fs.writeFile),
         writeStream = fs.createWriteStream,
         changelogHeaderLineCount = CHANGELOG_HEADER.split(/\r\n|\r|\n/).length;

   let isChangelogExisiting = false,
       lineCount = 0,
       existingChangelog = '',
       stream: fs.WriteStream,
       output: unknown;

   // Check for the changelog file.
   try {
      await stat(CHANGELOG_INFILE);
      isChangelogExisiting = true;
   } catch(error) {
      console.log('Changelog not present, creating...'); // eslint-disable-line
   }

   if (!isChangelogExisiting) {
      try {
         // Create a write out the file with our template.
         await writeFile(
            CHANGELOG_INFILE,
            `${CHANGELOG_HEADER}${CHANGELOG_FOOTER}`
         );
      } catch(error) {
         console.error('Error creating file:', error); // eslint-disable-line
      }
   }

   // Open the file for reading.
   lineReader.eachLine(CHANGELOG_INFILE, (line) => {
      if (changelogHeaderLineCount >= lineCount) {
         existingChangelog = existingChangelog.concat(line);
      }
      lineCount = lineCount + 1;
   });

   stream = writeStream(CHANGELOG_INFILE, { encoding: 'utf8' });

   // TODO: Instead of this, why not store the file contents in memory,
   // then empty the file, inject the new changelog (since latest tag only),
   // then append the footer again?

   output = await runAutochangelog();

   const fileOutput = [
      `${CHANGELOG_HEADER}`,
      `${output}`,
      `${existingChangelog}`,
      `${CHANGELOG_FOOTER}`,
   ];

   stream.write(fileOutput.join('\n'));

   // console.log(output); // eslint-disable-line
};

run();
