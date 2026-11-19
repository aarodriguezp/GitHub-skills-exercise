import { CapabilityCard } from './CapabilityCard.js';

import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };
const loadActivities = () => getJson<ActivitiesResponse>('/api/activities');

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      emptyText="No activities yet."
      load={loadActivities}
      renderItems={({ activities }) => activities.map((activity) => (
        <>{activity.type}: {activity.minutes} minutes, {activity.points} points</>
      ))}
    />
  );
}
