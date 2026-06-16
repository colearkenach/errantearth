export const EE = {};

EE.ALIGNMENTS = {
  principled:   "Principled",
  scrupulous:   "Scrupulous",
  taoist:       "Taoist",
  unprincipled: "Unprincipled",
  anarchist:    "Anarchist",
  miscreant:    "Miscreant",
  aberrant:     "Aberrant",
  diabolic:     "Diabolic"
};

EE.PSIONIC_LEVELS = {
  none:   "None",
  minor:  "Minor",
  major:  "Major",
  master: "Master"
};

EE.DAMAGE_TYPES = {
  kinetic:   "Kinetic",
  energy:    "Energy",
  laser:     "Laser",
  plasma:    "Plasma",
  ion:       "Ion",
  explosive: "Explosive",
  magic:     "Magic",
  psionic:   "Psionic"
};

EE.POWER_SOURCES = {
  magic:        "Magic",
  psionic:      "Psionic",
  natural:      "Natural",
  mutation:     "Mutation",
  technology:   "Technology",
  supernatural: "Supernatural"
};

EE.HTH_TYPES = {
  none:        "None",
  basic:       "Basic",
  expert:      "Expert",
  martialArts: "Martial Arts",
  commando:    "Commando",
  assassin:    "Assassin",
  aikido:      "Aikido",
  judo:        "Judo",
  jujitsu:     "Jujitsu",
  karate:      "Karate",
  kendo:       "Kendo",
  ninjitsu:    "Ninjitsu",
  samurai:     "Samurai",
  tengJutsu:   "Teng-Jutsu",
  drunkenStyleKungFu: "Drunken Style Kung Fu",
  cyberKnightZen: "Cyber-Knight Zen Combat",
  dragon:      "Dragon",
  anYinKungFu: "An Yin Kung Fu",
  baGuaKungFu: "Ba Gua Kung Fu",
  bakMeiKungFu: "Bak Mei Kung Fu",
  bokPaiKungFu: "Bok Pai Kung Fu",
  chaoTaKungFu: "Chao Ta Kung Fu",
  chiHsuanMen: "Chi Hsuan Men",
  chinNa: "Ch'in-Na",
  choyLiFut: "Choy-Li-Fut",
  fuChiaoPai: "Fu-Chiao Pai",
  guiLongKungFu: "Gui Long Kung Fu",
  hanYuKungFu: "Han Yu Kung Fu",
  hsienHsiaKungFu: "Hsien Hsia Kung Fu",
  hsingI: "Hsing-I",
  kuoChuan: "Kuo-Ch'uan",
  leeKwanChoo: "Lee Kwan Choo",
  liangHsiung: "Liang Hsiung",
  mienChuan: "Mien-Ch'uan",
  monkeyStyleKungFu: "Monkey Style Kung Fu",
  paoChih: "Pao Chih",
  shanTungKungFu: "Shan Tung Kung Fu",
  shihBaBanWuYi: "Shih Ba Ban Wu Yi",
  paoPatMei: "Pao Pat Mei",
  shaoLin: "Shao-Lin",
  snakeStyle: "Snake Style",
  taiChiChuan: "Tai-Chi Ch'uan",
  tienHsueh: "Tien-Hsueh Touch Mastery",
  tongLunKungFu: "Tong Lun Kung Fu",
  triadAssassinTraining: "Triad Assassin Training"
};

EE.POWER_ARMOR_HTH_TYPES = {
  none: "None",
  robotCombatBasic: "Robot Combat: Basic",
  rpaFlyingPowerArmor: "Power Armor Combat Elite: Flying Power Armor",
  rpaGroundBasedPowerArmor: "Power Armor Combat Elite: Ground-Based Power Armor",
  rpaHeavyVehicularRobots: "Robot Combat Elite: Heavy Vehicular Robots",
  rpaHeavyGroundRobots: "Robot Combat Elite: Heavy Ground Robots",
  rpaLightGroundRobots: "Robot Combat Elite: Light Ground Robots"
};

EE.LEGACY_PHYSICAL_TYPES = {
  normal: "Normal",
  augmented: "Augmented",
  robotic: "Robotic",
  giantRobotic: "Giant Robotic",
  supernatural: "Supernatural"
};

EE.RIFTS_COMBAT_REFERENCES = [
  {
    section: "Core Rolls",
    entries: [
      { name: "Strike", roll: "1D20 + Strike", bonusKey: "strike", target: "5+ hits; 1-4 misses", actions: "1", note: "Natural 20 is critical and only another natural 20 defense stops it.", source: "https://www.lawner.org.uk/rpg/rifts/combat/strike.html" },
      { name: "Parry", roll: "1D20 + Parry", bonusKey: "parry", target: "Meet or beat Strike", actions: "Free with HtH; otherwise 1", note: "Melee defense; unseen/rear attacks cannot be parried.", source: "https://www.lawner.org.uk/rpg/rifts/combat/parry.html" },
      { name: "Dodge", roll: "1D20 + Dodge", bonusKey: "dodge", target: "Meet or beat Strike", actions: "1", note: "Physical defense; unseen/rear attacks cannot be dodged.", source: "https://www.lawner.org.uk/rpg/rifts/combat/dodge.html" },
      { name: "Automatic Dodge", roll: "1D20 + Auto Dodge", bonusKey: "dodge", target: "As Dodge", actions: "Free", note: "Only when a feature specifically grants Automatic Dodge.", source: "https://www.lawner.org.uk/rpg/rifts/combat/autododg.htm" },
      { name: "Roll With Impact", roll: "1D20 + Roll", bonusKey: "roll", target: "Beat attack roll, or 14+ without one", actions: "Usually 1", note: "Halves valid impact/fall/explosive damage on success.", source: "https://www.lawner.org.uk/rpg/rifts/combat/rollimpa.html" },
      { name: "Disarm", roll: "1D20 + Disarm", bonusKey: "disarm", target: "High roll wins", actions: "1", note: "Declared before rolling; no damage on a successful disarm.", source: "https://www.lawner.org.uk/rpg/rifts/combat/disarm.htm" },
      { name: "Entangle", roll: "1D20 + Entangle", bonusKey: "entangle", target: "Beat Strike", actions: "1", note: "Used instead of parry/dodge; defender does not win ties.", source: "https://www.lawner.org.uk/rpg/rifts/combat/entangle.html" },
      { name: "Pull Punch", roll: "1D20 + Pull Punch", bonusKey: "pullPunch", target: "11+ to pull", actions: "1", note: "Declare first; failed control can still inflict normal damage.", source: "https://www.lawner.org.uk/rpg/rifts/combat/pullpunc.htm" }
    ]
  },
  {
    section: "Unarmed Attacks",
    entries: [
      { name: "Punch", roll: "1D20 + Strike", bonusKey: "strike", damage: "1d4", damageAddsHth: true, target: "5+ hits", actions: "1", note: "Normal hand strike.", source: "https://www.lawner.org.uk/rpg/rifts/combat/punch.html" },
      { name: "Power Punch", roll: "1D20 + Strike", bonusKey: "strike", damage: "(1d4 * 2)", damageAddsHth: true, target: "5+ hits", actions: "2", note: "Double normal punch damage, then add applicable bonuses.", source: "https://www.lawner.org.uk/rpg/rifts/combat/powpunch.html" },
      { name: "Kick", roll: "1D20 + Strike", bonusKey: "strike", damage: "1d8", damageAddsHth: true, target: "5+ hits", actions: "1", note: "Basic kick attack.", source: "https://www.lawner.org.uk/rpg/rifts/combat/kickattk.htm" },
      { name: "Power Kick", roll: "1D20 + Strike", bonusKey: "strike", damage: "(1d8 * 2)", damageAddsHth: true, target: "5+ hits", actions: "2", note: "Double normal kick damage, then add applicable bonuses.", source: "https://www.lawner.org.uk/rpg/rifts/combat/powkick.html" },
      { name: "Karate Punch", roll: "1D20 + Strike", bonusKey: "strike", damage: "2d4", damageAddsHth: true, target: "5+ hits", actions: "1", note: "Requires suitable hand-to-hand training.", source: "https://www.lawner.org.uk/rpg/rifts/combat/karatpun.html" },
      { name: "Karate Kick", roll: "1D20 + Strike", bonusKey: "strike", damage: "2d6", damageAddsHth: true, target: "5+ hits", actions: "1", note: "Requires suitable hand-to-hand training.", source: "https://www.lawner.org.uk/rpg/rifts/combat/karakick.htm" },
      { name: "Knee", roll: "1D20 + Strike", bonusKey: "strike", damage: "1d6", damageAddsHth: true, target: "5+ hits", actions: "1", note: "Close unarmed strike.", source: "https://www.lawner.org.uk/rpg/rifts/combat/karakick.htm" },
      { name: "Leap Kick", roll: "1D20 + Strike", bonusKey: "strike", damage: "3d8", damageAddsHth: true, target: "5+ hits", actions: "2", note: "Restricted by combat training; cannot be made as a power leap kick.", source: "https://www.lawner.org.uk/rpg/rifts/combat/leapkick.htm" },
      { name: "Body Flip / Throw", roll: "1D20 + Strike", bonusKey: "strike", damage: "1d6", damageAddsHth: true, target: "5+ hits", actions: "1", note: "Victim loses initiative and one action; roll with impact can halve damage.", source: "https://www.lawner.org.uk/rpg/rifts/combat/bodyflip.htm" },
      { name: "Body Block / Tackle", roll: "1D20 + Strike", bonusKey: "strike", damage: "1d4", damageAddsHth: true, target: "5+ hits; balance vs knockdown", actions: "2", note: "Successful hit can knock the target down and cost them initiative/action.", source: "https://www.lawner.org.uk/rpg/rifts/combat/bodblktac.htm" }
    ]
  },
  {
    section: "Special Situations",
    entries: [
      { name: "Back Flip Dodge", roll: "1D20 + Back Flip", target: "Beat Strike", actions: "1", note: "Uses back flip bonus instead of dodge bonus.", source: "https://www.lawner.org.uk/rpg/rifts/combat/backflip.htm" },
      { name: "Back Flip Attack", roll: "1D20 + Back Flip", damage: "By attached kick/strike", target: "5+ hits", actions: "1", note: "Uses back flip bonus instead of strike; no death blow or knockout/stun.", source: "https://www.lawner.org.uk/rpg/rifts/combat/bflipattk.htm" },
      { name: "Back Flip Escape", roll: "No roll", target: "Reposition", actions: "1", note: "Leaves combat range and grants initiative.", source: "https://www.lawner.org.uk/rpg/rifts/combat/bflipescp.htm" },
      { name: "Hold", roll: "Opposed 1D20 + P.P.", target: "High roll wins", actions: "1", note: "Immobilizes while maintained; escape is opposed agility/P.P.", source: "https://www.lawner.org.uk/rpg/rifts/combat/holds.htm" },
      { name: "Knockout / Stun", roll: "Declared Strike", bonusKey: "strike", target: "By HtH range or 5+", actions: "1", note: "Temporarily reduces the victim to one attack with no combat bonuses.", source: "https://www.lawner.org.uk/rpg/rifts/combat/knockstn.html" },
      { name: "Death Blow", roll: "Natural roll in listed range", target: "Declared before strike", actions: "Usually 2 if unrestricted", note: "Does not apply to guns and generally must bypass armor.", source: "https://www.lawner.org.uk/rpg/rifts/combat/deathblw.html" },
      { name: "Simultaneous Attack", roll: "Normal attack", bonusKey: "strike", target: "Both attacks proceed", actions: "1", note: "Chosen instead of defending; normally neither combatant defends.", source: "https://www.lawner.org.uk/rpg/rifts/combat/simultan.html" },
      { name: "Blind / Darkness", roll: "Apply -10", target: "Natural rolls only", actions: "Normal", note: "Normal combat bonuses do not apply; movement and sight-based skills suffer.", source: "https://www.lawner.org.uk/rpg/rifts/combat/blind.htm" },
      { name: "Sneak Attack", roll: "By situation", target: "If undetected", actions: "1+", note: "Attacker has initiative; first unseen strike cannot be parried or dodged.", source: "https://www.lawner.org.uk/rpg/rifts/combat/sneak.html" },
      { name: "Knockdown Impact", roll: "Percent chance by M.D.", target: "Damage band", actions: "Penalty varies", note: "Heavy impacts can cost one action or all actions when severe.", source: "https://www.lawner.org.uk/rpg/rifts/combat/knockdwn.html" }
    ]
  }
];

// EE Legacy hand-to-hand advancement tables. Values are cumulative base bonuses
// unlocked at the listed level; actor sheet manual fields are added on top.
const RIFTS_HTH_BASE = {
  attacks: 0,
  initiative: 0,
  strike: 0,
  parry: 0,
  dodge: 0,
  disarm: 0,
  entangle: 0,
  damage: 0,
  pullPunch: 0,
  roll: 0,
  horrorFactor: 0,
  critical: 20,
  knockout: 20
};
const RIFTS_HTH_STATS = Object.keys(RIFTS_HTH_BASE);
const riftsHthLevels = entries => {
  const running = { ...RIFTS_HTH_BASE };
  return entries.map(entry => {
    for (const key of RIFTS_HTH_STATS) {
      if (entry[key] !== undefined) running[key] = entry[key];
    }
    return {
      level: entry.level,
      ...running,
      notes: entry.notes ?? []
    };
  });
};

