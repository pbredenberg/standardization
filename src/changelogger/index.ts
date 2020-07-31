import getFileContents from './utilities/get-file-contents';
import { LATEST_VALID_TAG_COMMAND } from '../index';

const templateResolver = async (templateName: string): Promise<string> => {
   const templatePath = `${__dirname}/templates/${templateName}.tpl`;

   return await getFileContents(templatePath);
};

export {
   templateResolver,
   LATEST_VALID_TAG_COMMAND,
};
