# Multi-Agent Heart Sound Detector

![M2D Heart-Murmur Logo](logo.svg)

A multi-agent heart sound detector using the **Eheart_sound_by_Ahsan_Mandhar.onnx** model (M2D embedding) with a linear probe.

## Model
- **Model file:** `Eheart_sound_by_Ahsan_Mandhar.onnx`
- **Type:** M2D (Masked Modeling Duo) audio embedding model
- **Precision:** INT8 (ONNX)
- **Input:** `[1, 1, 80, 1001]` log-mel spectrogram
- **Output:** `[1, 311, 768]` embeddings → 768-dim pooled vector
- **Classifier:** Linear probe (`probe.json`)

## Features
- Multi-agent pipeline (preprocess → inference → decision → safety → visualization)
- Local model caching
- Download progress display
- Audio analysis with waveform and mel views
- Decision-support output with abstention

## Architecture Overview

### Model Pipeline Flow
```mermaid
flowchart LR
    AUD["Audio"] --> MEL["Log-Mel [1,1,80,1001]"] --> TOK["Patch Tokens [1,311,768]"] --> EMB["Mean-pooled Embedding [768]"] --> LOG["Logit / Probability"] --> LBL["Present / Absent / Uncertain"]
```

### Agent Interaction Sequence
```mermaid
sequenceDiagram
    actor User
    participant O as Orchestrator
    participant P as PreprocessAgent
    participant I as InferenceAgent
    participant M as M2D Model
    participant D as DecisionAgent
    participant S as SafetyAgent
    participant V as VisualizationAgent
    User->>O: Upload audio
    O->>P: run
    P-->>O: mel
    O->>I: run
    I->>M: inference
    M-->>I: tokens
    I-->>O: embedding
    O->>D: run
    D-->>O: label/prob
    O->>S: run
    S-->>O: safety result
    O->>V: run
    V-->>O: report
    O-->>User: result
```

## License
All rights reserved. No permission is granted to copy, reproduce, distribute, modify, or use this software, model, or associated files without prior written permission.

## Contact
Email: ahsanmandhar@gmail.com