EE.RIFTS_HTH_TABLES = {
  none: {
    label: EE.HTH_TYPES.none,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, notes: ["Starts with one hand to hand attack per melee round, reflecting pitiful fighting skills. Can instead perform two non-combat melee actions at first level; each attack uses two non-combat actions."] },
      { level: 3, attacks: 2, dodge: 1, notes: ["Additional attack per melee round, +1 to dodge, and +1 non-combat melee action."] },
      { level: 6, notes: ["Two additional non-combat melee actions."] },
      { level: 9, attacks: 3, notes: ["Additional attack per melee round, for a total of three attacks. +1 non-combat melee action, for a total of six non-combat melee actions."] }
    ])
  },
  basic: {
    label: EE.HTH_TYPES.basic,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, pullPunch: 2, roll: 2, critical: 20, knockout: 20, notes: ["Starts with four attacks/actions per melee."] },
      { level: 2, parry: 2, dodge: 2 },
      { level: 3, notes: ["Kick attack does 1D6 damage."] },
      { level: 4, attacks: 5, notes: ["Additional attack/action per melee."] },
      { level: 5, strike: 1 },
      { level: 6, critical: 19, notes: ["Critical strike on an unmodified 19 or 20."] },
      { level: 7, damage: 2 },
      { level: 8, notes: ["Judo-style body throw/flip; victim loses initiative and one attack."] },
      { level: 9, attacks: 6, notes: ["Additional attack per melee"] },
      { level: 10, roll: 4, pullPunch: 4 },
      { level: 11, parry: 3, dodge: 3 },
      { level: 12, strike: 2 },
      { level: 13, notes: ["Critical strike or knockout from behind."] },
      { level: 14, damage: 4 },
      { level: 15, attacks: 7, notes: ["Additional attack/action per melee."] }
    ])
  },
  expert: {
    label: EE.HTH_TYPES.expert,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, pullPunch: 2, roll: 2, critical: 20, knockout: 20, notes: ["Starts with four attacks/actions per melee."] },
      { level: 2, parry: 3, dodge: 3 },
      { level: 3, strike: 2 },
      { level: 4, attacks: 5, notes: ["Additional attack/action per melee."] },
      { level: 5, notes: ["Kick attack does 1D6 damage."] },
      { level: 6, critical: 18, notes: ["Critical strike on an unmodified 18, 19, or 20."] },
      { level: 7, notes: ["W.P. Paired Weapons."] },
      { level: 8, notes: ["Judo-style body throw/flip; victim loses initiative and one attack."] },
      { level: 9, attacks: 6, notes: ["Additional attack per melee."] },
      { level: 10, damage: 3 },
      { level: 11, knockout: 18, notes: ["Knockout/stun on an unmodified 18, 19, or 20."] },
      { level: 12, parry: 5, dodge: 5 },
      { level: 13, notes: ["Critical strike or knockout from behind."] },
      { level: 14, attacks: 7, notes: ["Additional attack/action per melee."] },
      { level: 15, notes: ["Death blow on a natural 20."] }
    ])
  },
  martialArts: {
    label: EE.HTH_TYPES.martialArts,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, pullPunch: 3, roll: 3, critical: 20, knockout: 20, notes: ["Starts with four attacks/actions per melee."] },
      { level: 2, parry: 3, dodge: 3, strike: 2 },
      { level: 3, initiative: 1, notes: ["Karate-style kick does 1D8 or 2D4 damage."] },
      { level: 4, attacks: 5, notes: ["Additional attack/action per melee."] },
      { level: 5, entangle: 1, notes: ["Jump kick and entangle."] },
      { level: 6, critical: 18, notes: ["Critical strike on an unmodified 18, 19, or 20."] },
      { level: 7, disarm: 2, notes: ["W.P. Paired Weapons."] },
      { level: 8, notes: ["Leap attack."] },
      { level: 9, attacks: 6, notes: ["Additional attack/action per melee."] },
      { level: 10, notes: ["Judo-style body throw/flip; victim loses initiative and one attack."] },
      { level: 11, damage: 4 },
      { level: 12, parry: 5, dodge: 5 },
      { level: 13, knockout: 18, notes: ["Knockout/stun on an unmodified 18, 19, or 20."] },
      { level: 14, attacks: 7, notes: ["Additional attack/action per melee."] },
      { level: 15, notes: ["Death blow on a natural 20."] }
    ])
  },
  commando: {
    label: EE.HTH_TYPES.commando,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, horrorFactor: 2, critical: 20, knockout: 20, notes: ["W.P. Paired Weapons, body flip/throw, and body block/tackle."] },
      { level: 2, initiative: 1, strike: 1, parry: 2, dodge: 2, roll: 3, pullPunch: 3, notes: ["Backward sweep kick."] },
      { level: 3, initiative: 2, disarm: 1, notes: ["+1 to automatic body flip."] },
      { level: 4, attacks: 5, notes: ["Additional attack/action per melee and karate kick."] },
      { level: 5, notes: ["Automatic dodge and critical body flip/throw."] },
      { level: 6, initiative: 4, strike: 2, parry: 3, dodge: 3, notes: ["+1 to body flip/throw."] },
      { level: 7, damage: 2, horrorFactor: 3, disarm: 2, pullPunch: 5, notes: ["+1 automatic dodge."] },
      { level: 8, attacks: 6, roll: 4, notes: ["Jump kick and +1 to body flip/throw."] },
      { level: 9, notes: ["Death blow on a natural 18-20."] },
      { level: 10, initiative: 5, strike: 3, horrorFactor: 5 },
      { level: 11, disarm: 3, pullPunch: 6, notes: ["+1 to body flip/throw."] },
      { level: 12, damage: 4, parry: 4, dodge: 4, notes: ["+2 automatic dodge."] },
      { level: 13, attacks: 7, notes: ["Additional attack/action per melee."] },
      { level: 14, notes: ["Automatic body flip/throw."] },
      { level: 15, critical: 17, notes: ["Critical strike on a natural 17-20."] }
    ])
  },
  assassin: {
    label: EE.HTH_TYPES.assassin,
    levels: riftsHthLevels([
      { level: 1, attacks: 3, strike: 2, critical: 20, knockout: 20, notes: ["W.P. Paired Weapons."] },
      { level: 2, attacks: 5, notes: ["Two additional attacks/actions per melee."] },
      { level: 3, pullPunch: 3, roll: 3 },
      { level: 4, damage: 4, initiative: 1 },
      { level: 5, attacks: 6, notes: ["Additional attack/action per melee."] },
      { level: 6, parry: 3, dodge: 3, entangle: 2 },
      { level: 7, knockout: 17, notes: ["Knockout/stun on an unmodified 17-20."] },
      { level: 8, attacks: 7, initiative: 2 },
      { level: 9, initiative: 3, notes: ["Kick attack does 1D6 damage."] },
      { level: 10, critical: 19, notes: ["Critical strike on an unmodified 19 or 20."] },
      { level: 11, strike: 4 },
      { level: 12, notes: ["Death blow on a natural 20."] },
      { level: 13, attacks: 8, notes: ["Additional attack/action per melee."] },
      { level: 14, damage: 6 },
      { level: 15, strike: 6 }
    ])
  },
  aikido: {
    label: EE.HTH_TYPES.aikido,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, roll: 2, pullPunch: 2, critical: 20, knockout: 20, notes: ["Body flip/throw +2, break fall +3, disarm and holds available."] },
      { level: 2, initiative: 1, parry: 2, dodge: 2 },
      { level: 3, disarm: 1, notes: ["Automatic dodge."] },
      { level: 4, attacks: 5, notes: ["Additional attack/action per melee and +1 body flip/throw."] },
      { level: 5, notes: ["Critical body flip/throw on natural 18-20."] },
      { level: 6, parry: 3, dodge: 3, notes: ["+1 body flip/throw."] },
      { level: 7, pullPunch: 4, notes: ["Automatic flip/throw."] },
      { level: 8, attacks: 6 },
      { level: 9, initiative: 2, strike: 1, parry: 4, dodge: 4 },
      { level: 10, disarm: 2, notes: ["Double existing P.P.E."] },
      { level: 11, parry: 5, dodge: 6, notes: ["+1 body flip/throw."] },
      { level: 12, attacks: 7 },
      { level: 13, initiative: 3, notes: ["+2 body block/tackle."] },
      { level: 14, critical: 18 },
      { level: 15, attacks: 8 }
    ])
  },
  judo: {
    label: EE.HTH_TYPES.judo,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, roll: 3, pullPunch: 3, critical: 20, knockout: 20, notes: ["Body block/tackle, body flip/throw, break fall, and disarm available."] },
      { level: 2, parry: 2, dodge: 2, strike: 1 },
      { level: 3, disarm: 1, notes: ["+1 body flip/throw and body tackle."] },
      { level: 4, attacks: 5, notes: ["Additional attack/action per melee and karate-style kick."] },
      { level: 5, notes: ["Critical body flip/throw on natural 19 or 20."] },
      { level: 6, strike: 2, parry: 3, dodge: 3, notes: ["+1 body flip/throw."] },
      { level: 7, damage: 2, notes: ["W.P. Paired Weapons."] },
      { level: 8, roll: 4, notes: ["Jump kick."] },
      { level: 9, attacks: 6 },
      { level: 10, initiative: 2, parry: 4, dodge: 4 },
      { level: 11, disarm: 2, notes: ["+1 break fall."] },
      { level: 12, critical: 18 },
      { level: 13, damage: 4, knockout: 19 },
      { level: 14, attacks: 7 },
      { level: 15, notes: ["Automatic body flip/throw."] }
    ])
  },
  jujitsu: {
    label: EE.HTH_TYPES.jujitsu,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, roll: 3, parry: 2, dodge: 2, pullPunch: 2, critical: 20, knockout: 20, notes: ["Maintain balance, break fall, disarm, body block/tackle, body flip/throw, holds, kicks, knees, and elbows available."] },
      { level: 2, strike: 1, notes: ["Tripping/leg hook and backward sweep kicks."] },
      { level: 3, initiative: 1, notes: ["Critical strike from behind."] },
      { level: 4, attacks: 5, damage: 2 },
      { level: 5, notes: ["Palm strike and drop kick."] },
      { level: 6, critical: 18 },
      { level: 7, strike: 2, disarm: 1, notes: ["+1 body flip/throw."] },
      { level: 8, attacks: 6, notes: ["+1 maintain balance."] },
      { level: 9, notes: ["Critical body flip/throw on natural 17-20."] },
      { level: 10, notes: ["Jump kick and leap attacks."] },
      { level: 11, attacks: 7, pullPunch: 4 },
      { level: 12, initiative: 2, parry: 3, dodge: 3, strike: 3 },
      { level: 13, damage: 4, pullPunch: 6, notes: ["+2 break fall."] },
      { level: 14, attacks: 8 },
      { level: 15, notes: ["Death blow."] }
    ])
  },
  karate: {
    label: EE.HTH_TYPES.karate,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, initiative: 1, roll: 2, parry: 2, dodge: 1, pullPunch: 2, critical: 20, knockout: 20, notes: ["Snap kick, knife hand, break fall, karate punch/kick, knees, and elbows available."] },
      { level: 2, strike: 1, notes: ["Tripping/leg hook and backward sweep kicks."] },
      { level: 3, attacks: 5, damage: 2 },
      { level: 4, initiative: 2, disarm: 1, notes: ["Roundhouse kick."] },
      { level: 5, notes: ["Power punch and palm strike."] },
      { level: 6, attacks: 6, pullPunch: 4 },
      { level: 7, strike: 2, parry: 3, notes: ["Power kick, wheel kick, and +1 break fall."] },
      { level: 8, critical: 18, notes: ["Critical strike from behind and death blow on natural 20."] },
      { level: 9, attacks: 7, damage: 4 },
      { level: 10, notes: ["Jump kick and leap attacks."] },
      { level: 11, initiative: 3, parry: 4, dodge: 2, strike: 3 },
      { level: 12, attacks: 8, pullPunch: 6 },
      { level: 13, notes: ["Death blow."] },
      { level: 14, damage: 6, pullPunch: 8, notes: ["+2 break fall."] },
      { level: 15, attacks: 9 }
    ])
  },
  kendo: {
    label: EE.HTH_TYPES.kendo,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, initiative: 1, roll: 2, disarm: 1, parry: 1, dodge: 1, pullPunch: 2, critical: 20, knockout: 20, notes: ["+2 to parry with sword or staff, knife hand, break fall, karate punch/kick, knees, and elbows."] },
      { level: 2, strike: 1, notes: ["Paired weapons."] },
      { level: 3, attacks: 5, damage: 2 },
      { level: 4, initiative: 2, disarm: 2, parry: 2 },
      { level: 5, notes: ["Tripping/leg hook and backward sweep kicks."] },
      { level: 6, notes: ["Power punch and palm strike."] },
      { level: 7, attacks: 6, pullPunch: 4 },
      { level: 8, critical: 18, notes: ["Critical strike from behind and death blow on natural 19-20."] },
      { level: 9, attacks: 7, damage: 6 },
      { level: 10, notes: ["Automatic dodge."] },
      { level: 11, initiative: 3, strike: 2, notes: ["+2 break fall."] },
      { level: 12, attacks: 8, pullPunch: 6 },
      { level: 13, notes: ["Jump kick and leap attacks."] },
      { level: 14, notes: ["Death blow."] },
      { level: 15, attacks: 9 }
    ])
  },
  ninjitsu: {
    label: EE.HTH_TYPES.ninjitsu,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, initiative: 2, parry: 1, dodge: 2, pullPunch: 2, roll: 2, critical: 20, knockout: 20, notes: ["Paired weapons, maintain balance, flips, cartwheel, body block/tackle, body flip/throw, holds, drop kick, kicks, knees, and elbows."] },
      { level: 2, strike: 1, notes: ["Cartwheel/back flip attacks and defenses."] },
      { level: 3, attacks: 5, notes: ["Palm strike."] },
      { level: 4, notes: ["Leap attack, axe kick, and +2 strike with back flip/cartwheel."] },
      { level: 5, damage: 2, notes: ["Tripping/leg hook and backward sweep kicks."] },
      { level: 6, attacks: 6, notes: ["Roundhouse kick."] },
      { level: 7, critical: 18, notes: ["Critical from behind and death blow on natural 20."] },
      { level: 8, initiative: 3, strike: 2, parry: 2, roll: 3, notes: ["+2 maintain balance."] },
      { level: 9, notes: ["Death blow."] },
      { level: 10, attacks: 7, pullPunch: 4 },
      { level: 11, notes: ["Double existing P.P.E."] },
      { level: 12, initiative: 4, roll: 5 },
      { level: 13, damage: 4, disarm: 1 },
      { level: 14, damage: 6, notes: ["Jump kick and +2 back flip/cartwheel."] },
      { level: 15, attacks: 8 }
    ])
  },
  samurai: {
    label: EE.HTH_TYPES.samurai,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, initiative: 2, roll: 2, parry: 2, dodge: 3, damage: 2, pullPunch: 2, critical: 20, knockout: 20, notes: ["Paired weapons and +2 to parry with sword or staff."] },
      { level: 2, attacks: 5, disarm: 1, notes: ["+1 maintain balance."] },
      { level: 3, initiative: 3, strike: 1, parry: 3, notes: ["Critical strike from behind and death blow on natural 20."] },
      { level: 4, attacks: 6, damage: 4 },
      { level: 5, critical: 18, notes: ["+1 maintain balance."] },
      { level: 6, roll: 3, dodge: 4, notes: ["+1 maintain balance."] },
      { level: 7, notes: ["Power punch/stab, jump kick, and backward sweep kick."] },
      { level: 8, attacks: 7, dodge: 5 },
      { level: 9, notes: ["Death blow."] },
      { level: 10, initiative: 4, horrorFactor: 1, notes: ["+1 maintain balance."] },
      { level: 11, attacks: 8 },
      { level: 12, damage: 6, horrorFactor: 2, notes: ["Knowledge to create a true samurai sword."] },
      { level: 13, attacks: 9 },
      { level: 14, disarm: 2, notes: ["Double existing P.P.E."] },
      { level: 15, attacks: 10 }
    ])
  },
  tengJutsu: {
    label: EE.HTH_TYPES.tengJutsu,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, dodge: 2, pullPunch: 2, disarm: 1, roll: 1, critical: 20, knockout: 20, notes: ["All Tengu special powers; +3 maintain balance and +1 break fall."] },
      { level: 2, initiative: 1, notes: ["Drop kick and +2 on back flips."] },
      { level: 3, strike: 1, disarm: 2, notes: ["+1 leap dodge."] },
      { level: 4, attacks: 5 },
      { level: 5, notes: ["Critical strike from all kicks, jump kick, and leap attacks."] },
      { level: 6, roll: 2, pullPunch: 4, notes: ["+1 leap dodge."] },
      { level: 7, initiative: 2, notes: ["Tripping/leg hook and backward sweep kicks."] },
      { level: 8, attacks: 6 },
      { level: 9, disarm: 4, notes: ["+1 back flips and cartwheel attack."] },
      { level: 10, initiative: 3, parry: 1, notes: ["Axe kick."] },
      { level: 11, attacks: 7 },
      { level: 12, disarm: 5, notes: ["+1 leap dodge."] },
      { level: 13, notes: ["Snap kick and wheel kick."] },
      { level: 14, pullPunch: 5, notes: ["+1 leap dodge."] },
      { level: 15, attacks: 8 }
    ])
  },
  cyberKnightZen: {
    label: EE.HTH_TYPES.cyberKnightZen,
    levels: riftsHthLevels([
      { level: 1, attacks: 4, notes: ["The Basics: all O.C.C. and skill bonuses from Cyber-Knight training are already known; later levels fine tune the knight's awareness against weapons and technology."] },
      { level: 2, notes: ["Paired Weapons: can use a shield with a weapon, or two weapons with equal skill. Gains W.P. Shield: +1 to parry at levels 1, 3, 6, 9, 12, and 15; +1 to strike with a shield at levels 4, 8, and 12."] },
      { level: 3, notes: ["Combat Acrobatics: no penalty to strike while moving or off balance."] },
      { level: 4, initiative: 3, strike: 3, parry: 3, notes: ["Basic Combat Awareness against one primary tech-using opponent: negates weapon or machine bonuses; +3 initiative against modern guns and machines, +6 against A.I. and computers; +3 to strike and parry. The affected opponent is -3 to dodge and loses two melee attacks/actions."] },
      { level: 5, notes: ["+4 automatic dodge against tech from the primary opponent without spending a melee action. Applies to one opponent at level 5, two at level 9, and three at level 13."] },
      { level: 6, notes: ["Cloud Sensors: can make sensors and weapon systems blink, misread, or lose the knight briefly. Inexperienced operators cannot use affected sensors and lose two melee actions; experienced operators lose one melee action and suffer -40% to evaluate/respond."] },
      { level: 7, notes: ["Nothing new."] },
      { level: 8, initiative: 2, strike: 2, parry: 2, dodge: 1, notes: ["Advanced Combat Awareness against all opponents directing attacks at the knight: negates weapon or machine bonuses; +2 initiative against modern guns and machines, +4 against A.I. and computers; +2 to strike and parry, +1 to dodge. Affected opponents are -2 to strike, -2 to dodge, and lose one melee attack/action."] },
      { level: 9, notes: ["Cloud targeting computers and weapon systems: negates built-in bonuses and gives shooters -2 to strike with modern or advanced weaponry, power armor, robots, combat vehicles, cyborg systems, energy weapons, sensor/optic-assisted weapons, and Techno-Wizard guns or machines."] }
    ])
  },
  dragon: {
    label: EE.HTH_TYPES.dragon,
    levels: riftsHthLevels([
      { level: 1, attacks: 3, roll: 2, pullPunch: 1, notes: ["Starts with three attacks per melee plus any R.C.C. bonus. Instinctively knows bite, punch, kick, Claw Swipe, and standard breath weapon use. Dragon metamorphosis takes one full melee round."] },
      { level: 2, parry: 2, dodge: 2, notes: ["Gains Tail Slap, Wing Attack: Basic, and Crush."] },
      { level: 3, damage: 2, notes: ["Dragon metamorphosis takes half a melee round. Inflicts +2 M.D. in physical combat and gains Tail Slap Power Strike."] },
      { level: 4, attacks: 4, notes: ["Additional attack per melee round; gains Bite & Grip and Tail Sweep."] },
      { level: 5, strike: 1, parry: 3, notes: ["+1 to strike and parry, +2 to dodge in flight, and gains Tail Parry."] },
      { level: 6, notes: ["+1 to Spell Strength; gains Wing Sweep and Grappling Hold."] },
      { level: 7, disarm: 2, entangle: 2, pullPunch: 3, notes: ["Gains Wing Attack: Advanced, +2 to disarm, +2 to entangle, and +2 to pull punch."] },
      { level: 8, attacks: 5, strike: 2, parry: 4, notes: ["Additional attack per melee, +1 to strike and parry, +1 to dodge in flight, and gains Wing Gliding Sweep Attack."] },
      { level: 9, roll: 3, pullPunch: 4, notes: ["Gains Breath Weapon Concentrated Beam, +1 to roll with impact and pull punch, and an additional +5% to Dimensional Teleport."] },
      { level: 10, initiative: 1, critical: 19, notes: ["Gains Teleport Dodge, +1 on initiative, and Critical Strike on an unmodified 19-20."] },
      { level: 11, damage: 4, notes: ["Inflicts +2 M.D. from physical attacks, +2 to dodge in flight, and +1 to Spell Strength."] },
      { level: 12, attacks: 6, strike: 3, notes: ["+1 attack per melee, +1 to strike, and +1 to Teleport Dodge."] },
      { level: 13, initiative: 2, notes: ["Gains Breath Weapon Cone and +1 on initiative."] },
      { level: 14, pullPunch: 5, notes: ["+1 to Teleport Dodge and +1 to pull punch."] },
      { level: 15, notes: ["+1 to Spell Strength and +1D4x10 to M.D.C."] },
      { level: 16, attacks: 7, damage: 6, notes: ["Additional attack per melee and inflicts another +2 M.D. from physical attacks."] },
      { level: 17, notes: ["+1 to Teleport Dodge and +1 to dodge in flight."] },
      { level: 18, strike: 4, parry: 5, notes: ["+1 to strike and parry, and +1 to Spell Strength."] },
      { level: 19, disarm: 3, roll: 5, notes: ["+1 to Teleport Dodge, +1 to disarm, +2 to roll with impact, and +1D4x10 to physical M.D.C."] },
      { level: 20, attacks: 8, notes: ["Additional attack per melee round."] }
    ])
  }
};

