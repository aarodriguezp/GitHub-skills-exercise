import { CapabilityCard } from './CapabilityCard.js';

import { getJson } from '../api/client.js';

type Team = { name: string; members: string[] };
type TeamsResponse = { teams: Team[] };
const loadTeams = () => getJson<TeamsResponse>('/api/teams');

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      emptyText="No teams yet."
      load={loadTeams}
      renderItems={({ teams }) => teams.map((team) => (
        <>{team.name}: {team.members.join(', ')}</>
      ))}
    />
  );
}
