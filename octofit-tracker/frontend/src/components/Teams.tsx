import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadTeams = () => getJson<unknown>('/api/teams');

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadData={loadTeams}
      dataKey="teams"
      emptyMessage="No teams yet."
      renderItem={(team) => `${String(team.name)}${Array.isArray(team.members) && team.members.length ? ` · Members: ${team.members.map(String).join(', ')}` : ''}`}
    />
  );
}
