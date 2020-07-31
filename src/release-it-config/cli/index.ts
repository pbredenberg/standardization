#!/usr/bin/env node
import releaseIt from 'release-it';
import _ from 'underscore';
import recommendedBump from 'conventional-recommended-bump';
import releaseItOptions from '../';
import { IReleaseItOptions } from '../interfaces';
import {
   preReleaseCommand,
   tag,
   helpCommand,
} from './commands';

const run = (): void => {
   const args = process.argv || [],
         config = Object.assign({}, releaseItOptions);

   const getOption = (arg: string): string => {
      return arg.split('=')[1];
   };

   const findArgument = (arg: string): string => {
      const matchedArgument = args.find((i: string) => {
         return i.indexOf(arg) > -1;
      });

      return matchedArgument ? matchedArgument.split('--')[1] : '';
   };

   const runRelease = (options: IReleaseItOptions): void => {
      Object.assign(releaseItOptions, options);

      releaseIt(options)
         .then((output: any) => {
            console.log('(silvermine-release) finished:', output.version); // eslint-disable-line
         });
   };

   let isExecutable = false;

   isExecutable = _.some(args, (arg: string): boolean => {
      const argument = (findArgument(arg) || '').split('=')[0],
            option = getOption(arg);

      if (argument === 'release') {
         return true;
      } else if (argument === 'pre-release') {
         return preReleaseCommand([ option ], config);
      } else if (argument === 'tag') {
         return tag(config);
      }

      return false;
   });

   if (!isExecutable || findArgument('--help') === 'help') {
      helpCommand();
   }

   if (!isExecutable) {
      return;
   }

   // TODO: Determine if recommended-bump is still needed:
   recommendedBump({ preset: 'conventionalcommits' }, (error: unknown, recommendation: Record<string, any>) => {
      if (error) {
         console.log('Error getting recommended bump:', error); // eslint-disable-line
      }

      console.log('Recommended bump:', recommendation); // eslint-disable-line
   });

   runRelease(config);
};

try {
   run();
} catch(error) {
   console.error(error); // eslint-disable-line
}
