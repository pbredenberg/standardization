import _ from 'underscore';

/**
 * Render the provided template with the provided paremeters:
 *
 * @param templateString A string that contains template references.
 * @param params A key/value object that contains the parameters to render
 * into the template.
 */
export default (templateString: string, params: { [param: string]: string }): string => {
   const renderer = _.template(templateString);

   return renderer(params);
};
