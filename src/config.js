export const EE = {};

EE.ALIGNMENTS = {
  principled:   "Principled",
  scrupulous:   "Scrupulous",
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
  mutation:     "Mutation",
  technology:   "Technology",
  supernatural: "Supernatural"
};

EE.HTH_TYPES = {
  basic:       "Basic",
  expert:      "Expert",
  martialArts: "Martial Arts",
  commando:    "Commando",
  assassin:    "Assassin"
};

// Cumulative numeric bonuses by HtH type and level (1..15) per RIFTS Ultimate
// Edition p.343-346. Non-numeric perks (kick damage dice, paired weapons, crit
// ranges, body flip dice, death blow, etc.) are NOT encoded here — only the
// per-stat numeric bonuses that map to the sheet fields. Verify against the
// book before relying on these in play; values are easy to correct in place.
EE.HTH_PROGRESSIONS = {
  // Hand to Hand: Basic
  basic: {
    1:  { attacks: 2, strike: 0, parry: 0, dodge: 0, damage: 0, pullRoll: 2, initiative: 0 },
    2:  { attacks: 2, strike: 0, parry: 0, dodge: 0, damage: 2, pullRoll: 5, initiative: 0 },
    3:  { attacks: 2, strike: 0, parry: 2, dodge: 2, damage: 2, pullRoll: 5, initiative: 0 },
    4:  { attacks: 3, strike: 0, parry: 2, dodge: 2, damage: 2, pullRoll: 5, initiative: 0 },
    5:  { attacks: 3, strike: 0, parry: 2, dodge: 2, damage: 2, pullRoll: 5, initiative: 0 },
    6:  { attacks: 3, strike: 1, parry: 2, dodge: 2, damage: 2, pullRoll: 5, initiative: 0 },
    7:  { attacks: 3, strike: 1, parry: 3, dodge: 3, damage: 2, pullRoll: 5, initiative: 0 },
    8:  { attacks: 4, strike: 1, parry: 3, dodge: 3, damage: 2, pullRoll: 5, initiative: 0 },
    9:  { attacks: 4, strike: 1, parry: 3, dodge: 3, damage: 4, pullRoll: 5, initiative: 0 },
    10: { attacks: 4, strike: 2, parry: 3, dodge: 3, damage: 4, pullRoll: 5, initiative: 0 },
    11: { attacks: 4, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 5, initiative: 0 },
    12: { attacks: 5, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 5, initiative: 0 },
    13: { attacks: 5, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 6, initiative: 0 },
    14: { attacks: 5, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 6, initiative: 0 },
    15: { attacks: 5, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 6, initiative: 0 }
  },
  // Hand to Hand: Expert
  expert: {
    1:  { attacks: 3, strike: 0, parry: 2, dodge: 2, damage: 0, pullRoll: 5, initiative: 0 },
    2:  { attacks: 3, strike: 1, parry: 2, dodge: 2, damage: 0, pullRoll: 5, initiative: 0 },
    3:  { attacks: 3, strike: 1, parry: 2, dodge: 2, damage: 2, pullRoll: 5, initiative: 0 },
    4:  { attacks: 3, strike: 1, parry: 3, dodge: 3, damage: 2, pullRoll: 5, initiative: 0 },
    5:  { attacks: 4, strike: 1, parry: 3, dodge: 3, damage: 2, pullRoll: 5, initiative: 0 },
    6:  { attacks: 4, strike: 1, parry: 3, dodge: 3, damage: 2, pullRoll: 7, initiative: 0 },
    7:  { attacks: 4, strike: 2, parry: 3, dodge: 3, damage: 2, pullRoll: 7, initiative: 0 },
    8:  { attacks: 4, strike: 2, parry: 4, dodge: 4, damage: 2, pullRoll: 7, initiative: 0 },
    9:  { attacks: 4, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 7, initiative: 0 },
    10: { attacks: 5, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 7, initiative: 0 },
    11: { attacks: 5, strike: 2, parry: 4, dodge: 4, damage: 4, pullRoll: 7, initiative: 0 },
    12: { attacks: 5, strike: 2, parry: 5, dodge: 5, damage: 4, pullRoll: 7, initiative: 0 },
    13: { attacks: 5, strike: 3, parry: 5, dodge: 5, damage: 4, pullRoll: 7, initiative: 0 },
    14: { attacks: 6, strike: 3, parry: 5, dodge: 5, damage: 4, pullRoll: 7, initiative: 0 },
    15: { attacks: 6, strike: 3, parry: 5, dodge: 5, damage: 4, pullRoll: 7, initiative: 0 }
  },
  // Hand to Hand: Martial Arts
  martialArts: {
    1:  { attacks: 4, strike: 2, parry: 3, dodge: 3, damage: 0, pullRoll: 2, initiative: 0 },
    2:  { attacks: 4, strike: 2, parry: 3, dodge: 3, damage: 2, pullRoll: 2, initiative: 0 },
    3:  { attacks: 4, strike: 3, parry: 3, dodge: 3, damage: 2, pullRoll: 2, initiative: 0 },
    4:  { attacks: 5, strike: 3, parry: 4, dodge: 4, damage: 2, pullRoll: 2, initiative: 0 },
    5:  { attacks: 5, strike: 3, parry: 4, dodge: 4, damage: 2, pullRoll: 4, initiative: 0 },
    6:  { attacks: 5, strike: 4, parry: 5, dodge: 5, damage: 2, pullRoll: 4, initiative: 0 },
    7:  { attacks: 5, strike: 4, parry: 5, dodge: 5, damage: 2, pullRoll: 4, initiative: 0 },
    8:  { attacks: 6, strike: 5, parry: 5, dodge: 5, damage: 2, pullRoll: 4, initiative: 0 },
    9:  { attacks: 6, strike: 5, parry: 5, dodge: 5, damage: 2, pullRoll: 4, initiative: 0 },
    10: { attacks: 6, strike: 6, parry: 6, dodge: 6, damage: 2, pullRoll: 4, initiative: 0 },
    11: { attacks: 7, strike: 6, parry: 6, dodge: 6, damage: 2, pullRoll: 4, initiative: 0 },
    12: { attacks: 7, strike: 6, parry: 6, dodge: 6, damage: 4, pullRoll: 4, initiative: 0 },
    13: { attacks: 7, strike: 6, parry: 6, dodge: 6, damage: 4, pullRoll: 4, initiative: 0 },
    14: { attacks: 8, strike: 7, parry: 6, dodge: 6, damage: 4, pullRoll: 4, initiative: 0 },
    15: { attacks: 8, strike: 7, parry: 7, dodge: 7, damage: 4, pullRoll: 4, initiative: 0 }
  },
  // Hand to Hand: Commando
  commando: {
    1:  { attacks: 4, strike: 2, parry: 3, dodge: 3, damage: 0, pullRoll: 5, initiative: 2 },
    2:  { attacks: 4, strike: 3, parry: 4, dodge: 4, damage: 0, pullRoll: 5, initiative: 2 },
    3:  { attacks: 5, strike: 3, parry: 4, dodge: 4, damage: 0, pullRoll: 5, initiative: 2 },
    4:  { attacks: 5, strike: 3, parry: 4, dodge: 4, damage: 2, pullRoll: 5, initiative: 2 },
    5:  { attacks: 5, strike: 3, parry: 4, dodge: 4, damage: 2, pullRoll: 5, initiative: 2 },
    6:  { attacks: 6, strike: 4, parry: 4, dodge: 4, damage: 2, pullRoll: 5, initiative: 2 },
    7:  { attacks: 6, strike: 4, parry: 5, dodge: 5, damage: 2, pullRoll: 5, initiative: 2 },
    8:  { attacks: 7, strike: 4, parry: 5, dodge: 5, damage: 2, pullRoll: 5, initiative: 2 },
    9:  { attacks: 7, strike: 4, parry: 5, dodge: 5, damage: 4, pullRoll: 5, initiative: 2 },
    10: { attacks: 7, strike: 5, parry: 5, dodge: 5, damage: 4, pullRoll: 5, initiative: 2 },
    11: { attacks: 7, strike: 5, parry: 6, dodge: 6, damage: 4, pullRoll: 5, initiative: 2 },
    12: { attacks: 8, strike: 5, parry: 6, dodge: 6, damage: 4, pullRoll: 5, initiative: 2 },
    13: { attacks: 8, strike: 5, parry: 6, dodge: 6, damage: 4, pullRoll: 5, initiative: 2 },
    14: { attacks: 8, strike: 6, parry: 6, dodge: 6, damage: 4, pullRoll: 5, initiative: 2 },
    15: { attacks: 9, strike: 6, parry: 6, dodge: 6, damage: 4, pullRoll: 5, initiative: 2 }
  },
  // Hand to Hand: Assassin
  assassin: {
    1:  { attacks: 4, strike: 1, parry: 2, dodge: 2, damage: 0, pullRoll: 2, initiative: 1 },
    2:  { attacks: 4, strike: 2, parry: 2, dodge: 2, damage: 0, pullRoll: 2, initiative: 1 },
    3:  { attacks: 4, strike: 2, parry: 3, dodge: 3, damage: 0, pullRoll: 2, initiative: 1 },
    4:  { attacks: 5, strike: 2, parry: 3, dodge: 3, damage: 0, pullRoll: 2, initiative: 1 },
    5:  { attacks: 5, strike: 2, parry: 3, dodge: 3, damage: 0, pullRoll: 2, initiative: 1 },
    6:  { attacks: 5, strike: 3, parry: 3, dodge: 3, damage: 0, pullRoll: 2, initiative: 1 },
    7:  { attacks: 5, strike: 3, parry: 3, dodge: 3, damage: 0, pullRoll: 2, initiative: 1 },
    8:  { attacks: 5, strike: 3, parry: 4, dodge: 4, damage: 2, pullRoll: 2, initiative: 1 },
    9:  { attacks: 6, strike: 3, parry: 4, dodge: 4, damage: 2, pullRoll: 2, initiative: 1 },
    10: { attacks: 6, strike: 4, parry: 4, dodge: 4, damage: 2, pullRoll: 2, initiative: 1 },
    11: { attacks: 6, strike: 4, parry: 5, dodge: 5, damage: 2, pullRoll: 2, initiative: 1 },
    12: { attacks: 7, strike: 4, parry: 5, dodge: 5, damage: 2, pullRoll: 2, initiative: 1 },
    13: { attacks: 7, strike: 5, parry: 5, dodge: 5, damage: 2, pullRoll: 2, initiative: 1 },
    14: { attacks: 7, strike: 5, parry: 5, dodge: 5, damage: 4, pullRoll: 2, initiative: 1 },
    15: { attacks: 7, strike: 5, parry: 6, dodge: 6, damage: 4, pullRoll: 2, initiative: 1 }
  }
};

