from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def group_tokens_to_lines(tokens: List[Dict[str, Any]], y_threshold: int = 8) -> List[Dict[str, Any]]:
    if not tokens:
        return []

    # Sort tokens by y-center, then x-position
    sorted_tokens = sorted(tokens, key=lambda t: ((t["bbox"][1] + t["bbox"][3]) / 2, t["bbox"][0]))

    lines = []
    for token in sorted_tokens:
        y_center = (token["bbox"][1] + token["bbox"][3]) / 2
        # Find matching line
        for line in lines:
            if abs(line["y_center"] - y_center) <= y_threshold:
                line["tokens"].append(token)
                break
        else:
            lines.append({"y_center": y_center, "tokens": [token]})

    for line in lines:
        line["tokens"].sort(key=lambda t: t["bbox"][0])

    return lines

def group_lines_to_blocks(lines: List[Dict[str, Any]], y_gap_threshold: int = 18) -> List[List[Dict[str, Any]]]:
    if not lines:
        return []

    sorted_lines = sorted(lines, key=lambda l: l["y_center"])
    blocks = []
    current_block = [sorted_lines[0]]

    for line in sorted_lines[1:]:
        if line["y_center"] - current_block[-1]["y_center"] <= y_gap_threshold:
            current_block.append(line)
        else:
            blocks.append(current_block)
            current_block = [line]

    blocks.append(current_block)
    return blocks

def build_block_data(block_lines: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    blocks = []
    for block_id, lines in enumerate(block_lines):
        all_tokens = [token for line in lines for token in line["tokens"]]
        if not all_tokens:
            continue

        # Collect all bbox coordinates
        xs = [coord for token in all_tokens for coord in token["bbox"][::2]]
        ys = [coord for token in all_tokens for coord in token["bbox"][1::2]]

        text = " ".join(token["text"].strip() for token in all_tokens if token["text"].strip())

        blocks.append({
            "block_id": block_id,
            "text": text,
            "bbox": [min(xs), min(ys), max(xs), max(ys)],
        })

    return blocks

def build_layout(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    logger.debug("Building layout for %d pages", len(pages))
    for page in pages:
        tokens = page.get("tokens", [])
        if not tokens:
            page["blocks"] = []
            continue
        lines = group_tokens_to_lines(tokens)
        block_lines = group_lines_to_blocks(lines)
        page["blocks"] = build_block_data(block_lines)
    return pages