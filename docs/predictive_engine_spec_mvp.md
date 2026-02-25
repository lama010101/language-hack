# Predictive Engine Specification (MVP)

Version: 1.0  
Scope: Lean Stack Implementation  
Target: Deterministic Rule-Based Morphological Transformation Engine

---

# 1. Purpose

This document defines the deterministic transformation pipeline used to generate predicted words across languages using operator-driven morphological rules.

The engine must:
- Be stateless
- Be deterministic
- Be rule-driven (no hardcoded word logic)
- Respect priority ordering
- Allow exception overrides
- Support semantic drift classification

---

# 2. Inputs

Required Inputs:
- root_id
- operator_id
- target_language_id

Optional Inputs:
- override_stem (string)
- strict_mode (boolean)

---

# 3. Output

```
{
  predicted_word: string,
  rule_applied: rule_id,
  exception_applied: boolean,
  drift_level: "green" | "yellow" | "red" | null,
  validation_status: "generated" | "cached" | "exception"
}
```

---

# 4. Engine Pipeline (Strict Order)

The following steps MUST be executed in order.

---

## Step 1 — Check Cache

Query generated_words using:
- root_id
- operator_id
- language_id

If exists:
Return cached result.

---

## Step 2 — Load Base Stem

Query stems table:
- WHERE root_id
- AND language_id

If not found:
- If strict_mode = true → throw error
- Else fallback to canonical root form

---

## Step 3 — Load Operator Suffix

Query suffixes:
- WHERE operator_id
- AND language_id

If not found:
Return error.

---

## Step 4 — Load Rules

Query operator_rules:
- WHERE operator_id
- AND language_id
- ORDER BY priority ASC

Rules are evaluated in priority order.

---

## Step 5 — Apply First Matching Rule

Each rule contains:

```
{
  transformation_type: string,
  pattern: JSON
}
```

Supported transformation types (MVP):

1. simple_attach
2. drop_last_if
3. replace_last_if
4. conditional_replace


### 5.1 simple_attach

Logic:
```
result = stem + suffix
```


### 5.2 drop_last_if

Pattern:
```
{
  "drop_last_if": "e",
  "add_suffix": "ción"
}
```

Logic:
- If stem endsWith(drop_last_if)
  - Remove last char
  - Append add_suffix


### 5.3 replace_last_if

Pattern:
```
{
  "replace_last_if": "y",
  "with": "i",
  "add_suffix": "es"
}
```

Logic:
- If stem endsWith(replace_last_if)
  - Replace last char
  - Append add_suffix


### 5.4 conditional_replace

Pattern:
```
{
  "if_ends_with": "ct",
  "replace_with": "cc",
  "add_suffix": "ión"
}
```

---

The FIRST matching rule must terminate evaluation.

If no rule matches:
Fallback to simple_attach.

---

## Step 6 — Exception Override

Query operator_exceptions:
- WHERE operator_id
- AND language_id
- AND base_word = original_stem

If match:
- Replace predicted_word with corrected_word
- Mark exception_applied = true

---

## Step 7 — Semantic Drift Lookup

Query semantic_drift:
- WHERE root_id
- AND operator_id
- AND language_id

Attach drift_level if exists.

---

## Step 8 — Persist Generated Result

Insert into generated_words:

- root_id
- operator_id
- language_id
- predicted_word
- validated = false

---

# 5. Determinism Rules

- No randomness
- No AI inference
- No language models
- All transformations must be rule-traceable

---

# 6. Performance Targets

- Cold generation < 100ms
- Cached retrieval < 20ms
- Single DB round-trip per stage

---

# 7. Error Handling

Possible errors:
- ROOT_NOT_FOUND
- STEM_NOT_FOUND
- SUFFIX_NOT_FOUND
- RULE_NOT_FOUND

Errors must return structured JSON.

---

# 8. Extensibility (Post-MVP)

Future capabilities:
- Multi-suffix operators
- Phonological normalization layer
- Accent injection module
- Multi-rule chaining
- Confidence scoring

---

# 9. Non-Negotiable Constraints

- Engine must not hardcode specific word transformations.
- All linguistic logic must exist in the database.
- Rules must be editable without code changes.
- Engine must remain stateless.

---

End of Specification

