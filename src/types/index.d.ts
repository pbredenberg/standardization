declare module 'release-it';

declare module 'auto-changelog/src/remote' {
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
   const fetchRemote: (options: AutoChangelogOptions) => RemoteData;

   /**
    * Returns the getRemote object after fetching details from the repo.
    */
   const getRemote: (remoteUrl: string, options: AutoChangelogOptions) => RemoteData;

   export {
      getRemote,
      fetchRemote,
      RemoteData,
      AutoChangelogOptions,
   };
}
