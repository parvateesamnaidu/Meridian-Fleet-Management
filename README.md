# MeridianBlue Fleet Intelligence Workbench

**MeridianBlue** is an enterprise maritime fleet disruption management and non-autonomous voyage recovery intelligence workbench. It bridges live AIS telemetry, metocean conditions, cargo constraints, and strict IMO/charter policy compliance into an explainable, deterministic decision-support system for shore superintendents, operators, and vessel bridge crews.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (v9+) or `pnpm` / `yarn`

### Installation
1. Clone or download the repository into your local environment:
   ```bash
   git clone <repo-url>
   cd meridianblue-workbench
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
Start the local Vite development server on port `3000`:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

#### Production Build
To create an optimized production build:
```bash
npm run build
```
To preview the production bundle locally:
```bash
npm run preview
```

#### Code Quality & Verification
To run TypeScript validation checks:
```bash
npm run lint
```

---

## 🧭 System Architecture & Core Concepts

MeridianBlue enforces a **Non-Autonomous Decision Support** paradigm:
- **Zero Hidden Chain-of-Thought**: All AI outputs and policy rules produce structured, auditable evidence with explicit provenance.
- **Deterministic Policy Gates (v4.1)**: Hard safety constraints (e.g., speed ceilings, fuel reserves, CMMS technical holds, ECA sulfur boundaries) cannot be overridden autonomously by models or unauthorized roles.
- **Offline & Edge Continuity**: Designed for deep-sea satellite blackouts with monotonic event queuing, clock skew normalization, and idempotent replay deduplication.
- **Template 10 Decision Traces**: Every human decision snapshot includes exact prompt, model, ontology, and policy bundle versions for full statutory reconstructability.

---

## 🖥️ Feature Walkthrough & Navigation

The workbench is divided into 11 specialized operational modules accessible via the left navigation rail:

### 1. 🎛️ Control Tower (`ControlTower.tsx`)
- **Executive Overview**: High-level fleet status displaying active disruptions, risk indices, affected vessels, and commercial exposure.
- **Quick Switcher**: Filter disruptions by severity (`CRITICAL`, `MAJOR`, `MODERATE`) or type (Weather, Chokepoint, Engine, Port Congestion).
- **KPI Metrics**: Fleet on-time reliability, fuel burn variance, active CMMS technical holds, and connection statuses.

### 2. 🚢 Voyage Context Deep-Dive (`VoyageContextView.tsx`)
- **Vessel Telemetry**: View live AIS position, speed over ground (SOG), heading, draft, fuel levels (VLSFO/MGO), and engine load.
- **Cargo & Port Windows**: Inspect bill-of-lading cargo restrictions (e.g., refrigerated container temperatures, hazardous goods), laycan arrival windows, and demurrage rate schedules ($45,000/day).
- **Metocean Conditions**: Real-time significant wave heights, swell direction, wind force (Beaufort scale), and current vectors.

### 3. 🕸️ Context Graph Explorer (`ContextGraphExplorer.tsx`)
- **Interactive Knowledge Graph (D3.js)**: Visualize maritime entities, relationships, and dependencies (`Vessel` ➔ `Voyage` ➔ `Waypoint` ➔ `Chokepoint` ➔ `CargoConstraint`).
- **Graph Traversal**: Inspect multi-hop blast radiuses when a canal (e.g., Suez, Panama) or port terminal experiences a disruption.

### 4. ⚖️ Evidence Reconciliation (`EvidenceReconciliation.tsx`)
- **Multimodal Stream Synthesis**: Ingests and reconciles heterogeneous data feeds (AIS, Navtex weather faxes, CMMS work orders, satellite radar, terminal emails).
- **Conflict Resolution & Temporal Weighting**: Flags conflicting data (e.g., vessel reporting 14.5 kts vs. port radar reporting 11.2 kts) and resolves truth using source reliability scores and logical timestamps.

### 5. 🔍 Hybrid Retrieval Engine (`HybridRetrievalView.tsx`)
- **Dense Vector + Sparse BM25 + Graph**: Combines semantic embeddings with exact keyword matching (IMO rules, Charter Party clauses) and structured graph queries.
- **Retrieval Inspector**: Inspect similarity scores, retrieved statutory documents (e.g., MARPOL Annex VI, SOLAS Chapter V), and query execution times.

### 6. 🛠️ Recovery Option Workbench (`RecoveryWorkbench.tsx`)
- **Multi-Option Candidate Matrix**: Compares generated recovery courses:
  - **Option Alpha**: Speed-up along direct track (fuel burn vs. on-time laycan).
  - **Option Bravo**: Weather diversion corridor (safety maximized, minor delay).
  - **Option Charlie**: Alternate bunkering / transshipment port call.
- **Pareto Trade-Off Visualizer**: Evaluates Cost Index ($), Estimated Delay (hrs), Fuel Consumption (MT), and CII / Carbon Tax Exposure.
- **Gemini AI Advisory**: Generates grounded operational recommendations with observable evidence citations.

### 7. 🛡️ Authority & Deterministic Policy Gate (`AuthorityGateView.tsx`)
- **Policy Bundle v4.1 Enforcement**: Validates that candidates satisfy hard safety gates (e.g., maximum sustained engine RPM, minimum bunker safety reserves of 15%, ECA compliance).
- **CMMS Technical Hold Release**: Simulates main engine bearing temperature alerts (`WO-CRIT-003`). Speed increases remain locked until authorized specifically by the `CHIEF_ENGINEER`.
- **Operator Decision Sign-Off**: Formal human commit requiring digital signature, operational notes, and active role authorization.

### 8. 📡 Offline Continuity & Idempotent Reconnect (`OfflineReconnectView.tsx`)
- **Satellite Blackout Simulator**: Toggle simulated satcom blackout mode (0 kbps link) to test vessel-side edge autonomy.
- **Clock Skew Normalization**: Simulates temporal drift (e.g., +420s offset) and enforces monotonic sequence sorting over wall-clock time.
- **Idempotent Replay Queue**: Deduplicates queued vessel actions during reconnection using unique event hashing.

### 9. 📜 Decision Trace & Audit Repository (`DecisionTraceView.tsx`)
- **Template 10 Compliance**: Review immutable, structured records of every committed decision.
- **Artifact Inspection**: Audit exact model IDs, prompt templates, policy versions, actor identity, and context snapshots.
- **Export & Download**: One-click export of complete decision traces as formatted JSON for insurance and maritime legal compliance.

### 10. 📈 Voyage Outcome & Governed Learning (`OutcomeFeedbackView.tsx`)
- **Predicted vs. Observed Tracking**: Compares pre-voyage AI estimates against actual bunker consumption, arrival timestamps, and operational costs.
- **Governed Learning Queue**: Records operator feedback (`ACCEPTED`, `MODIFIED`, `OVERRIDDEN`) into a peer-reviewed queue. *Strict rule: No autonomous model retraining or self-tuning in production.*

### 11. 🧪 Scenario & Failure Injection Lab (`ScenarioLabView.tsx`)
- **15 Golden Maritime Test Cases (GS-01 to GS-15)**: Pre-configured operational edge cases covering typhoons, canal groundings, engine overheating, prompt injection attempts, and crew rest violations.
- **Automated 12 Hard Gate Acceptance Test Suite**:
  - `AT-01`: Deterministic Policy Gate Precedence
  - `AT-02`: CMMS Hold Authorization Locking
  - `AT-03`: Role-Based Authority Isolation
  - `AT-04`: Prompt Injection Resistance
  - `AT-05`: Evidence Source Provenance Tagging
  - `AT-06`: Template 10 Decision Trace Formatting
  - `AT-07`: Offline Edge Event Buffering
  - `AT-08`: Clock Skew Monotonic Reordering
  - `AT-09`: Idempotent Replay Reconciler
  - `AT-10`: No Autonomous Model Self-Retraining
  - `AT-11`: Multi-Hop Chokepoint Graph Traversal
  - `AT-12`: Superseded Policy Isolation (v3.7 vs v4.1)

---

## 👥 Role-Based Access Control (RBAC)

Use the role switcher in the top navigation header to test permissions across maritime personas:

| Role | Permissions & Operational Scope |
| :--- | :--- |
| **VOYAGE_OPERATOR** | Full operational planning, disruption evaluation, recovery execution, and feedback logging. |
| **VESSEL_MASTER** | Bridge authority: accepts voyage diversions, endorses safety overrides, reviews weather routing. |
| **CHIEF_ENGINEER** | Technical authority: holds exclusive privilege to release CMMS machinery technical holds (`WO-CRIT-003`). |
| **TECHNICAL_SUPERINTENDENT** | Shore technical manager: reviews engine maintenance logs, audits fleet performance. |
| **SAFETY_OFFICER** | ISM/SOLAS compliance auditor: monitors navigation safety corridors, reviews audit traces. |
| **AUDITOR** | Read-only compliance inspector: exports Template 10 traces, reviews acceptance gate logs. |

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript (ESM)
- **Styling**: Tailwind CSS (v4) + Lucide Icons + Motion
- **Data Visualization**: D3.js (Force-directed Graph), Recharts
- **Backend / API**: Express 4 + Vite middleware + `@google/genai` TypeScript SDK
- **Persistence & Auth**: Firebase Firestore + Google OAuth Auth Service + IndexedDB Client Cache

---

## 📄 License & Compliance

Built in compliance with IMO Maritime Safety Committee guidelines, ISM Code standards, and strict non-autonomous explainable AI governance principles.
