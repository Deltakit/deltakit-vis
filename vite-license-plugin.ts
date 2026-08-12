import fs from 'fs';
import path from 'path';
import license, { type Dependency } from 'rollup-plugin-license';
import type { PluginOption } from 'vite';

const OUT_DIR = path.resolve(__dirname, 'dist');
const NOTICES_FILE = path.join(OUT_DIR, 'THIRD-PARTY-NOTICES.txt');
// Accumulates dependencies across the full and lite builds, which run as
// separate processes; not published (package.json "files" whitelists the output).
const SIDECAR_FILE = path.join(OUT_DIR, '.third-party-notices.json');

interface NoticeEntry {
    name: string;
    version: string;
    license: string | null;
    author: string | null;
    homepage: string | null;
    licenseText: string | null;
}

const PREAMBLE = `THIRD-PARTY SOFTWARE NOTICES

The distributed files of the deltakit-visualise package
(deltakit-visualise.umd.js and deltakit-visualise.lite.umd.js) bundle the
third-party packages listed below. Their copyright notices and license
terms are reproduced here. This file is generated automatically at build
time; do not edit it by hand.
`;

// shadcn/ui is not an npm dependency: its components are copied into src/ui as
// source files, so the bundler sees them as first-party code and the automatic
// scan below cannot detect them. Any other vendored third-party source needs a
// static entry like this one; installed packages are picked up automatically.
const SHADCN_ENTRY: NoticeEntry = {
    name: 'shadcn/ui',
    version: 'n/a (vendored source)',
    license: 'MIT',
    author: 'shadcn',
    homepage: 'https://ui.shadcn.com',
    licenseText:
        'The UI components in src/ui of this package are derived from shadcn/ui,\n' +
        'Copyright (c) 2023 shadcn, licensed under the MIT License\n' +
        '(https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).',
};

const SEPARATOR = '\n' + '-'.repeat(79) + '\n\n';

function toEntry(dep: Dependency): NoticeEntry {
    return {
        name: dep.name ?? 'unknown',
        version: dep.version ?? 'unknown',
        license: dep.license ?? null,
        author: dep.author ? dep.author.text() : null,
        homepage: dep.homepage ?? (typeof dep.repository === 'string' ? dep.repository : dep.repository?.url ?? null),
        licenseText: dep.licenseText ?? null,
    };
}

function renderEntry(entry: NoticeEntry): string {
    const lines = [`${entry.name}@${entry.version}`];
    if (entry.license) lines.push(`License: ${entry.license}`);
    if (entry.author) lines.push(`Author: ${entry.author}`);
    if (entry.homepage) lines.push(`Homepage: ${entry.homepage}`);
    lines.push('');
    lines.push(
        entry.licenseText?.trim() ??
            'License text not distributed with the package; see the package homepage for the full license.',
    );
    return lines.join('\n') + '\n';
}

function writeNotices(dependencies: Dependency[]): void {
    const merged = new Map<string, NoticeEntry>();
    if (fs.existsSync(SIDECAR_FILE)) {
        for (const entry of JSON.parse(fs.readFileSync(SIDECAR_FILE, 'utf-8')) as NoticeEntry[]) {
            merged.set(`${entry.name}@${entry.version}`, entry);
        }
    }
    for (const dep of dependencies) {
        const entry = toEntry(dep);
        merged.set(`${entry.name}@${entry.version}`, entry);
    }

    const entries = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(SIDECAR_FILE, JSON.stringify(entries, null, 2));
    fs.writeFileSync(NOTICES_FILE, [PREAMBLE, ...[SHADCN_ENTRY, ...entries].map(renderEntry)].join(SEPARATOR));
}

export function licenseNoticesPlugin(): PluginOption {
    return {
        ...license({
            thirdParty: {
                includePrivate: false,
                output: writeNotices,
            },
        }),
        apply: 'build',
    };
}
