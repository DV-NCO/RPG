import { describe, expect, it } from 'vitest';

import DialogueSystem, { DialogueScript } from '../systems/Dialogue';

describe('DialogueSystem', () => {
  it('progresses between nodes and handles endings', () => {
    const system = new DialogueSystem();
    const script: DialogueScript = {
      start: 'intro',
      nodes: {
        intro: {
          speaker: 'NPC',
          text: 'Hello',
          responses: [
            { text: 'Bye', end: true },
            { text: 'Tell me more', next: 'more' },
          ],
        },
        more: {
          speaker: 'NPC',
          text: 'More info',
          responses: [{ text: 'Done', end: true }],
        },
      },
    };
    system.load('test', script);
    const node = system.start('test');
    expect(node?.text).toBe('Hello');
    const next = system.choose(node!.responses[1]!);
    expect(next?.text).toBe('More info');
    const end = system.choose(next!.responses[0]!);
    expect(end).toBeNull();
  });
});
