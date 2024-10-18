class Score {
    level = 0;
    levelScore = 0;

    lastLevelScore = 0;
    oldLevelScore = 0;

    score = 0;

    scoreProgress = 0;

    lastLevel = 0;
    animate = false;

    update() {
        if (!this.animate) {
            if (this.lastLevel < this.level) return (this.animate = true);

            if (this.levelScore !== this.lastLevelScore) {
                this.oldLevelScore = this.lastLevelScore;
                this.lastLevelScore = this.levelScore;
            }

            let scoreProgress = (this.score - this.oldLevelScore) / (this.lastLevelScore - this.oldLevelScore);

            if (scoreProgress === Infinity) scoreProgress = 1;
            if (scoreProgress === -Infinity) scoreProgress = 0;
            if (isNaN(scoreProgress)) scoreProgress = 0;

            if (scoreProgress !== this.scoreProgress) {
                const diff = Math.abs(scoreProgress - this.scoreProgress);

                if (diff < 0.001) {
                    this.scoreProgress = scoreProgress;
                } else {
                    this.scoreProgress += (scoreProgress - this.scoreProgress) / 30;
                }
            }

            if (isNaN(this.scoreProgress)) this.scoreProgress = 0;
        } else {
            if (this.scoreProgress < -0.2) {
                this.animate = false;
                this.lastLevel = this.level;

                return;
            }

            this.scoreProgress -= 0.03;
        }
    }
}

export const score = new Score();
window.score = score;
