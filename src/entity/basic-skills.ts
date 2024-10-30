import {SkillType} from './skill';

export const BASIC_SKILLS: Partial<
    Record<
        SkillType,
        {
            level: number;
            maxLevel: number;
            name: string;
        }
    >
> = {
    [SkillType.MaxHealth]: {
        level: 0,
        maxLevel: 10,
        name: 'Max Health',
    },
    [SkillType.HealthRegen]: {
        level: 0,
        maxLevel: 10,
        name: 'Health Regeneration',
    },
    [SkillType.MovementSpeed]: {
        level: 0,
        maxLevel: 10,
        name: 'Movement Speed',
    },
    [SkillType.BodyDamage]: {
        level: 0,
        maxLevel: 10,
        name: 'Body Damage',
    },
    [SkillType.BulletDamage]: {
        level: 0,
        maxLevel: 10,
        name: 'Bullet Damage',
    },
    [SkillType.BulletPenetration]: {
        level: 0,
        maxLevel: 10,
        name: 'Bullet Penetration',
    },
    [SkillType.BulletRange]: {
        level: 0,
        maxLevel: 3,
        name: 'Bullet Range',
    },
    [SkillType.Shield]: {
        level: 0,
        maxLevel: 10,
        name: 'Shield',
    },
    [SkillType.ShieldRegen]: {
        level: 0,
        maxLevel: 10,
        name: 'Shield Regen',
    },
};
