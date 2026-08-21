// ============================================================
// OTHERWISE — Concept Manager
// Manages discovered concepts, equipped concept, and application
// ============================================================
import { ConceptDefinition, ALL_CONCEPTS } from '../../data/ConceptData';

export class ConceptManager {
  /** Concepts the player has discovered */
  private discoveredConcepts: Map<string, ConceptDefinition> = new Map();

  /** Currently equipped concept */
  private equippedConceptId: string | null = null;

  /** Callbacks */
  public onConceptDiscovered: ((concept: ConceptDefinition) => void) | null = null;
  public onConceptEquipped: ((concept: ConceptDefinition | null) => void) | null = null;

  /** Discover a new concept */
  discoverConcept(conceptId: string): ConceptDefinition | null {
    const concept = ALL_CONCEPTS[conceptId];
    if (!concept) return null;
    if (this.discoveredConcepts.has(conceptId)) return concept;

    this.discoveredConcepts.set(conceptId, concept);

    // Auto-equip if first concept
    if (this.discoveredConcepts.size === 1) {
      this.equipConcept(conceptId);
    }

    if (this.onConceptDiscovered) {
      this.onConceptDiscovered(concept);
    }

    return concept;
  }

  /** Equip a discovered concept */
  equipConcept(conceptId: string): boolean {
    if (!this.discoveredConcepts.has(conceptId)) return false;
    this.equippedConceptId = conceptId;

    if (this.onConceptEquipped) {
      this.onConceptEquipped(this.getEquippedConcept());
    }

    return true;
  }

  /** Get currently equipped concept */
  getEquippedConcept(): ConceptDefinition | null {
    if (!this.equippedConceptId) return null;
    return this.discoveredConcepts.get(this.equippedConceptId) || null;
  }

  /** Get all discovered concepts */
  getDiscoveredConcepts(): ConceptDefinition[] {
    return Array.from(this.discoveredConcepts.values());
  }

  /** Check if a concept has been discovered */
  isDiscovered(conceptId: string): boolean {
    return this.discoveredConcepts.has(conceptId);
  }

  /** Cycle to next equipped concept */
  cycleNext(): void {
    const concepts = this.getDiscoveredConcepts();
    if (concepts.length <= 1) return;

    const currentIndex = concepts.findIndex(c => c.id === this.equippedConceptId);
    const nextIndex = (currentIndex + 1) % concepts.length;
    this.equipConcept(concepts[nextIndex].id);
  }

  /** Cycle to previous equipped concept */
  cyclePrev(): void {
    const concepts = this.getDiscoveredConcepts();
    if (concepts.length <= 1) return;

    const currentIndex = concepts.findIndex(c => c.id === this.equippedConceptId);
    const prevIndex = (currentIndex - 1 + concepts.length) % concepts.length;
    this.equipConcept(concepts[prevIndex].id);
  }

  /** Get equipped concept ID */
  getEquippedId(): string | null {
    return this.equippedConceptId;
  }

  /** Load state (for save system) */
  loadState(discoveredIds: string[], equippedId: string | null): void {
    this.discoveredConcepts.clear();
    for (const id of discoveredIds) {
      const concept = ALL_CONCEPTS[id];
      if (concept) {
        this.discoveredConcepts.set(id, concept);
      }
    }
    if (equippedId && this.discoveredConcepts.has(equippedId)) {
      this.equippedConceptId = equippedId;
    }
  }

  /** Save state */
  saveState(): { discovered: string[]; equipped: string | null } {
    return {
      discovered: Array.from(this.discoveredConcepts.keys()),
      equipped: this.equippedConceptId,
    };
  }
}