const mysticChinaHth = (key, attacks, notes = []) => ({
  label: EE.HTH_TYPES[key],
  levels: riftsHthLevels([
    {
      level: 1,
      attacks,
      notes: [
        "Mystic China personal martial art. Exotic techniques, powers, training skills, and detailed level choices should be tracked in notes or extras.",
        ...notes
      ]
    }
  ])
});

Object.assign(EE.RIFTS_HTH_TABLES, {
  anYinKungFu: mysticChinaHth("anYinKungFu", 2, ["Defensive Tibetan Buddhist style focused on meditation, patience, Mudra, and Atemi/Chi options."]),
  baGuaKungFu: mysticChinaHth("baGuaKungFu", 2, ["Eight Trigrams Kung Fu; circular movement, palm work, deflection, Chi Mastery, and Specialty Katas."]),
  bakMeiKungFu: mysticChinaHth("bakMeiKungFu", 1, ["White Eyebrow Kung Fu; contradictory soft defenses and hard attacks with Atemi, Chi Mastery, and Martial Art Techniques."]),
  bokPaiKungFu: mysticChinaHth("bokPaiKungFu", 2, ["White Crane style with Crane Fist, circular parries, multiple dodge, and Body Hardening or Specialty Katas."]),
  chaoTaKungFu: mysticChinaHth("chaoTaKungFu", 2, ["Performance-oriented Hong Kong film style with stunt, acting, leap, and theatrical combat training."]),
  chiHsuanMen: mysticChinaHth("chiHsuanMen", 2, ["The White Jade Fan; exclusive fan-based style with disarms, vital point work, and paired fan training."]),
  chinNa: mysticChinaHth("chinNa", 2, ["Joint-locking and seizing style focused on holds, locks, pressure points, and disabling attacks."]),
  choyLiFut: mysticChinaHth("choyLiFut", 2, ["Aggressive long-range Kung Fu with strong weapon training, leaps, and powerful sweeping attacks."]),
  drunkenStyleKungFu: mysticChinaHth("drunkenStyleKungFu", 2, ["Deceptive broken-rhythm style built around staggering movement, rolls, deceptive attacks, and ground fighting."]),
  fuChiaoPai: mysticChinaHth("fuChiaoPai", 2, ["Tiger Claw Kung Fu; powerful clawing, leaping, climbing, and body-hardening style."]),
  guiLongKungFu: mysticChinaHth("guiLongKungFu", 3, ["Dragon Spirit Kung Fu; sword-focused style with Sword Chi Resonance and Chi/Zenjorike development."]),
  hanYuKungFu: mysticChinaHth("hanYuKungFu", 2, ["Modernized New Wave exercise-derived Kung Fu with acrobatic and Chi Kata options."]),
  hsienHsiaKungFu: mysticChinaHth("hsienHsiaKungFu", 1, ["Secretive immortal-knight style emphasizing Taoist training, restraint, and Chi development."]),
  hsingI: mysticChinaHth("hsingI", 2, ["Internal Five Elements style with direct attacks, Chi Mastery, and Hua Chin."]),
  kuoChuan: mysticChinaHth("kuoChuan", 2, ["Dog Boxing Kung Fu; low, evasive, rolling, ground-fighting style with rear attacks and Body Hardening."]),
  leeKwanChoo: mysticChinaHth("leeKwanChoo", 1, ["Merciful shock/stun style whose strikes disable without causing S.D.C. or Hit Point damage."]),
  liangHsiung: mysticChinaHth("liangHsiung", 3, ["Bull style with goring, ramming, shoulder strikes, body hardening, and wilderness training."]),
  mienChuan: mysticChinaHth("mienChuan", 1, ["Cotton Fist; secret internal defensive style built around soft deflection and Chi mastery."]),
  monkeyStyleKungFu: mysticChinaHth("monkeyStyleKungFu", 2, ["Monkey Style Kung Fu with deceptive postures, acrobatics, Monkey Katas, and invisibility/Chi options."]),
  paoChih: mysticChinaHth("paoChih", 1, ["Animus-focused style that stores and channels Chi through a spiritual double."]),
  shanTungKungFu: mysticChinaHth("shanTungKungFu", 2, ["Escape-focused Shantung style centered on survival, evasion, and tactical awareness."]),
  shihBaBanWuYi: mysticChinaHth("shihBaBanWuYi", 3, ["Eighteen Weapons style with broad paired-weapon and specialty kata training."]),
  paoPatMei: mysticChinaHth("paoPatMei", 3, ["Black Tiger style with aggressive clawing, leaping, and body-hardening techniques."]),
  shaoLin: mysticChinaHth("shaoLin", 3, ["Shao-Lin temple boxing with broad strikes, kicks, body hardening, and acrobatic training."]),
  snakeStyle: mysticChinaHth("snakeStyle", 1, ["Internal snake style using whipping motion, Chi channeling, fingertip attacks, and evasive movement."]),
  taiChiChuan: mysticChinaHth("taiChiChuan", 1, ["Common internal soft style with strong Chi development, circular defense, and push/palm techniques."]),
  tienHsueh: mysticChinaHth("tienHsueh", 1, ["Touch Mastery; restricted vital-point style focused on Atemi, Dim Mak, and Chi mastery."]),
  tongLunKungFu: mysticChinaHth("tongLunKungFu", 3, ["Praying Mantis style with close-in Gou strikes, grips, intimidation attacks, and Atemi training."]),
  triadAssassinTraining: mysticChinaHth("triadAssassinTraining", 2, ["Modern firearm-focused assassin training for 9mm automatic pistols; advancement bonuses are not cumulative."])
});

