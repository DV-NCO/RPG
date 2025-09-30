export interface DialogueResponse {
  text: string;
  next?: string;
  end?: boolean;
  shop?: string;
  setQuest?: string;
}

export interface DialogueNode {
  speaker: string;
  text: string;
  responses: DialogueResponse[];
}

export interface DialogueScript {
  start: string;
  nodes: Record<string, DialogueNode>;
}

export interface DialoguePayload {
  id: string;
  script: DialogueScript;
}

export default class DialogueSystem {
  private readonly scripts: Map<string, DialogueScript> = new Map();

  private active?: DialoguePayload;

  load(id: string, script: DialogueScript): void {
    this.scripts.set(id, script);
  }

  start(id: string): DialogueNode | null {
    const script = this.scripts.get(id);
    if (!script) {
      return null;
    }
    this.active = { id, script };
    return script.nodes[script.start] ?? null;
  }

  choose(response: DialogueResponse): DialogueNode | null {
    if (!this.active) {
      return null;
    }
    if (response.end) {
      this.active = undefined;
      return null;
    }
    if (response.next) {
      const nextNode = this.active.script.nodes[response.next];
      if (nextNode) {
        return nextNode;
      }
    }
    this.active = undefined;
    return null;
  }
}
