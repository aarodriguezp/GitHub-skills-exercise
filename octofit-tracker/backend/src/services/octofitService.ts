import { Activity, Team, User, Workout } from '../models/index.js';

function isRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input);
}

function isObjectId(input: unknown): input is string {
  return typeof input === 'string' && /^[\da-f]{24}$/i.test(input);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input;

  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw Object.assign(new Error('Valid userId and teamId are required'), { status: 400 });
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw Object.assign(new Error('Activity type is required'), { status: 400 });
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Activity minutes must be a positive number'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot } = input;
  const members = input.members === undefined ? [] : input.members;
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw Object.assign(new Error('Team mascot is required'), { status: 400 });
  }
  if (!Array.isArray(members) || !members.every(isObjectId)) {
    throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
  }

  const memberIds = [...new Set(members)];
  const existingMembers = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
  if (existingMembers.length !== memberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: existingMembers.map((member) => member._id),
  });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map(totals.map((total) => [total._id.toString(), total.totalPoints]));

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const activityType = recentActivity?.type.trim().toLowerCase();
  const activityFocus = activityType
    ? ({ run: 'endurance', running: 'endurance', cycle: 'endurance', cycling: 'endurance', walk: 'endurance' }[activityType] ?? activityType)
    : undefined;
  const goalFocus = user.fitnessGoal.trim().toLowerCase();
  const preferredFocus =
    (activityFocus && workouts.some((workout) => workout.focus.toLowerCase() === activityFocus) && activityFocus) ||
    (workouts.some((workout) => workout.focus.toLowerCase() === goalFocus) && goalFocus) ||
    goalFocus;
  const orderedWorkouts = [
    ...workouts.filter((workout) => workout.focus.toLowerCase() === preferredFocus),
    ...workouts.filter((workout) => workout.focus.toLowerCase() !== preferredFocus),
  ];
  const reason = recentActivity
    ? `Recommended based on your recent ${activityType} activity (${preferredFocus} focus).`
    : `Recommended based on your ${goalFocus} fitness goal.`;

  return orderedWorkouts.map((workout) => ({ ...workout, reason }));
}

export { User };
