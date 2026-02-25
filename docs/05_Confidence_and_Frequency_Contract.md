# Confidence & Frequency Contract (v1)

## Purpose

Standardize scoring of inferred cognates.

## Required Scores

1.  Orthographic Similarity Score (0-1)
2.  Morphological Validity Score (0-1)
3.  Corpus Frequency Score (0-1)
4.  False Friend Flag (boolean)

## Final Confidence Formula

Weighted composite score (weights must be declared in config).

## Output Requirement

Every inferred word must return: - Rule ID used - Confidence score -
Exception flag (if any)
