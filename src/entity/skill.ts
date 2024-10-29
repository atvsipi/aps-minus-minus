import {Entity} from './entity';

export enum SkillType {
    MaxHealth = 'MaxHealth',
    HealthRegen = 'HealthRegen',
    MovementSpeed = 'MovementSpeed',
    Damage = 'Damage',
    Penetration = 'Penetration',
    Range = 'Range',
    Shield = 'Shield',
}

export interface Skill {
    type: SkillType;
    level: number;
    maxLevel: number;
    name: string;
    description: string;
}

export class SkillManager {
    private entity: Entity;
    private skillPoints: number = 0;
    private skills: Map<SkillType, Skill> = new Map();
    private baseStats: {[key: string]: number} = {};

    constructor(entity: Entity) {
        this.entity = entity;
        this.initializeSkills();
        this.updateBaseStats();
    }

    private initializeSkills() {
        this.skills.set(SkillType.MaxHealth, {
            type: SkillType.MaxHealth,
            level: 0,
            maxLevel: 10,
            name: 'Max Health',
            description: 'Increases maximum health',
        });

        this.skills.set(SkillType.HealthRegen, {
            type: SkillType.HealthRegen,
            level: 0,
            maxLevel: 10,
            name: 'Health Regeneration',
            description: 'Increases health regeneration rate',
        });

        this.skills.set(SkillType.MovementSpeed, {
            type: SkillType.MovementSpeed,
            level: 0,
            maxLevel: 10,
            name: 'Movement Speed',
            description: 'Increases movement speed',
        });

        this.skills.set(SkillType.Damage, {
            type: SkillType.Damage,
            level: 0,
            maxLevel: 10,
            name: 'Bullet Damage',
            description: 'Increases bullet damage',
        });

        this.skills.set(SkillType.Penetration, {
            type: SkillType.Penetration,
            level: 0,
            maxLevel: 10,
            name: 'Bullet Penetration',
            description: 'Increases bullet penetration',
        });

        this.skills.set(SkillType.Range, {
            type: SkillType.Range,
            level: 0,
            maxLevel: 15,
            name: 'Bullet Range',
            description: 'Increases bullet range',
        });

        this.skills.set(SkillType.Shield, {
            type: SkillType.Shield,
            level: 0,
            maxLevel: 10,
            name: 'Shield',
            description: 'Increases shield capacity',
        });
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
        this.applyAllSkillEffects();
        return true;
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
        if (this.skills.get(SkillType.Shield).level > 0) {
            const multiplier = 1 + this.skills.get(SkillType.Shield).level * 0.1;
            this.entity.setting.skill.shield = this.baseStats.shield * multiplier;
        }

        for (const [type, skill] of this.skills) {
            if (skill.level > 0) {
                const multiplier = 1 + skill.level * 0.1;
                switch (type) {
                    case SkillType.MaxHealth:
                        this.entity.setting.skill.health = this.baseStats.health * multiplier;
                        break;
                    case SkillType.HealthRegen:
                        this.entity.setting.skill.regen = this.baseStats.regen * multiplier;
                        break;
                    case SkillType.MovementSpeed:
                        this.entity.setting.skill.speed = this.baseStats.speed * multiplier;
                        break;
                    case SkillType.Damage:
                        this.entity.setting.skill.damage = this.baseStats.damage * multiplier;
                        break;
                    case SkillType.Penetration:
                        this.entity.setting.skill.pen = this.baseStats.pen * multiplier;
                        break;
                    case SkillType.Range:
                        if (this.baseStats.range) {
                            this.entity.setting.skill.range = this.baseStats.range * multiplier;
                        }
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
