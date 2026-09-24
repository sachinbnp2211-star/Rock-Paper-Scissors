(() => {
    "use strict";

    const stats = RPSData.load();
    const elements = {
        totalGames: document.querySelector("#total-games"),
        wins: document.querySelector("#wins"),
        losses: document.querySelector("#losses"),
        draws: document.querySelector("#draws"),
        winPercentage: document.querySelector("#win-percentage"),
        lossPercentage: document.querySelector("#loss-percentage"),
        drawPercentage: document.querySelector("#draw-percentage"),
        winBar: document.querySelector("#win-bar"),
        lossBar: document.querySelector("#loss-bar"),
        drawBar: document.querySelector("#draw-bar"),
        currentStreak: document.querySelector("#current-streak"),
        bestStreak: document.querySelector("#best-streak"),
        historyBody: document.querySelector("#history-body"),
        emptyHistory: document.querySelector("#empty-history"),
        resetButton: document.querySelector("#reset-button"),
        statusMessage: document.querySelector("#status-message")
    };

    const formatChoice = (choice) => choice[0].toUpperCase() + choice.slice(1);
    const percentage = (value) => stats.totalGames ? Math.round((value / stats.totalGames) * 100) : 0;

    function getStreaks() {
        if (stats.bestWinStreak > 0 || stats.currentWinStreak > 0) {
            return { current: stats.currentWinStreak, best: stats.bestWinStreak };
        }
        let current = 0;
        let best = 0;
        let running = 0;
        stats.history.forEach((game) => {
            if (game.result === "win") {
                running += 1;
                best = Math.max(best, running);
            } else {
                running = 0;
            }
        });
        for (let index = stats.history.length - 1; index >= 0 && stats.history[index].result === "win"; index -= 1) current += 1;
        return { current, best };
    }

    function renderSummary() {
        elements.totalGames.textContent = stats.totalGames;
        elements.wins.textContent = stats.wins;
        elements.losses.textContent = stats.losses;
        elements.draws.textContent = stats.draws;
        const values = [
            [elements.winPercentage, elements.winBar, percentage(stats.wins)],
            [elements.lossPercentage, elements.lossBar, percentage(stats.losses)],
            [elements.drawPercentage, elements.drawBar, percentage(stats.draws)]
        ];
        values.forEach(([label, bar, value]) => {
            label.textContent = `${value}%`;
            bar.style.width = `${value}%`;
        });
        const streaks = getStreaks();
        elements.currentStreak.textContent = streaks.current;
        elements.bestStreak.textContent = streaks.best;
    }

    function renderHistory() {
        elements.historyBody.replaceChildren();
        elements.emptyHistory.hidden = stats.history.length > 0;
        stats.history.slice().reverse().forEach((game) => {
            const row = document.createElement("tr");
            const resultLabel = game.result === "win" ? "Win" : game.result === "loss" ? "Loss" : "Draw";
            const playerCell = document.createElement("td");
            const computerCell = document.createElement("td");
            const resultCell = document.createElement("td");
            const timeCell = document.createElement("td");
            const resultTag = document.createElement("span");
            const time = document.createElement("time");
            playerCell.textContent = formatChoice(game.playerChoice);
            computerCell.textContent = formatChoice(game.computerChoice);
            resultTag.className = `result-tag result-${game.result}`;
            resultTag.textContent = resultLabel;
            resultCell.append(resultTag);
            time.dateTime = game.timestamp;
            time.textContent = new Date(game.timestamp).toLocaleString();
            timeCell.append(time);
            row.append(playerCell, computerCell, resultCell, timeCell);
            elements.historyBody.append(row);
        });
    }

    elements.resetButton.addEventListener("click", () => {
        if (!window.confirm("Reset all saved statistics and game history? This cannot be undone.")) return;
        const cleared = RPSData.clear();
        if (!cleared) {
            elements.statusMessage.textContent = "Statistics could not be cleared in this browser.";
            return;
        }
        window.location.reload();
    });

    renderSummary();
    renderHistory();
})();
