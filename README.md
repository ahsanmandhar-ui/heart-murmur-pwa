# Multi-Agent Heart Sound Detector

![Heart Sound Detector Logo](logo.svg)

A multi-agent heart sound detector using the **Eheart_sound_by_Ahsan_Mandhar.onnx** model (Audio Spectrogram Transformer, AST) with a linear probe.

## Model
- **Model file:** `Eheart_sound_by_Ahsan_Mandhar.onnx`
- **Base pretrained:** `MIT/ast-finetuned-audioset-10-10-0.4593`
- **Type:** Audio Spectrogram Transformer (AST) — ViT-style encoder
- **Dataset:** CirCor DigiScope Phonocardiogram Dataset
- **Classes:** 0=Absent, 1=Murmur, 2=Unknown
- **Claimed validation accuracy:** 86.2%
- **Claimed validation loss:** 0.4385
- **Precision:** INT8 (ONNX)
- **Input:** `[1, 1, 80, 1001]` log-mel spectrogram
- **Patch size:** 16×16 → 310 patches + 1 CLS token = 311 tokens
- **Hidden dimension:** 768
- **Encoder layers:** 12
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
    participant M as AST Model
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

### Model + Agent System Architecture
```mermaid
flowchart TD
    subgraph MODEL["Model: AST Embedding"]
        A1["Input Audio [1,1,80,1001]"] --> A2["Transformer Encoder"] --> A3["Embeddings [1,311,768]"] --> A4["Mean-Pool 768"] --> A5["Linear Probe"] --> A6(["Present / Absent / Uncertain"])
    end
    subgraph AGENTS["Multi-Agent Pipeline"]
        O["Orchestrator"] --> P["PreprocessAgent"] --> I["InferenceAgent"] --> D["DecisionAgent"] --> S["SafetyAgent"] --> V["VisualizationAgent"] --> O
    end
```

### Agent Class Diagram
```mermaid
classDiagram
    class Orchestrator { +run_pipeline(audio) }
    class PreprocessAgent { +build_mel() }
    class InferenceAgent { +embed(mel) }
    class DecisionAgent { +label() }
    class SafetyAgent { +add_safety_note() }
    class VisualizationAgent { +embedding_stats() }
    Orchestrator --> PreprocessAgent
    Orchestrator --> InferenceAgent
    Orchestrator --> DecisionAgent
    Orchestrator --> SafetyAgent
    Orchestrator --> VisualizationAgent
```

## License
All rights reserved. No permission is granted to copy, reproduce, distribute, modify, or use this software, model, or associated files without prior written permission.

## Contact
Email: ahsanmandhar@gmail.com
