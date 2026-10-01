/**
 * Shared helper for the scripts that need to look at the built site.
 *
 * `astro preview` forks a server; the detached process group is what makes a
 * capture run exit cleanly instead of hanging on an orphaned child.
 */
import { spawn } from 'node:child_process';

export const PREVIEW_PORT = 4321;
export const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

export async function waitForServer(baseUrl = PREVIEW_URL, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

export function startPreview(port = PREVIEW_PORT) {
  const child = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  child.unref();
  return child;
}

export function stopPreview(child) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      /* already gone */
    }
  }
}

/** Boot the preview server and hand back a `{ baseUrl, stop }` handle. */
export async function withPreview({ port = PREVIEW_PORT, url = null } = {}) {
  if (url) return { baseUrl: url.replace(/\/$/, ''), stop: () => {} };

  const child = startPreview(port);
  const baseUrl = `http://localhost:${port}`;
  const ready = await waitForServer(baseUrl);
  if (!ready) {
    stopPreview(child);
    throw new Error(`astro preview did not answer on ${baseUrl}`);
  }
  return { baseUrl, stop: () => stopPreview(child) };
}
