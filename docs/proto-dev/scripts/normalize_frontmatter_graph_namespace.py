#!/usr/bin/env python3
"""Normalize and validate docs frontmatter graph namespaces.

For markdown files under docs/proto-dev/src with `source: src/...`, this script
ensures entries under `imports` and `used_by` use `src/...` instead of legacy
`proto-dev/src/...`.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Tuple


@dataclass
class FrontmatterSection:
    start: int
    end: int
    lines: List[str]


class MarkdownFrontmatterParser:
    def parse(self, text: str) -> FrontmatterSection | None:
        lines = text.splitlines(keepends=True)
        if not lines or lines[0].strip() != "---":
            return None

        for index in range(1, len(lines)):
            if lines[index].strip() == "---":
                return FrontmatterSection(start=0, end=index, lines=lines)
        return None


class NamespaceNormalizer:
    TARGET_PREFIX = "src/"
    LEGACY_PREFIX = "proto-dev/src/"
    TARGET_KEYS = {"imports", "used_by"}

    def normalize(self, frontmatter: FrontmatterSection) -> Tuple[bool, List[str], List[str]]:
        has_source = False
        in_target_list = False
        changed = False
        mismatches: List[str] = []
        updated_lines = list(frontmatter.lines)

        for idx in range(frontmatter.start + 1, frontmatter.end):
            raw_line = updated_lines[idx]
            stripped = raw_line.strip()

            if stripped.startswith("source:"):
                source_value = stripped.split(":", 1)[1].strip()
                has_source = source_value.startswith(self.TARGET_PREFIX)
                in_target_list = False
                continue

            if stripped.endswith(":") and not stripped.startswith("-"):
                key = stripped[:-1].strip()
                in_target_list = key in self.TARGET_KEYS
                continue

            if in_target_list and stripped.startswith("- "):
                item_value = stripped[2:].strip()
                if item_value.startswith(self.LEGACY_PREFIX):
                    replacement = item_value.replace(self.LEGACY_PREFIX, self.TARGET_PREFIX, 1)
                    updated_lines[idx] = raw_line.replace(item_value, replacement, 1)
                    changed = True
                    item_value = replacement
                if item_value.startswith(self.LEGACY_PREFIX):
                    mismatches.append(item_value)
                continue

            if stripped and not stripped.startswith("#") and not stripped.startswith("-"):
                in_target_list = False

        if not has_source:
            return False, frontmatter.lines, []

        return changed, updated_lines, mismatches


class NamespaceConsistencyChecker:
    def __init__(self, root: Path):
        self.root = root
        self.parser = MarkdownFrontmatterParser()
        self.normalizer = NamespaceNormalizer()

    def iter_markdown_files(self) -> Iterable[Path]:
        return sorted(self.root.glob("**/*.md"))

    def process(self, fix: bool) -> Tuple[int, List[str], List[Path]]:
        mismatch_count = 0
        mismatch_reports: List[str] = []
        changed_files: List[Path] = []

        for file_path in self.iter_markdown_files():
            text = file_path.read_text(encoding="utf-8")
            section = self.parser.parse(text)
            if section is None:
                continue

            changed, updated_lines, _ = self.normalizer.normalize(section)
            if changed and fix:
                file_path.write_text("".join(updated_lines), encoding="utf-8")
                changed_files.append(file_path)

            section_after = self.parser.parse(file_path.read_text(encoding="utf-8")) if fix else FrontmatterSection(section.start, section.end, updated_lines)
            if section_after is None:
                continue
            _, _, post_mismatches = self.normalizer.normalize(section_after)
            if post_mismatches:
                mismatch_count += len(post_mismatches)
                for mismatch in post_mismatches:
                    mismatch_reports.append(f"{file_path}: {mismatch}")

        return mismatch_count, mismatch_reports, changed_files


def main() -> int:
    arg_parser = argparse.ArgumentParser(description="Normalize doc graph namespaces in frontmatter.")
    arg_parser.add_argument("--root", type=Path, default=Path("InterDeadProto/docs/proto-dev/src"), help="Root directory containing markdown docs.")
    arg_parser.add_argument("--check", action="store_true", help="Only validate without writing changes.")
    args = arg_parser.parse_args()

    checker = NamespaceConsistencyChecker(args.root)
    mismatches, reports, changed_files = checker.process(fix=not args.check)

    if not args.check:
        print(f"Updated files: {len(changed_files)}")
        for path in changed_files:
            print(f" - {path}")

    if mismatches:
        print(f"Found mismatches: {mismatches}")
        for report in reports:
            print(report)
        return 1

    print("Found mismatches: 0")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
