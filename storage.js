(() => {
    "use strict";

    const STORAGE_KEY = "rockPaperScissorsStatistics";
    const HISTORY_LIMIT = 20;
    const choices = ["rock", "paper", "scissors"];
    const results = ["win", "loss", "draw"];
    const emptyStats = () => ({
        wins: 0, losses: 0, draws: 0, totalGames: 0,
        currentWinStreak: 0, bestWinStreak: 0, history: []
    });

    function isValidHistoryEntry(entry) {
        return entry &&
            choices.includes(entry.playerChoice) &&
            choices.includes(entry.computerChoice) &&
            results.includes(entry.result) &&
            typeof entry.timestamp === "string" &&
            !Number.isNaN(Date.parse(entry.timestamp));
    }

    function normalizeStats(value) {
        if (!value || typeof value !== "object") return emptyStats();
        const stats = emptyStats();
        ["wins", "losses", "draws", "totalGames", "currentWinStreak", "bestWinStreak"].forEach((key) => {
            if (Number.isSafeInteger(value[key]) && value[key] >= 0) stats[key] = value[key];
        });
        if (
            stats.wins + stats.losses + stats.draws !== stats.totalGames ||
            stats.currentWinStreak > stats.bestWinStreak ||
            stats.bestWinStreak > stats.totalGames
        ) return emptyStats();
        if (Array.isArray(value.history)) {
            stats.history = value.history.filter(isValidHistoryEntry).slice(-HISTORY_LIMIT);
        }
        return stats;
    }

    function load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? normalizeStats(JSON.parse(stored)) : emptyStats();
        } catch {
            return emptyStats();
        }
    }

    function save(stats) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStats(stats)));
            return true;
        } catch {
            return false;
        }
    }

    function clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch {
            return false;
        }
    }

    window.RPSData = { HISTORY_LIMIT, load, save, clear, emptyStats };
})();
