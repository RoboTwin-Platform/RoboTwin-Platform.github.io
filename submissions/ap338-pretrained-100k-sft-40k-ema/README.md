# Awomo-0.5I: AP338 EMA evaluation submission draft

This submission records AP338 initialized from 100,000 pretraining updates and evaluated after 40,000 RobotWin SFT updates. It contains 1,000 completed rollouts from one policy across 50 tasks and two conditions.

| Condition | Successes | Episodes | SR |
|---|---:|---:|---:|
| Clean | 441 | 500 | 88.2% |
| Random | 421 | 500 | 84.2% |
| Combined | 862 | 1000 | 86.2% |

The **86.2% is the combined score**; the clean-to-random score is **84.2%**.

## Checkpoint and inference

- Training run: `aap338-rw32-h20-resume-s17499-r03-20261022-112322`.
- Checkpoint: `epoch_1_step_39999` (40,000 SFT updates), initialized from AP338 `epoch_32_step_99999` (100,000 pretraining updates).
- DiT weights: Power EMA, `sigma_rel=0.1`, paired with `vl_lora/ema.safetensors`. All four model workers recorded 40,000 EMA updates.
- Evaluation: `aap338-rw32-s40000-rw-ema-213545/robotwin_p6000_r03`.
- Prediction horizon 16; execute 8 actions; 16 denoising steps; shift 5; CFG 1; seed 42; history slots 0.

The evaluation replays a frozen historical manifest of seeds, instructions and step limits: 10 trials per task and condition, 500 Clean and 500 Random episodes. `cases.jsonl` contains the 1,000 unique outcomes; `per_task.json` contains all 100 task-condition totals. `result.json` identifies the checkpoint and protocol. `audit.json` records live source checksums, all 100 passing scene-history proof digests, and the four weight-loading receipts. The completed terminal summary reports zero infrastructure errors.

The source checkpoint completion marker and EMA metadata were verified. Full checkpoint payload checksums and public downloads have not been verified. Artifact checksums in this submission identify evaluation evidence or EMA metadata, not the full model weights.

## Listing status

The [leaderboard policy](https://robotwin-platform.github.io/leaderboard) specifies 100 trials/task under both conditions and requires public code, weights and a technical report. This submission has 10 trials/task/condition and no verified public artifact URLs; pretraining and training-data provenance also need finalization. It remains a draft, and the standard ranking data is unchanged.

Any expanded evaluation of the earlier checkpoint does not establish the 100-trial result for this AP338 checkpoint. No new expanded evaluation or model upload is claimed by this submission.
