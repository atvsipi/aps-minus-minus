class Score {
    level = 0;
    levelScore = 0;

    score = 0;

    scoreProgress = 0;

    update() {
        const scoreProgress = this.score / this.levelScore;

        if (scoreProgress !== this.scoreProgress) {
            const diff = Math.abs(scoreProgress - this.scoreProgress);

            if (diff < 0.001) {
                this.scoreProgress = scoreProgress;
            } else {
                this.scoreProgress += (scoreProgress - this.scoreProgress) / 70;
            }
        }

        if (isNaN(this.scoreProgress)) this.scoreProgress = 0;
    }
}

export const score = new Score();
