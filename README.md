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

## Installation Guide
```mermaid
flowchart TD
    START([" Start"]) --> DL[" Download the ZIP"]
    DL --> UNZIP[" Unzip the archive"]
    UNZIP --> CHECK{"Files present?<br/>setup.bat<br/>run.bat"}
    
    CHECK -- No --> ERR1[" Missing files<br/>Re-download ZIP"]
    ERR1 --> DL
    
    CHECK -- Yes --> SETUP["️ Run setup.bat"]
    
    subgraph SETUP_BLOCK["setup.bat — Environment Preparation"]
        direction TB
        S1["Check Python installed"]
        S2["Create virtual environment<br/>(venv)"]
        S3["Install Python dependencies<br/>(pip install -r requirements.txt)"]
        S4["Download AST model (Eheart_sound_by_Ahsan_Mandhar.onnx)<br/>(ONNX weights + probe.json)"]
        S5{"Setup<br/>successful?"}
        S1 --> S2 --> S3 --> S4 --> S5
    end
    
    SETUP --> S1
    S5 -- No --> ERR2[" Check error log<br/>Retry setup.bat"]
    ERR2 --> SETUP
    
    S5 -- Yes --> RUN["▶️ Run run.bat"]
    
    subgraph RUN_BLOCK["run.bat — Application Launch"]
        direction TB
        R1["Activate virtual environment"]
        R2["Start Streamlit server"]
        R3["Load ONNX model + probe"]
        R4["Bind to http://localhost:8501"]
        R1 --> R2 --> R3 --> R4
    end
    
    RUN --> R1
    R4 --> BROWSER[" Open browser<br/>http://localhost:8501"]
    BROWSER --> APP([" App Ready<br/>Upload audio → get prediction"])

    classDef startend fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef action fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef decision fill:#fff9c4,stroke:#f9a825,stroke-width:2px,color:#f57f17;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;
    classDef setup fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1px,color:#4a148c;
    classDef run fill:#e0f7fa,stroke:#00838f,stroke-width:1px,color:#006064;
    classDef done fill:#d1c4e9,stroke:#4527a0,stroke-width:2px,color:#311b92;

    class START,APP startend;
    class DL,UNZIP,SETUP,RUN,BROWSER action;
    class CHECK,S5 decision;
    class ERR1,ERR2 error;
    class S1,S2,S3,S4 setup;
    class R1,R2,R3,R4 run;
```

## Download (PC)
[Download heart-murmur-pc-v3.zip](https://github.com/ahsanmandhar-ui/heart-murmur-pwa/releases/download/pc-v3/heart-murmur-pc-v3.zip)

## Features
- Multi-agent pipeline (preprocess → inference → decision → safety → visualization)
- Local model caching
- Download progress display
- Audio analysis with waveform and mel views
- Decision-support output with abstention
- Audio conversion integrated (decode to 16 kHz mono)
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
