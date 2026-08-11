import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import { visualizer } from 'rollup-plugin-visualizer';
import { bundleReportPlugin } from 'vite-plugin-bundle-report';
import path from 'path';

export default defineConfig(() => {
    const plugins: PluginOption[] = [react(), cssInjectedByJs()];
    const openAnalyzerReport = (process.env.ANALYZE_OPEN_BROWSER ?? 'false') === 'true';
    if (process.env.ANALYZE) {
        plugins.push(visualizer({ open: openAnalyzerReport, brotliSize: true, filename: 'dist/stats.html' }) as any);
        plugins.push(bundleReportPlugin({
            dependenciesOutputFile: 'dist/dependencies-full.json',
            reportSections: ['dependencyPackages', 'sourceModules', 'shipped'],
        }));
    }
    return {
        plugins,
        define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.npm_package_version': JSON.stringify(process.env.npm_package_version),
            'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL ?? '')
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                'deltakit': path.resolve(__dirname, 'src/index.ts'),
            },
        },
        build: {
            lib: {
                entry: path.resolve(__dirname, 'src/index.ts'),
                name: 'Deltakit',
                fileName: (format) => `deltakit-vis.${format}.js`
            },
            rollupOptions: {
                external: [],
                output: {
                    globals: {}
                }
            }
        }
    };
});
