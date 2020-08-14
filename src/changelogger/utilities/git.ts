import executeShellCommand from '../../utilities/execute-shell-command';
import { fetchRemote, RemoteData } from 'auto-changelog/src/remote';

/**
 * Gets the full commit ID hash from the provided short hash.
 *
 * @param hash The short commit hash from which to derive the complete commit id
 */
export const getFullHash = async (hash: string): Promise<string> => {
   return await executeShellCommand(`git rev-parse ${hash}`);
};

/**
 * Get data about the configured remote.
 *
 * @param remoteName The name of the remote to retrieve. Defaults to `origin`
 */
export const getOriginData = async (remoteName = 'origin'): Promise<RemoteData> => {
   return fetchRemote({ remote: remoteName });
};

/**
 * Show the data of the provided commit ID with the format `mm/dd/yyy`.
 *
 * @param hash The commit ID of which to show the date
 */
export const getCommitDate = async (hash: string): Promise<string> => {
   return await executeShellCommand(`git show -s ${hash} --format="%at" | xargs -I{} date -d @{} +%m/%d/%Y`);
};
