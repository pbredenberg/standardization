import executeShellCommand from '../../utilities/execute-shell-command';

/**
 * Gets the full commit ID hash from the provided short hash.
 *
 * @param hash The short commit hash from which to derive the complete commit id
 */
export const getFullHash = async (hash: string): Promise<string> => {
   return await executeShellCommand(`git rev-parse ${hash}`);
};
