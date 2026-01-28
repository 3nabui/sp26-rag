export type AnalysisCharacterFrequency = { name: string; count: number };

export type AnalysisOverride = {
  scopeKey: string;
  dominantEmotion?: string;
  avgWordsPerScene?: number;
  characterFrequency?: AnalysisCharacterFrequency[];
  note?: string;
  updatedAt: string;
  updatedBy: 'staff';
};

const STORAGE_KEY = 'storynest_analysis_overrides';
const EVENT_NAME = 'storynest_analysis_override_updated';

type OverridesStore = Record<string, AnalysisOverride>;

export function makeStoryScopeKey(params: {
  storyId: string;
  chapterId: string;
  versionId: string;
}) {
  return `story:${params.storyId}:${params.chapterId}:${params.versionId}`;
}

export function makeMockScopeKey(params: {
  manuscriptId: number;
  chapter: number;
  versionId?: string;
}) {
  return `mock:${params.manuscriptId}:${params.chapter}:${params.versionId || 'v1'}`;
}

export function loadAnalysisOverrides(): OverridesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OverridesStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAnalysisOverride(override: AnalysisOverride) {
  const store = loadAnalysisOverrides();
  store[override.scopeKey] = override;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: override }));
}

export function removeAnalysisOverride(scopeKey: string) {
  const store = loadAnalysisOverrides();
  if (store[scopeKey]) {
    delete store[scopeKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { scopeKey } }));
  }
}

export function subscribeAnalysisOverrides(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

