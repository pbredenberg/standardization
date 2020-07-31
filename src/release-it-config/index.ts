import {
   IRepositoryReleaseSettings,
   IReleaseItOptions,
} from './interfaces';
// import path from 'path';

const RELEASE_VERSION_NAME = 'release v${version}';

// const CHANGELOG_INFILE = 'CHANGELOG.md';

const REPOSITORY_RELEASE_SETTINGS: IRepositoryReleaseSettings = {};

const CHANGELOG_PATTERN: string | boolean = `
  git log --grep=fix: --grep=feat: --no-merges --pretty=format:"* %s (%h)" $(git describe --exclude "*rc*" --abbrev=0)...HEAD
`;

REPOSITORY_RELEASE_SETTINGS.release = true;
REPOSITORY_RELEASE_SETTINGS.releaseName = 'Release ${tagName}';
REPOSITORY_RELEASE_SETTINGS.releaseNotes = CHANGELOG_PATTERN;

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
      changelog: CHANGELOG_PATTERN,
      requireUpstream: false,
   },
   npm: {
      publish: false,
   },
   gitHub: REPOSITORY_RELEASE_SETTINGS,
   gitLab: REPOSITORY_RELEASE_SETTINGS,
};

export default config;
