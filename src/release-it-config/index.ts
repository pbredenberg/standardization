import {
   IRepositoryReleaseSettings,
   IReleaseItOptions,
} from './interfaces';
import path from 'path';
import process from 'process';

const RELEASE_VERSION_NAME = 'release v${version}';

const CHANGELOG_INFILE = process.cwd() + '/CHANGELOG.md';

const REPOSITORY_RELEASE_SETTINGS: IRepositoryReleaseSettings = {};

const LATEST_VALID_TAG_COMMAND = 'git describe --exclude "*rc*" --abbrev=0';

const RELEASE_NOTES_COMMAND: string | boolean = `
  git log --grep=fix: --grep=feat: --no-merges --pretty=format:"* %s (%h)" $(${LATEST_VALID_TAG_COMMAND})...HEAD
`;

// This is an array to allow execution via `process.spawn`
const AUTOCHANGELOG_COMMAND = [
   'npx',
   'auto-changelog',
   '-p',
   '--commit-limit false',
   `--template ${path.resolve(__dirname)}/changelog-templates/template.hbs`,
   `--output ${CHANGELOG_INFILE}`,
   '--stdout',
]
   .join(' ');

REPOSITORY_RELEASE_SETTINGS.release = true;
REPOSITORY_RELEASE_SETTINGS.releaseName = 'Release ${tagName}';
REPOSITORY_RELEASE_SETTINGS.releaseNotes = RELEASE_NOTES_COMMAND;

const config: IReleaseItOptions = {
   plugins: {
      '@release-it/conventional-changelog': {
         preset: 'conventionalcommits',
      },
   },
   git: {
      push: false,
      tag: false,
      tagName: 'v${version}',
      tagAnnotation: RELEASE_VERSION_NAME,
      commitMessage: 'chore: ' + RELEASE_VERSION_NAME,
      // This uses the auto-changelog command to generate report changelogs
      // in the CLI output
      changelog: AUTOCHANGELOG_COMMAND,
      requireUpstream: false,
   },
   npm: {
      publish: false,
   },
   gitHub: REPOSITORY_RELEASE_SETTINGS,
   gitLab: REPOSITORY_RELEASE_SETTINGS,
   hooks: {
      // Executes auto-changelog to generate the file.
      'after:bump': `node ${path.resolve(__dirname)}/utilities/auto-changelog.js`,
   },
};

export {
   AUTOCHANGELOG_COMMAND,
   CHANGELOG_INFILE,
};

export default config;
