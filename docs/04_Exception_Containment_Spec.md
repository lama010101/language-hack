# Exception Containment Specification (v1)

## Purpose

Prevent exception drift.

## Rules

-   Exceptions must be tied to a specific Rule ID.
-   Exceptions cannot exist globally.
-   Exception ratio \> 25% triggers rule review.
-   Exceptions must declare reason category:
    -   Historical divergence
    -   False cognate
    -   Orthographic anomaly
    -   Semantic drift

## Prohibited

-   Manual overrides outside registry
-   Silent exception insertion
