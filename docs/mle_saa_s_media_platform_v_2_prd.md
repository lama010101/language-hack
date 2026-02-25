# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Morphological Leverage Engine (MLE)
## SaaS + Media Platform v2.0

Database: Neon (PostgreSQL)
Frontend: React (Web) + React Native (Mobile)
Core Engine: TypeScript (Deterministic Rule Engine)
Media Layer: HTML/CSS Slide Renderer + Headless Video Capture
Version: v2.0

---

# 1. Executive Introduction

The Morphological Leverage Engine (MLE) is a cross-linguistic morphological inference system designed to:

1. Operate as a SaaS product for language learners and educators.
2. Serve as a deterministic content engine that automatically generates animated HTML slide decks convertible into YouTube-ready videos.

The system models systematic morphological transformations across languages (initially: English, French, Spanish, Italian, Portuguese, German, Dutch).

It is not a dictionary.
It is a generative linguistic inference engine.

The platform separates:

- Core Morphological Engine (logic)
- SaaS Application Layer (user interface)
- Media Generation Layer (automated slides + video)

This separation is mandatory for scalability.

---

# 2. Product Vision

Enable users to:

- Predict cognates across languages using morphological operators.
- Expand entire lexical families (noun ↔ verb ↔ adjective).
- Measure statistical reliability of transformations.
- Automatically generate structured educational slide decks.
- Export animated HTML presentations renderable into video.

The system transforms users from memorizing vocabulary to understanding morphological systems.

---

# 3. System Architecture Overview

The platform consists of five layers:

1. Core Morphological Engine (CME)
2. API Layer
3. SaaS UI Layer
4. Presentation Engine (PME)
5. Media Rendering Pipeline

Data flow:

User Input → CME → Structured JSON →
(a) SaaS UI Rendering
(b) Slide Generator → HTML Templates → Headless Capture → MP4

The core engine must never output formatted UI text. Only structured JSON.

---

# 4. Core Morphological Engine (CME)

The CME is deterministic and rule-based.

Responsibilities:

- Detect morphological operators
- Extract and normalize stems
- Apply language-specific rules
- Handle stem variants (allomorphs)
- Apply accent/orthographic corrections
- Check override tables
- Assign confidence scores

Performance target: <200ms per prediction.

Determinism requirement:
Same input must always produce identical output.

---

# 5. Database Schema (Neon PostgreSQL)

## 5.1 languages
- id (PK)
- name
- iso_code
- family
- script
- latin_lexical_density_estimate
- total_speakers
- notes

## 5.2 roots
- id (PK)
- classical_origin
- base_root_form
- semantic_gloss
- domain
- productivity_score
- frequency_score

## 5.3 operators
- id (PK)
- source_pos
- target_pos
- semantic_function
- classical_origin_suffix
- productivity_score
- reversibility_score

## 5.4 operator_realizations
- id (PK)
- operator_id (FK)
- language_id (FK)
- suffix_surface_form
- phonetic_hint
- confidence_score

## 5.5 stem_variants
- id (PK)
- root_id (FK)
- language_id (FK)
- base_form
- derived_stem_form
- transformation_type
- confidence_score

## 5.6 operator_rules
- id (PK)
- operator_id (FK)
- language_id (FK)
- stem_pattern_regex
- transformation_action
- suffix_output
- accent_rule
- priority_order
- productivity_score

## 5.7 derivational_families
- id (PK)
- root_id (FK)
- language_id (FK)
- word_form
- pos
- frequency_score
- register

## 5.8 overrides
- id (PK)
- source_word
- predicted_word
- correct_word
- language_id
- reason

## 5.9 semantic_alignment
- id (PK)
- root_id
- language_pair
- drift_level (green/yellow/red)
- description

## 5.10 operator_metrics
- id (PK)
- operator_id
- language_id
- lexical_coverage_score
- communicative_frequency_score

## 5.11 rule_versions
- id (PK)
- version_label
- release_date
- change_log

---

# 6. API Layer

All outputs must be JSON.

Endpoints:

POST /predict
POST /expand-family
GET /operators
GET /roots
POST /generate-slide-deck
POST /generate-script

No HTML rendering in API responses.

---

# 7. SaaS Application Layer

## 7.1 Core Features

- Language selection (pivot mode)
- Operator exploration
- Predictive mode
- Derivational family viewer
- Semantic drift indicator
- Statistics dashboard

## 7.2 Pivot UI Requirement

Base language fixed.
Other languages displayed as transformation deltas.

Avoid full 7-column overload by default.

## 7.3 Multi-Tenancy

Schema must allow:
- user_id
- organization_id
- operator personalization

Even if unused in MVP.

---

# 8. Presentation & Media Engine (PME)

The PME consumes structured JSON and produces:

- Deterministic HTML slide decks
- CSS-based animations
- Themeable layouts

Slides must support:
- Max 7 visual elements per frame
- Progressive reveal
- Delta highlighting
- Clean typography

Presentation Mode must remove SaaS UI elements.

---

# 9. Slide JSON Schema

Example structure:

{
  "title": "The -tion Operator",
  "slides": [
    {
      "type": "operator_intro",
      "operator": "Verb → Abstract Noun"
    },
    {
      "type": "transformation_matrix",
      "base_word": "transformation",
      "predictions": [
        {"language": "Spanish", "form": "transformación", "confidence": 0.97}
      ]
    },
    {
      "type": "family_expansion",
      "root": "transform",
      "entries": []
    }
  ]
}

Slide templates must be versioned.

---

# 10. Media Rendering Pipeline

Pipeline:

CME → Slide JSON → HTML Template → Headless Browser Render → MP4 Export

Requirements:

- Deterministic timing
- Configurable animation duration
- No runtime randomness
- Export resolution presets (1080p minimum)

---

# 11. Analytics Layer

Track:

- Most used operators
- Prediction failure rate
- Most exported decks
- Language pair usage frequency

Analytics must not affect deterministic output.

---

# 12. Performance Requirements

- Prediction <200ms
- Indexed suffix lookup
- Indexed root lookup
- Optimized regex usage
- Slide generation <500ms

---

# 13. MVP Scope

Include:

- 7 languages
- 200–300 curated roots
- 10–15 operators
- Rule-based prediction engine
- Stem variants
- Override table
- Semantic drift tagging
- Slide JSON generation
- HTML animation templates

Exclude (Phase 2):

- Russian & East Asian modules
- Corpus auto-scoring
- Audio generation
- AI rule discovery

---

# 14. Versioning Strategy

Every:
- Operator
- Rule set
- Slide template

Must carry version identifiers.

Historical outputs must remain reproducible.

---

# 15. Success Criteria

- ≥80% accurate predictions for high-productivity operators
- Deterministic slide generation
- Stable Neon schema
- SaaS UI fully responsive
- Automated HTML-to-video export operational

---

# 16. Definition of Done (v2.0 MVP)

The platform is complete when:

- Core engine predicts reliably
- SaaS UI functional on web & mobile
- Slide decks generated from JSON
- Animated HTML renders correctly
- MP4 export reproducible
- Versioning system operational

---

This document is the authoritative technical and product reference for building the Morphological Leverage Engine as a SaaS and automated media platform.

