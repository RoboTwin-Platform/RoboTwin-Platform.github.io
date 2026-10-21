# Awomo-0.5I: 150k EMA evaluation submission draft

This draft submits audited results from 1,000 rollouts across 50 tasks and two conditions. An expanded 10,000-rollout evaluation has been submitted on P6000 and is pending.

| Condition | Successes | Episodes | SR |
|---|---:|---:|---:|
| Clean | 434 | 500 | 86.8% |
| Random | 380 | 500 | 76.0% |
| Combined | 814 | 1000 | 81.4% |

The checkpoint is epoch_78_step_149999, EMA decay 0.999. The evaluation covers all 50 tasks, with 10 trials per condition and task. One jointly trained policy is used. The model display name is Awomo-0.5I. Initialization/training-data provenance must be finalized before listing.

`result.json` records weight identity and inference settings. `cases.jsonl` contains all 1000 case identities, scene seeds, instructions, step limits and outcomes; `per_task.json` contains the 100 task-condition totals. Infrastructure errors in the terminal summary: zero. A stale per-unit status-file discrepancy is disclosed in result.json.

## Blocking requirements

The official leaderboard specifies 100 trials/task under both conditions and requires public code, weights and a technical report. This submission currently has 10 trials/task/condition and no verified public artifact URLs. Do not insert these numbers into the standard ranking without resolving the protocol discrepancy with maintainers.

Source policy: https://robotwin-platform.github.io/leaderboard

No official ranking data has been modified. The expanded evaluation uses the same 150k EMA checkpoint, with 5,000 Clean and 5,000 Random rollouts planned. No model upload has been made.
