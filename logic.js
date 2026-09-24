(() => {
    "use strict";

    const choices = ["rock", "paper", "scissors"];
    const beats = { rock: "scissors", paper: "rock", scissors: "paper" };

    const elements = {
        choiceButtons: document.querySelectorAll(".choice-button"),
        playerChoice: document.querySelector("#player-choice"),
        computerChoice: document.querySelector("#computer-choice"),
        resultPanel: document.querySelector("#result-panel"),
        resultMessage: document.querySelector("#result-message"),
        resultIcon: document.querySelector(".result-icon"),
        replayButton: document.querySelector("#replay-button"),
        roundCount: document.querySelector("#round-count"),
        wins: document.querySelector("#wins"),
        losses: document.querySelector("#losses"),
        draws: document.querySelector("#draws"),
        totalGames: document.querySelector("#total-games"),
        resetButton: document.querySelector("#reset-button"),
        statusMessage: document.querySelector("#status-message")
    };

    let stats = RPSData.load();

    function formatChoice(choice) {
        return choice ? choice[0].toUpperCase() + choice.slice(1) : "—";
    }

    function getRoundResult(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) return "draw";
        return beats[playerChoice] === computerChoice ? "win" : "loss";
    }

    function renderStats() {
        elements.wins.textContent = stats.wins;
        elements.losses.textContent = stats.losses;
        elements.draws.textContent = stats.draws;
        elements.totalGames.textContent = stats.totalGames;
        elements.roundCount.textContent = `Round ${stats.totalGames}`;
    }

    function renderResult(result) {
        const messages = {
            win: ["You win!", "✓"],
            loss: ["Computer wins this round.", "×"],
            draw: ["It’s a draw.", "＝"]
        };
        const [message, icon] = messages[result];
        elements.resultPanel.className = `result-panel is-${result}`;
        elements.resultMessage.textContent = message;
        elements.resultIcon.textContent = icon;
    }

    function playRound(playerChoice) {
        if (!choices.includes(playerChoice)) return;
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        const result = getRoundResult(playerChoice, computerChoice);

        elements.playerChoice.textContent = formatChoice(playerChoice);
        elements.computerChoice.textContent = formatChoice(computerChoice);
        stats[result === "win" ? "wins" : result === "loss" ? "losses" : "draws"] += 1;
        stats.totalGames += 1;
        stats.history.push({ playerChoice, computerChoice, result, timestamp: new Date().toISOString() });
        stats.history = stats.history.slice(-RPSData.HISTORY_LIMIT);
        stats.currentWinStreak = result === "win" ? stats.currentWinStreak + 1 : 0;
        stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak);
        renderResult(result);
        renderStats();
        if (!RPSData.save(stats)) {
            elements.statusMessage.textContent = "Statistics could not be saved in this browser.";
        }
        elements.replayButton.hidden = false;
    }

    function resetStats() {
        if (!window.confirm("Reset all saved statistics? This cannot be undone.")) return;
        stats = RPSData.emptyStats();
        if (!RPSData.clear()) {
            elements.statusMessage.textContent = "Statistics were reset for this session, but storage could not be cleared.";
        }
        renderStats();
        elements.statusMessage.textContent = "Statistics reset.";
    }

    elements.choiceButtons.forEach((button) => {
        button.addEventListener("click", () => playRound(button.dataset.choice));
    });
    elements.replayButton.addEventListener("click", () => {
        elements.resultMessage.textContent = "Choose your next move.";
        elements.resultPanel.className = "result-panel is-idle";
        elements.resultIcon.textContent = "✦";
        elements.replayButton.hidden = true;
    });
    elements.resetButton.addEventListener("click", resetStats);

    renderStats();
})();

