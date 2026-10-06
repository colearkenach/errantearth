import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const SOURCE_DIR = path.join(ROOT, "data", "rifts-ultimate-edition");
const PACK_ROOT = path.join(ROOT, "packs");

const PACKS = [
  { name: "rifts-occs", source: "occs.json", label: "Rifts Ultimate Edition - O.C.C.s" },
  { name: "rifts-rccs", source: "rccs.json", label: "Rifts Ultimate Edition - R.C.C.s" },
  { name: "rifts-races", source: "races.json", label: "Rifts Ultimate Edition - Races" },
  { name: "rifts-weapons", source: "weapons.json", label: "Rifts Ultimate Edition - Weapons" },
  { name: "rifts-armor", source: "armor.json", label: "Rifts Ultimate Edition - Armor" },
  { name: "rifts-spells", source: "spells.json", label: "Rifts Ultimate Edition - Spells" },
  { name: "rifts-psionics", source: "psionics.json", label: "Rifts Ultimate Edition - Psionics" },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function merge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return clone(override);
  const out = clone(base);
  for (const [key, value] of Object.entries(override)) {
    out[key] = isPlainObject(value) && isPlainObject(out[key])
      ? merge(out[key], value)
      : clone(value);
  }
  return out;
}

function stableId(packName, record) {
  return crypto
    .createHash("sha256")
    .update(`${packName}\0${record.type}\0${record.name}`, "utf8")
    .digest("base64url")
    .slice(0, 16);
}

function assertPackPath(target) {
  const relative = path.relative(PACK_ROOT, path.resolve(target));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify a path outside the compendium directory: ${target}`);
  }
}

function loadClassicLevel() {
  const require = createRequire(import.meta.url);
  const candidates = [
    process.env.FOUNDRY_CLASSIC_LEVEL,
    "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
  ].filter(Boolean);
  const errors = [];
  for (const candidate of candidates) {
    try {
      const loaded = require(candidate);
      if (loaded?.ClassicLevel) return loaded.ClassicLevel;
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new Error(
    "Could not load Foundry's classic-level module. Set FOUNDRY_CLASSIC_LEVEL to its directory.\n" +
    errors.join("\n")
  );
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function makeDocument(record, index, pack, itemDefaults, manifest) {
  if (!itemDefaults[record.type]) {
    throw new Error(`${pack.source}: unsupported Item type '${record.type}' for ${record.name}`);
  }
  const id = stableId(pack.name, record);
  const printedPage = Number(record.source?.printedPage || 0);
  return {
    _id: id,
    name: record.name,
    type: record.type,
    img: record.img || "icons/svg/item-bag.svg",
    system: merge(itemDefaults[record.type], record.system || {}),
    effects: [],
    folder: null,
    sort: (index + 1) * 100000,
    ownership: { default: 0 },
    flags: {
      errantearth: {
        source: {
          book: "Rifts Ultimate Edition",
          printedPage,
        },
      },
    },
    _stats: {
      compendiumSource: null,
      duplicateSource: null,
      coreVersion: "13",
      systemId: manifest.id,
      systemVersion: manifest.version,
      createdTime: 0,
      modifiedTime: 0,
      lastModifiedBy: null,
    },
  };
}

async function writePack(ClassicLevel, pack, documents) {
  const target = path.join(PACK_ROOT, pack.name);
  assertPackPath(target);
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });

  const db = new ClassicLevel(target, { keyEncoding: "utf8", valueEncoding: "json" });
  try {
    await db.open();
    await db.batch(documents.map(document => ({
      type: "put",
      key: `!items!${document._id}`,
      value: document,
    })));
  } finally {
    await db.close();
  }

  const verify = new ClassicLevel(target, { keyEncoding: "utf8", valueEncoding: "json" });
  const seen = [];
  try {
    await verify.open();
    for await (const [key, value] of verify.iterator()) {
      if (!key.startsWith("!items!")) throw new Error(`${pack.name}: unexpected database key ${key}`);
      if (!value?._id || !value?.name || !value?.type || !value?.system) {
        throw new Error(`${pack.name}: invalid Item document at ${key}`);
      }
      seen.push(value);
    }
  } finally {
    await verify.close();
  }
  if (seen.length !== documents.length) {
    throw new Error(`${pack.name}: wrote ${documents.length} documents but read back ${seen.length}`);
  }
  return seen;
}

async function main() {
  const ClassicLevel = loadClassicLevel();
  const template = await readJson(path.join(ROOT, "template.json"));
  const manifest = await readJson(path.join(ROOT, "system.json"));
  const itemDefaults = template.Item || {};
  await fs.mkdir(PACK_ROOT, { recursive: true });

  const globalIds = new Set();
  for (const pack of PACKS) {
    const records = await readJson(path.join(SOURCE_DIR, pack.source));
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error(`${pack.source}: expected a non-empty JSON array`);
    }
    const names = new Set();
    const documents = records.map((record, index) => {
      const nameKey = `${record.type}\0${record.name.toLocaleLowerCase("en-US")}`;
      if (names.has(nameKey)) throw new Error(`${pack.source}: duplicate entry '${record.name}'`);
      names.add(nameKey);
      const document = makeDocument(record, index, pack, itemDefaults, manifest);
      if (globalIds.has(document._id)) throw new Error(`Duplicate generated id ${document._id}`);
      globalIds.add(document._id);
      return document;
    });
    const verified = await writePack(ClassicLevel, pack, documents);
    console.log(`${pack.name}: ${verified.length} Items verified`);
  }
}

await main();
