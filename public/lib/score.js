class Score {
    level = 0;
    levelScore = 0;

    score = 0;

    scoreProgress = 0;

    lastLevel = 0;
    animate = false;

    update() {
        if (this.lastLevel < this.level) console.log(1);
        if (!this.animate) {
            if (this.lastLevel < this.level) return (this.animate = true);

            const scoreProgress = this.score / this.levelScore;

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