EE.POWER_ARMOR_HTH_TABLES = {
  none: {
    label: EE.POWER_ARMOR_HTH_TYPES.none,
    levels: riftsHthLevels([
      { level: 1, notes: ["No robot or power armor combat training selected."] }
    ])
  },
  robotCombatBasic: {
    label: EE.POWER_ARMOR_HTH_TYPES.robotCombatBasic,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, strike: 1, parry: 1, dodge: 1, roll: 1, notes: ["Basic robot and power armor combat training. Bonuses are added to the pilot's own hand-to-hand and attribute bonuses, and apply only while operating robots or power armor.", "Damage is as per Robot P.S. Basic training allows restrained punch, full-strength punch, and ordinary kick only.", "Critical strike is the same as the pilot's hand-to-hand skill."] }
    ])
  },
  rpaFlyingPowerArmor: {
    label: EE.POWER_ARMOR_HTH_TYPES.rpaFlyingPowerArmor,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, initiative: 2, strike: 2, parry: 3, dodge: 2, disarm: 2, roll: 4, notes: ["+2 strike with energy weapons, +2 strike with long-range weapons, +5 dodge when flying or leaping, +3 roll with punch, +4 roll with impact.", "Punch and kick damage as per robot or augmented P.S.; power punch does double damage but counts as two attacks; tear/pry with hands does 1D4 M.D.", "Body block/ram equals Robot P.S. punch damage; full-speed running ram does double Robot P.S. punch damage with a 60% knockdown chance against same-size or smaller opponents."] },
      { level: 3, attacks: 2 },
      { level: 6, attacks: 3 },
      { level: 9, attacks: 4 },
      { level: 12, attacks: 5 }
    ])
  },
  rpaGroundBasedPowerArmor: {
    label: EE.POWER_ARMOR_HTH_TYPES.rpaGroundBasedPowerArmor,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, initiative: 1, strike: 2, parry: 2, dodge: 2, disarm: 3, pullPunch: 3, roll: 2, notes: ["+2 strike with energy weapons, +2 strike with long-range weapons, +3 pull punch, +2 roll with impact.", "Punch and kick damage as per robot or augmented P.S.; power punch does double damage but counts as two attacks; tear/pry with hands does 1D4 M.D.", "Body block/ram equals Robot P.S. punch damage; full-speed running ram does double Robot P.S. punch damage with a 50% knockdown chance against same-size or smaller opponents."] },
      { level: 3, attacks: 2 },
      { level: 5, attacks: 3 },
      { level: 10, attacks: 4 },
      { level: 15, attacks: 5 }
    ])
  },
  rpaHeavyVehicularRobots: {
    label: EE.POWER_ARMOR_HTH_TYPES.rpaHeavyVehicularRobots,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, initiative: 1, strike: 1, parry: 1, dodge: 1, roll: 1, notes: ["+3 strike with energy weapons. Dodge is +1 when standing stationary and +2 when already in motion.", "Punch and kick damage as per Robot P.S.; power punch does double damage but counts as two attacks.", "Full-speed running ram does triple Robot P.S. punch damage with an 80% knockdown chance against same-size or smaller opponents. Stomp does 1D6 M.D. against targets under one-third the robot's height."] },
      { level: 4, attacks: 2 },
      { level: 8, attacks: 3 },
      { level: 12, attacks: 4 }
    ])
  },
  rpaHeavyGroundRobots: {
    label: EE.POWER_ARMOR_HTH_TYPES.rpaHeavyGroundRobots,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, initiative: 1, strike: 2, parry: 3, dodge: 1, disarm: 1, pullPunch: 2, roll: 3, notes: ["+3 strike with energy weapons. Dodge is +1 standing stationary and +2 when already in motion, running, or leaping.", "+1 to disarm a giant-sized opponent, +2 pull punch, +3 roll with impact.", "Tear/pry with hands does 1D6 M.D.; full-speed running ram does double Robot P.S. punch damage with an 85% knockdown chance against same-size or smaller opponents. Stomp does 1D6 M.D. against targets under one-third the robot's height."] },
      { level: 3, attacks: 2 },
      { level: 6, attacks: 3 },
      { level: 10, attacks: 4 },
      { level: 15, attacks: 5 }
    ])
  },
  rpaLightGroundRobots: {
    label: EE.POWER_ARMOR_HTH_TYPES.rpaLightGroundRobots,
    levels: riftsHthLevels([
      { level: 1, attacks: 1, initiative: 2, strike: 3, parry: 3, dodge: 2, disarm: 2, pullPunch: 4, roll: 4, notes: ["+1 strike with energy weapons. Dodge is +2 standing stationary and +3 when already in motion, running, or leaping.", "+2 to disarm a giant-sized opponent, +4 pull punch, +4 roll with impact.", "Tear/pry with hands does 1D4 M.D.; full-speed running ram does double Robot P.S. punch damage with a 70% knockdown chance against same-size or smaller opponents. Stomp does 1D4 M.D. against targets under one-third the robot's height."] },
      { level: 3, attacks: 2 },
      { level: 5, attacks: 3 },
      { level: 8, attacks: 4 },
      { level: 11, attacks: 5 },
      { level: 15, attacks: 6 }
    ])
  }
};

EE.VEHICLE_TYPES = {
  ground:     "Ground",
  air:        "Air",
  space:      "Space",
  naval:      "Naval",
  powerArmor: "Power Armor"
};

// Free-text suggestions (datalist), not hard-locked.
EE.OCC_SUGGESTIONS = [
  "Crazy", "Juicer", "Operator", "City Rat", "Cyber-Knight",
  "Cyber-Doc", "Headhunter", "Mercenary", "Vagabond", "Rogue Scholar"
];

EE.RACE_SUGGESTIONS = [
  "Human", "D-Bee", "Dragon Hatchling", "Psi-Stalker", "True Atlantean",
  "Wolfen", "Dog Boy", "Crazy", "Mutant"
];

EE.WEAPON_CATEGORIES = {
  modern:  "Modern",
  ancient: "Ancient"
};

EE.SKILL_CATEGORIES = {
  occ:        "OCC",
  occRelated: "OCC Related",
  secondary:  "Secondary"
};

