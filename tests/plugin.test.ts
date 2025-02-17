import fs from 'node:fs/promises';
import { resolve } from 'node:path';

import { execa } from 'execa';
import { expect, test } from 'vitest';

const testCwd = resolve(__dirname, './fixtures/mono/app');

const stdout = await fs.readFile(resolve(testCwd, 'stdout.txt'), 'utf8');
const stderr = await fs.readFile(resolve(testCwd, 'stderr.txt'), 'utf8');
const exec = async (command: string) => {
    const [cmd, ...args] = command.split(' ');
    const result = await execa(cmd, args, {
        cwd: testCwd,
        preferLocal: true,
        env: {
            NO_COLOR: 'true',
        },
    });
    return {
        stderr: result.stderr.replaceAll('\r?\n?', '\n'),
        stdout: result.stdout.replaceAll('\r?\n?', '\n'),
    };
};

test('vite esm', async () => {
    const result = await exec('vite build -l error -c vite.config.mts');

    // await fs.writeFile(resolve(testCwd, 'stdout.txt'), result.stdout, 'utf8');
    // await fs.writeFile(resolve(testCwd, 'stderr.txt'), result.stderr, 'utf8');

    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('vite cjs', async () => {
    const result = await exec('vite build -l error -c vite.config.cts');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('rollup esm', async () => {
    const result = await exec('rollup --silent -c rollup.config.mjs');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('rollup cjs', async () => {
    const result = await exec('rollup --silent -c rollup.config.cjs');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('no pkg size', async () => {
    const result = await exec('vite build -l error -c vite.config.disable-show-pkg-size.mts');

    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(await fs.readFile(resolve(testCwd, 'no-pkg-size.txt'), 'utf8'));
});
