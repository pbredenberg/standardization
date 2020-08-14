import fs from 'fs';
import lineReader from 'line-reader';
import { promisify } from 'util';
import _ from 'underscore';
import executeShellCommand from '../utilities/execute-shell-command';
import {
   getMultilineStringLineCount,
   getFirstLineMultilineString,
   renderTemplate,
   getFullHash,
} from './utilities';
import {
   CHANGELOG_INFILE, LATEST_VALID_TAG_COMMAND,
} from '../index';
import { templateResolver } from './index';
import { getOriginData, getCommitDate } from './utilities/git';

const CURRENT_PROJECT_PACKAGE_JSON: { version: number } = require(process.cwd() + '/package.json');

/**
 * Reads the changelog at the provided path, starting at the provided line number,
 * and returns the existing contents.
 *
 * @param infile Path to the changelog file to be written to.
 * @param startLineNumber Line number at which to start reading/
 */
const readCurrentChangelog = async (infile: string, startLineNumber: number): Promise<string> => {
   const changelogFooter = await templateResolver('footer');

   let lineCount = 0,
       existingChangelog = '';

   return new Promise((resolve) => {
      // Open the file for reading.
      lineReader.eachLine(infile, (line, isLast) => {
         const isLineChangeLogFooter = getFirstLineMultilineString(changelogFooter) === line;

         if (isLast || isLineChangeLogFooter) {
            resolve(existingChangelog);
         }

         if (lineCount >= startLineNumber) {
            existingChangelog = existingChangelog.concat('\n' + line);
         }

         lineCount = lineCount + 1;
      });
   });
};

/**
 * Get the compare statement to be provided to `git log`. If the latest version
 * (typically parsed from package.json) matches the lates tag, the comparison will
 * use the latest tag and HEAD.
 *
 * @param latestValidTag
 * @param latestVersion
 */
const getCompareStatement = (latestValidTag: string, latestVersion: string): string => {
   return latestValidTag === latestVersion
      ? `${latestValidTag}...HEAD`
      : `${latestValidTag}...${latestVersion}`;
};

/**
 * Runs auto-changelog with our custom options.
 *
 * @param isWritingToFile If set to true, the changelog will write out
 * changes to the changelog.
 * @param args Any additional arguments to be provided to auto-changelog
 * see: <https://github.com/CookPete/auto-changelog#usage>
 */
const run = async (isWritingToFile = false): Promise<void> => {
   const stat = promisify(fs.stat),
         writeFile = promisify(fs.writeFile),
         writeStream = fs.createWriteStream,
         changelogPath = `${process.cwd()}/${CHANGELOG_INFILE}`;

   let isChangelogExisiting = false,
       existingChangelog = '',
       latestValidTag = '',
       latestVersion = `v${CURRENT_PROJECT_PACKAGE_JSON.version.toString()}`,
       changelogHeaderTemplate: string,
       changelogFooterTemplate: string,
       changelogCommitTemplate: string,
       changelogReleaseHeaderTemplate: string,
       changelogHeaderLineCount: number,
       stream: fs.WriteStream,
       fileOutput: string[],
       output: string,
       generatedChangelogLines: string[],
       commitList: (string | undefined)[],
       formattedChangelog: string;

   // Get default template contents
   changelogHeaderTemplate = await templateResolver('header');
   changelogFooterTemplate = await templateResolver('footer');
   changelogCommitTemplate = await templateResolver('commit');
   changelogReleaseHeaderTemplate = await templateResolver('release');

   changelogHeaderLineCount = getMultilineStringLineCount(changelogHeaderTemplate);

   // Check for the changelog file.
   try {
      await stat(changelogPath);
      isChangelogExisiting = true;
   } catch(error) {
      console.log(`Changelog ${changelogPath} not present, creating...`); // eslint-disable-line
   }

   if (!isChangelogExisiting) {
      try {
         // Create a write out the file with our template.
         await writeFile(
            changelogPath,
            `${changelogHeaderTemplate}${changelogFooterTemplate}`
         );
      } catch(error) {
         console.error('Error creating file:', error); // eslint-disable-line
      }
   }

   // Store the existing changelog file contents in memory.
   existingChangelog = await readCurrentChangelog(changelogPath, changelogHeaderLineCount);

   // TODO: Move to `utilities/git`
   try {
      latestValidTag = await executeShellCommand(LATEST_VALID_TAG_COMMAND, 'Getting latest valid tag');
   } catch(error) {
      console.log('No valid tags found.'); // eslint-disable-line
   }

   try {
      // TODO: Move to `utilities/git`
      latestVersion = await executeShellCommand(`git describe ${latestVersion}`, 'Verifying version in package.json is a valid release');
   } catch(error) {
      console.log('Could not find release matching the version in package.json'); // eslint-disable-line
      latestVersion = 'HEAD';
   }

   // Get latest changelog.
   // TODO: Move to `utilities/git`
   output = await executeShellCommand(
      [
         'git log',
         '--oneline',
         '--no-merges',
         // TODO: Allow user to pass in range of commits for comparison.
         latestValidTag === '' ? '' : getCompareStatement(latestValidTag, latestVersion),
      ]
         .join(' '),
      'Executing git log'
   );

   generatedChangelogLines = output.split('\n');

   // There's no new changelog to generate if:
   // 1. The first line of the current changelog matches the first line of
   //    the newly generated changelog.
   // 2. Less than 2 lines of generated output were found. This typically
   //    indicates that all auto-changelog had to go one was a release with
   //    0 usable commits.
   if (generatedChangelogLines.length <= 0 || getFirstLineMultilineString(existingChangelog) === getFirstLineMultilineString(output)) {
      console.log('Most recent changelog:\n\n', output); // eslint-disable-line
      console.log('No new changes detected, exiting...'); // eslint-disable-line
      return;
   }

   // Retrieve our changelog lines.
   commitList = await Promise.all(generatedChangelogLines.map(async (line) => {
      const hash = line.replace(/^\s+/g, '').substring(0, 7),
            commit = line.match(/(feat:|fix:).*/),
            release = line.match(/(release v).*/),
            fullHash = await getFullHash(hash),
            isPreRelease = !!release && !!release[0].match(/(rc.|alhpa.|beta.)/),
            originData = await getOriginData();

      if (commit) {
         return renderTemplate(changelogCommitTemplate, {
            hash: hash,
            fullHash: fullHash,
            commit: commit[0],
            commitURL: originData.getCommitLink(fullHash),
         });
      }

      if (release && !isPreRelease) {
         return renderTemplate(changelogReleaseHeaderTemplate, {
            release: release[0],
            compareLink: originData.getCompareLink(latestValidTag, latestVersion),
            commitDate: await getCommitDate(fullHash),
         });
      }

      return undefined;
   }));

   // Filter out any undefined values from the commit list and join
   // them into a mulitline string.
   formattedChangelog = _.compact(commitList).join('\n');

   if (isWritingToFile) {
      stream = writeStream(changelogPath, { encoding: 'utf8' });

      fileOutput = [
         changelogHeaderTemplate,
         formattedChangelog,
         existingChangelog,
         changelogFooterTemplate,
      ];

      stream.write(fileOutput.join('\n'));
   }

   console.log('\nChangelog generated!\n', formattedChangelog); // eslint-disable-line
};

export default run;