// Master EE Legacy skill list (p.302–303). Each entry seeds a row
// when the player picks it from the Add-Skill picker. base/perLvl are
// editable on the sheet; values shown here are the canonical defaults.
// `group` is the source category used only for grouping in the picker UI.
EE.SKILL_LIST = [
  // Communication
  { key: "barter",                 name: "Barter",                              group: "Communication", base: 30, perLvl: 4 },
  { key: "creativeWriting",        name: "Creative Writing",                    group: "Communication", base: 25, perLvl: 5 },
  { key: "cryptography",           name: "Cryptography",                        group: "Communication", base: 25, perLvl: 5 },
  { key: "electronicCountermeasures", name: "Electronic Countermeasures",       group: "Communication", base: 30, perLvl: 5 },
  { key: "languageNative",         name: "Language: Native Tongue",             group: "Communication", base: 88, perLvl: 1 },
  { key: "languageOther",          name: "Language: Other",                     group: "Communication", base: 50, perLvl: 5 },
  { key: "laserCommunications",    name: "Laser",                               group: "Communication", base: 30, perLvl: 5 },
  { key: "literacyNative",         name: "Literacy: Native Tongue",             group: "Communication", base: 40, perLvl: 5 },
  { key: "literacyOther",          name: "Literacy: Other",                     group: "Communication", base: 30, perLvl: 5 },
  { key: "opticSystems",           name: "Optic Systems",                       group: "Communication", base: 30, perLvl: 5 },
  { key: "performance",            name: "Performance",                         group: "Communication", base: 30, perLvl: 5 },
  { key: "publicSpeaking",         name: "Public Speaking",                     group: "Communication", base: 30, perLvl: 5 },
  { key: "radioBasic",             name: "Radio: Basic",                        group: "Communication", base: 45, perLvl: 5 },
  { key: "sensoryEquipment",       name: "Sensory Equipment",                   group: "Communication", base: 30, perLvl: 5 },
  { key: "signLanguage",           name: "Sign Language",                       group: "Communication", base: 25, perLvl: 5 },
  { key: "sing",                   name: "Sing",                                group: "Communication", base: 35, perLvl: 5 },
  { key: "surveillance",           name: "Surveillance",                        group: "Communication", base: 30, perLvl: 5 },
  { key: "tvVideo",                name: "T.V./Video",                          group: "Communication", base: 25, perLvl: 5 },

  // Cowboy
  { key: "branding",               name: "Branding",                            group: "Cowboy", base: 50, perLvl: 5 },
  { key: "breakingTamingWildHorse",name: "Breaking/Taming Wild Horse",          group: "Cowboy", base: 20, perLvl: 5 },
  { key: "herdingCattle",          name: "Herding Cattle",                      group: "Cowboy", base: 30, perLvl: 5 },
  { key: "horsemanshipCowboy",     name: "Horsemanship: Cowboy",                group: "Cowboy", base: 66, perLvl: 3 },
  { key: "horsemanshipExotic",     name: "Horsemanship: Exotic Animals",        group: "Cowboy", base: 40, perLvl: 4 },
  { key: "loreAmericanIndians",    name: "Lore: American Indians",              group: "Cowboy", base: 25, perLvl: 5 },
  { key: "loreCattleAnimals",      name: "Lore: Cattle/Animals",                group: "Cowboy", base: 30, perLvl: 5 },
  { key: "roping",                 name: "Roping",                              group: "Cowboy", base: 20, perLvl: 5 },
  { key: "trickRiding",            name: "Trick Riding",                        group: "Cowboy", base: 0,  perLvl: 0 },

  // Domestic
  { key: "brewing",                name: "Brewing",                             group: "Domestic", base: 25, perLvl: 5 },
  { key: "cook",                   name: "Cook",                                group: "Domestic", base: 35, perLvl: 5 },
  { key: "dance",                  name: "Dance",                               group: "Domestic", base: 30, perLvl: 5 },
  { key: "fishing",                name: "Fishing",                             group: "Domestic", base: 40, perLvl: 5 },
  { key: "gardening",              name: "Gardening",                           group: "Domestic", base: 36, perLvl: 4 },
  { key: "housekeeping",           name: "Housekeeping",                        group: "Domestic", base: 35, perLvl: 5 },
  { key: "playMusicalInstrument",  name: "Play Musical Instrument",             group: "Domestic", base: 35, perLvl: 5 },
  { key: "recycle",                name: "Recycle",                             group: "Domestic", base: 30, perLvl: 5 },
  { key: "sewing",                 name: "Sewing/Tailoring",                    group: "Domestic", base: 40, perLvl: 5 },
  { key: "wardrobeGrooming",       name: "Wardrobe & Grooming",                 group: "Domestic", base: 50, perLvl: 4 },

  // Electrical
  { key: "basicElectronics",       name: "Basic Electronics",                   group: "Electrical", base: 30, perLvl: 5 },
  { key: "computerRepair",         name: "Computer Repair",                     group: "Electrical", base: 30, perLvl: 5 },
  { key: "electricalEngineer",     name: "Electrical Engineer",                 group: "Electrical", base: 35, perLvl: 5 },
  { key: "electricityGeneration",  name: "Electricity Generation",              group: "Electrical", base: 50, perLvl: 5 },
  { key: "robotElectronics",       name: "Robot Electronics",                   group: "Electrical", base: 30, perLvl: 5 },

  // Espionage
  { key: "detectAmbush",           name: "Detect Ambush",                       group: "Espionage", base: 30, perLvl: 5 },
  { key: "detectConcealment",      name: "Detect Concealment",                  group: "Espionage", base: 25, perLvl: 5 },
  { key: "disguise",               name: "Disguise",                            group: "Espionage", base: 25, perLvl: 5 },
  { key: "escapeArtist",           name: "Escape Artist",                       group: "Espionage", base: 30, perLvl: 5 },
  { key: "forgery",                name: "Forgery",                             group: "Espionage", base: 20, perLvl: 5 },
  { key: "impersonation",          name: "Impersonation",                       group: "Espionage", base: 30, perLvl: 4 },
  { key: "intelligence",           name: "Intelligence",                        group: "Espionage", base: 32, perLvl: 4 },
  { key: "interrogation",          name: "Interrogation",                       group: "Espionage", base: 30, perLvl: 5 },
  { key: "pickLocks",              name: "Pick Locks",                          group: "Espionage", base: 30, perLvl: 5 },
  { key: "pickPockets",            name: "Pick Pockets",                        group: "Espionage", base: 25, perLvl: 5 },
  { key: "sniper",                 name: "Sniper",                              group: "Espionage", base: 0,  perLvl: 0 },
  { key: "trackingPeople",         name: "Tracking: Humans & Robots",           group: "Espionage", base: 25, perLvl: 5 },
  { key: "undercoverOps",          name: "Undercover Ops",                      group: "Espionage", base: 30, perLvl: 5 },
  { key: "wildernessSurvival",     name: "Wilderness Survival",                 group: "Espionage", base: 30, perLvl: 5 },

  // Horsemanship
  { key: "horsemanshipGeneral",    name: "Horsemanship: General",               group: "Horsemanship", base: 40, perLvl: 4 },
  { key: "horsemanshipCossack",    name: "Horsemanship: Cossack",               group: "Horsemanship", base: 55, perLvl: 5 },
  { key: "horsemanshipCyberKnight",name: "Horsemanship: Cyber-Knight",          group: "Horsemanship", base: 70, perLvl: 3 },
  { key: "horsemanshipEquestrian", name: "Horsemanship: Equestrian",            group: "Horsemanship", base: 40, perLvl: 5 },
  { key: "horsemanshipExoticAnimals",name: "Horsemanship: Exotic Animals",      group: "Horsemanship", base: 30, perLvl: 5 },

  // Mechanical
  { key: "aircraftMechanics",      name: "Aircraft Mechanics",                  group: "Mechanical", base: 25, perLvl: 5 },
  { key: "automotiveMechanics",    name: "Automotive Mechanics",                group: "Mechanical", base: 25, perLvl: 5 },
  { key: "basicMechanics",         name: "Basic Mechanics",                     group: "Mechanical", base: 30, perLvl: 5 },
  { key: "biowareMechanics",       name: "Bioware Mechanics",                   group: "Mechanical", base: 30, perLvl: 5 },
  { key: "locksmith",              name: "Locksmith",                           group: "Mechanical", base: 25, perLvl: 5 },
  { key: "mechanicalEngineer",     name: "Mechanical Engineer",                 group: "Mechanical", base: 25, perLvl: 5 },
  { key: "robotMechanics",         name: "Robot Mechanics",                     group: "Mechanical", base: 20, perLvl: 5 },
  { key: "vehicleArmorer",         name: "Vehicle Armourer",                    group: "Mechanical", base: 30, perLvl: 5 },
  { key: "weaponsEngineer",        name: "Weapons Engineer",                    group: "Mechanical", base: 25, perLvl: 5 },

  // Medical
  { key: "animalHusbandry",        name: "Animal Husbandry",                    group: "Medical", base: 35, perLvl: 5 },
  { key: "brewingMedicinal",       name: "Brewing: Medicinal",                  group: "Medical", base: 25, perLvl: 5 },
  { key: "crimeSceneInvestigation",name: "Crime Scene Investigation",           group: "Medical", base: 35, perLvl: 5 },
  { key: "cyberneticMedicine",     name: "Cybernetic Medicine",                 group: "Medical", base: 40, perLvl: 5 },
  { key: "entomologicalMedicine",  name: "Entomological Medicine",              group: "Medical", base: 40, perLvl: 5 },
  { key: "fieldSurgery",           name: "Field Surgery",                       group: "Medical", base: 16, perLvl: 4 },
  { key: "firstAid",               name: "First Aid",                           group: "Medical", base: 45, perLvl: 5 },
  { key: "forensics",              name: "Forensics",                           group: "Medical", base: 35, perLvl: 5 },
  { key: "holisticMedicine",       name: "Hollistic Medicine",                  group: "Medical", base: 30, perLvl: 5 },
  { key: "pathology",              name: "Pathology",                           group: "Medical", base: 40, perLvl: 5 },
  { key: "paramedic",              name: "Paramedic",                           group: "Medical", base: 40, perLvl: 5 },
  { key: "medicalDoctor",          name: "Medical Doctor",                      group: "Medical", base: 60, perLvl: 5 },
  { key: "psychology",             name: "Psychology",                          group: "Medical", base: 35, perLvl: 5 },
  { key: "veterinaryScience",      name: "Veterinary Science",                  group: "Medical", base: 50, perLvl: 4 },

  // Military
  { key: "camouflage",             name: "Camouflage",                          group: "Military", base: 20, perLvl: 5 },
  { key: "demolitions",            name: "Demolitions",                         group: "Military", base: 60, perLvl: 3 },
  { key: "demolitionsDisposal",    name: "Demolitions Disposal",                group: "Military", base: 60, perLvl: 3 },
  { key: "demolitionsUnderwater",  name: "Demolitions: Underwater",             group: "Military", base: 56, perLvl: 4 },
  { key: "fieldArmorerMunitions",  name: "Field Armourer & Munitions",          group: "Military", base: 40, perLvl: 5 },
  { key: "findContraband",         name: "Find Contraband",                     group: "Military", base: 26, perLvl: 4 },
  { key: "forcedMarch",            name: "Forced March",                        group: "Military", base: 0,  perLvl: 0 },
  { key: "militaryEtiquette",      name: "Military Etiquette",                  group: "Military", base: 35, perLvl: 5 },
  { key: "militaryFortification",  name: "Military Fortification",              group: "Military", base: 30, perLvl: 5 },
  { key: "navalHistory",           name: "Naval History",                       group: "Military", base: 30, perLvl: 5 },
  { key: "navalTactics",           name: "Naval Tactics",                       group: "Military", base: 25, perLvl: 5 },
  { key: "nbcWarfare",             name: "NBC Warfare",                         group: "Military", base: 35, perLvl: 5 },
  { key: "parachuting",            name: "Parachuting",                         group: "Military", base: 40, perLvl: 5 },
  { key: "recognizeWeaponQuality", name: "Recognise Weapon Quality",            group: "Military", base: 25, perLvl: 5 },
  { key: "trapMineDetection",      name: "Trap/Mine Detection",                 group: "Military", base: 20, perLvl: 5 },

  // Physical
  { key: "acrobatics",             name: "Acrobatics",                          group: "Physical", base: 0, perLvl: 0, statBonuses: { ps: { bonus: 1 }, pe: { bonus: 1 }, pp: { bonus: 1 }, sdc: { formula: "1d6" } } },
  { key: "aerobicAthletics",       name: "Aerobic Athletics",                   group: "Physical", base: 0, perLvl: 0, statBonuses: { sdc: { formula: "2d4" } } },
  { key: "athleticsGeneral",       name: "Athletics (general)",                 group: "Physical", base: 0, perLvl: 0, statBonuses: { ps: { bonus: 1 }, spd: { formula: "1d6" }, sdc: { formula: "1d8" } } },
  { key: "bodyBuildingWeightLifting", name: "Body Building & Weight Lifting",   group: "Physical", base: 0, perLvl: 0, statBonuses: { ps: { bonus: 2 }, sdc: { bonus: 10 } } },
  { key: "boxing",                 name: "Boxing",                              group: "Physical", base: 0, perLvl: 0, statBonuses: { ps: { bonus: 2 }, sdc: { formula: "3d6" } } },
  { key: "climbing",               name: "Climb",                               group: "Physical", base: 40, perLvl: 5 },
  { key: "deadball",               name: "Deadball",                            group: "Physical", base: 0, perLvl: 0, statBonuses: { spd: { formula: "1d6" }, sdc: { formula: "2d4" } } },
  { key: "fencing",                name: "Fencing",                             group: "Physical", base: 0, perLvl: 0 },
  { key: "gymnastics",             name: "Gymnastics",                          group: "Physical", base: 0, perLvl: 0, statBonuses: { ps: { bonus: 2 }, pe: { bonus: 2 }, pp: { bonus: 1 }, sdc: { formula: "2d6" } } },
  { key: "juggling",               name: "Juggling",                            group: "Physical", base: 35, perLvl: 5 },
  { key: "juicerFootball",         name: "Juicer Football",                     group: "Physical", base: 32, perLvl: 4, statBonuses: { ps: { bonus: 1 }, pe: { bonus: 1 }, spd: { formula: "1d4" }, sdc: { formula: "3d6" } } },
  { key: "juicerMurderthon",       name: "Juicer Murderthon",                   group: "Physical", base: 0, perLvl: 0, statBonuses: { spd: { formula: "2d6" }, sdc: { formula: "2d4" } } },
  { key: "kickBoxing",             name: "Kick Boxing",                         group: "Physical", base: 0, perLvl: 0 },
  { key: "outdoorsmanship",        name: "Outdoormanship",                      group: "Physical", base: 0, perLvl: 0 },
  { key: "physicalLabor",          name: "Physical Labour",                     group: "Physical", base: 0, perLvl: 0 },
  { key: "prowl",                  name: "Prowl",                               group: "Physical", base: 25, perLvl: 5 },
  { key: "running",                name: "Running",                             group: "Physical", base: 0, perLvl: 0, statBonuses: { pe: { bonus: 1 }, spd: { formula: "4d4" }, sdc: { formula: "1d6" } } },
  { key: "swimming",               name: "Swimming",                            group: "Physical", base: 50, perLvl: 5 },
  { key: "scuba",                  name: "S.C.U.B.A.",                          group: "Physical", base: 50, perLvl: 5 },
  { key: "wrestling",              name: "Wrestling",                           group: "Physical", base: 0, perLvl: 0, statBonuses: { ps: { bonus: 2 }, pe: { bonus: 1 }, sdc: { formula: "4d6" } } },

  // Physical Space
  { key: "depressurizationTraining", name: "Depressurization Training",         group: "Physical Space", base: 0, perLvl: 0, statBonuses: { pe: { bonus: 1 }, sdc: { bonus: 10 } } },
  { key: "oxygenConservation",     name: "Oxygen Conservation",                 group: "Physical Space", base: 30, perLvl: 5, statBonuses: { pe: { bonus: 1 } } },
  { key: "zeroGravityCombatBasic", name: "Zero Gravity Combat: Basic",          group: "Physical Space", base: 0, perLvl: 0 },
  { key: "zeroGravityCombatElite", name: "Zero Gravity Combat: Elite",          group: "Physical Space", base: 0, perLvl: 0 },
  { key: "spaceMovementZeroGravity", name: "Space Movement: Zero Gravity",      group: "Physical Space", base: 0, perLvl: 4 },

  // Pilot
  { key: "pilotAirplane",          name: "Airplane",                            group: "Pilot", base: 50, perLvl: 4 },
  { key: "pilotAutomobile",        name: "Automobile",                          group: "Pilot", base: 60, perLvl: 2 },
  { key: "pilotBicycling",         name: "Bicycling",                           group: "Pilot", base: 44, perLvl: 4 },
  { key: "pilotBoatMotor",         name: "Boats: Motor & Hydrofoils",           group: "Pilot", base: 55, perLvl: 5 },
  { key: "pilotBoatPaddle",        name: "Boats: Paddle Types",                 group: "Pilot", base: 50, perLvl: 5 },
  { key: "pilotBoatSail",          name: "Boats: Sail Types",                   group: "Pilot", base: 60, perLvl: 5 },
  { key: "pilotBoatShips",         name: "Boats: Ships",                        group: "Pilot", base: 45, perLvl: 5 },
  { key: "combatDriving",          name: "Combat Driving",                      group: "Pilot", base: 0,  perLvl: 0 },
  { key: "flightSystemCombat",     name: "Flight System Combat",                group: "Pilot", base: 40, perLvl: 5 },
  { key: "pilotHelicopter",        name: "Helicopter",                          group: "Pilot", base: 44, perLvl: 4 },
  { key: "hoverCraftGround",       name: "Hover Craft: Ground",                 group: "Pilot", base: 50, perLvl: 5 },
  { key: "hovercyclesSkycyclesRocketBikes", name: "Hovercycles / Skycycles / Rocket Bikes", group: "Pilot", base: 70, perLvl: 3 },
  { key: "pilotJetAircraft",       name: "Jet Aircraft",                        group: "Pilot", base: 40, perLvl: 4 },
  { key: "jetPacks",               name: "Jet Packs",                           group: "Pilot", base: 42, perLvl: 4 },
  { key: "jumpBikeCombat",         name: "Jump Bike Combat",                    group: "Pilot", base: 45, perLvl: 5 },
  { key: "militaryCombatHelicopter", name: "Military: Combat Helicopter",       group: "Pilot", base: 52, perLvl: 3 },
  { key: "militaryJetFighters",    name: "Military: Jet Fighter",               group: "Pilot", base: 40, perLvl: 4 },
  { key: "militarySubmersibles",   name: "Military: Submersibles",              group: "Pilot", base: 40, perLvl: 4 },
  { key: "militaryTanksApcs",      name: "Military: Tanks & APCs",              group: "Pilot", base: 36, perLvl: 4 },
  { key: "militaryWarshipsPatrolBoats", name: "Military: Warships & Patrol Boats", group: "Pilot", base: 40, perLvl: 4 },
  { key: "motorcyclesSnowmobiles", name: "Motorcycles & Snowmobiles",           group: "Pilot", base: 60, perLvl: 4 },
  { key: "robotsPowerArmor",       name: "Robots & Power Armour",               group: "Pilot", base: 56, perLvl: 3 },
  { key: "robotCombatBasic",       name: "Robot Combat: Basic",                 group: "Pilot", base: 0,  perLvl: 0 },
  { key: "robotCombatElite",       name: "Robot Combat: Elite",                 group: "Pilot", base: 0,  perLvl: 0 },
  { key: "trackedConstructionVehicles", name: "Tracked & Construction Vehicles", group: "Pilot", base: 40, perLvl: 4 },
  { key: "pilotTruck",             name: "Truck",                               group: "Pilot", base: 40, perLvl: 4 },
  { key: "waterScooters",          name: "Water Scooters",                      group: "Pilot", base: 50, perLvl: 5 },
  { key: "waterSkiingSurfing",     name: "Water Skiing & Surfing",              group: "Pilot", base: 40, perLvl: 4 },

  // Pilot Related
  { key: "navigation",             name: "Navigation",                          group: "Pilot Related", base: 40, perLvl: 5 },
  { key: "weaponSystems",          name: "Weapon Systems",                      group: "Pilot Related", base: 40, perLvl: 5 },

  // Rogue
  { key: "cardsharp",              name: "Cardsharp",                           group: "Rogue", base: 24, perLvl: 4 },
  { key: "computerHacking",        name: "Computer Hacking",                    group: "Rogue", base: 20, perLvl: 5 },
  { key: "concealment",            name: "Concealment",                         group: "Rogue", base: 20, perLvl: 4 },
  { key: "gamblingStandard",       name: "Gambling: Standard",                  group: "Rogue", base: 30, perLvl: 5 },
  { key: "gamblingDirtyTricks",    name: "Gambling: Dirty Tricks",              group: "Rogue", base: 20, perLvl: 4 },
  { key: "idUndercoverAgent",      name: "I.D. Undercover Agents",              group: "Rogue", base: 30, perLvl: 4 },
  { key: "imitateVoicesSounds",    name: "Imitate Voices & Sounds",             group: "Rogue", base: 42, perLvl: 4 },
  { key: "palming",                name: "Palming",                             group: "Rogue", base: 20, perLvl: 5 },
  { key: "roadwise",               name: "Roadwise",                            group: "Rogue", base: 26, perLvl: 4 },
  { key: "safeCracking",           name: "Safe-Cracking",                       group: "Rogue", base: 20, perLvl: 4 },
  { key: "seduction",              name: "Seduction",                           group: "Rogue", base: 20, perLvl: 3 },
  { key: "streetwise",             name: "Streetwise",                          group: "Rogue", base: 20, perLvl: 4 },
  { key: "tailing",                name: "Tailing",                             group: "Rogue", base: 30, perLvl: 5 },

  // Science
  { key: "anthropology",           name: "Anthropology",                        group: "Science", base: 30, perLvl: 5 },
  { key: "archaeology",            name: "Archaeology",                         group: "Science", base: 30, perLvl: 5 },
  { key: "artificialIntelligence", name: "Artificial Intelligence",             group: "Science", base: 30, perLvl: 3 },
  { key: "astronomyNavigation",    name: "Astronomy & Navigation",              group: "Science", base: 30, perLvl: 5 },
  { key: "astrophysics",           name: "Astrophysics",                        group: "Science", base: 30, perLvl: 5 },
  { key: "biology",                name: "Biology",                             group: "Science", base: 30, perLvl: 5 },
  { key: "botany",                 name: "Botany",                              group: "Science", base: 25, perLvl: 5 },
  { key: "chemistry",              name: "Chemistry",                           group: "Science", base: 30, perLvl: 5 },
  { key: "chemistryAnalytical",    name: "Chemistry: Analytical",               group: "Science", base: 25, perLvl: 5 },
  { key: "chemistryPharmaceutical",name: "Chemistry: Pharmaceutical",           group: "Science", base: 30, perLvl: 5 },
  { key: "mathematicsBasic",       name: "Mathematics: Basic",                  group: "Science", base: 45, perLvl: 5 },
  { key: "mathematicsAdvanced",    name: "Mathematics: Advanced",               group: "Science", base: 45, perLvl: 5 },
  { key: "xenology",               name: "Xenology",                            group: "Science", base: 30, perLvl: 5 },
  { key: "zoology",                name: "Zoology",                             group: "Science", base: 30, perLvl: 5 },

  // Technical
  { key: "appraiseGoods",          name: "Appraise Goods",                      group: "Technical", base: 30, perLvl: 5 },
  { key: "art",                    name: "Art",                                 group: "Technical", base: 35, perLvl: 5 },
  { key: "begging",                name: "Begging",                             group: "Technical", base: 30, perLvl: 3 },
  { key: "breedDogs",              name: "Breed Dogs",                          group: "Technical", base: 40, perLvl: 5 },
  { key: "calligraphy",            name: "Calligraphy",                         group: "Technical", base: 35, perLvl: 5 },
  { key: "computerOperation",      name: "Computer Operation",                  group: "Technical", base: 40, perLvl: 5 },
  { key: "computerProgramming",    name: "Computer Programming",                group: "Technical", base: 30, perLvl: 5 },
  { key: "cyberneticsBasic",       name: "Cybernetics: Basic",                  group: "Technical", base: 25, perLvl: 5 },
  { key: "excavation",             name: "Excavation",                          group: "Technical", base: 30, perLvl: 5 },
  { key: "firefighting",           name: "Firefighting",                        group: "Technical", base: 40, perLvl: 5 },
  { key: "gemology",               name: "Gemology",                            group: "Technical", base: 25, perLvl: 5 },
  { key: "generalRepairMaintenance", name: "General Repair & Maintenance",      group: "Technical", base: 35, perLvl: 5 },
  { key: "historyPreRifts",        name: "History: Pre-Rifts",                  group: "Technical", base: 32, perLvl: 4 },
  { key: "historyPostApocalypse",  name: "History: Post-Apocalypse",            group: "Technical", base: 35, perLvl: 5 },
  { key: "juryRig",                name: "Jury-Rig",                            group: "Technical", base: 25, perLvl: 5 },
  { key: "lawGeneral",             name: "Law (general)",                       group: "Technical", base: 35, perLvl: 5 },
  { key: "leatherWorking",         name: "Leather Working",                     group: "Technical", base: 40, perLvl: 5 },
  { key: "loreDBee",               name: "Lore: D-Bee",                         group: "Technical", base: 25, perLvl: 5 },
  { key: "loreDemonsMonsters",     name: "Lore: Demons & Monsters",             group: "Technical", base: 25, perLvl: 5 },
  { key: "loreFaeries",            name: "Lore: Faerie & Creatures of Magic",   group: "Technical", base: 25, perLvl: 5 },
  { key: "loreJuicers",            name: "Lore: Juicers",                       group: "Technical", base: 30, perLvl: 5 },
  { key: "loreMagic",              name: "Lore: Magic",                         group: "Technical", base: 25, perLvl: 5 },
  { key: "lorePsychicsPsionics",   name: "Lore: Psychics & Psionics",           group: "Technical", base: 25, perLvl: 5 },
  { key: "masonry",                name: "Masonry",                             group: "Technical", base: 40, perLvl: 5 },
  { key: "mining",                 name: "Mining",                              group: "Technical", base: 35, perLvl: 5 },
  { key: "mythology",              name: "Mythology",                           group: "Technical", base: 30, perLvl: 5 },
  { key: "philosophy",             name: "Philosophy",                          group: "Technical", base: 30, perLvl: 5 },
  { key: "photography",            name: "Photography",                         group: "Technical", base: 35, perLvl: 5 },
  { key: "prospecting",            name: "Prospecting",                         group: "Technical", base: 20, perLvl: 5 },
  { key: "recycling",              name: "Recycle",                             group: "Technical", base: 30, perLvl: 5 },
  { key: "research",               name: "Research",                            group: "Technical", base: 40, perLvl: 5 },
  { key: "ropeWorks",              name: "Rope Works",                          group: "Technical", base: 30, perLvl: 5 },
  { key: "salvage",                name: "Salvage",                             group: "Technical", base: 35, perLvl: 5 },
  { key: "ventriloquism",          name: "Ventriloquism",                       group: "Technical", base: 16, perLvl: 4 },
  { key: "whittlingSculpting",     name: "Whittling & Sculpting",               group: "Technical", base: 30, perLvl: 5 },

  // Wilderness
  { key: "boatBuilding",           name: "Boat Building",                       group: "Wilderness", base: 25, perLvl: 5 },
  { key: "carpentry",              name: "Carpentry",                           group: "Wilderness", base: 25, perLvl: 5 },
  { key: "dowsing",                name: "Dowsing",                             group: "Wilderness", base: 20, perLvl: 5 },
  { key: "fasting",                name: "Fasting",                             group: "Wilderness", base: 40, perLvl: 3 },
  { key: "hunting",                name: "Hunting",                             group: "Wilderness", base: 0,  perLvl: 0 },
  { key: "identifyPlantsFruit",    name: "Identify Plants & Fruit",             group: "Wilderness", base: 25, perLvl: 5 },
  { key: "landNavigation",         name: "Land Navigation",                     group: "Wilderness", base: 36, perLvl: 4 },
  { key: "preserveFood",           name: "Preserve Food",                       group: "Wilderness", base: 30, perLvl: 5 },
  { key: "skinPrepareAnimalHides", name: "Skin & Prepare Animal Hides",         group: "Wilderness", base: 30, perLvl: 5 },
  { key: "spelunking",             name: "Spelunking",                          group: "Wilderness", base: 35, perLvl: 5 },
  { key: "trackTrapAnimals",       name: "Track & Trap Animals",                group: "Wilderness", base: 20, perLvl: 5 }
];

