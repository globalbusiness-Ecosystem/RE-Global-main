// Runs one health probe: true when it finishes in time, false when it throws or is too slow.
// The reason goes to the server log only (first line, short), never to the public answer.
export async function probe(name: string, fn: () => Promise<unknown>, ms = 3000): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      fn(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); }),
    ]);
    return true;
  } catch (e) {
    const why = e instanceof Error ? `${e.name}: ${e.message.split('\n')[0].slice(0, 200)}` : 'unknown error';
    console.error(`[health] ${name} failed: ${why}`);
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
