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
    AUD["🎵 Audio<br/>(any format)"] 
    --> MEL["Log-Mel Spectrogram<br/>[1,1,80,1001]"]
    --> TOK["Patch Tokens<br/>[1,311,768]"]
    --> EMB["Mean-pooled Embedding<br/>[768]"]
    --> LOG["Logit / Probability"]
    --> LBL["🏷️ Present / Absent / Uncertain<br/>(+ abstention)"]
    --> SAFE["🛡️ Safety Note + Disclaimer<br/>+ Event Log"]

    classDef step fill:#e8eaf6,stroke:#283593,stroke-width:2px,color:#1a237e;
    class AUD,MEL,TOK,EMB,LOG,LBL,SAFE step;
```

### Agent Interaction Sequence
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant O as Orchestrator
    participant P as PreprocessAgent
    participant I as InferenceAgent
    participant M as M2D Model (ONNX)
    participant D as DecisionAgent
    participant S as SafetyAgent
    participant V as VisualizationAgent

    User->>O: Upload audio file
    O->>P: run(audio)
    P->>P: Resample → 16 kHz<br/>Build log-mel [1,1,80,1001]
    P-->>O: mel spectrogram

    O->>I: run(mel)
    I->>M: ONNX inference
    M-->>I: tokens [1,311,768]
    I->>I: mean-pool → 768-dim embedding
    I-->>O: embedding (768,)

    O->>D: run(embedding)
    D->>D: standardize → logit → probability<br/>apply abstain threshold
    D-->>O: label + prob + abstain

    O->>S: run(label, prob)
    S->>S: attach safety note + disclaimer<br/>flag if uncertain
    S-->>O: safety-enriched result

    O->>V: run(embedding, mel)
    V->>V: embedding stats + PCA point + mel shape
    V-->>O: visualization payload

    O-->>User: final result + event log
```

### Model + Agent System Architecture
```mermaid
flowchart TD
    subgraph MODEL["🧠 Model: M2D Embedding"]
        direction TB
        A1["Input Audio<br/>[1,1,80,1001] log-mel"]
        A2["Transformer Encoder<br/>(ViT-style) → 311 patch tokens"]
        A3["Embeddings<br/>[1,311,768]"]
        A4["Mean-Pool → 768-dim vector"]
        A5["Logistic Regression Probe<br/>(probe.json)"]
        A6(["Present / Absent / Uncertain"])

        A1 --> A2 --> A3 --> A4 --> A5 --> A6
    end

    subgraph AGENTS["🤖 Multi-Agent Pipeline"]
        direction TB
        O["Orchestrator<br/>Runs agents in order,<br/>aggregates results & events"]
        P["PreprocessAgent (DSP)<br/>Resample → 16 kHz<br/>Mel spectrogram [1,1,80,1001]"]
        I["InferenceAgent (Model runner)<br/>Load ONNX session, run embedding<br/>mean-pool → 768-dim"]
        D["DecisionAgent (Classifier)<br/>Standardize embedding,<br/>logit/probability, abstain threshold"]
        S["SafetyAgent (Guardrails)<br/>Safety note, disclaimer,<br/>flag uncertain cases"]
        V["VisualizationAgent (Reporting)<br/>Embedding stats, PCA point,<br/>mel shape"]

        O --> P --> I --> D --> S --> V --> O
    end

    subgraph FLOW["🔄 End-to-End Flow"]
        direction LR
        U["🎧 User uploads audio"]
        F1["PreprocessAgent →<br/>mel spectrogram"]
        F2["InferenceAgent →<br/>768-dim embedding"]
        F3["DecisionAgent →<br/>label + probability + abstain"]
        F4["SafetyAgent →<br/>safety note + disclaimer"]
        F5["VisualizationAgent →<br/>stats + PCA"]
        F6["Orchestrator →<br/>final result + event log"]

        U --> F1 --> F2 --> F3 --> F4 --> F5 --> F6
    end

    I -.uses.-> A2
    D -.uses.-> A5
    P -.feeds.-> A1

    classDef model fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef agent fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e;
    classDef flow fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100;
    classDef result fill:#fce4ec,stroke:#ad1457,stroke-width:2px,color:#880e4f;

    class A1,A2,A3,A4,A5 model;
    class A6 result;
    class O,P,I,D,S,V agent;
    class U,F1,F2,F3,F4,F5,F6 flow;
```

### Agent Class Diagram
```mermaid
classDiagram
    class Orchestrator {
        +run_pipeline(audio)
        +aggregate(results)
        +emit_event_log()
    }
    class PreprocessAgent {
        +resample_16k(audio)
        +build_mel() [1,1,80,1001]
    }
    class InferenceAgent {
        +load_onnx_session()
        +embed(mel) [1,311,768]
        +mean_pool() 768-dim
    }
    class DecisionAgent {
        +standardize(emb)
        +compute_logit()
        +apply_abstain_threshold()
        +label() Present|Absent|Uncertain
    }
    class SafetyAgent {
        +add_safety_note()
        +add_disclaimer()
        +flag_uncertain()
    }
    class VisualizationAgent {
        +embedding_stats()
        +pca_point()
        +mel_shape()
    }

    Orchestrator --> PreprocessAgent
    Orchestrator --> InferenceAgent
    Orchestrator --> DecisionAgent
    Orchestrator --> SafetyAgent
    Orchestrator --> VisualizationAgent

    PreprocessAgent ..> InferenceAgent : mel
    InferenceAgent ..> DecisionAgent : embedding
    DecisionAgent ..> SafetyAgent : label+prob
    SafetyAgent ..> VisualizationAgent : enriched result
```

## License
All rights reserved. No permission is granted to copy, reproduce, distribute, modify, or use this software, model, or associated files without prior written permission.

## Contact
Email: ahsanmandhar@gmail.com