# Awomo-0.6: AP338 EMA 100-trial evaluation (draft)

One AP338 policy initialized from the 100,000-update pretraining checkpoint and fine-tuned for 40,000 SFT updates was evaluated on 50 RoboTwin tasks, 100 rollouts per task and condition.

| Condition | Successes / rollouts | SR |
|---|---:|---:|
| Clean | 4408 / 5000 | 88.16% |
| Random | 4239 / 5000 | 84.78% |
| Combined | 8647 / 10000 | 86.47% |

Checkpoint: `aap338-rw32-h20-resume-s17499-r03-20261022-112322/checkpoints/epoch_1_step_39999`. DiT Power EMA (`sigma_rel=0.1`) and paired LoRA EMA both reflect 40,000 updates.

Each task-condition uses the frozen historical 10-case seed/instruction/step-limit prefix and 90 sequential expert-qualified extension cases. Native expert-stage exceptions were skipped and logged; policy failures were not filtered. Early infrastructure/contract failures were recovered via reruns with verification of the retained case prefixes. `cases.jsonl` has 10,000 unique outcomes, `per_task.json` the 100 task-condition totals, `expert_exceptions.json` the expert-candidate exceptions, and `audit.json` the source proof hashes and weight-loading receipts.

**Known scene discrepancy:** `put_bottles_dustbin/random`, episode 0 (seed 4300000) has different expert and policy initial-scene signatures (10 vs 7 clutter objects); the policy rollout failed. The other 9,999 expert/policy scene signatures match. Its cause and impact on leaderboard comparability remain unresolved; the counts above include this case.

The 100-trial count is complete. Equivalence of this mixed historical-prefix and recovery procedure to the official leaderboard protocol has not been independently established. Public model weights, code and technical-report links and full-weight checksum remain unverified. This is a draft; no leaderboard acceptance is claimed.

The previous 10-trial result (86.2%) is retained in the sibling `ap338-pretrained-100k-sft-40k-ema` directory.
