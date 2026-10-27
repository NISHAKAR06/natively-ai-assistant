---
noteId: "8c779110d20d11f18715a13677c2340f"
tags: []

---

# Candidate Portfolio & Technical Projects Dossier: Nishakar T

## 1. Candidate Overview & Elevator Pitch
- **Candidate Name**: Nishakar T
- **Contact & Profiles**:
  - Email: nishakarnishakar06@gmail.com
  - Phone: +91 6383628949
  - GitHub: github.com/NISHAKAR06
  - LinkedIn: linkedin.com/in/nishakar314
  - LeetCode: leetcode.com/Nishakar06 (400+ problems solved)
- **Education**:
  - B.Tech in Artificial Intelligence & Machine Learning (2023 - 2027)
  - Sri Shakthi Institute of Engineering and Technology, CGPA: 8.08 / 10
  - Coursework: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, OOP, Software Engineering
- **Achievements**:
  - GHCI 2025 Hackathon (AnitaB.org India): Cleared Round 1, recognized for GenAI, problem-solving, and collaboration.
  - HackIndia 2025: Top 100 out of 50,000+ applicants nationwide.
  - LeetCode: Solved 400+ algorithmic and data structure problems.
- **Elevator Pitch (Spoken Intro)**:
  "I am an AI and Software Development Engineer specializing in building scalable backend systems, multi-agent LLM architectures, and machine learning pipelines. My work ranges from engineering real-time IoT digital twins at Intel Unnati to developing an enterprise AI governance platform with graduated autonomy. I'm strong in Python, FastAPI, PyTorch, SQL, and building reliable, low-latency production applications."

---

## 2. Project: Threshold — AI Governance Platform
- **Tech Stack**: FastAPI, PostgreSQL, Gemini API, WebSockets, Python, Docker
- **Architecture Overview**:
  A multi-agent AI governance system featuring **Graduated Autonomy** — a risk policy decision engine that classifies each AI suggestion into three tiers:
  1. *Auto-Execute*: Low risk, routine actions executed immediately.
  2. *User-Confirm*: Moderate risk, requiring user validation via WebSockets.
  3. *Human-Review / Administrator Escalation*: High risk or sensitive operations routed to human review queues.
  The architecture adheres strictly to SOLID principles with modular agents: `BaseAgent`, `PlannerAgent`, `GovernanceAgent`, and `ReviewAgent`.
- **The 8th Node State Machine**:
  The decision pipeline is implemented as a formal, deterministic state machine comprising **8 distinct nodes**:
  1. **Node 1: DraftProposal** — The raw generative plan produced by Gemini API from the user request.
  2. **Node 2: PolicyVerification** — Rule-based checks verifying enterprise access permissions and compliance constraints.
  3. **Node 3: RiskScoringNode** — Evaluates probabilistic blast radius, data sensitivity, and operational impact.
  4. **Node 4: AutonomyGate** — Compares the aggregate risk score against dynamic thresholds to determine the execution tier.
  5. **Node 5: HumanReviewQueue** — Enqueues requests exceeding the autonomy threshold into an administrative review pipeline.
  6. **Node 6: ExecutionDispatchNode** — Asynchronously dispatches authorized actions via FastAPI workers and WebSockets.
  7. **Node 7: AuditLedgerCommit** — Persists an immutable, cryptographically verifiable log entry to PostgreSQL for audit compliance.
  8. **Node 8: FeedbackStateNode (The 8th Node)**:
     - **Purpose & Mechanics**: The 8th node is the **Closed-Loop Learning and Policy Adaptation State**. Whenever a human administrator approves or rejects an escalated action, Node 8 captures the outcome, analyzes feature discrepancies between model predictions and human decisions, and adjusts future risk-scoring weights. This ensures the system continuously learns human organizational preferences and safely expands its autonomy over time.
- **Spoken Answer for Interviewers**:
  "In my Threshold AI Governance Platform, I implemented an 8-state risk policy machine. Nodes 1 through 7 handle proposal drafting, policy checks, risk scoring, autonomy gating, human review routing, execution dispatch, and immutable PostgreSQL audit logging.
  **The 8th Node is the Feedback and Policy Adaptation State**. It acts as our closed-loop learning engine: whenever a human administrator approves or rejects an action, the 8th node records the decision, updates our Bayesian risk parameters, and recalibrates future autonomy thresholds. This bridges the gap between manual human oversight and safe, expanding automation."

---

## 3. Project: Health Forecast AI / MediQuery AI (30-Day Hospital Readmission Risk Model)
- **Tech Stack**: Python, Scikit-learn, XGBoost, Random Forest, FastAPI, LangChain, ChromaDB
- **Problem & Objective**:
  Predicting whether a patient is at high risk of 30-day hospital readmission based on clinical EHR data (diagnoses, lab results, medications, demographics) to help clinicians intervene early.
