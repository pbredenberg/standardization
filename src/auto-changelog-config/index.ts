import path from 'path';
import getLatestValidTag from '../utilities/get-latest-valid-tag';
import { CHANGELOG_INFILE } from '../index';

const CHANGELOG_HEADER =
`# Changelog

All notable changes to this project will be documented in this file.
See [our coding standards][commit-messages] for commit guidelines.
`;

const CHANGELOG_FOOTER =
`[commit-messages]: https://github.com/silvermine/silvermine-info/blob/master/commit-history.md#commit-messages
`;

const AUTOCHANGELOG_TEMPLATE_PATH = `${path.resolve(__dirname)}/auto-changelog/templates/template.hbs`;

// Generates auto-changlog command with options
const autoChangelogCommand = async (): Promise<string> => {
   return [
      'npx',
      'auto-changelog',
      '-p',
      '--commit-limit false',
      `--template ${AUTOCHANGELOG_TEMPLATE_PATH}`,
      `--output ${CHANGELOG_INFILE}`,
      '--unreleased-only',
      // Pass latest tag to get correct changeset
      `--latest-version ${await getLatestValidTag()}`,
      '--stdout',
   ]
      .join(' ');
};

export {
   autoChangelogCommand,
   CHANGELOG_HEADER,
   CHANGELOG_FOOTER,
};
