import {Logger} from '@/util/logger';
import {Entity} from './entity';

export enum SkillType {
    MaxHealth,
    HealthRegen,
    MovementSpeed,
    BodyDamage,
    BulletDamage,
    BulletPenetration,
    BulletRange,
    Range,
    Shield,
    ShieldRegen,
}

export interface Skill {
    type: SkillType;
    level: number;
    maxLevel: number;
    name: string;
}

export class SkillManager {
    private entity: Entity;
    private baseStats: {[key: string]: number} = {};

    public skillPoints: number = 0;
    public usedSkillPoints: number = 0;
    public skills: Map<SkillType, Skill> = new Map();

    private bulletSkills: Partial<Record<SkillType, number>> = {};

    constructor(entity: Entity) {
        this.entity = entity;
    }

    public updateBaseStats() {
        this.baseStats = {
            health: this.entity.setting.skill.health,
            regen: this.entity.setting.skill.regen,
            speed: this.entity.setting.skill.speed,
            damage: this.entity.setting.skill.damage,
            pen: this.entity.setting.skill.pen,
            range: this.entity.setting.skill.range || 0,
            shield: this.entity.setting.skill.shield || 0,
            shieldRegen: this.entity.setting.skill.shieldRegen || 0,
        };
    }

    public addSkillPoints(points: number) {
        this.skillPoints += points;
    }

    public getSkillPoints(): number {
        return this.skillPoints;
    }

    public upgradeSkill(type: SkillType): boolean {
        const skill = this.skills.get(type);
        if (!skill) return false;

        if (this.skillPoints <= 0 || skill.level >= skill.maxLevel) {
            return false;
        }

        skill.level++;
        this.skillPoints--;
        this.usedSkillPoints++;
        this.applyAllSkillEffects();
        return true;
    }

    private calculateSkillMultiplier(level: number): number {
        return 1 + Math.log(level + 1) * 0.15;
    }

    public bulletSkill(bullet: Entity) {
        for (const type in this.bulletSkills) {
            const skillType = +type as SkillType;

            if (bullet.skillManager.skills.has(skillType)) {
                const skill = bullet.skillManager.skills.get(skillType);

                skill.level = this.bulletSkills[skillType];
            } else {
                bullet.skillManager.skills.set(skillType, {
                    type: skillType,
                    level: this.bulletSkills[skillType],
                    maxLevel: 0,
                    name: '',
                });
            }
        }
    }

    private addToBulletSkill(type: SkillType) {
        if (!this.bulletSkills[type]) this.bulletSkills[type] = 0;

        this.bulletSkills[type] += 1;
    }

    public applyAllSkillEffects() {
        this.entity.setting.skill.health = this.baseStats.health;
        this.entity.setting.skill.regen = this.baseStats.regen;
        this.entity.setting.skill.speed = this.baseStats.speed;
        this.entity.setting.skill.damage = this.baseStats.damage;
        this.entity.setting.skill.pen = this.baseStats.pen;
        if (this.baseStats.range) {
            this.entity.setting.skill.range = this.baseStats.range;
        }
        this.entity.setting.skill.shield = this.baseStats.shield;
        this.entity.setting.skill.shieldRegen = this.baseStats.shieldRegen;

        this.bulletSkills = {};

        for (const [type, skill] of this.skills) {
            if (skill.level > 0) {
                const multiplier = this.calculateSkillMultiplier(skill.level);
                const baseMultiplier = 0.7;

                switch (type) {
                    case SkillType.MaxHealth:
                        this.entity.setting.skill.health = this.baseStats.health * (1 + (multiplier - 1) * baseMultiplier);
                        break;
                    case SkillType.HealthRegen:
                        this.entity.setting.skill.regen = this.baseStats.regen * (1 + (multiplier - 1) * baseMultiplier);
                        break;
                    case SkillType.MovementSpeed:
                        this.entity.setting.skill.speed = this.baseStats.speed * (1 + (multiplier - 1) * baseMultiplier);
                        break;
                    case SkillType.BodyDamage:
                        this.entity.setting.skill.damage = this.baseStats.damage * (1 + (multiplier - 1) * baseMultiplier);
                        break;
                    case SkillType.BulletDamage:
                        this.addToBulletSkill(SkillType.BodyDamage);
                        break;
                    case SkillType.BulletPenetration:
                        this.addToBulletSkill(SkillType.BodyDamage);
                        break;
                    case SkillType.BulletRange:
                        this.addToBulletSkill(SkillType.Range);
                        break;
                    case SkillType.Range:
                        if (!this.bulletSkills[SkillType.BulletDamage]) this.bulletSkills[SkillType.BulletDamage] = 0;

                        this.bulletSkills[SkillType.BulletDamage] += 1;
                        break;
                    case SkillType.Shield:
                        this.entity.setting.skill.shield = this.baseStats.shield * (1 + (multiplier - 1) * baseMultiplier);
                        break;
                    case SkillType.ShieldRegen:
                        this.entity.setting.skill.shieldRegen = this.baseStats.shieldRegen * (1 + (multiplier - 1) * baseMultiplier);
                        break;
                }
            }
        }
    }

    public getSkill(type: SkillType): Skill | undefined {
        return this.skills.get(type);
    }

    public getAllSkills(): Skill[] {
        return Array.from(this.skills.values());
    }
}
