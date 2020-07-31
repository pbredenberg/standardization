import path from 'path';
import { CHANGELOG_INFILE, LATEST_VALID_TAG_COMMAND } from '../index';
import executeShellCommand from '../utilities/execute-shell-command';

const CHANGELOG_HEADER =
`# Changelog

All notable changes to this project will be documented in this file.
See [our coding standards][commit-messages] for commit guidelines.
`;

const CHANGELOG_FOOTER =
`[commit-messages]: https://github.com/silvermine/silvermine-info/blob/master/commit-history.md#commit-messages
`;

const AUTOCHANGELOG_TEMPLATE_PATH = `${path.resolve(__dirname)}/templates/template.hbs`;

// Generates auto-changlog command with options
const autoChangelogCommand = async (): Promise<string> => {
   const changelogPath = `${process.cwd()}/${CHANGELOG_INFILE}`,
         getLatestValidTag = await executeShellCommand(LATEST_VALID_TAG_COMMAND, 'Getting latest valid tag');

   return [
      'npx',
      'auto-changelog',
      '--commit-limit false',
      '--backfill-limit false',
      `--template ${AUTOCHANGELOG_TEMPLATE_PATH}`,
      `--output ${changelogPath}`,
      '--stdout',
      `--starting-version ${getLatestValidTag}`,
   ]
      .join(' ');
};

export {
   autoChangelogCommand,
   CHANGELOG_HEADER,
   CHANGELOG_FOOTER,
};
