#!/usr/bin/env python3
"""Extract structured EE Legacy compendium source from Rifts Ultimate Edition.

The source PDF is supplied at build time and is never modified. Printed page
numbers are used throughout because the PDF page index is exactly one greater
than the printed page number (and pdfplumber uses a zero-based index).
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "rifts-ultimate-edition"
ATTRIBUTE_KEYS = ("iq", "me", "ma", "ps", "pp", "pe", "pb", "spd")
ATTRIBUTE_LABELS = {
    "iq": "I.Q.", "me": "M.E.", "ma": "M.A.", "ps": "P.S.",
    "pp": "P.P.", "pe": "P.E.", "pb": "P.B.", "spd": "Spd"
}
NUMBER_WORDS = {
    "zero": 0, "none": 0, "one": 1, "two": 2, "three": 3,
    "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8,
    "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
    "thirteen": 13, "fourteen": 14, "fifteen": 15, "twenty": 20,
    "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
    "seventy": 70, "eighty": 80, "ninety": 90,
}
LEVEL_WORDS = {word: number for word, number in NUMBER_WORDS.items() if 1 <= number <= 15}


@dataclass
class Line:
    printed_page: int
    column: int
    top: float
    text: str
    size: float
    fonts: frozenset[str]

    @property
    def order(self) -> tuple[int, int, float]:
        return (self.printed_page, self.column, self.top)


def clean_text(value: str) -> str:
    text = str(value or "")
    text = text.replace("\u00ad", "")
    text = text.replace("\u2013", "-").replace("\u2014", "-").replace("\u2212", "-")
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = re.sub(r"\bAlign\s+m\s*ent\b", "Alignment", text, flags=re.I)
    text = re.sub(r"\bL\.?\s*S\.\s*P\.\b", "I.S.P.", text)
    text = re.sub(r"\bO\.?\s*[eE]\.?\s*C\.?\b", "O.C.C.", text)
    text = re.sub(r"\bR\.?\s*[eE]\.?\s*C\.?\b", "R.C.C.", text)
    text = re.sub(r"\b([1-9])0([468])\b", lambda m: f"{m.group(1)}D{m.group(2)}", text)
    text = re.sub(r"\b[Iil]D(?=\d)", "1D", text)
    text = re.sub(r"\b([1-9])D([468])xI0\b", r"\1D\2x10", text, flags=re.I)
    text = re.sub(r"\b[Iil]\s+(?=\d{2,3}\b)", "1", text)
    text = re.sub(r"(?<=\d)\s+(?=\d{2,3}\b)", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", clean_text(value).lower())


def join_lines(lines: Iterable[Line | str], separator: str = "\n") -> str:
    values: list[str] = []
    for line in lines:
        raw = line.text if isinstance(line, Line) else str(line)
        text = clean_text(raw)
        if not text:
            continue
        if isinstance(line, Line) and line.top > 730 and re.fullmatch(r"\d{1,3}", text):
            continue
        if values and values[-1].endswith("-") and text[:1].islower():
            values[-1] = values[-1][:-1] + text
        else:
            values.append(text)
    return separator.join(values).strip()


def prose(lines: Iterable[Line | str]) -> str:
    return join_lines(lines, " ")


def first_number(value: str, fallback: int = 0) -> int:
    text = clean_text(value).lower().replace(",", "")
    match = re.search(r"[-+]?\d+", text)
    if match:
        return int(match.group())
    tokens = re.findall(r"[a-z]+", text)
    total = 0
    current = 0
    seen = False
    for token in tokens:
        if token == "and" and seen:
            continue
        if token in NUMBER_WORDS:
            current += NUMBER_WORDS[token]
            seen = True
        elif token == "hundred" and seen:
            current = max(1, current) * 100
        elif token == "thousand" and seen:
            total += max(1, current) * 1000
            current = 0
        elif seen:
            break
    if seen:
        return total + current
    return fallback


def clean_entry_name(value: str) -> str:
    text = clean_text(value)
    corrections = {
        "1m pervious to Fire": "Impervious to Fire",
        "Create Zorn bie (Ritual)": "Create Zombie (Ritual)",
        "Lighthlade": "Lightblade",
        "Rift Teieportation": "Rift Teleportation",
        "Em pathic Transmission": "Empathic Transmission",
        "Cloud Of Smoke": "Cloud of Smoke",
    }
    return corrections.get(text, text)


def default_attribute_bonuses() -> dict:
    return {key: {"bonus": 0, "formula": "", "value": 0, "rolled": False} for key in ATTRIBUTE_KEYS}


def default_locations() -> dict:
    return {
        key: {"current": 0, "max": 0}
        for key in ("mainBody", "head", "leftArm", "rightArm", "leftLeg", "rightLeg")
    }


class RueExtractor:
    COLUMNS = ((25, 25, 306, 765), (306, 25, 590, 765))

    def __init__(self, pdf_path: Path):
        self.pdf_path = pdf_path
        self.pdf = pdfplumber.open(str(pdf_path))
        self.skill_catalog = self._load_skill_catalog()

    def close(self) -> None:
        self.pdf.close()

    def _load_skill_catalog(self) -> list[dict]:
        source = (ROOT / "src" / "config.js").read_text(encoding="utf-8")
        pattern = re.compile(
            r"\{\s*key:\s*\"([^\"]+)\",\s*name:\s*\"([^\"]+)\","
            r"\s*group:\s*\"([^\"]+)\",\s*base:\s*(-?\d+),\s*perLvl:\s*(-?\d+)"
        )
        rows = []
        for match in pattern.finditer(source):
            rows.append({
                "key": match.group(1), "name": match.group(2), "group": match.group(3),
                "base": int(match.group(4)), "perLvl": int(match.group(5))
            })
        if len(rows) < 200:
            raise RuntimeError(f"Expected the configured master skill catalog; found only {len(rows)} entries")
        return rows

    def page_lines(self, printed_page: int, columns: tuple[int, ...] = (0, 1)) -> list[Line]:
        page = self.pdf.pages[printed_page]
        out: list[Line] = []
        for column in columns:
            crop = page.crop(self.COLUMNS[column])
            for item in crop.extract_text_lines(return_chars=True, strip=True):
                chars = item.get("chars") or []
                if not chars:
                    continue
                text = clean_text(item.get("text", ""))
                if not text or re.fullmatch(r"\d{1,3}", text):
                    continue
                out.append(Line(
                    printed_page=printed_page,
                    column=column,
                    top=float(item.get("top", 0)),
                    text=text,
                    size=max(float(char.get("size", 0)) for char in chars),
                    fonts=frozenset(str(char.get("fontname", "")) for char in chars),
                ))
        return sorted(out, key=lambda line: line.order)

    def lines(self, first_printed: int, last_printed: int) -> list[Line]:
        out: list[Line] = []
        for printed in range(first_printed, last_printed + 1):
            out.extend(self.page_lines(printed))
        return out

    @staticmethod
    def slice_between(lines: list[Line], start: str, end: str | None = None) -> list[Line]:
        start_rx = re.compile(start, re.I)
        end_rx = re.compile(end, re.I) if end else None
        start_index = next((i for i, line in enumerate(lines) if start_rx.search(line.text)), None)
        if start_index is None:
            raise RuntimeError(f"Could not find source heading /{start}/")
        end_index = len(lines)
        if end_rx:
            end_index = next(
                (i for i, line in enumerate(lines[start_index + 1:], start_index + 1) if end_rx.search(line.text)),
                len(lines),
            )
        return lines[start_index:end_index]

    @staticmethod
    def _entry_fields(lines: list[Line], cost_label: str) -> dict:
        label_aliases = {
            "range": ("Range", "Effective Range", "Maximum Effective Range"),
            "duration": ("Duration", "Length of Trance"),
            "savingThrow": ("Saving Throw", "Save"),
            "damage": ("Damage", "Mega-Damage"),
            "cost": (cost_label, f"{cost_label} Cost"),
        }
        fields = {key: "" for key in label_aliases}
        label_re = re.compile(
            r"^(Range|Effective Range|Maximum Effective Range|Duration|Length of Trance|"
            r"Saving Throw|Save|Damage|Mega-Damage|P\.P\.E\.(?:\s*\([^)]*\))?(?:\s+Cost)?|"
            r"I\.S\.P\.(?:\s*\([^)]*\))?(?:\s+Cost)?)\s*:\s*(.*)$",
            re.I,
        )
        consumed: set[int] = set()
        for index, line in enumerate(lines):
            match = label_re.match(line.text)
            if not match:
                continue
            raw_label, value = match.group(1), match.group(2)
            key = next((k for k, aliases in label_aliases.items() if any(norm(raw_label) == norm(a) for a in aliases)), None)
            if norm(raw_label).startswith(norm(cost_label)):
                key = "cost"
            if not key:
                continue
            consumed.add(index)
            continuation: list[str] = [value]
            if key in {"range", "duration", "savingThrow"}:
                for offset in (1, 2):
                    child = index + offset
                    if child >= len(lines) or label_re.match(lines[child].text):
                        break
                    if offset == 1 and (line.text.endswith("-") or lines[child].text[:1].islower()):
                        continuation.append(lines[child].text)
                        consumed.add(child)
                    else:
                        break
            parsed = prose(continuation)
            fields[key] = f"{fields[key]} / {parsed}".strip(" / ") if fields[key] else parsed

        description_lines = [line for index, line in enumerate(lines) if index not in consumed]
        fields["description"] = prose(description_lines)
        return fields

    def extract_spells(self) -> list[dict]:
        entries: list[dict] = []
        current: dict | None = None
        level = 1

        def finish() -> None:
            nonlocal current
            if not current:
                return
            fields = self._entry_fields(current.pop("_lines"), "P.P.E.")
            current["system"] = {
                "category": "invocations", "categoryCustom": False,
                "description": fields["description"], "level": current.pop("_level"),
                "ppeCost": first_number(fields["cost"]), "duration": fields["duration"],
                "range": fields["range"], "savingThrow": fields["savingThrow"],
                "damage": fields["damage"],
                "isMDC": bool(re.search(r"\bM\.?D\.?", fields["damage"], re.I)),
            }
            entries.append(current)
            current = None

        for printed in range(198, 226):
            for line in self.page_lines(printed):
                level_match = re.search(r"\bLevel\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)\b", line.text, re.I)
                if line.size >= 18 and level_match:
                    finish()
                    level = LEVEL_WORDS[level_match.group(1).lower()]
                    continue
                is_title = 13.2 <= line.size <= 16.5 and "Fd1257499" in line.fonts
                if is_title:
                    if re.search(r"Magic Spells|List of Spells|Invocations", line.text, re.I):
                        continue
                    if current and not current["_lines"]:
                        current["name"] = clean_text(f"{current['name']} {line.text}")
                        continue
                    finish()
                    current = {
                        "name": clean_entry_name(line.text), "type": "spell", "img": "icons/svg/book.svg",
                        "source": {"printedPage": printed}, "_level": level, "_lines": [],
                    }
                    continue
                if current:
                    current["_lines"].append(line)
        finish()
        return self._dedupe(entries)

    def extract_psionics(self) -> list[dict]:
        entries: list[dict] = []
        current: dict | None = None
        power_type = "healing"
        type_labels = {
            "healing psionics": "healing", "physical psionics": "physical",
            "sensitive psionics": "sensitive", "super-psionics": "superPsionics",
            "super psionics": "superPsionics",
        }

        def finish() -> None:
            nonlocal current
            if not current:
                return
            fields = self._entry_fields(current.pop("_lines"), "I.S.P.")
            current["system"] = {
                "type": current.pop("_type"), "typeCustom": False,
                "description": fields["description"], "ispCost": first_number(fields["cost"]),
                "duration": fields["duration"], "range": fields["range"],
                "savingThrow": fields["savingThrow"], "damage": fields["damage"],
                "isMDC": bool(re.search(r"\bM\.?D\.?", fields["damage"], re.I)),
            }
            entries.append(current)
            current = None

        for printed in range(164, 185):
            columns = (1,) if printed == 164 else (0, 1)
            for line in self.page_lines(printed, columns):
                heading = norm(line.text)
                if line.size >= 18 and heading in {norm(label) for label in type_labels}:
                    finish()
                    power_type = next(value for label, value in type_labels.items() if norm(label) == heading)
                    continue
                is_title = 13.2 <= line.size <= 16.5 and "Fd1257499" in line.fonts
                if is_title:
                    if re.search(r"(?:Psionic Powers|Super-Psionics)$", line.text, re.I):
                        continue
                    if current and not current["_lines"]:
                        current["name"] = clean_text(f"{current['name']} {line.text}")
                        continue
                    finish()
                    current = {
                        "name": clean_entry_name(line.text), "type": "psionicPower", "img": "icons/svg/aura.svg",
                        "source": {"printedPage": printed}, "_type": power_type, "_lines": [],
                    }
                    continue
                if current:
                    current["_lines"].append(line)
        finish()

        merged: dict[str, dict] = {}
        for entry in entries:
            key = norm(entry["name"])
            if key not in merged:
                merged[key] = entry
                continue
            prior = merged[key]
            types = []
            for value in (prior["system"]["type"], entry["system"]["type"]):
                types.extend(part.strip() for part in value.split("/") if part.strip())
            prior["system"]["type"] = " / ".join(dict.fromkeys(types))
            prior["system"]["typeCustom"] = True
            if len(entry["system"]["description"]) > len(prior["system"]["description"]):
                prior["system"]["description"] = entry["system"]["description"]
        return list(merged.values())

    @staticmethod
    def _dedupe(entries: list[dict]) -> list[dict]:
        out: dict[str, dict] = {}
        for entry in entries:
            key = norm(entry["name"])
            if key not in out or len(entry.get("system", {}).get("description", "")) > len(out[key].get("system", {}).get("description", "")):
                out[key] = entry
        return list(out.values())

    def _sectionize(self, lines: list[Line]) -> dict[str, str]:
        cc = r"(?:O|R|D)\.?\s*C\.?\s*C\."
        lookup = [
            ("related", rf"{cc}\s*Related Skills"),
            ("skills", rf"(?:Military\s+)?{cc}\s*Skills(?:\s+of\s+[^:]+)?"),
            ("secondary", r"Secondary Skills"),
            ("alignment", r"Alignments?"),
            ("requirements", r"Attribute Requirements?"),
            ("raceRestrictions", r"Rac(?:e|ial)\s+(?:Restrictions?|Requirements?|Limitation)"),
            ("equipment", r"Standard Equipment(?:\s+for\s+[^:]+)?"),
            ("equipment", r"Equipment Available Upon Assignment"),
            ("equipment", r"Equipment"),
            ("weapons", r"Weapons?"),
            ("armor", r"(?:Body\s+)?Armor"),
            ("vehicles", r"Vehicles?"),
            ("money", r"Money"),
            ("cybernetics", r"Cybernetics(?:\s*&\s*Bionics)?|Bionics"),
            ("bonuses", rf"(?:Special\s+)?{cc}\s+(?:Abilities\s*&\s*)?Bonuses|Bonuses"),
            ("psionics", r"Psionics|Psionic Powers"),
            ("magic", r"Magic Powers|Magic|P\.P\.E\."),
            ("experience", r"Experience Table|Experience"),
        ]
        result: dict[str, list[str]] = {}
        current = "other"
        for line in lines:
            matches: list[tuple[int, int, str]] = []
            for key, pattern in lookup:
                for match in re.finditer(rf"\b(?:{pattern})\s*:\s*", line.text, re.I):
                    if not any(match.start() < end and match.end() > start for start, end, _ in matches):
                        matches.append((match.start(), match.end(), key))
            matches.sort(key=lambda item: item[0])
            if not matches:
                result.setdefault(current, []).append(line.text)
                continue
            prefix = line.text[:matches[0][0]].strip()
            if prefix:
                result.setdefault(current, []).append(prefix)
            for index, (start, end, key) in enumerate(matches):
                current = key
                next_start = matches[index + 1][0] if index + 1 < len(matches) else len(line.text)
                value = line.text[end:next_start].strip()
                result.setdefault(current, [])
                if value:
                    result[current].append(value)
        return {key: prose(value) for key, value in result.items()}

    def _skill_rows(self, text: str) -> list[dict]:
        wanted = clean_text(text)
        wanted_norm = norm(wanted)
        found: list[dict] = []
        for skill in sorted(self.skill_catalog, key=lambda row: -len(norm(row["name"]))):
            key = norm(skill["name"])
            if len(key) < 5:
                match = re.search(rf"\b{re.escape(skill['name'])}\b", wanted, re.I)
                present = bool(match)
            else:
                present = key in wanted_norm
            if not present or any(row["key"] == skill["key"] for row in found):
                continue
            row = {**skill, "category": "occ", "custom": False}
            bonus_match = re.search(rf"{re.escape(skill['name'])}[^.;]*?\(\s*\+(\d+)\s*%", wanted, re.I)
            if bonus_match:
                row["bonus"] = int(bonus_match.group(1))
            found.append(row)
        return sorted(found, key=lambda row: wanted_norm.find(norm(row["name"])))

    def _choice_rows(self, label: str, text: str, category: str) -> list[dict]:
        if not text:
            return []
        count_match = re.search(r"\b(?:select|choose|pick|get(?:s)? to select)\s+(one|two|three|four|five|six|seven|eight|nine|ten|\d+)", text, re.I)
        if not count_match:
            count_match = re.search(r"(?:^|\.\s+)(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(?:other\s+)?skills?\b", text, re.I)
        count = first_number(count_match.group(1), 0) if count_match else 0
        groups = []
        all_groups = sorted({row["group"] for row in self.skill_catalog}, key=len, reverse=True)
        for group in all_groups:
            match = re.search(rf"\b{re.escape(group)}\s*:\s*", text, re.I)
            if not match:
                continue
            following = text[match.end():]
            next_positions = [m.start() for other in all_groups for m in [re.search(rf"\b{re.escape(other)}\s*:\s*", following, re.I)] if m]
            segment = following[:min(next_positions)] if next_positions else following
            if not re.match(r"\s*(?:None|No\b)", segment, re.I):
                groups.append(group)
        bonus_match = re.search(r"\+(\d+)\s*%", text)
        rows: list[dict] = []
        if count:
            rows.append({
                "label": label, "count": count, "level": 1, "category": category,
                "bonus": int(bonus_match.group(1)) if bonus_match else 0,
                "allowedKeys": [], "allowedGroups": groups,
            })

        def levels_from(raw: str) -> list[int]:
            # The source PDF occasionally recognizes a printed "1" as a capital I.
            normalized = re.sub(r"\bI\b", "1", raw)
            return list(dict.fromkeys(
                int(value) for value in re.findall(r"\b(?:[1-9]|1[0-9]|20)\b", normalized)
            ))

        # Some tables use the compact form "Two at levels 1, 4, 8 and 12"
        # without a preceding Select/Choose verb.
        schedule_match = re.search(
            r"\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+"
            r"(?:additional\s+)?(?:secondary\s+)?(?:skills?\s+)?at\s+levels?\s+([^.]+)",
            text,
            re.I,
        )
        if schedule_match and not count_match:
            schedule_count = first_number(schedule_match.group(1), 0)
            for level in levels_from(schedule_match.group(2)):
                rows.append({
                    "label": f"{label} (Level {level})", "count": schedule_count, "level": level,
                    "category": category, "bonus": int(bonus_match.group(1)) if bonus_match else 0,
                    "allowedKeys": [], "allowedGroups": groups,
                })

        later_match = re.search(r"(?:addi\s*tional|an\s*other)[^.]{0,100}?at\s+levels?\s+([^.]+)", text, re.I)
        if later_match:
            later_count_match = re.search(r"(?:addi\s*tional|an\s*other)\s+(one|two|three|four|\d+)", later_match.group(0), re.I)
            later_count = first_number(later_count_match.group(1), 1) if later_count_match else 1
            for level in levels_from(later_match.group(1)):
                rows.append({
                    "label": f"{label} (Level {level})", "count": later_count, "level": level,
                    "category": category, "bonus": int(bonus_match.group(1)) if bonus_match else 0,
                    "allowedKeys": [], "allowedGroups": groups,
                })
        return rows

    @staticmethod
    def _xp_track(preset: str) -> dict:
        return {"preset": preset, "thresholds": [0] * 15, "level15Max": 0}

    def _occ_record(self, config: dict) -> dict:
        lines = self.lines(config["start"], config["end"])
        lines = self.slice_between(lines, config["startPattern"], config.get("endPattern"))
        stats_pattern = config.get("statsPattern", r"(?:O\.C\.C\.|R\.C\.C\.).{0,20}Stats|Stats.{0,20}(?:O\.C\.C\.|R\.C\.C\.)")
        stats_index = next((i for i, line in enumerate(lines) if re.search(stats_pattern, line.text, re.I)), None)
        if stats_index is None:
            stats_index = next((i for i, line in enumerate(lines) if re.match(r"^(?:Alignment|Attribute Requirements?)\s*:", line.text, re.I)), None)
        if stats_index is None:
            stats_index = next((i for i, line in enumerate(lines) if re.search(r"\bStats\b", line.text, re.I)), len(lines) // 2)
        narrative = lines[1:stats_index]
        stats = lines[stats_index + 1:]
        sections = self._sectionize(stats)
        skill_rows = self._skill_rows(sections.get("skills", ""))
        choices = self._choice_rows("O.C.C. Related Skills", sections.get("related", ""), "occRelated")
        choices += self._choice_rows("Secondary Skills", sections.get("secondary", ""), "secondary")
        equipment = "\n".join(filter(None, [
            sections.get("equipment", ""),
            f"Weapons: {sections.get('weapons', '')}" if sections.get("weapons") else "",
            f"Armor: {sections.get('armor', '')}" if sections.get("armor") else "",
            f"Vehicles: {sections.get('vehicles', '')}" if sections.get("vehicles") else "",
            f"Cybernetics & Bionics: {sections.get('cybernetics', '')}" if sections.get("cybernetics") else "",
        ]))
        return {
            "name": config["name"], "type": "occ", "img": "icons/svg/upgrade.svg",
            "source": {"printedPage": config["start"]},
            "system": {
                "description": prose(narrative), "category": config["category"],
                "isRCC": bool(config.get("isRCC")), "skills": skill_rows,
                "skillChoices": choices, "xpTrack": self._xp_track(config["xp"]),
                "bonuses": sections.get("bonuses", ""), "equipment": equipment,
                "money": sections.get("money", ""), "attributeBonuses": default_attribute_bonuses(),
                "poolBonuses": {"hp": "", "sdc": "", "mdc": "", "isp": "", "ppe": ""},
                "skillBonuses": [
                    {"key": row["key"], "name": row["name"], "bonus": row["bonus"]}
                    for row in skill_rows if row.get("bonus")
                ],
                "weaponProficiencies": {"selected": {}, "custom": [], "choices": []},
                "combatBonuses": {key: 0 for key in ("attacks", "initiative", "perception", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll")},
                "saveBonuses": {key: 0 for key in ("spell", "ritual", "psionics", "drugPoison", "harmfulDrugs", "insanity", "possession", "horrorFactor", "death", "pain")},
                "grantsMagic": bool(config.get("magic")), "grantsPsionics": bool(config.get("psionics")),
                "abilities": [],
            },
            "rawSections": sections,
        }

    def extract_occs(self) -> tuple[list[dict], list[dict]]:
        configs = [
            {"name": "Combat Cyborg", "category": "Men at Arms", "start": 45, "end": 52, "startPattern": r"Combat Cyborg O\.C\.C\.", "endPattern": r"Craz(?:y|ies) O\.C\.C\.", "xp": "combatCyborgHeadhunterRobotPilot"},
            {"name": "Crazy", "category": "Men at Arms", "start": 53, "end": 60, "startPattern": r"Craz(?:y|ies) O\.C\.C\.", "endPattern": r"Cyber-Knight O\.C\.C\.", "xp": "cyberKnightCrazyJuicer"},
            {"name": "Cyber-Knight", "category": "Men at Arms", "start": 61, "end": 66, "startPattern": r"Cyber-Knight O\.C\.C\.", "endPattern": r"Glitter Boy O\.C\.C\.", "xp": "cyberKnightCrazyJuicer", "psionics": True},
            {"name": "Glitter Boy", "category": "Men at Arms", "start": 67, "end": 73, "startPattern": r"Glitter Boy O\.C\.C\.", "endPattern": r"Headhunter O\.C\.C\.", "xp": "glitterBoyPilot"},
            {"name": "Headhunter", "category": "Men at Arms", "start": 74, "end": 77, "startPattern": r"Headhunter O\.C\.C\.", "endPattern": r"Juicer O\.C\.C\.", "xp": "combatCyborgHeadhunterRobotPilot"},
            {"name": "Juicer", "category": "Men at Arms", "start": 78, "end": 81, "startPattern": r"Juicer O\.C\.C\.", "endPattern": r"Mere Soldier O\.C\.C\.", "xp": "cyberKnightCrazyJuicer"},
            {"name": "Merc Soldier", "category": "Men at Arms", "start": 81, "end": 83, "startPattern": r"Mere Soldier O\.C\.C\.", "endPattern": r"Robot Pilot O\.C\.C\.", "xp": "mercSoldier"},
            {"name": "Robot Pilot", "category": "Men at Arms", "start": 83, "end": 85, "startPattern": r"Robot Pilot O\.C\.C\.", "endPattern": r"Body Fixer O\.C\.C\.", "xp": "combatCyborgHeadhunterRobotPilot"},
            {"name": "Body Fixer", "category": "Adventurers & Scholars", "start": 86, "end": 87, "startPattern": r"Body Fixer O\.C\.C\.", "endPattern": r"City Rat O\.C\.C\.", "xp": "csSamasPilotBodyFixer"},
            {"name": "City Rat", "category": "Adventurers & Scholars", "start": 88, "end": 88, "startPattern": r"City Rat O\.C\.C\.", "xp": "cityRatVagabond"},
            {"name": "Cyber-Doc", "category": "Adventurers & Scholars", "start": 89, "end": 90, "startPattern": r"Cyber-Doc O\.C\.C\.", "endPattern": r"Operator O\.C\.C\.", "xp": "cyberDocRogueScholarScientist"},
            {"name": "Operator", "category": "Adventurers & Scholars", "start": 91, "end": 92, "startPattern": r"Operator O\.C\.C\.", "endPattern": r"Rogue Scholar O\.C\.C\.", "xp": "operatorWildernessScout"},
            {"name": "Rogue Scholar", "category": "Adventurers & Scholars", "start": 93, "end": 94, "startPattern": r"Rogue Scholar O\.C\.C\.", "endPattern": r"Rogue Scientist O\.C\.C\.", "xp": "cyberDocRogueScholarScientist"},
            {"name": "Rogue Scientist", "category": "Adventurers & Scholars", "start": 95, "end": 96, "startPattern": r"Rogue Scientist O\.C\.C\.", "endPattern": r"Vagabond O\.C\.C\.", "xp": "cyberDocRogueScholarScientist"},
            {"name": "Vagabond", "category": "Adventurers & Scholars", "start": 97, "end": 97, "startPattern": r"Vagabond O\.C\.C\.", "xp": "cityRatVagabond"},
            {"name": "Wilderness Scout", "category": "Adventurers & Scholars", "start": 98, "end": 99, "startPattern": r"Wilderness Scout O\.C\.C\.", "xp": "operatorWildernessScout"},
            {"name": "Elemental Fusionist", "category": "Practitioners of Magic", "start": 100, "end": 104, "startPattern": r"Elemental Fusionist O\.C\.C\.", "xp": "elementalFusionist", "magic": True},
            {"name": "Ley Line Walker", "category": "Practitioners of Magic", "start": 113, "end": 116, "startPattern": r"Ley Line Walker O\.C\.C\.", "endPattern": r"Ley Line Rifter O\.C\.C\.", "xp": "mindMelterLeyLine", "magic": True},
            {"name": "Ley Line Rifter", "category": "Practitioners of Magic", "start": 116, "end": 117, "startPattern": r"Ley Line Rifter O\.C\.C\.", "endPattern": r"Mystic O\.C\.C\.", "xp": "mindMelterLeyLine", "magic": True},
            {"name": "Mystic", "category": "Practitioners of Magic", "start": 118, "end": 119, "startPattern": r"Mystic O\.C\.C\.", "endPattern": r"Shifter O\.C\.C\.", "xp": "bursterPsiStalkerMystic", "magic": True, "psionics": True},
            {"name": "Shifter", "category": "Practitioners of Magic", "start": 120, "end": 125, "startPattern": r"Shifter O\.C\.C\.", "endPattern": r"Techno-Wizard O\.C\.C\.", "xp": "csTechnicalMilitaryShifter", "magic": True},
            {"name": "Techno-Wizard", "category": "Practitioners of Magic", "start": 126, "end": 137, "startPattern": r"Techno-Wizard O\.C\.C\.", "endPattern": r"Psychic Characters", "xp": "technoWizard", "magic": True, "psionics": True},
            {"name": "Burster", "category": "Psychic Characters", "start": 139, "end": 142, "startPattern": r"Burster O\.C\.C\.", "endPattern": r"Dog Boy O\.C\.C\.", "xp": "bursterPsiStalkerMystic", "psionics": True},
            {"name": "Dog Boy", "category": "Psychic Characters", "start": 142, "end": 149, "startPattern": r"Dog Boy O\.C\.C\.", "endPattern": r"Mind Melter O\.C\.C\.", "xp": "csGruntDogBoys", "psionics": True},
            {"name": "Mind Melter", "category": "Psychic Characters", "start": 150, "end": 151, "startPattern": r"Mind Melter O\.C\.C\.", "endPattern": r"Psi-Stalker O\.C\.C\.", "xp": "mindMelterLeyLine", "psionics": True},
            {"name": "Psi-Stalker (Civilized/Coalition)", "category": "Psychic Characters", "start": 152, "end": 154, "startPattern": r"Psi-Stalker O\.C\.C\.", "endPattern": r"Wild Psi-Stalker O\.C\.C\.", "xp": "bursterPsiStalkerMystic", "psionics": True},
            {"name": "Wild Psi-Stalker", "category": "Psychic Characters", "start": 155, "end": 155, "startPattern": r"Wild Psi-Stalker O\.C\.C\.", "xp": "bursterPsiStalkerMystic", "psionics": True},
            {"name": "Coalition Grunt", "category": "Coalition Military", "start": 231, "end": 233, "startPattern": r"Coalition Grunt O\.C\.C\.", "endPattern": r"SAMAS Pilot O\.C\.C\.", "xp": "csGruntDogBoys"},
            {"name": "Coalition SAMAS Pilot", "category": "Coalition Military", "start": 233, "end": 235, "startPattern": r"SAMAS Pilot O\.C\.C\.", "endPattern": r"(?:CS|Coalition) Military Specialist", "xp": "csSamasPilotBodyFixer"},
            {"name": "Coalition Military Specialist", "category": "Coalition Military", "start": 235, "end": 236, "startPattern": r"CS Military", "endPattern": r"CS Technical", "xp": "csTechnicalMilitaryShifter"},
            {"name": "Coalition Technical Officer", "category": "Coalition Military", "start": 236, "end": 237, "startPattern": r"CS Technical", "statsPattern": r"Coalition Technical Officer O\.C\.C\.", "xp": "csTechnicalMilitaryShifter"},
            {"name": "Dragon Hatchling", "category": "Racial Character Class", "start": 156, "end": 163, "startPattern": r"Dragon Hatchling", "xp": "dragon", "isRCC": True, "magic": True, "psionics": True},
        ]
        records = [self._occ_record(config) for config in configs]
        walker = next(record for record in records if record["name"] == "Ley Line Walker")
        rifter = next(record for record in records if record["name"] == "Ley Line Rifter")
        for key in ("skills", "skillChoices", "equipment", "money", "weaponProficiencies"):
            if not rifter["system"].get(key):
                rifter["system"][key] = copy.deepcopy(walker["system"].get(key))

        # The Dragon Hatchling presents its shared R.C.C. rules before six
        # species blocks rather than in the normal O.C.C. stat layout.
        dragon = next(record for record in records if record["name"] == "Dragon Hatchling")
        dragon_lines = self.slice_between(
            self.lines(156, 159), r"Dragon Hatchling", r"Species of Dragons\."
        )
        dragon["system"]["description"] = prose(dragon_lines)
        by_key = {row["key"]: row for row in self.skill_catalog}
        dragon["system"]["skills"] = [
            {**by_key["languageNative"], "name": "Language: Dragonese/Elven", "base": 98,
             "perLvl": 0, "bonus": 0, "category": "occ", "custom": True},
            {**by_key["literacyNative"], "name": "Literacy: Dragonese/Elven", "base": 98,
             "perLvl": 0, "bonus": 0, "category": "occ", "custom": True},
            {**by_key["mathematicsBasic"], "bonus": 0, "category": "occ", "custom": False},
        ]
        secondary_levels = (1, 2, 4, 8, 10, 15, 20)
        special_levels = (1, 3, 6, 9, 12, 15, 20)
        lore_keys = [row["key"] for row in self.skill_catalog if row["name"].startswith("Lore:")]
        special_keys = ["languageOther", "literacyOther", *lore_keys, "research"]
        dragon["system"]["skillChoices"] = [
            *[
                {"label": f"Secondary Skills (Level {level})", "count": 2, "level": level,
                 "category": "secondary", "bonus": 0, "allowedKeys": [], "allowedGroups": []}
                for level in secondary_levels
            ],
            *[
                {"label": f"Special Interest (Level {level})", "count": 1, "level": level,
                 "category": "occRelated", "bonus": 15, "allowedKeys": special_keys,
                 "allowedGroups": []}
                for level in special_levels
            ],
        ]
        dragon["system"]["skillBonuses"] = []
        dragon["system"]["equipment"] = (
            "A Hatchling can use any type of weapon and generally relies on its own natural, "
            "magical, and psionic powers. Body armor is usually worn only as part of a disguise."
        )
        dragon["system"]["money"] = (
            "Very young Dragon Hatchlings are usually more interested in experience and magic "
            "items than accumulated wealth."
        )
        return ([record for record in records if not record["system"]["isRCC"]], [record for record in records if record["system"]["isRCC"]])

    def extract_races(self) -> list[dict]:
        races: list[dict] = []
        base = {
            "lifespan": "", "size": "", "bonuses": "", "languages": "", "isMDC": False,
            "attributeBonuses": default_attribute_bonuses(),
            "poolBonuses": {"hp": "", "sdc": "", "mdc": "", "isp": "", "ppe": ""},
            "skillBonuses": [], "skillChoices": [],
            "weaponProficiencies": {"selected": {}, "custom": [], "choices": []},
            "combatBonuses": {key: 0 for key in ("attacks", "initiative", "perception", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll")},
            "saveBonuses": {key: 0 for key in ("spell", "ritual", "psionics", "drugPoison", "harmfulDrugs", "insanity", "possession", "horrorFactor", "death", "pain")},
            "grantsMagic": False, "grantsPsionics": False, "abilities": [],
        }
        races.append({"name": "Human", "type": "race", "img": "icons/svg/dna.svg", "source": {"printedPage": 42}, "system": {**base, "description": "Baseline human; use the selected O.C.C. for occupational abilities, skills, equipment, and advancement."}})

        dog_lines = self.slice_between(self.lines(142, 149), r"Dog Boy O\.C\.C\.", r"Dog Boy O\.C\.C\. Stats")
        races.append({"name": "Mutant Canine (Dog Boy)", "type": "race", "img": "icons/svg/dna.svg", "source": {"printedPage": 142}, "system": {**base, "description": prose(dog_lines), "grantsPsionics": True}})
        psi_lines = self.slice_between(self.lines(152, 155), r"Psi-Stalker O\.C\.C\.", r"Civilized/Coalition Psi-Stalker O\.C\.C\. Stats")
        races.append({"name": "Psi-Stalker", "type": "race", "img": "icons/svg/dna.svg", "source": {"printedPage": 152}, "system": {**base, "description": prose(psi_lines), "grantsPsionics": True}})

        species_lines = self.lines(159, 163)
        headings = [(index, line) for index, line in enumerate(species_lines) if 15.0 <= line.size <= 16.5 and "Dragon Hatchling" in line.text]
        for position, (index, heading) in enumerate(headings):
            end = headings[position + 1][0] if position + 1 < len(headings) else len(species_lines)
            description = prose(species_lines[index + 1:end])
            name = re.sub(r"\s+Hatchling$", "", heading.text).strip()
            races.append({
                "name": name, "type": "race", "img": "icons/svg/dna.svg",
                "source": {"printedPage": heading.printed_page},
                "system": {**base, "description": description, "grantsMagic": True, "grantsPsionics": True},
            })
        return races

    def _equipment_stream(self, first: int, last: int) -> list[Line]:
        return self.lines(first, last)

    @staticmethod
    def _anchored_blocks(lines: list[Line], anchors: list[dict], end_pattern: str | None = None) -> list[tuple[dict, list[Line]]]:
        starts: list[tuple[int, dict]] = []
        cursor = 0
        for anchor in anchors:
            rx = re.compile(anchor["pattern"], re.I)
            index = next((i for i in range(cursor, len(lines)) if rx.search(lines[i].text)), None)
            if index is None:
                raise RuntimeError(f"Could not find equipment heading /{anchor['pattern']}/")
            starts.append((index, anchor))
            cursor = index + 1
        blocks = []
        for position, (index, anchor) in enumerate(starts):
            end = starts[position + 1][0] if position + 1 < len(starts) else len(lines)
            if position + 1 == len(starts) and end_pattern:
                rx = re.compile(end_pattern, re.I)
                end = next((i for i in range(index + 1, len(lines)) if rx.search(lines[i].text)), end)
            blocks.append((anchor, lines[index:end]))
        return blocks

    @staticmethod
    def _field_from_text(text: str, *labels: str) -> str:
        labels_rx = "|".join(re.escape(label) for label in labels)
        match = re.search(rf"(?:{labels_rx})\s*:\s*(.+?)(?=(?:Range|Effective Range|Maximum Effective Range|Rate of Fire|Payload|Cost|Black Market Cost|Weight|Mega-Damage|Damage|Bonus to Strike|M\.D\.C\. by Location)\s*:|$)", text, re.I)
        return clean_text(match.group(1)) if match else ""

    def _weapon_record(self, anchor: dict, lines: list[Line]) -> dict:
        text = prose(lines)
        damage = self._field_from_text(text, "Mega-Damage", "Damage")
        damage_overrides = {
            "CS Hand Grenade": "Fragmentation 2D6 M.D.; Light High Explosive 3D6 M.D.; Heavy High Explosive 4D6 M.D.; Plasma 6D6 M.D.",
            "CS Rifle Grenade": "2D6 M.D.",
            "CS Smoke Grenade": "No direct damage; smoke obscures vision and impairs unprotected targets.",
            "CS Tear Gas Grenade": "No direct damage; tear gas incapacitates and penalizes unprotected targets.",
            "CS Vibro-Blade Vambraces": "M.D. varies by the Vibro-Blade fitted to the vambrace.",
            "Dog Pack Spikes": "1D4 S.D.C.; weighted gloves add 1D6+1 S.D.C. to punches; knee pads add 1D6 S.D.C. to knee kicks.",
            "Wilk's Laser Scalpel": "Up to 1D6 S.D.C.",
        }
        if not damage:
            damage = damage_overrides.get(anchor["name"], "")
        range_text = self._field_from_text(text, "Maximum Effective Range", "Effective Range", "Range")
        range_overrides = {
            "CS Hand Grenade": "Thrown about 40 yards / 120 feet / 36 m.",
            "CS Smoke Grenade": "Thrown; creates a 20-40 foot / 6-12 m radius cloud.",
            "CS Tear Gas Grenade": "Thrown; creates a 25 foot / 7.6 m cloud.",
            "Wilk's Laser Scalpel": "6 inches / 15.2 cm.",
        }
        if not range_text:
            range_text = range_overrides.get(anchor["name"], "")
        rate = self._field_from_text(text, "Rate of Fire")
        payload = self._field_from_text(text, "Payload")
        strike = self._field_from_text(text, "Bonus to Strike", "Bonus to Aimed Strike")
        is_mdc = bool(re.search(r"\bM\.?D\.?", damage or text, re.I))
        lowered = f"{anchor['name']} {text}".lower()
        damage_type = next((key for key in ("laser", "plasma", "ion", "explosive") if key in lowered), "kinetic" if anchor.get("category") == "ancient" else "energy")
        return {
            "name": anchor["name"], "type": "weapon", "img": "icons/svg/sword.svg",
            "source": {"printedPage": lines[0].printed_page},
            "system": {
                "category": anchor.get("category", "modern"), "wpKey": anchor.get("wpKey", ""),
                "damage": damage, "damageScale": "M" if is_mdc else "S", "damageType": damage_type,
                "range": range_text, "ammo": "", "payload": payload, "rate": rate,
                "strike": strike, "parry": "", "special": "", "notes": text,
                "isMDC": is_mdc, "quickRoll": False,
            },
        }

    def extract_weapons(self) -> list[dict]:
        cs_anchors = [
            {"name": "C-18 Laser Pistol", "pattern": r"C-[t1]?[s8] Laser Pistol"},
            {"name": "C-10 Light Assault Laser Rifle", "pattern": r"C[o0][l1][o0] Light Assault Laser Rifle"},
            {"name": "C-12 Heavy Assault Laser Rifle", "pattern": r"C-12 Heavy Assault Laser Rifle"},
            {"name": "C-14 Fire Breather Assault Laser and Grenade Launcher", "pattern": r"C-14 .*Fire Breather.*Assault Laser"},
            {"name": "C-27 Heavy Plasma Cannon", "pattern": r"C-27 Heavy Plasma Cannon"},
            {"name": "CV-212 Variable Light Frequency Laser Rifle", "pattern": r"CV-212 Variable Light Frequency Laser Rifle"},
            {"name": "CR-1 Rocket Launcher", "pattern": r"CR-[l1] Rocket Launcher"},
        ]
        vibro_anchors = [
            {"name": "Vibro-Knife", "pattern": r"^Vibro-Knife\.", "category": "ancient", "wpKey": "wpKnife"},
            {"name": "Vibro-Bayonet", "pattern": r"^Vibro-Bayonet\.", "category": "ancient", "wpKey": "wpKnife"},
            {"name": "Vibro-Saber", "pattern": r"^Vibro-Saber", "category": "ancient", "wpKey": "wpSword"},
            {"name": "Vibro-Sword", "pattern": r"^Vibro-Sword", "category": "ancient", "wpKey": "wpSword"},
            {"name": "Giant-Sized Vibro-Sword", "pattern": r"^Giant-Sized Vibro-Sword", "category": "ancient", "wpKey": "wpSword"},
            {"name": "Vibro-Forearm Claws", "pattern": r"^Vibro-Forearm Claws", "category": "ancient"},
            {"name": "CS Vibro-Blade Vambraces", "pattern": r"^CS Vibro-Blade Vambraces", "category": "ancient"},
            {"name": "Short Blade Hand-Guard", "pattern": r"^Short Blade Hand-Guard", "category": "ancient"},
            {"name": "Triple Bladed Cat's Claw Hand-Guard", "pattern": r"^Triple Bladed .*Cat's Claw.*Hand-Guard", "category": "ancient"},
            {"name": "Dual Long-Blade Hand-Guard", "pattern": r"^Dual Long-Blade Hand-Guard", "category": "ancient"},
            {"name": "Hooked Forearm Vibro-Blades", "pattern": r"^Hooked Forearm Vibro-Blades", "category": "ancient"},
            {"name": "Saber Forearm Vibro-Blades", "pattern": r"^Saber Forearm Vibro-Blades", "category": "ancient"},
            {"name": "Dog Pack Spikes", "pattern": r"^Dog Pack Spikes", "category": "ancient"},
            {"name": "Neural Mace", "pattern": r"^Neural Mace$", "category": "ancient", "wpKey": "wpBlunt"},
        ]
        explosive_anchors = [
            {"name": "CS Fusion Block", "pattern": r"^CS Fusion Blocks?\."},
            {"name": "CS Hand Grenade", "pattern": r"^CS Hand Grenades?\."},
            {"name": "CS Rifle Grenade", "pattern": r"^CS Rifle Grenades?"},
            {"name": "CS Smoke Grenade", "pattern": r"^CS Smoke Grenades?\."},
            {"name": "CS Tear Gas Grenade", "pattern": r"^CS Tear Gas Grenades?\."},
        ]
        common_anchors = [
            {"name": "Wilk's 320 Laser Pistol", "pattern": r"^Wilk's 320 Laser Pistol"},
            {"name": "Wilk's 447 Laser Rifle", "pattern": r"^Wilk's 447 Laser Rifle"},
            {"name": "Wilk's Portable Laser Torch", "pattern": r"^Wilk's Portable Laser Torch"},
            {"name": "Wilk's Laser Wand", "pattern": r"^Wilk's Laser Wand"},
            {"name": "Wilk's Laser Scalpel", "pattern": r"^Wilk's Laser Scalpel"},
            {"name": "NG-S7 Heavy-Duty Ion Blaster", "pattern": r"^NG-S7 Northern Gun Heavy-Duty Ion Blaster"},
            {"name": "NG Super Laser Pistol and Grenade Launcher", "pattern": r"^NG-Super Laser Pistol and Grenade Launcher"},
            {"name": "NG-33 Laser Pistol", "pattern": r"^NG-33 Northern Gun Laser Pistol"},
            {"name": "NG-L5 Laser Rifle", "pattern": r"^NG-L5 Northern Gun Laser Rifle"},
            {"name": "NG-P7 Particle Beam Rifle", "pattern": r"^NG-P7 Northern Gun Particle Beam Rifle"},
            {"name": "L-20 Pulse Rifle", "pattern": r"^L-20 Pulse Rifle"},
            {"name": "JA-11 Juicer Assassin's Energy Rifle", "pattern": r"^JA-[l1]{2} Juicer Assassin's Energy Rifle"},
            {"name": "JA-9 Juicer Assassin Variable Laser Rifle", "pattern": r"^JA-9 Juicer Assassin Variable Laser Rifle"},
            {"name": "NG-101 Rail Gun", "pattern": r"^NG-[l1][o0][l1] Rail Gun"},
            {"name": "NG-202 Rail Gun", "pattern": r"^NG-202 Rail Gun"},
        ]
        records = []
        for lines, anchors, end in [
            (self._equipment_stream(257, 258), cs_anchors, r"CS Ammunition"),
            (self._equipment_stream(259, 259), vibro_anchors, None),
            (self._equipment_stream(260, 260), explosive_anchors, r"Handheld Flare"),
            (self._equipment_stream(268, 271), common_anchors, r"Power Armor"),
        ]:
            records.extend(self._weapon_record(anchor, block) for anchor, block in self._anchored_blocks(lines, anchors, end))
        return records

    @staticmethod
    def _locations_from_text(text: str) -> dict:
        locations = default_locations()
        patterns = {
            "mainBody": [
                r"\bMain\s+Body\b\s*[-–—:]\s*(\d+)",
                r"M\.D\.C\.?\s*(\d+)\s*(?:to\s+the\s+)?main\s+body",
            ],
            "head": [
                r"\b(?:Helmet|Head)[A-Za-z/]*(?:\s*\([^)]*\))?\s*[-–—:]\s*(\d+)",
                r"(\d+)\s+to\s+(?:the\s+)?head",
            ],
            "leftArm": [
                r"\b(?:Arms?|Anns)\b(?:\s*\([^)]*\))?\s*[-–—:]\s*(\d+)",
                r"(\d+)\s+to\s+(?:the\s+)?arms?",
            ],
            "leftLeg": [
                r"\bLegs?\b(?:\s*\([^)]*\))?\s*[-–—:]\s*(\d+)",
                r"(\d+)\s+to\s+(?:the\s+)?legs?",
            ],
        }
        values = {}
        for key, alternatives in patterns.items():
            for pattern in alternatives:
                match = re.search(pattern, text, re.I)
                if match:
                    values[key] = int(match.group(1))
                    break
        if "leftArm" in values:
            values["rightArm"] = values["leftArm"]
        if "leftLeg" in values:
            values["rightLeg"] = values["leftLeg"]
        for key, value in values.items():
            locations[key] = {"current": value, "max": value}
        return locations

    def _armor_record(self, anchor: dict, lines: list[Line]) -> dict:
        text = prose(lines)
        is_power = anchor.get("powerArmor", False)
        locations = self._locations_from_text(text)
        is_mdc = bool(re.search(r"\bM\.D\.(?:C\.)?|Mega-Damage", text, re.I))
        weight = self._field_from_text(text, "Weight")
        cost = self._field_from_text(text, "Black Market Cost", "Cost")
        penalty_match = re.search(r"(-?\d+)\s*%\s*(?:movement|mobility|prowl)", text, re.I)
        common = {
            "description": text, "ar": 0, "isMDC": is_mdc, "locations": locations,
            "weight": weight, "cost": cost, "notes": text,
            "soak": 0, "resistance": 0, "damageScale": "M" if is_mdc else "S",
        }
        if is_power:
            system = {**common, "speed": self._field_from_text(text, "Speed", "Running")}
            item_type = "powerArmor"
            img = "icons/svg/upgrade.svg"
        else:
            system = {**common, "prowlPenalty": int(penalty_match.group(1)) if penalty_match else 0}
            system.pop("description", None)
            item_type = "armor"
            img = "icons/svg/shield.svg"
        return {
            "name": anchor["name"], "type": item_type, "img": img,
            "source": {"printedPage": lines[0].printed_page}, "system": system,
        }

    def extract_armor(self) -> list[dict]:
        conventional = [
            {"name": "CA-1 Heavy Dead Boy Body Armor", "pattern": r"^CA-[l1] Heavy Body Armor"},
            {"name": "CA-2 Light Dead Boy Body Armor", "pattern": r"^CA-2 Light Body Armor"},
            {"name": "Dog Pack DPM 101 Light Riot Armor", "pattern": r"^Dog Pack DPM 101 Light Riot Armor"},
        ]
        body = [
            {"name": "Gladiator Full Environmental Body Armor", "pattern": r"^Gladiator\s*-?\s*Full Environmental Body Armor"},
            {"name": "Crusader Full Environmental Body Armor", "pattern": r"^Crusader\s*-?\s*Full Environmental Body Armor"},
            {"name": "Juicer Assassin Plate Armor", "pattern": r"^Juicer\s*-?\s*Assassin Plate Armor"},
            {"name": "Urban Warrior Padded Environmental Body Armor", "pattern": r"^Urban Warrior"},
            {"name": "Plastic-Man Full Environmental Body Armor", "pattern": r"^Plastic-Man"},
            {"name": "Huntsman Plate & Padded Armor", "pattern": r"^Huntsman"},
            {"name": "Bushman Full Composite Environmental Body Armor", "pattern": r"^Bushman"},
        ]
        power = [
            {"name": "Glitter Boy Power Armor", "pattern": r"^Glitter Boy Power Armor", "powerArmor": True},
            {"name": "Coalition SAMAS Power Armor", "pattern": r"^Coalition SAMAS Power Armor", "powerArmor": True},
            {"name": "Northern Gun Samson Power Armor", "pattern": r"^Northern Gun Samson Power Armor", "powerArmor": True},
            {"name": "Flying Titan Power Armor", "pattern": r"^Flying Titan Power Armor", "powerArmor": True},
        ]
        records = []
        records.extend(self._armor_record(anchor, block) for anchor, block in self._anchored_blocks(self._equipment_stream(260, 261), conventional, r"Common Gear"))
        records.extend(self._armor_record(anchor, block) for anchor, block in self._anchored_blocks(self._equipment_stream(267, 268), body, r"Weapons"))
        for start, end, anchor, end_pattern in [
            (71, 73, power[0], r"Headhunter O\.C\.C\."),
            (240, 248, power[1], r"UAR-1 Enforcer"),
            (271, 272, power[2], r"Flying Titan Power Armor"),
            (272, 273, power[3], r"Robot Vehicles"),
        ]:
            block = self.slice_between(self.lines(start, end), anchor["pattern"], end_pattern)
            records.append(self._armor_record(anchor, block))
        return records


def write_catalog(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ordered = sorted(records, key=lambda record: record["name"].casefold())
    path.write_text(json.dumps(ordered, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", required=True, type=Path, help="Path to the Rifts Ultimate Edition PDF")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output catalog directory")
    args = parser.parse_args()
    if not args.pdf.is_file():
        parser.error(f"PDF not found: {args.pdf}")

    extractor = RueExtractor(args.pdf)
    try:
        occs, rccs = extractor.extract_occs()
        catalogs = {
            "occs": occs,
            "rccs": rccs,
            "races": extractor.extract_races(),
            "weapons": extractor.extract_weapons(),
            "armor": extractor.extract_armor(),
            "spells": extractor.extract_spells(),
            "psionics": extractor.extract_psionics(),
        }
    finally:
        extractor.close()

    for name, records in catalogs.items():
        write_catalog(args.output / f"{name}.json", records)
        print(f"{name}: {len(records)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
