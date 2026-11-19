import { CapabilityCard } from './CapabilityCard.js';

import { getJson } from '../api/client.js';

type Suggestion = { title: string; reason: string };
type SuggestionsResponse = { suggestions: Suggestion[] };
const loadSuggestions = () => getJson<SuggestionsResponse>(
  `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`,
);

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyText="No workout suggestions yet."
      load={loadSuggestions}
      renderItems={({ suggestions }) => suggestions.map((suggestion) => (
        <>{suggestion.title}: {suggestion.reason}</>
      ))}
    />
  );
}
