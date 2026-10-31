import { describe, it, expect, vi } from 'vitest';
import { shareListingLink } from '@/lib/share-action';

const URL_ = 'https://x.test/p/abc';
describe('shareListingLink', () => {
  it('uses the share sheet when there is one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const copy = vi.fn();
    expect(await shareListingLink({ share, copy }, 'T', URL_)).toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'T', url: URL_ });
    expect(copy).not.toHaveBeenCalled();
  });
  it('closing the sheet is cancelled, not copied', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }));
    const copy = vi.fn();
    expect(await shareListingLink({ share, copy }, 'T', URL_)).toBe('cancelled');
    expect(copy).not.toHaveBeenCalled();
  });
  it('copies when there is no share sheet', async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    expect(await shareListingLink({ copy }, 'T', URL_)).toBe('copied');
    expect(copy).toHaveBeenCalledWith(URL_);
  });
  it('copies when the share sheet fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    const copy = vi.fn().mockResolvedValue(undefined);
    expect(await shareListingLink({ share, copy }, 'T', URL_)).toBe('copied');
  });
  it('reports failure when nothing works', async () => {
    expect(await shareListingLink({}, 'T', URL_)).toBe('failed');
    expect(await shareListingLink({ copy: vi.fn().mockRejectedValue(new Error('no')) }, 'T', URL_)).toBe('failed');
  });
});