for (const key of [
  "electricalEngineer",
  "robotElectronics",
  "mechanicalEngineer",
  "robotMechanics",
  "medicalDoctor",
  "cyberneticMedicine",
  "demolitions",
  "demolitionsDisposal",
  "acrobatics",
  "boxing",
  "gymnastics",
  "wrestling",
  "weaponSystems"
]) {
  const skill = EE.SKILL_LIST.find(s => s.key === key);
  if (skill) skill.secondary = false;
}

for (const key of [
  "combatDriving",
  "flightSystemCombat",
  "jumpBikeCombat",
  "militaryCombatHelicopter",
  "militaryJetFighters",
  "militarySubmersibles",
  "militaryTanksApcs",
  "militaryWarshipsPatrolBoats",
  "robotCombatBasic",
  "robotCombatElite"
]) {
  const skill = EE.SKILL_LIST.find(s => s.key === key);
  if (skill) skill.secondary = false;
}

for (const key of ["languageNative", "languageOther", "literacyNative", "literacyOther"]) {
  const skill = EE.SKILL_LIST.find(s => s.key === key);
  if (skill) {
    skill.repeatable = key === "languageOther" || key === "literacyOther";
    skill.specialization = true;
    skill.specializationBase = key.startsWith("language") ? "Language" : "Literacy";
    skill.specializationLabel = key.endsWith("Native") ? "Native Language" : skill.specializationBase;
  }
}

// Master EE Legacy W.P. list. Rendered as checkboxes on the legacy Combat tab.
EE.WP_LIST = {
  ancient: [
    { key: "wpArchery",                  name: "W.P. Archery" },
    { key: "wpAxe",                      name: "W.P. Axe" },
    { key: "wpBlunt",                    name: "W.P. Blunt" },
    { key: "wpChain",                    name: "W.P. Chain" },
    { key: "wpForked",                   name: "W.P. Forked" },
    { key: "wpGrapplingHook",            name: "W.P. Grappling Hook" },
    { key: "wpKnife",                    name: "W.P. Knife" },
    { key: "wpPairedWeapons",            name: "W.P. Paired Weapons" },
    { key: "wpPoleArm",                  name: "W.P. Polearm" },
    { key: "wpQuickDraw",                name: "W.P. Quick Draw" },
    { key: "wpRope",                     name: "W.P. Rope" },
    { key: "wpShield",                   name: "W.P. Shield" },
    { key: "wpSlingShot",                name: "W.P. Sling Shot" },
    { key: "wpSpear",                    name: "W.P. Spear" },
    { key: "wpStaff",                    name: "W.P. Staff" },
    { key: "wpSword",                    name: "W.P. Sword" },
    { key: "wpTargeting",                name: "W.P. Targeting" },
    { key: "wpTomahawk",                 name: "W.P. Tomahawk (throwing axe)" },
    { key: "wpWhip",                     name: "W.P. Whip" }
  ],
  modern: [
    { key: "wpHandguns",                 name: "W.P. Handguns" },
    { key: "wpRifles",                   name: "W.P. Rifles" },
    { key: "wpBoltActionRifle",          name: "W.P. Bolt Action Rifle (hunting/sniping/shotguns)" },
    { key: "wpShotgun",                  name: "W.P. Shotguns" },
    { key: "wpSubmachineGun",            name: "W.P. Sub-Machineguns" },
    { key: "wpHeavyMilitary",            name: "W.P. Heavy Military" },
    { key: "wpFlamethrowers",            name: "W.P. Military Flamethrowers" },
    { key: "wpHarpoonSpearGun",          name: "W.P. Harpoon & Speargun" },
    { key: "wpEnergyPistol",             name: "W.P. Energy Pistol" },
    { key: "wpEnergyRifle",              name: "W.P. Energy Rifle" },
    { key: "wpSharpshooting",            name: "W.P. Sharpshooting" },
    { key: "wpHeavyMD",                  name: "W.P. Heavy M.D." }
  ]
};

