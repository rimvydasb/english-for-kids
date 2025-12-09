import { InGameStatsMap } from '@/lib/statistics/AStatisticsManager';
import { SubjectRecord } from '@/lib/types';

export const ensureStatsForSubjects = <T extends SubjectRecord>(
    subjects: T[],
    stats: InGameStatsMap,
): InGameStatsMap => {
    const next: InGameStatsMap = { ...stats };
    subjects.forEach((subject) => {
        const key = subject.getSubject();
        const existing = next[key];
        next[key] =
            existing ??
            {
                key,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
                learned: false,
            };
    });
    return next;
};
