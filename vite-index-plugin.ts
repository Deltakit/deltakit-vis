import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export interface IndexPluginOptions {
  indexFile: string;
}

export function viteIndexPlugin(options: IndexPluginOptions): Plugin {
  return {
    name: 'vite-index-plugin',
    configResolved(config) {
      // no-op
    },
    async transformIndexHtml(html: string, ctx) {
      // Read the specified index file
      const indexPath = path.resolve(process.cwd(), options.indexFile);
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      return indexContent;
    },
  };
}