EE.RIFTS_WP_RULES = {
  wpArchery: {
    strikeLevels: [1, 2, 4, 6, 8, 10, 12, 14],
    parryFlat: 1,
    parryLabel: "bow weapon only",
    disarmLevels: [2, 5, 10, 15],
    rateOfFireBase: 2,
    rateOfFireLevels: [2, 4, 5, 8, 10, 12, 14],
    damage: "Short Bow 1D6; Long Bow 2D6; Compound Bow 2D6+1; Harpoon Gun 1D10; Light Crossbow 2D4; Heavy Crossbow 2D8; Pistol Crossbow 1D6.",
    note: "Bows and crossbows may shoot up to 50% farther with no W.P. strike or disarm bonus. Running, flying, riding, vehicle fire, or other unbalanced shots lose all bonuses and halve rate of fire."
  },
  wpAxe: {
    strikeLevels: [2, 5, 8, 12, 15],
    parryLevels: [2, 5, 8, 12, 15],
    thrownStrikeLevels: [5, 8, 12],
    damage: "Large axes 2D6 or 2D8 by size/style; small axes and hatchets 1D6.",
    note: "Not designed for throwing."
  },
  wpBlunt: {
    strikeLevels: [1, 3, 6, 9, 12],
    parryLevels: [1, 3, 6, 9, 12],
    thrownStrikeLevels: [5, 10, 15],
    damage: "Typically 1D6 or 2D4; largest or spiked blunt weapons 2D6.",
    note: "Not designed for throwing."
  },
  wpChain: {
    strikeLevels: [1, 3, 7, 10, 13],
    parryLevels: [4, 8, 12],
    thrownPenalty: -3,
    damage: "Typically 2D6; large/spiked chain weapons such as Goupiillon flails 3D6.",
    note: "Can parry only when wielded in two hands. Cannot entangle and cannot be thrown accurately."
  },
  wpForked: {
    strikeLevels: [1, 3, 5, 8, 11, 13],
    entangleLevels: [1, 3, 5, 8, 11, 13],
    parryLevels: [1, 3, 6, 10, 13],
    thrownStrikeLevels: [4, 10, 15],
    damage: "Small forked weapons 1D8; most large spear-like forked weapons 2D6; trident 2D8.",
    note: "Strike bonus can be used to strike or entangle. Not really designed for throwing."
  },
  wpGrapplingHook: {
    strikeLevels: [3, 6, 9, 12],
    entangleLevels: [3, 6, 9, 12],
    skillBonus: "+5% Climbing when a grappling hook is used",
    damage: "1D4 in hand-to-hand; 1D6 when swung and pulled back into a victim.",
    note: "Can trip by hooking a foot, ankle, or leg. Cannot be used to parry."
  },
  wpKnife: {
    strikeLevels: [2, 4, 7, 10, 13],
    parryLevels: [1, 3, 6, 9, 12],
    thrownStrikeLevels: [1, 3, 6, 8, 10, 13],
    damage: "Very small knives 1D4; typical knives 1D6."
  },
  wpPairedWeapons: {
    note: "Exclusive to Men at Arms O.C.C.s. Allows one-handed weapons in each hand: strike and parry simultaneously, twin strikes, strike two targets, or parry two attackers. Requires W.P. in each weapon used; two-handed weapons do not qualify."
  },
  wpPoleArm: {
    strikeLevels: [1, 3, 6, 9, 12],
    parryLevels: [1, 3, 6, 9, 12],
    thrownStrikeLevels: [3, 8, 12],
    damageLevels: [2, 8],
    damage: "Typically 2D8; largest pole arms 3D6; Voulge 4D6.",
    note: "Not designed for throwing."
  },
  wpQuickDraw: {
    quickDraw: true,
    note: "Initiative bonus is based on P.P.: +1 at 17 or less, +2 at 18-23, +3 at 24-30, +4 at 31 or higher."
  },
  wpRope: {
    note: "Usually exclusive to the Cowboy O.C.C.; see Cowboy skills for the full description."
  },
  wpShield: {
    strikeLevels: [4, 8, 12],
    parryLevels: [1, 3, 7, 10, 13],
    damage: "1D6 as a blunt weapon; 1D4 damage when thrown.",
    note: "No bonus to strike when thrown. Shield blocks bullets or energy blasts only with no bonuses; blocking thrown weapons is -8 to parry and spears/arrows are -3."
  },
  wpSlingShot: {
    sameAs: "wpTargeting",
    note: "See W.P. Targeting."
  },
  wpSpear: {
    strikeLevels: [1, 3, 6, 9, 12],
    parryLevels: [1, 3, 6, 9, 12],
    thrownStrikeLevels: [3, 6, 10, 14],
    damage: "Short spear or javelin 1D6; long spear 2D6.",
    note: "Maximum throwing range 150 feet."
  },
  wpStaff: {
    strikeLevels: [1, 3, 7, 10, 13],
    parryLevels: [2, 5, 8, 11, 14],
    thrownStrikeLevels: [5, 10, 15],
    damage: "Short Staff 1D6; Long Staff 2D4; Bo Staff or Quarter Staff 2D6.",
    note: "Typically made of wood. Not designed for throwing."
  },
  wpSword: {
    strikeLevels: [1, 3, 6, 9, 12, 15],
    parryLevels: [2, 4, 7, 10, 13],
    thrownStrikeLevels: [4, 8, 12],
    damage: "Short Sword or Saber 2D4; Falchion/Scimitar 2D6; Broadsword 1D8+1; Long Sword and other large swords 2D6; huge swords 3D6.",
    note: "Swords are not designed for being thrown."
  },
  wpTargeting: {
    strikeLevels: [1, 3, 7, 10],
    damage: "Bolas 2D4; blowgun/dart 1D4; boomerang, stone, javelin, sling/slingshot, spear, knives, sticks 1D6; throwing axe 2D4; trident 2D8; net no damage.",
    note: "Applies to thrown/projectile weapons except bows, crossbows, and guns. Requires any one missile W.P. Running, flying, riding, vehicle use, or imbalance halves bonuses and rate of fire. Strength damage normally does not apply to arrows or thrown weapons unless an O.C.C. says otherwise."
  },
  wpTomahawk: {
    strikeLevels: [2, 4, 7, 10, 13],
    parryLevels: [1, 3, 6, 9, 12],
    thrownStrikeLevels: [1, 3, 6, 8, 10, 13],
    note: "Training with light throwing axes and tomahawks; almost exclusive to Native American Indians."
  },
  wpWhip: {
    strikeLevels: [2, 4, 7, 10, 13],
    disarmLevels: [2, 4, 7, 10, 13],
    entangleLevels: [2, 4, 7, 10, 13],
    damageLevels: [2, 4, 8, 12],
    damage: "Light Whip 1D6; Heavy Whip, Bull Whip, or Cat-O-Nine-Tails 2D6.",
    note: "Cannot be used to parry and cannot be thrown."
  },
  wpHandguns: {
    strikeLevels: [2, 4, 6, 8, 10, 12, 14],
    damage: "Light caliber 2D6 to 3D6 S.D.C.; medium 3D6 to 4D6 S.D.C.; heavy/large 4D6 to 6D6 S.D.C. Short bursts from pistols double damage.",
    range: "Average range 140 feet."
  },
  wpRifles: {
    strikeLevels: [1, 3, 5, 7, 9, 11, 13],
    damage: "Light caliber 5D6 S.D.C.; medium 6D6 S.D.C.; heavy/large 7D6 to 1D6x10+3 S.D.C. Short bursts double damage; long bursts triple damage.",
    range: "Average range 1300 feet, plus 500 feet for precision bolt-action rifles."
  },
  wpBoltActionRifle: {
    strikeLevels: [4, 7, 10, 13],
    note: "Modern W.P. for most hunting rifles and shotguns; not automatic-firing weapons. Uses standard modern weapon proficiency bonuses."
  },
  wpShotgun: {
    strikeLevels: [1, 3, 6, 10, 14],
    damage: "Buckshot 2D6 S.D.C. in a 10 foot radius; light shot 3D6; medium shot 4D6 to 5D6; heavy shot/large bore 6D6. Double damage if both barrels fire simultaneously.",
    range: "Sawed-Off 60 feet; hunting 200 feet; police/military 300 feet."
  },
  wpSubmachineGun: {
    strikeLevels: [1, 3, 6, 9, 12, 15],
    damage: "4D6 S.D.C. per single round or 1D4x10 S.D.C. per three-round burst.",
    range: "Average range 500-600 feet.",
    note: "Can only fire in bursts."
  },
  wpHeavyMilitary: {
    strikeLevels: [1, 3, 6, 10, 14],
    damage: "Machine-guns, grenade launchers, mortars, mini-guns, and similar military hardware; damage varies by weapon.",
    note: "Many heavy weapons can only fire bursts or must be mounted/supported."
  },
  wpFlamethrowers: {
    strikeLevels: [2, 5, 10, 15],
    damage: "5D6 S.D.C. per burst of flame, with 01-75% likelihood of flammable targets catching fire.",
    range: "Average range 60 feet."
  },
  wpHarpoonSpearGun: {
    strikeLevels: [2, 4, 7, 10, 15],
    damage: "Plain pointed end 2D6 S.D.C.; explosive head 4D6 M.D."
  },
  wpEnergyPistol: {
    damage: "Mega-Damage varies.",
    note: "Includes lasers, ion blasters, and other energy firing small arms."
  },
  wpEnergyRifle: {
    damage: "Mega-Damage varies.",
    note: "Includes all long-range energy firing rifles."
  },
  wpSharpshooting: {
    summary: "Specialized W.P. enhancement; select once per weapon type. Adds one attack when using that weapon for the entire melee round.",
    note: "Aimed Shot: +1 strike at P.P. 20 and every 5 P.P. above 20. Quick Draw: +1 initiative at P.P. 18 and every 4 P.P. above 18. Sharpshooter's Called Shot: +1 strike at P.P. 18 and every 3 P.P. above 18, counts as 2 attacks. Costs two O.C.C. Related Skill selections, cannot be bought with Secondary Skills, and cannot apply to heavy military/heavy M.D. weapons or non-shooting weapons."
  },
  wpHeavyMD: {
    damage: "Mega-Damage varies by weapon and manufacturer.",
    note: "Includes plasma ejectors, M.D. rail guns, rocket launchers, mini-missile launchers, and mounted heavy weapon turrets."
  }
};

EE.RIFTS_WP_NOTES = [
  "Each modern W.P. counts as one skill selection and represents training with a particular modern weapon type.",
  "Modern W.P.s allow the character to reload, disassemble, unjam, clean, and maintain the weapon, and to use the normal firing modes for that weapon.",
  "Recognize Weapon Quality for modern weapons starts at -30% at level 1 and improves by +6% per level.",
  "Standard modern W.P. strike bonus: +1 to strike for every 3 levels beyond level 1.",
  "Aimed shots are +3 to strike, or +4 with revolvers, and each individual shot uses one attack/action.",
  "Short bursts and long bursts are +1 to strike. Short bursts fire 20% of the magazine and double one round's damage; long bursts fire 50% of the magazine and triple one round's damage.",
  "Firing the entire magazine uses 100% of the rounds, multiplies one round's damage by 7, uses two attacks/actions, and normally targets only one foe.",
  "Wild/spray fire has no bonus or penalty for a trained shooter, uses two attacks/actions, and can hit bystanders; untrained wild/spray fire is -6.",
  "A character may use any weapon without its W.P., but does not receive W.P. bonuses.",
  "Modern weapons without W.P.: no attribute or Hand to Hand bonuses apply, cannot make Aimed or Called Shots, and suffer -3 to burst attacks, -5 with heavy weapons, and -6 when shooting wild.",
  "A Natural 19 or 20 to strike with a thrown weapon is a critical strike and inflicts double damage; an aimed/called disarm succeeds automatically unless matched or beaten by the defender's natural roll.",
  "Strength damage does not apply to arrows or thrown weapons unless an O.C.C. description specifically says it does."
];

// Errant Earth weapon proficiencies - the canonical short list from the
// Errant Earth "Weapon Proficiencies" table. Stored in the same selected map
// as EE Legacy W.P.s so switching rules modes preserves both sets.
EE.EE_WP_LIST = [
  { key: "wpArchaicProjectileWeapons", name: "Archaic Projectile Weapons" },
  { key: "wpArchaicMeleeWeapons",      name: "Archaic Melee Weapons" },
  { key: "wpModernMeleeWeapons",       name: "Modern Melee Weapons" },
  { key: "wpArchaicFirearms",          name: "Archaic Firearms" },
  { key: "wpUnarmed",                  name: "Unarmed" },
  { key: "wpKineticHandgun",           name: "Kinetic Handgun" },
  { key: "wpEnergyHandgun",            name: "Energy Handgun" },
  { key: "wpKineticLongGun",           name: "Kinetic Long Gun" },
  { key: "wpEnergyLongGun",            name: "Energy Long Gun" },
  { key: "wpKineticAutomatics",        name: "Kinetic Automatics" },
  { key: "wpEnergyAutomatics",         name: "Energy Automatics" },
  { key: "wpHeavyWeapons",             name: "Heavy Weapons" },
  { key: "wpVehicleHardpoints",        name: "Vehicle Hardpoints" }
];

EE.ATTRIBUTES = {
  iq:  "IQ",
  me:  "ME",
  ma:  "MA",
  ps:  "PS",
  pp:  "PP",
  pe:  "PE",
  pb:  "PB",
  spd: "SPD"
};

