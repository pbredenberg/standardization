import { autoChangelogCommand } from './auto-changelog-config';
import { CHANGELOG_INFILE } from './release-it-config';

// Shared variable used by various configurations.
const LATEST_VALID_TAG_COMMAND = 'git describe --exclude "*rc*" --abbrev=0';

export {
   autoChangelogCommand,
   CHANGELOG_INFILE,
   LATEST_VALID_TAG_COMMAND,
};
