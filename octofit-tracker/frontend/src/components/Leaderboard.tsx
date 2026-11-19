import { CapabilityCard } from './CapabilityCard.js';

import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };
const loadLeaderboard = () => getJson<LeaderboardResponse>('/api/leaderboard');

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      emptyText="No leaderboard rankings yet."
      load={loadLeaderboard}
      renderItems={({ leaderboard }) => leaderboard.map((entry) => (
        <>{entry.rank}. {entry.teamName}: {entry.totalPoints} points</>
      ))}
    />
  );
}