// ===== Errant Earth-mode enums =====

EE.SYSTEM_MODES = {
  rifts:        "EE Legacy",
  errantEarth:  "Errant Earth"
};

EE.EE_ATTRIBUTE_TIERS = {
  Mortal:       "Mortal",
  Augmented:    "Augmented",
  Mechanical:   "Mechanical",
  Supernatural: "Supernatural",
  Exalted:      "Exalted",
  Divine:       "Divine"
};

// Errant Earth alignment is a 5x4 grid: Morality (row) x Ethics (column).
// The intersection names the alignment (e.g. Paragon + Ontological = Messiah).
EE.EE_ALIGNMENT_MORALITIES = {
  paragon:   "Paragon",
  lawful:    "Lawful",
  arbitrary: "Arbitrary",
  miscreant: "Miscreant",
  aberrant:  "Aberrant"
};

EE.EE_ALIGNMENT_ETHICS = {
  ontological: "Ontological",
  realist:     "Realist",
  relativist:  "Relativist",
  nihilist:    "Nihilist"
};

EE.EE_ALIGNMENT_GRID = {
  paragon:   { ontological: "Messiah",     realist: "Missionary", relativist: "Vigilante",     nihilist: "Lone Ranger" },
  lawful:    { ontological: "Adjudicator", realist: "Officer",    relativist: "Citizen",       nihilist: "Bureaucratic" },
  arbitrary: { ontological: "Egoist",      realist: "Prideful",   relativist: "Self-Centered", nihilist: "Anarchist" },
  miscreant: { ontological: "Psychopath",  realist: "Syndicate",  relativist: "Punk",          nihilist: "Sociopath" },
  aberrant:  { ontological: "Devil",       realist: "Maniac",     relativist: "Sophist",       nihilist: "Defiler" }
};

EE.EE_SKILL_CATEGORIES = {
  cultural:    "Cultural and Domestic",
  electronics: "Electronics and Mechanics",
  espionage:   "Espionage and Rogue",
  medical:     "Medical",
  military:    "Military",
  people:      "People",
  science:     "Science",
  technical:   "Technical",
  psychic:     "Psychic",
  magic:       "Magic",
  wilderness:  "Wilderness"
};

EE.EE_SKILL_TAGS = {
  aced:          "Aced",
  armor:         "Armor",
  assurance:     "Assurance",
  combat:        "Combat",
  contested:     "Contested",
  crafting:      "Crafting",
  downtime:      "Downtime",
  exploration:   "Exploration",
  fated:         "Fated",
  hacking:       "Hacking",
  investigation: "Investigation",
  language:      "Language",
  lore:          "Lore",
  magic:         "Magic",
  medical:       "Medical",
  mobility:      "Mobility",
  pilot:         "Pilot",
  profession:    "Profession",
  psychic:       "Psychic",
  reliable:      "Reliable",
  social:        "Social",
  survival:      "Survival",
  take20:        "Take 20",
  tech:          "Tech",
  utility:       "Utility",
  vehicle:       "Vehicle",
  weapon:        "Weapon"
};

// Errant Earth uses a percentile skill model. Each skill has a Base success
// chance plus three tiered progressions per level: Core (focus), Trained
// (working knowledge), and Hobby (casual). The `open` flag marks skills that
// require a specialization (e.g. "Language (Open)" -> player picks language).
EE.EE_SKILL_LIST = [
  // Cultural and Domestic
  { key: "appraisal",         name: "Appraisal",         category: "cultural",    base: 35, core: 8,  trained: 3, hobby: 0 },
  { key: "cooking",           name: "Cooking",           category: "cultural",    base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "domesticWork",      name: "Domestic Work",     category: "cultural",    base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "language",          name: "Language (Open)",   category: "cultural",    base: 35, core: 10, trained: 5, hobby: 1, open: true },
  { key: "literacy",          name: "Literacy (Open)",   category: "cultural",    base: 20, core: 8,  trained: 3, hobby: 0, open: true },
  { key: "loreCultural",      name: "Lore (Open)",       category: "cultural",    base: 50, core: 10, trained: 5, hobby: 1, open: true },
  { key: "memetics",          name: "Memetics",          category: "cultural",    base: 50, core: 4,  trained: 0, hobby: 0 },
  { key: "trade",             name: "Trade (Open)",      category: "cultural",    base: 35, core: 10, trained: 5, hobby: 1, open: true },
  { key: "trinkets",          name: "Trinkets",          category: "cultural",    base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "wardrobe",          name: "Wardrobe",          category: "cultural",    base: 50, core: 12, trained: 7, hobby: 3 },

  // Electronics and Mechanics
  { key: "modeller3d",        name: "3D Modeller",       category: "electronics", base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "collapseMechnika",  name: "Collapse Mechnika", category: "electronics", base: 5,  core: 10, trained: 5, hobby: 0 },
  { key: "computerUse",       name: "Computer Use",      category: "electronics", base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "cybernetics",       name: "Cybernetics",       category: "electronics", base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "demolitions",       name: "Demolitions",       category: "electronics", base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "earthMechanics",    name: "Earth Mechanics (Open)", category: "electronics", base: 50, core: 10, trained: 5, hobby: 0, open: true },
  { key: "exoMechanics",      name: "Exo Mechanics",     category: "electronics", base: 5,  core: 8,  trained: 3, hobby: 0 },
  { key: "radio",             name: "Radio",             category: "electronics", base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "robotics",          name: "Robotics",          category: "electronics", base: 35, core: 10, trained: 5, hobby: 1 },

  // Espionage and Rogue
  { key: "concealment",       name: "Concealment",       category: "espionage",   base: 50, core: 10, trained: 5, hobby: 1 },
  { key: "disguise",          name: "Disguise",          category: "espionage",   base: 35, core: 12, trained: 7, hobby: 3 },
  { key: "forgery",           name: "Forgary",           category: "espionage",   base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "gambling",          name: "Gambling",          category: "espionage",   base: 35, core: 12, trained: 7, hobby: 3 },
  { key: "intelGathering",    name: "Intelligence Gathering", category: "espionage", base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "investigation",     name: "Investigation",     category: "espionage",   base: 35, core: 12, trained: 7, hobby: 3 },
  { key: "lockpicking",       name: "Lockpicking",       category: "espionage",   base: 35, core: 8,  trained: 3, hobby: 0 },
  { key: "search",            name: "Search",            category: "espionage",   base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "sleightOfHand",     name: "Sleight of Hand",   category: "espionage",   base: 50, core: 10, trained: 5, hobby: 1 },
  { key: "stealth",           name: "Stealth",           category: "espionage",   base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "streetwise",        name: "Streetwise",        category: "espionage",   base: 50, core: 12, trained: 7, hobby: 3 },

  // Medical
  { key: "cyberdoctoring",    name: "Cyberdoctoring",    category: "medical",     base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "exodoctoring",      name: "Exodoctoring",      category: "medical",     base: 5,  core: 8,  trained: 3, hobby: 0 },
  { key: "fieldMedicine",     name: "Field Medicine",    category: "medical",     base: 35, core: 8,  trained: 3, hobby: 0 },
  { key: "holisticMedicine",  name: "Holistic Medicine", category: "medical",     base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "medtech",           name: "Medtech",           category: "medical",     base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "psychology",        name: "Psychology",        category: "medical",     base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "traditionalMedicine", name: "Traditional Medicine", category: "medical", base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "veterinary",        name: "Veterinary",        category: "medical",     base: 35, core: 8,  trained: 3, hobby: 0 },

  // Military
  { key: "armory",            name: "Armory",            category: "military",    base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "commandStructure",  name: "Command Structure", category: "military",    base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "dueling",           name: "Dueling",           category: "military",    base: 35, core: 8,  trained: 3, hobby: 0 },
  { key: "electronicWarfare", name: "Electronic Warfare", category: "military",   base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "fortification",     name: "Fortification",     category: "military",    base: 35, core: 8,  trained: 3, hobby: 0 },
  { key: "militaryHistory",   name: "Military History",  category: "military",    base: 50, core: 4,  trained: 0, hobby: 0 },
  { key: "monsterHunter",     name: "Monster Hunter",    category: "military",    base: 20, core: 10, trained: 5, hobby: 1 },
  { key: "scouter",           name: "Scouter",           category: "military",    base: 35, core: 12, trained: 7, hobby: 3 },
  { key: "tactics",           name: "Tactics",           category: "military",    base: 20, core: 8,  trained: 3, hobby: 0 },

  // People
  { key: "animalHusbandry",   name: "Animal Husbandry",  category: "people",      base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "banter",            name: "Banter",            category: "people",      base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "barter",            name: "Barter",            category: "people",      base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "charm",             name: "Charm",             category: "people",      base: 50, core: 10, trained: 5, hobby: 1 },
  { key: "command",           name: "Command",           category: "people",      base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "diplomacy",         name: "Diplomacy",         category: "people",      base: 20, core: 10, trained: 5, hobby: 1 },
  { key: "empathy",           name: "Empathy",           category: "people",      base: 20, core: 12, trained: 7, hobby: 3 },
  { key: "etiquette",         name: "Etiquette",         category: "people",      base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "performance",       name: "Performance (Open)", category: "people",     base: 50, core: 10, trained: 5, hobby: 1, open: true },
  { key: "signLanguage",      name: "Sign Language (Open)", category: "people",   base: 20, core: 10, trained: 5, hobby: 1, open: true },

  // Science
  { key: "astraKnowledge",    name: "Astra Knowledge",   category: "science",     base: 20, core: 4,  trained: 0, hobby: 0 },
  { key: "formalScience",     name: "Formal Science (Open)", category: "science", base: 20, core: 10, trained: 5, hobby: 1, open: true },
  { key: "naturalSciences",   name: "Natural Sciences (Open)", category: "science", base: 20, core: 10, trained: 5, hobby: 1, open: true },
  { key: "preCollapseHistory", name: "Pre-Collapse History", category: "science", base: 5,  core: 4,  trained: 0, hobby: 0 },
  { key: "psychoPhenomenon",  name: "Psycho Phenomenon", category: "science",     base: 20, core: 4,  trained: 0, hobby: 0 },
  { key: "socialSciences",    name: "Social Sciences (Open)", category: "science", base: 35, core: 10, trained: 5, hobby: 1, open: true },
  { key: "tearKnowledge",     name: "Tear Knowledge",    category: "science",     base: 5,  core: 10, trained: 5, hobby: 1 },
  { key: "xenoScience",       name: "Xeno Science (Open)", category: "science",   base: 5,  core: 8,  trained: 3, hobby: 0, open: true },

  // Technical
  { key: "architecture",      name: "Architecture",      category: "technical",   base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "daredevil",         name: "Daredevil",         category: "technical",   base: 20, core: 10, trained: 5, hobby: 1 },
  { key: "navigation",        name: "Navigation",        category: "technical",   base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "piloting",          name: "Piloting (Open)",   category: "technical",   base: 50, core: 8,  trained: 3, hobby: 0, open: true },
  { key: "salvageOperations", name: "Salvage Operations", category: "technical",  base: 50, core: 12, trained: 7, hobby: 3 },
  { key: "sensorEquipment",   name: "Sensor Equipment",  category: "technical",   base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "technical",         name: "Technical (Open)",  category: "technical",   base: 35, core: 10, trained: 5, hobby: 1, open: true },

  // Psychic
  { key: "identifyPsychicPower", name: "Identify Psychic Power", category: "psychic", base: 20, core: 12, trained: 7, hobby: 3 },
  { key: "readPsychicSignature", name: "Read Psychic Signature", category: "psychic", base: 35, core: 12, trained: 7, hobby: 3 },
  { key: "shivers",           name: "Shivers",           category: "psychic",     base: 50, core: 4,  trained: 0, hobby: 0 },
  { key: "trancing",          name: "Trancing",          category: "psychic",     base: 20, core: 10, trained: 5, hobby: 1 },

  // Magic
  { key: "druidicCircles",    name: "Druidic Circles",   category: "magic",       base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "elementalPhysics",  name: "Elemental Physics", category: "magic",       base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "fiendKnowledge",    name: "Fiend Knowledge",   category: "magic",       base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "schoolOfOccultism", name: "School of Occultism", category: "magic",     base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "technomancy",       name: "Technomancy",       category: "magic",       base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "theurgy",           name: "Theurgy",           category: "magic",       base: 20, core: 8,  trained: 3, hobby: 0 },
  { key: "tulpamancy",        name: "Tulpamancy",        category: "magic",       base: 5,  core: 4,  trained: 0, hobby: 0 },

  // Wilderness
  { key: "camouflage",        name: "Camouflage",        category: "wilderness",  base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "naturalism",        name: "Naturalism",        category: "wilderness",  base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "landNavigation",    name: "Land Navigation",   category: "wilderness",  base: 35, core: 12, trained: 7, hobby: 3 },
  { key: "tracking",          name: "Tracking",          category: "wilderness",  base: 35, core: 10, trained: 5, hobby: 1 },
  { key: "bushcraft",         name: "Bushcraft",         category: "wilderness",  base: 50, core: 8,  trained: 3, hobby: 0 },
  { key: "homesteading",      name: "Homesteading",      category: "wilderness",  base: 20, core: 10, trained: 5, hobby: 1 }
];

EE.EE_DAMAGE_SCALES = {
  S: "Standard",
  M: "Mega",
  G: "Giga",
  U: "Ultra"
};
