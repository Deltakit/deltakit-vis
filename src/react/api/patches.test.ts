import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPatchesAtRound } from '@/react/api/patches';
import { logicalPatchUrl } from '@/lib/utils';

/** A round payload as returned by `/api/get-patches-info-at-round/{round}`. */
function envelope(round: number) {
  return {
    type: 'logical_patch',
    ops: [
      {
        round,
        qubits: [
          { id: 'q_0', type: 'data', coordinates: [1.5, 1.5] },
          { id: 'q_1', type: 'data', coordinates: [2.5, 1.5] },
        ],
        patches: [
          {
            plaquettes: [
              { id: 0, colour: 'blue', shape: 'square', weight: 4, coordinates: ['q_0', 'q_1'] },
            ],
          },
        ],
      },
    ],
  };
}

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: 'OK',
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('logicalPatchUrl', () => {
  it('is the single definition of the round endpoint, shared with the library', () => {
    expect(logicalPatchUrl(7)).toBe('/api/get-patches-info-at-round/7');
  });
});

describe('fetchPatchesAtRound', () => {
  it('unwraps the logical_patch envelope', async () => {
    const fetchMock = mockFetch(envelope(7));

    const patch = await fetchPatchesAtRound(7);

    expect(fetchMock).toHaveBeenCalledWith(
      logicalPatchUrl(7),
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
    expect(patch?.round).toBe(7);
    expect(patch?.qubits).toHaveLength(2);
    expect(patch?.patches[0].plaquettes[0].colour).toBe('blue');
  });

  it('resolves to null for a round outside the program', async () => {
    mockFetch({ type: 'logical_patch', ops: [] });

    await expect(fetchPatchesAtRound(21)).resolves.toBeNull();
  });

  it('resolves to null for a body without an envelope', async () => {
    mockFetch({});

    await expect(fetchPatchesAtRound(21)).resolves.toBeNull();
  });

  it('throws on a failed request', async () => {
    mockFetch({}, { ok: false, status: 500 });

    await expect(fetchPatchesAtRound(1)).rejects.toThrow('500');
  });
});
