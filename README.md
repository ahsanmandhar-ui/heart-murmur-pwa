# Agentic Heart Sound Detector

![Heart Sound Detector Logo](logo.svg)

A multi-agent heart sound detector using the **Eheart_sound_by_Ahsan_Mandhar.onnx** model (Audio Spectrogram Transformer, AST) with a linear probe.

## Model
- **Model file:** `Eheart_sound_by_Ahsan_Mandhar.onnx`
- **Base pretrained:** `MIT/ast-finetuned-audioset-10-10-0.4593`
- **Type:** Audio Spectrogram Transformer (AST) â€” ViT-style encoder
- **Dataset:** CirCor DigiScope Phonocardiogram Dataset
- **Classes:** 0=Absent, 1=Murmur, 2=Unknown
- **Precision:** INT8 (ONNX)
- **Input:** `[1, 1, 80, 1001]` log-mel spectrogram
- **Patch size:** 16Ã—16 â†’ 310 patches + 1 CLS token = 311 tokens
- **Hidden dimension:** 768
- **Encoder layers:** 12
- **Output:** `[1, 311, 768]` embeddings â†’ 768-dim pooled vector
- **Classifier:** Linear probe (`probe.json`)

## Installation Guide
```mermaid
flowchart TD
    START([" Start"]) --> DL[" Download the ZIP"]
    DL --> UNZIP[" Unzip the archive"]
    UNZIP --> CHECK{"Files present?<br/>setup.bat<br/>run.bat"}
    
    CHECK -- No --> ERR1[" Missing files<br/>Re-download ZIP"]
    ERR1 --> DL
    
    CHECK -- Yes --> SETUP["ï¸ Run setup.bat"]
    
    subgraph SETUP_BLOCK["setup.bat â€” Environment Preparation"]
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
    
    S5 -- Yes --> RUN["â–¶ï¸ Run run.bat"]
    
    subgraph RUN_BLOCK["run.bat â€” Application Launch"]
        direction TB
        R1["Activate virtual environment"]
        R2["Start Streamlit server"]
        R3["Load ONNX model + probe"]
        R4["Bind to http://localhost:8501"]
        R1 --> R2 --> R3 --> R4
    end
    
    RUN --> R1
    R4 --> BROWSER[" Open browser<br/>http://localhost:8501"]
    BROWSER --> APP([" App Ready<br/>Upload audio â†’ get prediction"])

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
[Download heart-murmur-pc-v5.zip](https://github.com/ahsanmandhar-ui/heart-murmur-pwa/releases/download/pc-v5/heart-murmur-pc-v5.zip)

## Features
- Multi-agent pipeline (preprocess â†’ inference â†’ decision â†’ safety â†’ visualization)
- Local model caching
- Download progress display
- Audio analysis with waveform and mel views
- Decision-support output with abstention
- Audio conversion integrated (decode to 16 kHz mono)
## Metrics (100-sample evaluation)

### Confusion Matrix
```mermaid
flowchart TB
    subgraph CM["Confusion Matrix - rows = True, cols = Predicted"]
        direction LR
        subgraph ROW1["Actual = POSITIVE"]
            direction LR
            TP["TP = 39\nCorrectly detected"]
            FN["FN = 10\nMissed cases"]
        end
        subgraph ROW2["Actual = NEGATIVE"]
            direction LR
            FP["FP = 8\nFalse alarms"]
            TN["TN = 41\nCorrectly rejected"]
        end
        HDR["Predicted Pos  |  Predicted Neg"]
    end

    HDR --> ROW1
    HDR --> ROW2

    classDef tp fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef tn fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef fp fill:#ffcdd2,stroke:#c62828,stroke-width:2px,color:#b71c1c;
    classDef fn fill:#ffcdd2,stroke:#c62828,stroke-width:2px,color:#b71c1c;
    classDef hdr fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;

    class TP,TN tp;
    class FP,FN fp;
    class HDR hdr;
```

### Outcome Distribution
```mermaid
pie showData
    title "Outcome Distribution (Evaluated = 98)"
    "True Positive (39)" : 39
    "True Negative (41)" : 41
    "False Positive (8)" : 8
    "False Negative (10)" : 10
```

### Derived Metrics
```mermaid
flowchart LR
    subgraph INPUTS["Raw Counts"]
        TPc["TP = 39"]
        TNc["TN = 41"]
        FPc["FP = 8"]
        FNc["FN = 10"]
    end

    subgraph CALC["Derived Metrics"]
        ACC["Accuracy\n(TP+TN)/98\n0.8163"]
        REC["Recall / Sensitivity\nTP/(TP+FN)\n0.7959"]
        SPEC["Specificity\nTN/(TN+FP)\n0.8367"]
        PREC["Precision\nTP/(TP+FP)\n0.8298"]
        F1["F1 Score\n2*P*R/(P+R)\n0.8125"]
        AUC["AUC (ROC)\nrank-based\n0.8796"]
    end

    TPc --> ACC
    TNc --> ACC
    TPc --> REC
    FNc --> REC
    TNc --> SPEC
    FPc --> SPEC
    TPc --> PREC
    FPc --> PREC
    PREC --> F1
    REC --> F1
    TPc --> AUC
    TNc --> AUC
    FPc --> AUC
    FNc --> AUC

    classDef raw fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#01579b;
    classDef metric fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e;
    classDef best fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,color:#1b5e20;

    class TPc,TNc,FPc,FNc raw;
    class ACC,REC,SPEC,PREC,F1 metric;
    class AUC best;
```

### Metrics Bar Chart
```mermaid
xychart-beta
    title "Performance Metrics (AUC = 0.8796)"
    x-axis ["Accuracy", "Recall", "Specificity", "Precision", "F1", "AUC"]
    y-axis "Score" 0 --> 1
    bar [0.8163, 0.7959, 0.8367, 0.8298, 0.8125, 0.8796]
```

### Evaluation Flow
```mermaid
sequenceDiagram
    autonumber
    participant O as Orchestrator
    participant M as AST Model
    participant D as DecisionAgent
    participant S as SafetyAgent
    participant E as Evaluator

    loop Over 100 samples
        O->>M: audio -> embedding
        M-->>O: 768-dim
        O->>D: classify
        D-->>O: Present / Absent / Uncertain
        O->>S: guardrail
        S-->>O: final label
        O->>E: record (pred, truth)
    end

    Note over E: 2 uncertain -> excluded
    Note over E: 98 evaluated
    E-->>E: TP=39 TN=41 FP=8 FN=10
    E-->>E: compute Accuracy, Recall, Specificity, Precision, F1, AUC
    E-->>O: Final report
```

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


## Provenance & License
- **Base model:** MIT/ast-finetuned-audioset-10-10-0.4593 (MIT License)
- **Dataset:** CirCor DigiScope Phonocardiogram Dataset (ODC Attribution License)
- **Fine-tuning & quantization:** Ahsan Mandhar
- **License:** MIT (see LICENSE file)
- **Attribution:** Original copyright preserved; modifications copyright (c) 2026 Ahsan Mandhar
## License
All rights reserved. No permission is granted to copy, reproduce, distribute, modify, or use this software, model, or associated files without prior written permission.

## Contact
Email: ahsanmandhar@gmail.com

