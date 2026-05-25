import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export function loadEmailTemplate(
  templateName: string,
  context: Record<string, any>,
): string {
  const templatePath = path.join(
    __dirname,
    '..',
    'templates',
    `${templateName}.html`,
  );

  const source = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(source);

  return template(context);
}
