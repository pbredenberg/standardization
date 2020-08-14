declare module 'release-it';

declare module 'auto-changelog' {
   interface RemoteData {
      getCommitLink: (id: string) => string;
      getIssueLink: (id: string) => string;
      getMergeLink: (id: string) => string;
      getCompareLink: (from: string, to: string) => string;
   }

   interface AutoChangelogOptions {

      /**
       * The remote to use to fetch external details about the repo.
       * Example: `origin`
       */
      remote: string;
   }

   /**
    * Returns an object with details about the the remote.
    */
   const getRemote: (options: AutoChangelogOptions) => RemoteData;

   /**
    * Returns the getRemote object after fetching details from the repo.
    */
   const fetchRemote: (remoteUrl: string, options: AutoChangelogOptions) => typeof getRemote;

   export {
      getRemote,
      fetchRemote,
      RemoteData,
      AutoChangelogOptions,
   };
}
