Database Schema Specification (MVP – Lean Stack)

Target: Neon PostgreSQL
Design principles:

Fully relational

Rule-driven (not static word storage)

Exception-based overrides

Media-ready

SaaS-ready (minimal billing hooks)

1. Core Linguistic Tables
1.1 languages

Stores supported languages.

languages (
  id UUID PK,
  code VARCHAR(5) UNIQUE NOT NULL,   -- en, fr, es, it, pt, etc
  name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

Index:

UNIQUE(code)
1.2 operators

Morphological operators (e.g. -TION family).

operators (
  id UUID PK,
  canonical_name VARCHAR(100) NOT NULL,   -- "TION Operator"
  description TEXT,
  base_language_id UUID FK -> languages(id),
  difficulty_level INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)
1.3 suffixes

Suffix per operator per language.

suffixes (
  id UUID PK,
  operator_id UUID FK -> operators(id),
  language_id UUID FK -> languages(id),
  suffix VARCHAR(50) NOT NULL,
  phonetic_hint VARCHAR(100),   -- optional IPA-like string
  is_productive BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

Constraint:

UNIQUE(operator_id, language_id)
2. Root & Stem System (Critical Layer)
2.1 roots

Abstract semantic base.

roots (
  id UUID PK,
  canonical_form VARCHAR(100) NOT NULL,  -- "act", "construct"
  base_language_id UUID FK -> languages(id),
  meaning TEXT,
  frequency_score FLOAT,  -- optional later
  created_at TIMESTAMP
)
2.2 stems

Language-specific realizations.

stems (
  id UUID PK,
  root_id UUID FK -> roots(id),
  language_id UUID FK -> languages(id),
  stem VARCHAR(100) NOT NULL,
  created_at TIMESTAMP
)

Example:

Root: "destroy"

English stem: destroy

Spanish stem: destru-

Constraint:

UNIQUE(root_id, language_id)
3. Rule Engine Layer (Do NOT skip)
3.1 operator_rules

Defines how suffix attaches.

operator_rules (
  id UUID PK,
  operator_id UUID FK -> operators(id),
  language_id UUID FK -> languages(id),
  transformation_type VARCHAR(50),  
    -- simple_attach
    -- replace_final_char
    -- drop_e_add
    -- etc
  pattern JSONB,         -- pattern definition
  priority INT DEFAULT 1,
  created_at TIMESTAMP
)

Example pattern JSON:

{
  "drop_last_if": "e",
  "add_suffix": "ción"
}

Rules must be evaluated by priority.

3.2 operator_exceptions

Override engine predictions.

operator_exceptions (
  id UUID PK,
  operator_id UUID FK -> operators(id),
  language_id UUID FK -> languages(id),
  base_word VARCHAR(100),
  corrected_word VARCHAR(100),
  reason TEXT,
  created_at TIMESTAMP
)

Used when:

Accent needed

Irregular stem

Historical anomaly

4. Generated Words Cache (Optional but Recommended)

Avoid recomputing identical predictions.

generated_words (
  id UUID PK,
  root_id UUID FK -> roots(id),
  operator_id UUID FK -> operators(id),
  language_id UUID FK -> languages(id),
  predicted_word VARCHAR(150),
  validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

Constraint:

UNIQUE(root_id, operator_id, language_id)
5. Semantic Drift Indicator
5.1 semantic_drift
semantic_drift (
  id UUID PK,
  root_id UUID FK -> roots(id),
  operator_id UUID FK -> operators(id),
  language_id UUID FK -> languages(id),
  drift_level VARCHAR(10), 
    -- green / yellow / red
  explanation TEXT,
  created_at TIMESTAMP
)

Constraint:

UNIQUE(root_id, operator_id, language_id)
6. SaaS Layer (Lean Version)
6.1 users
users (
  id UUID PK,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP
)
6.2 subscriptions
subscriptions (
  id UUID PK,
  user_id UUID FK -> users(id),
  plan VARCHAR(50),
  status VARCHAR(50),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP
)
7. Media Rendering (Minimal MVP)
7.1 media_templates
media_templates (
  id UUID PK,
  name VARCHAR(100),
  theme VARCHAR(50),
  template_json JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)
7.2 render_jobs
render_jobs (
  id UUID PK,
  user_id UUID FK -> users(id),
  operator_id UUID FK -> operators(id),
  template_id UUID FK -> media_templates(id),
  status VARCHAR(50),   -- pending / rendering / done / failed
  output_url TEXT,
  created_at TIMESTAMP
)
8. Required Index Strategy

Add indexes for:

roots(canonical_form)

stems(root_id, language_id)

operator_rules(operator_id, language_id)

operator_exceptions(operator_id, language_id)

generated_words(root_id, operator_id, language_id)

render_jobs(status)

9. What This Enables Immediately

With only this schema, you can build:

Operator browsing

Predictive engine

Cross-language matrix

Drift indicator

SaaS auth

Video job queue stub

Nothing unnecessary. Nothing speculative.