- **Handling Class Imbalance (CRITICAL)**:
  - *The Challenge*: Severe class imbalance where readmitted patients represent only ~11% of the dataset (a ~9:1 negative-to-positive ratio). Naive models simply predict 'no readmission' to achieve 89% accuracy while failing clinical objectives.
  - *Specific Techniques Implemented*:
    1. **SMOTE (Synthetic Minority Over-sampling Technique)**: Applied strictly to training folds within cross-validation (never leaking into validation/test splits) to generate synthetic minority samples along feature-space interpolation vectors.
    2. **Class-Weighted Tree Ensembles**: Trained Random Forest and XGBoost with `class_weight='balanced'` and `scale_pos_weight = (count(negative) / count(positive))`. This places a substantially higher loss penalty on False Negatives (missed readmissions), aligning the model with clinical reality where missing a sick patient is far more costly than a false alert.
    3. **Appropriate Clinical Metrics (PR-AUC & F2-Score)**: Evaluated primarily on **Precision-Recall AUC (PR-AUC)** rather than ROC-AUC or accuracy. Also monitored **F2-Score**, which weights recall twice as heavily as precision.
    4. **Optimal Decision Threshold Tuning**: Did not use the default 0.5 probability cutoff. Instead, tuned the operating threshold to approximately **0.32** along the Precision-Recall curve to maximize sensitivity at an acceptable false-alarm rate.
- **Spoken Answer for Interviewers**:
  "For my hospital readmission prediction model, the positive class—readmitted patients—was only about 11% of the dataset. To handle this class imbalance effectively:
  First, I applied **SMOTE** on the training splits to synthesize realistic minority examples without data leakage.
  Second, I used **class-weighted Random Forest and XGBoost** with `class_weight='balanced'`, heavily penalizing false negatives because missing a sick patient carries severe clinical consequences.
  Third, I replaced accuracy and ROC-AUC with **Precision-Recall AUC (PR-AUC)** and **F2-score** to directly prioritize recall.
  Finally, I tuned the classification probability threshold down from 0.5 to approximately 0.32 based on our precision-recall curve to achieve optimal clinical sensitivity."

---

## 4. Project: Intel Unnati Internship — Digital Twin & Predictive Maintenance
- **Role**: Backend & AI Developer Intern (Oct 2025 - Dec 2025)
- **Tech Stack**: FastAPI, Python, XGBoost, Isolation Forest, WebSockets, Pandas, NumPy
- **Implementation**:
  - Developed backend REST and WebSocket APIs for a simulated electro-mechanical Digital Twin platform.
  - Processed continuous high-frequency mock sensor data using a 10-timestep rolling window preprocessor.
  - Implemented **Isolation Forest** for unsupervised anomaly detection on sensor drift.
  - Implemented **XGBoost Regressor** for Remaining Useful Life (RUL) prediction, estimating degradation timelines before hardware failure.
  - Streamed telemetry and predictive health alerts to an operations dashboard with sub-second latency.
- **Spoken Answer for Interviewers**:
  "During my internship at Intel Unnati, I built the backend data and AI pipeline for an industrial Digital Twin platform using FastAPI. I ingested streaming sensor telemetry through WebSockets, applied Isolation Forest for real-time anomaly detection, and trained an XGBoost regression model to estimate the Remaining Useful Life of critical machine components. This enabled automated predictive maintenance and reduced unexpected machine downtime."

---

## 5. Project: AI-Powered Mental Wellness Platform (Voice Therapy)
- **Tech Stack**: Django, FastAPI, Gemini API, PostgreSQL, Google Speech-to-Text (STT), Google Text-to-Speech (TTS), WebSockets, JWT
- **Implementation**:
  - Built an end-to-end voice therapy conversation pipeline: Audio In -> Google STT -> Gemini CBT Psychologist Persona -> Google TTS -> Audio Out.
  - Multi-turn dialogue management with state tracking and prompt-engineered therapeutic empathy based on Cognitive Behavioral Therapy (CBT).
  - Sub-second latency via asynchronous streaming WebSockets and JWT security.

---

## 6. Project: SolidWorks Computer Vision Parts Counting
- **Tech Stack**: PyTorch, OpenCV, NumPy, Scikit-learn
- **Implementation**:
  - Built a CNN from scratch to count industrial parts (bolts, pins, nuts, washers) across 10,000+ annotated images.
  - Applied aggressive image augmentation (rotation, jitter, scaling) across 45 epochs.
  - Achieved **96.53% exact-match accuracy** and **100% accuracy within a ±1 count tolerance**.

---

## 7. Project: FloatChat — Oceanographic Data Platform
- **Tech Stack**: Django, FastAPI, Celery, PostgreSQL, NetCDF4, Groq Llama 3.1
- **Implementation**:
  - Asynchronous ingestion and validation of large scientific NetCDF oceanographic datasets via Celery workers.
  - Vector search and structured querying allowing researchers to ask natural language questions about salinity, temperature, and sea currents.
