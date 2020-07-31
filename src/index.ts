// Shared variables used by various configurations.
const LATEST_VALID_TAG_COMMAND = 'git describe --tags --abbrev=0 --exclude "*rc*" $(git rev-list --tags --max-count=1)';

const CHANGELOG_INFILE = 'CHANGELOG.md';

export {
   CHANGELOG_INFILE,
   LATEST_VALID_TAG_COMMAND,
};