EE.HTH_STAT_KEYS = ["attacks", "strike", "parry", "dodge", "damage", "pullRoll", "initiative"];

EE.getHthBonuses = function (type, level) {
  const empty = { attacks: 0, strike: 0, parry: 0, dodge: 0, damage: 0, pullRoll: 0, initiative: 0 };
  if (!type || !EE.HTH_PROGRESSIONS[type]) return empty;
  const lvl = Math.max(1, Math.min(15, Number(level) || 1));
  return { ...empty, ...(EE.HTH_PROGRESSIONS[type][lvl] ?? {}) };
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

// Master Palladium / RIFTS skill list (p.302–303). Each entry seeds a row
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
  { key: "languageOther",          name: "Language: Other",                     group: "Communication", base: 50, perLvl: 3 },
  { key: "laserCommunications",    name: "Laser Communications",                group: "Communication", base: 30, perLvl: 5 },
  { key: "literacyNative",         name: "Literacy: Native Language",           group: "Communication", base: 40, perLvl: 5 },
  { key: "literacyOther",          name: "Literacy: Other",                     group: "Communication", base: 30, perLvl: 5 },
  { key: "opticSystems",           name: "Optic Systems",                       group: "Communication", base: 30, perLvl: 5 },
  { key: "performance",            name: "Performance",                         group: "Communication", base: 30, perLvl: 5 },
  { key: "publicSpeaking",         name: "Public Speaking",                     group: "Communication", base: 30, perLvl: 5 },
  { key: "radioBasic",             name: "Radio: Basic",                        group: "Communication", base: 45, perLvl: 5 },
  { key: "sensoryEquipment",       name: "Sensory Equipment",                   group: "Communication", base: 30, perLvl: 5 },
  { key: "signLanguage",           name: "Sign Language",                       group: "Communication", base: 25, perLvl: 5 },
  { key: "sing",                   name: "Sing",                                group: "Communication", base: 35, perLvl: 5 },
  { key: "surveillance",           name: "Surveillance",                        group: "Communication", base: 30, perLvl: 5 },
  { key: "tvVideo",                name: "TV/Video",                            group: "Communication", base: 25, perLvl: 5 },

  // Cowboy
  { key: "branding",               name: "Branding",                            group: "Cowboy", base: 50, perLvl: 5 },
  { key: "breakingTamingWildHorse",name: "Breaking/Taming Wild Horse",          group: "Cowboy", base: 20, perLvl: 5 },
  { key: "herdingCattle",          name: "Herding Cattle",                      group: "Cowboy", base: 30, perLvl: 5 },
  { key: "horsemanshipCowboy",     name: "Horsemanship: Cowboy",                group: "Cowboy", base: 66, perLvl: 3 },
  { key: "horsemanshipExotic",     name: "Horsemanship: Exotic",                group: "Cowboy", base: 30, perLvl: 5 },
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
  { key: "sewing",                 name: "Sewing",                              group: "Domestic", base: 40, perLvl: 5 },
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
  { key: "trackingPeople",         name: "Tracking (people)",                   group: "Espionage", base: 25, perLvl: 5 },
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
  { key: "vehicleArmorer",         name: "Vehicle Armorer",                     group: "Mechanical", base: 30, perLvl: 5 },
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
  { key: "holisticMedicine",       name: "Holistic Medicine",                   group: "Medical", base: 30, perLvl: 5 },
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
  { key: "fieldArmorerMunitions",  name: "Field Armorer & Munitions Expert",    group: "Military", base: 40, perLvl: 5 },
  { key: "findContraband",         name: "Find Contraband",                     group: "Military", base: 26, perLvl: 4 },
  { key: "forcedMarch",            name: "Forced March",                        group: "Military", base: 0,  perLvl: 0 },
  { key: "militaryEtiquette",      name: "Military Etiquette",                  group: "Military", base: 35, perLvl: 5 },
  { key: "militaryFortification",  name: "Military Fortification",              group: "Military", base: 30, perLvl: 5 },
  { key: "navalHistory",           name: "Naval History",                       group: "Military", base: 30, perLvl: 5 },
  { key: "navalTactics",           name: "Naval Tactics",                       group: "Military", base: 25, perLvl: 5 },
  { key: "nbcWarfare",             name: "NBC Warfare",                         group: "Military", base: 35, perLvl: 5 },
  { key: "parachuting",            name: "Parachuting",                         group: "Military", base: 40, perLvl: 5 },
  { key: "recognizeWeaponQuality", name: "Recognize Weapon Quality",            group: "Military", base: 25, perLvl: 5 },
  { key: "trapMineDetection",      name: "Trap/Mine Detection",                 group: "Military", base: 20, perLvl: 5 },

  // Physical
  { key: "noHandToHand",           name: "No Hand to Hand Combat Skill",        group: "Physical", base: 0, perLvl: 0 },
  { key: "hthBasic",               name: "Hand to Hand: Basic",                 group: "Physical", base: 0, perLvl: 0 },
  { key: "hthExpert",              name: "Hand to Hand: Expert",                group: "Physical", base: 0, perLvl: 0 },
  { key: "hthMartialArts",         name: "Hand to Hand: Martial Arts",          group: "Physical", base: 0, perLvl: 0 },
  { key: "hthAssassin",            name: "Hand to Hand: Assassin",              group: "Physical", base: 0, perLvl: 0 },
  { key: "hthCommando",            name: "Hand to Hand: Commando",              group: "Physical", base: 0, perLvl: 0 },
  { key: "acrobatics",             name: "Acrobatics",                          group: "Physical", base: 0, perLvl: 0 },
  { key: "aerobicAthletics",       name: "Aerobic Athletics",                   group: "Physical", base: 0, perLvl: 0 },
  { key: "athleticsGeneral",       name: "Athletics (General)",                 group: "Physical", base: 0, perLvl: 0 },
  { key: "bodyBuildingWeightLifting", name: "Body Building & Weight Lifting",   group: "Physical", base: 0, perLvl: 0 },
  { key: "boxing",                 name: "Boxing",                              group: "Physical", base: 0, perLvl: 0 },
  { key: "climbing",               name: "Climbing",                            group: "Physical", base: 40, perLvl: 5 },
  { key: "fencing",                name: "Fencing",                             group: "Physical", base: 0, perLvl: 0 },
  { key: "gymnastics",             name: "Gymnastics",                          group: "Physical", base: 0, perLvl: 0 },
  { key: "juggling",               name: "Juggling",                            group: "Physical", base: 35, perLvl: 5 },
  { key: "kickBoxing",             name: "Kick Boxing",                         group: "Physical", base: 0, perLvl: 0 },
  { key: "outdoorsmanship",        name: "Outdoorsmanship",                     group: "Physical", base: 0, perLvl: 0 },
  { key: "physicalLabor",          name: "Physical Labor",                      group: "Physical", base: 0, perLvl: 0 },
  { key: "prowl",                  name: "Prowl",                               group: "Physical", base: 25, perLvl: 5 },
  { key: "running",                name: "Running",                             group: "Physical", base: 0, perLvl: 0 },
  { key: "swimming",               name: "Swimming",                            group: "Physical", base: 50, perLvl: 5 },
  { key: "scuba",                  name: "SCUBA",                               group: "Physical", base: 50, perLvl: 5 },
  { key: "wrestling",              name: "Wrestling",                           group: "Physical", base: 0, perLvl: 0 },

  // Pilot
  { key: "pilotAirplane",          name: "Pilot: Airplane",                     group: "Pilot", base: 50, perLvl: 4 },
  { key: "pilotAutomobile",        name: "Pilot: Automobile",                   group: "Pilot", base: 60, perLvl: 2 },
  { key: "pilotBicycling",         name: "Pilot: Bicycling",                    group: "Pilot", base: 44, perLvl: 4 },
  { key: "pilotBoatMotor",         name: "Pilot: Boat — Motor, Race & Hydrofoil", group: "Pilot", base: 55, perLvl: 5 },
  { key: "pilotBoatPaddle",        name: "Pilot: Boat — Paddle/Canoe/Kayak",    group: "Pilot", base: 50, perLvl: 5 },
  { key: "pilotBoatSail",          name: "Pilot: Boat — Sail",                  group: "Pilot", base: 60, perLvl: 5 },
  { key: "pilotBoatShips",         name: "Pilot: Boat — Ships",                 group: "Pilot", base: 45, perLvl: 5 },
  { key: "combatDriving",          name: "Combat Driving",                      group: "Pilot", base: 0,  perLvl: 0 },
  { key: "flightSystemCombat",     name: "Flight System Combat (Juicer)",       group: "Pilot", base: 40, perLvl: 5 },
  { key: "hoverCraftGround",       name: "Hover Craft (Ground)",                group: "Pilot", base: 50, perLvl: 5 },
  { key: "hovercyclesSkycyclesRocketBikes", name: "Hovercycles, Skycycles & Rocket Bikes", group: "Pilot", base: 70, perLvl: 3 },
  { key: "pilotJetAircraft",       name: "Pilot: Jet Aircraft",                 group: "Pilot", base: 40, perLvl: 4 },
  { key: "jetPacks",               name: "Jet Packs",                           group: "Pilot", base: 42, perLvl: 4 },
  { key: "jumpBikeCombat",         name: "Jump Bike Combat (Juicer)",           group: "Pilot", base: 45, perLvl: 5 },
  { key: "militaryCombatHelicopter", name: "Military: Combat Helicopter",       group: "Pilot", base: 52, perLvl: 3 },
  { key: "militaryJetFighters",    name: "Military: Jet Fighters",              group: "Pilot", base: 40, perLvl: 4 },
  { key: "militarySubmersibles",   name: "Military: Submersibles",              group: "Pilot", base: 40, perLvl: 4 },
  { key: "militaryTanksApcs",      name: "Military: Tanks & APCs",              group: "Pilot", base: 36, perLvl: 4 },
  { key: "militaryWarshipsPatrolBoats", name: "Military: Warships & Patrol Boats", group: "Pilot", base: 40, perLvl: 4 },
  { key: "motorcyclesSnowmobiles", name: "Motorcycles & Snowmobiles",           group: "Pilot", base: 60, perLvl: 4 },
  { key: "robotsPowerArmor",       name: "Robots & Power Armor",                group: "Pilot", base: 56, perLvl: 3 },
  { key: "robotCombatBasic",       name: "Robot Combat: Basic",                 group: "Pilot", base: 0,  perLvl: 0 },
  { key: "robotCombatElite",       name: "Robot Combat: Elite",                 group: "Pilot", base: 0,  perLvl: 0 },
  { key: "trackedConstructionVehicles", name: "Tracked & Construction Vehicles", group: "Pilot", base: 40, perLvl: 4 },
  { key: "pilotTruck",             name: "Pilot: Truck",                        group: "Pilot", base: 40, perLvl: 4 },
  { key: "waterScooters",          name: "Water Scooters",                      group: "Pilot", base: 50, perLvl: 5 },
  { key: "waterSkiingSurfing",     name: "Water Skiing & Surfing",              group: "Pilot", base: 40, perLvl: 4 },

  // Pilot Related
  { key: "navigation",             name: "Navigation",                          group: "Pilot Related", base: 40, perLvl: 5 },
  { key: "weaponSystems",          name: "Weapon Systems",                      group: "Pilot Related", base: 40, perLvl: 5 },

  // Rogue
  { key: "cardsharp",              name: "Cardsharp",                           group: "Rogue", base: 24, perLvl: 4 },
  { key: "computerHacking",        name: "Computer Hacking",                    group: "Rogue", base: 20, perLvl: 5 },
  { key: "concealment",            name: "Concealment",                         group: "Rogue", base: 20, perLvl: 4 },
  { key: "gamblingStandard",       name: "Gambling (Standard)",                 group: "Rogue", base: 30, perLvl: 5 },
  { key: "gamblingDirtyTricks",    name: "Gambling (Dirty Tricks)",             group: "Rogue", base: 20, perLvl: 4 },
  { key: "idUndercoverAgent",      name: "I.D. Undercover Agent",               group: "Rogue", base: 30, perLvl: 4 },
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
  { key: "excavation",             name: "Excavation",                          group: "Technical", base: 40, perLvl: 5 },
  { key: "firefighting",           name: "Firefighting",                        group: "Technical", base: 30, perLvl: 5 },
  { key: "gemology",               name: "Gemology",                            group: "Technical", base: 25, perLvl: 5 },
  { key: "generalRepairMaintenance", name: "General Repair & Maintenance",      group: "Technical", base: 35, perLvl: 5 },
  { key: "historyPreRifts",        name: "History: Pre-Rifts",                  group: "Technical", base: 32, perLvl: 4 },
  { key: "historyPostApocalypse",  name: "History: Post-Apocalypse",            group: "Technical", base: 35, perLvl: 5 },
  { key: "juryRig",                name: "Jury-Rig",                            group: "Technical", base: 25, perLvl: 5 },
  { key: "lawGeneral",             name: "Law (General)",                       group: "Technical", base: 35, perLvl: 5 },
  { key: "leatherWorking",         name: "Leather Working",                     group: "Technical", base: 40, perLvl: 5 },
  { key: "loreDBee",               name: "Lore: D-Bee",                         group: "Technical", base: 25, perLvl: 5 },
  { key: "loreDemonsMonsters",     name: "Lore: Demons & Monsters",             group: "Technical", base: 25, perLvl: 5 },
  { key: "loreFaeries",            name: "Lore: Faeries & Creatures of Magic",  group: "Technical", base: 25, perLvl: 5 },
  { key: "loreJuicers",            name: "Lore: Juicers",                       group: "Technical", base: 30, perLvl: 5 },
  { key: "loreMagic",              name: "Lore: Magic",                         group: "Technical", base: 25, perLvl: 5 },
  { key: "lorePsychicsPsionics",   name: "Lore: Psychics & Psionics",           group: "Technical", base: 25, perLvl: 5 },
  { key: "masonry",                name: "Masonry",                             group: "Technical", base: 40, perLvl: 5 },
  { key: "mining",                 name: "Mining",                              group: "Technical", base: 35, perLvl: 5 },
  { key: "mythology",              name: "Mythology",                           group: "Technical", base: 30, perLvl: 5 },
  { key: "philosophy",             name: "Philosophy",                          group: "Technical", base: 30, perLvl: 5 },
  { key: "photography",            name: "Photography",                         group: "Technical", base: 35, perLvl: 5 },
  { key: "recycling",              name: "Recycling",                           group: "Technical", base: 30, perLvl: 5 },
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

// Master W.P. list (p.303). Rendered as checkboxes on the Combat tab.
EE.WP_LIST = {
  ancient: [
    { key: "wpArchery",         name: "W.P. Archery" },
    { key: "wpAxe",             name: "W.P. Axe" },
    { key: "wpBlunt",           name: "W.P. Blunt" },
    { key: "wpChain",           name: "W.P. Chain" },
    { key: "wpForked",          name: "W.P. Forked" },
    { key: "wpGrapplingHook",   name: "W.P. Grappling Hook" },
    { key: "wpKnife",           name: "W.P. Knife" },
    { key: "wpPairedWeapons",   name: "W.P. Paired Weapons (Men at Arms)" },
    { key: "wpPoleArm",         name: "W.P. Pole Arm" },
    { key: "wpQuickDraw",       name: "W.P. Quick Draw" },
    { key: "wpRope",            name: "W.P. Rope" },
    { key: "wpShield",          name: "W.P. Shield" },
    { key: "wpSpear",           name: "W.P. Spear" },
    { key: "wpStaff",           name: "W.P. Staff" },
    { key: "wpSword",           name: "W.P. Sword" },
    { key: "wpTargeting",       name: "W.P. Targeting" },
    { key: "wpWhip",            name: "W.P. Whip" }
  ],
  modern: [
    { key: "wpHandguns",        name: "W.P. Handguns" },
    { key: "wpRifles",          name: "W.P. Rifles" },
    { key: "wpShotgun",         name: "W.P. Shotgun" },
    { key: "wpSubmachineGun",   name: "W.P. Submachine-Gun" },
    { key: "wpHeavyMilitary",   name: "W.P. Heavy Military Weapons" },
    { key: "wpFlamethrowers",   name: "W.P. Military Flamethrowers" },
    { key: "wpHarpoonSpearGun", name: "W.P. Harpoon & Spear Gun" },
    { key: "wpEnergyPistol",    name: "W.P. Energy Pistol" },
    { key: "wpEnergyRifle",     name: "W.P. Energy Rifle" },
    { key: "wpHeavyMD",         name: "W.P. Heavy M.D. Weapons" }
  ]
};

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
  rifts:        "RIFTS",
  errantEarth:  "Errant Earth"
};

EE.EE_ATTRIBUTES = {
  anm: "ANM (Animus)",
  brv: "BRV (Bravado)",
  com: "COM (Composure)",
  fin: "FIN (Finesse)",
  hrd: "HRD (Hardiness)",
  pow: "POW (Power)",
  spd: "SPD (Speed)",
  wil: "WIL (Will)"
};

EE.EE_ATTRIBUTE_TIERS = {
  Mortal:       "Mortal",
  Augmented:    "Augmented",
  Mechanical:   "Mechanical",
  Supernatural: "Supernatural",
  Exalted:      "Exalted",
  Divine:       "Divine"
};

EE.EE_SKILL_CATEGORIES = {
  core:    "Core",
  trained: "Trained",
  hobby:   "Hobby"
};

EE.EE_SKILL_TAGS = {
  Aced:      "Aced",
  Assurance: "Assurance",
  Fated:     "Fated",
  Reliable:  "Reliable",
  Take20:    "Take 20"
};

EE.EE_DAMAGE_SCALES = {
  S: "Standard",
  M: "Mega",
  G: "Giga",
  U: "Ultra"
};
