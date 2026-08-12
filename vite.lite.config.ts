import { defineConfig, type PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { bundleReportPlugin } from 'vite-plugin-bundle-report';
import path from 'path';
import type { Plugin } from 'vite';
import fs from 'fs';
import { licenseNoticesPlugin } from './vite-license-plugin';

function multiIndexPlugin(): Plugin {
  return {
    name: 'multi-index-plugin',
    configResolved() {
      // no-op
    },
    async transformIndexHtml(html: string, ctx) {
      // Serve index.patch.lite.html as index.patch.html
      if (ctx.filename?.includes('index.patch.html')) {
        const indexPath = path.resolve(process.cwd(), 'index.patch.lite.html');
        return fs.readFileSync(indexPath, 'utf-8');
      }
      // Serve index.lite.html as index.html (default)
      const indexPath = path.resolve(process.cwd(), 'index.lite.html');
      return fs.readFileSync(indexPath, 'utf-8');
    },
  };
}

export default defineConfig(() => {
  const plugins: PluginOption[] = [multiIndexPlugin(), licenseNoticesPlugin()];
  const openAnalyzerReport = (process.env.ANALYZE_OPEN_BROWSER ?? 'false') === 'true';
  if (process.env.ANALYZE) {
    plugins.push(visualizer({ open: openAnalyzerReport, brotliSize: true, filename: 'dist/stats-lite.html' }));
    plugins.push(bundleReportPlugin({
      dependenciesOutputFile: 'dist/dependencies-lite.json',
      reportSections: ['dependencyPackages', 'sourceModules', 'shipped'],
    }));
  }
  return {
    plugins,
    optimizeDeps: {
      entries: ['src/main.lite.ts', 'src/main.patch.lite.ts'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL ?? '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'deltakit': path.resolve(__dirname, 'src/index.lite.ts'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: path.resolve(__dirname, 'src/index.lite.ts'),
        name: 'Deltakit',
        fileName: (format) => `deltakit-visualise.lite.${format}.js`,
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {},
        },
      },
    },
  };
});

