import { ClarificationQuestion, StructuredBRD } from "./types";

export const DEMO_CLARIFICATION_QUESTIONS: ClarificationQuestion[] = [
  {
    id: "Q-1",
    question: "Do you plan to support walk-in patients alongside advance online/phone appointments?",
    context: "Queue management in physical clinics requires coordinating pre-booked slots with impromptu walk-in visitors to maintain fair waiting times.",
    defaultAssumption: "The system will support both advance slot bookings and on-the-spot walk-in token generation, with priority given to scheduled slots within a 15-minute window.",
  },
  {
    id: "Q-2",
    question: "Which communication channels should be used for automated appointment reminders and queue status updates?",
    context: "Clinic patients have varying connectivity and smartphone usage habits; notification delivery reliability affects no-show rates.",
    defaultAssumption: "Automated reminders will be dispatched via WhatsApp Business API and fallback SMS 24 hours and 2 hours before the appointment.",
  },
  {
    id: "Q-3",
    question: "Is online consultation fee collection required at the time of booking, or should all payments be handled in-person?",
    context: "Payment gateways introduce refunds, cancellation charges, and reconciliation overhead for clinic administrators.",
    defaultAssumption: "Phase 1 will record payment status upon clinic arrival (Cash / Clinic UPI QR), with integrated online pre-payment deferred to Phase 2.",
  },
  {
    id: "Q-4",
    question: "How should estimated wait time be calculated when a doctor spends more time with a critical patient?",
    context: "Static average consultation time can cause patient frustration if consultations run overtime.",
    defaultAssumption: "Dynamic rolling average based on the last 3 completed consultations plus the count of arrived patients ahead in the queue.",
  },
];

export function generateDemoBRD(ideaText: string, answers?: Record<string, string>): StructuredBRD {
  const isClinicIdea = ideaText.toLowerCase().includes("clinic") || ideaText.toLowerCase().includes("patient") || ideaText.toLowerCase().includes("doctor");

  const projectName = isClinicIdea ? "AarogyaQueue - Smart Clinic Appointment & Queue Manager" : "VyaparFlow - Business Requirements Document";

  const q1Answer = answers?.["Q-1"] || DEMO_CLARIFICATION_QUESTIONS[0].defaultAssumption;
  const q2Answer = answers?.["Q-2"] || DEMO_CLARIFICATION_QUESTIONS[1].defaultAssumption;
  const q3Answer = answers?.["Q-3"] || DEMO_CLARIFICATION_QUESTIONS[2].defaultAssumption;
  const q4Answer = answers?.["Q-4"] || DEMO_CLARIFICATION_QUESTIONS[3].defaultAssumption;

  const brd: StructuredBRD = {
    metadata: {
      projectName,
      targetLanguage: "en-IN",
      generatedAt: new Date().toISOString(),
      engine: "DemoEngine",
      isDemo: true,
      modelUsed: "Deterministic Simulation (No Sarvam API Key Configured)",
    },
    summary: {
      executiveSummary: `A streamlined digital management solution designed for single-specialty and multi-doctor outpatient clinics. It bridges the gap between pre-booked appointments and physical waiting rooms, providing transparent real-time wait estimation for patients while automating receptionist triage and doctor consultation flow.`,
      problemStatement: `Small clinics currently struggle with chaotic waiting room congestion, unpredictable patient waiting durations (often exceeding 45-60 minutes), frequent no-shows, and receptionist burnout caused by repetitive manual queue inquiries. Patients lack visibility into real-time delay status.`,
      proposedSolution: `A cloud-based responsive web application that enables multi-channel appointment booking, automated appointment reminders, on-arrival QR check-in, dynamic live queue token tracking, and a real-time status dashboard for doctors and receptionists.`,
    },
    businessObjectives: [
      "Reduce average patient waiting room congestion by 40% within 90 days of clinic deployment.",
      "Lower appointment no-show rates from the industry baseline of 28% to under 10% via proactive automated reminders.",
      "Eliminate manual paper token registers and cut receptionist triage time per patient from 4 minutes to under 45 seconds.",
      "Achieve patient satisfaction (CSAT) rating of >= 4.5/5 on transparency of consultation scheduling.",
    ],
    stakeholders: [
      {
        role: "Patients / Caregivers",
        responsibilities: "Book appointment slots, view queue position from mobile browser, check-in upon arrival, and receive schedule notifications.",
      },
      {
        role: "Clinic Receptionist / Admin Staff",
        responsibilities: "Validate bookings, generate tokens for walk-in patients, mark patient arrivals, handle emergency queue overrides, and collect fees.",
      },
      {
        role: "Consulting Doctors",
        responsibilities: "View current waiting queue, call the next patient, log consultation start/end timestamps, and mark break/delay intervals.",
      },
      {
        role: "Clinic Owner / Practice Manager",
        responsibilities: "Review daily footfall reports, monitor peak waiting times, audit doctor turnaround benchmarks, and configure clinic timings.",
      },
    ],
    scope: {
      inScope: [
        "Patient mobile-friendly web portal for slot selection and token status tracking without mandatory app downloads.",
        "Receptionist desk console for queue management, walk-in creation, and check-in confirmation.",
        "Doctor consultation room view with 'Call Next Patient' and 'Start/Complete Consultation' controls.",
        "Automated WhatsApp & SMS reminder alerts (24-hour and 2-hour pre-appointment).",
        "Dynamic estimated wait time calculation based on real-time doctor consultation pace.",
        "End-of-day analytics export in CSV format covering patient volume and queue wait times.",
      ],
      outOfScope: [
        "Full Electronic Health Records (EHR) or complex diagnostic prescription writing (Phase 2).",
        "Direct insurance pre-authorization or TPA claim settlements.",
        "In-app video teleconsultation streaming (in-person physical clinic visits prioritized).",
        "Pharmacy inventory management and drug dispensing hardware integration.",
      ],
    },
    functionalRequirements: [
      {
        id: "FR-001",
        title: "Patient Self-Service Appointment Booking",
        description: "System shall allow patients to select a doctor, consultation date, available 15-minute slot, enter patient name, phone number, and brief reason for visit.",
        priority: "High",
      },
      {
        id: "FR-002",
        title: "Walk-In Token Registration",
        description: "System shall allow the receptionist to create instant walk-in tokens with auto-assigned priority numbers interleaved seamlessly into the active queue.",
        priority: "High",
      },
      {
        id: "FR-003",
        title: "Patient Arrival Check-In",
        description: "System shall permit receptionists to mark pre-booked patients as 'Arrived', changing their status from 'Booked' to 'Waiting in Clinic' and activating their live queue spot.",
        priority: "High",
      },
      {
        id: "FR-004",
        title: "Dynamic Wait Time Calculation",
        description: "System shall compute estimated waiting time dynamically: (Patients ahead in 'Arrived' state) x (Rolling average duration of doctor's last 3 consultations).",
        priority: "Medium",
      },
      {
        id: "FR-005",
        title: "Live Token Tracker URL",
        description: "System shall generate a secure, tokenized web link sent to patient via SMS/WhatsApp showing: Current Token Serving, Your Token Number, and Estimated Waiting Minutes.",
        priority: "High",
      },
      {
        id: "FR-006",
        title: "Doctor Calling Console",
        description: "Doctor interface shall present a single-click 'Call Next Patient' button, which updates reception displays and triggers a buzz/notification to the target patient.",
        priority: "High",
      },
      {
        id: "FR-007",
        title: "Emergency Queue Priority Override",
        description: "Clinic staff shall have privileged permission to elevate an urgent emergency case to 'Immediate Next' with mandatory reason logging for audit.",
        priority: "Medium",
      },
      {
        id: "FR-008",
        title: "Automated Multi-Channel Reminders",
        description: "System shall automatically trigger WhatsApp and SMS notifications for booking confirmation, 2-hour pre-visit alert, and '2 patients ahead of you' queue warning.",
        priority: "Medium",
      },
    ],
    nonFunctionalRequirements: [
      {
        id: "NFR-001",
        category: "Performance",
        description: "Patient mobile live tracker and receptionist dashboard must refresh status within 1.5 seconds under standard 4G/LTE mobile networks.",
        metric: "< 1.5s page load; WebSocket/SSE status sync latency < 500ms.",
      },
      {
        id: "NFR-002",
        category: "Security",
        description: "All patient Personal Identifiable Information (PII) including phone numbers and visit notes must be encrypted at rest (AES-256) and in transit (TLS 1.3).",
        metric: "100% compliance with India Digital Personal Data Protection Act (DPDP) 2023.",
      },
      {
        id: "NFR-003",
        category: "Reliability",
        description: "The core queue management engine must maintain high availability during clinic operating hours (8:00 AM to 10:00 PM IST).",
        metric: "99.9% uptime during operational business hours.",
      },
      {
        id: "NFR-004",
        category: "Usability",
        description: "Receptionist check-in action must require no more than two screen taps or barcode scans to handle high rush hours smoothly.",
        metric: "Check-in completion time <= 15 seconds per patient.",
      },
      {
        id: "NFR-005",
        category: "Compliance",
        description: "System must retain audit logs for all queue overrides, cancellations, and staff actions for a minimum of 180 days.",
        metric: "Tamper-proof append-only audit trail.",
      },
    ],
    userStories: [
      {
        id: "US-001",
        role: "Patient",
        action: "book an appointment slot from my phone and receive an instant confirmation link",
        benefit: "I don't have to call during clinic rush hours or wait indefinitely in a crowded room",
        acceptanceCriteria: [
          "Given an available slot on the calendar, when the patient submits their name and 10-digit mobile number, then a booking confirmation is displayed immediately.",
          "Given a confirmed booking, when the automated messaging service executes, then a WhatsApp confirmation containing booking ID and directions is dispatched within 60 seconds.",
        ],
      },
      {
        id: "US-002",
        role: "Arriving Patient",
        action: "view my live position in line and estimated minutes left from a mobile link",
        benefit: "I can wait comfortably in a nearby coffee shop or park instead of an overcrowded waiting hall",
        acceptanceCriteria: [
          "Given the patient has arrived and checked in, when they open their tracking link, then they see: (a) Doctor Name, (b) Token Currently In Room, (c) Their Token, and (d) Dynamic Estimated Wait Time.",
          "Given another patient ahead completes consultation, when the doctor calls next, then the tracker updates the remaining count without requiring a manual browser refresh.",
        ],
      },
      {
        id: "US-003",
        role: "Clinic Receptionist",
        action: "mark a patient arrived or issue a walk-in token in under 15 seconds",
        benefit: "the front desk queue clears rapidly and the doctor's queue stays continuously populated",
        acceptanceCriteria: [
          "Given a patient standing at the counter, when the receptionist searches by phone number or booking ID, then clicking 'Mark Arrived' immediately moves them to active waiting status.",
          "Given a walk-in visitor without an advance booking, when the receptionist clicks 'New Walk-In', then the system assigns the next sequential token and displays estimated time.",
        ],
      },
      {
        id: "US-004",
        role: "Doctor",
        action: "click 'Call Next Patient' on my tablet or laptop when ready for the next consultation",
        benefit: "the next patient enters promptly without me having to step outside or ring a bell repeatedly",
        acceptanceCriteria: [
          "Given the doctor finishes with patient A, when they click 'Call Next', then patient B's status changes to 'In Consultation' and the waiting room display chimes and highlights Token B.",
        ],
      },
    ],
    businessRules: [
      {
        id: "BR-001",
        rule: "Grace Period for Late Arrivals",
        impact: "If a pre-booked patient fails to arrive within 15 minutes past their slot start time, their slot is downgraded to standby walk-in status to prevent blocking punctual patients.",
      },
      {
        id: "BR-002",
        rule: "Booking Cancellation Window",
        impact: "Patients may self-cancel or reschedule up to 2 hours prior to scheduled appointment time; later cancellations require receptionist approval.",
      },
      {
        id: "BR-003",
        rule: "Emergency Queue Priority Interleaving",
        impact: "Marking a patient as 'Emergency' inserts them directly into position #1 of the waiting queue; the previously scheduled patient receives an automated courtesy delay notification.",
      },
    ],
    dependenciesAndAssumptions: {
      dependencies: [
        { id: "DEP-001", description: "WhatsApp Business Cloud API account approval and SMS Gateway (e.g. Gupshup / Twilio / Kaleyra) for OTP and notification dispatch." },
        { id: "DEP-002", description: "Stable Wi-Fi or 4G broadband connectivity at the clinic premises for reception desk and doctor consoles." },
        { id: "DEP-003", description: "Standard modern browser (Chrome, Edge, Safari) compatible hardware (iPad, Android tablet, or desktop PC) at clinic front desk." },
      ],
      assumptions: [
        {
          id: "ASM-001",
          description: `[ASSUMPTION] Walk-in and advance booking coordination: ${q1Answer}`,
          impactIfNotMet: "Without clear walk-in interleaving, walk-in patients may wait indefinitely or booked patients will face unannounced delays.",
        },
        {
          id: "ASM-002",
          description: `[ASSUMPTION] Notification channel strategy: ${q2Answer}`,
          impactIfNotMet: "Patients without smartphone WhatsApp access will miss digital wait alerts if fallback SMS is omitted.",
        },
        {
          id: "ASM-003",
          description: `[ASSUMPTION] Billing and payment flow: ${q3Answer}`,
          impactIfNotMet: "Adding upfront payment processing in Phase 1 would expand MVP scope to include payment gateway KYC, refund reconciliation, and transaction fees.",
        },
        {
          id: "ASM-004",
          description: `[ASSUMPTION] Wait-time estimation logic: ${q4Answer}`,
          impactIfNotMet: "Fixed 15-minute assumption causes severe estimation drift during complicated diagnostic appointments.",
        },
      ],
    },
    risksAndOpenQuestions: {
      risks: [
        {
          id: "RSK-001",
          risk: "Elderly or tech-reluctant patients may not use the digital live tracking link.",
          mitigation: "Install a simple physical TV/monitor in the waiting room mirroring current token numbers and announce tokens via audio chime.",
          severity: "Medium",
        },
        {
          id: "RSK-002",
          risk: "Frequent WhatsApp API rate limiting or delivery delays during peak festival rush.",
          mitigation: "Implement automated fallback to transactional SMS when WhatsApp delivery receipts are not acknowledged within 90 seconds.",
          severity: "High",
        },
        {
          id: "RSK-003",
          risk: "Doctor consultation overrun causing accumulated backlog and patient complaints.",
          mitigation: "Auto-adjust subsequent estimated times in real-time and send proactive 'Doctor running 20 mins behind' notifications.",
          severity: "Medium",
        },
      ],
      openQuestions: [
        "Will multiple doctors share the same receptionist desk concurrently, requiring segregated doctor queues on a single clinic landing screen?",
        "Do specific recurring patients require automated recurring weekly slot reservations (e.g., physiotherapy or dialysis clinics)?",
        "Should patients be allowed to select specific appointment types (e.g., First Consultation 30m vs Follow-up 10m) with variable default durations?",
      ],
    },
    milestones: [
      {
        id: "M-001",
        phase: "Sprint 1: Core Foundation & Booking Engine",
        deliverables: ["Clinic setup wizard", "Doctor slot configuration", "Patient mobile booking portal", "SMS/WhatsApp booking confirmation integration"],
        estimatedWeeks: 2,
      },
      {
        id: "M-002",
        phase: "Sprint 2: Queue Engine & Receptionist Console",
        deliverables: ["Receptionist counter dashboard", "Walk-in token generation", "Arrival check-in status toggles", "Emergency priority override mechanism"],
        estimatedWeeks: 2,
      },
      {
        id: "M-003",
        phase: "Sprint 3: Doctor Calling View & Live Patient Tracker",
        deliverables: ["Doctor single-click consultation room view", "Dynamic wait-time computation engine", "Patient real-time live link with WebSocket updates", "Waiting room TV display view"],
        estimatedWeeks: 2,
      },
      {
        id: "M-004",
        phase: "Sprint 4: Pilot Deployment & Optimization",
        deliverables: ["Pilot launch in 2 partner clinics", "Receptionist onboarding & training", "Performance latency tuning", "Daily volume & wait-time analytics reporting"],
        estimatedWeeks: 1,
      },
    ],
    successMetrics: [
      {
        id: "SM-001",
        metric: "Average Patient Waiting Room Duration",
        target: "<= 18 minutes from arrival check-in to doctor entry",
        measurementMethod: "System timestamps comparing check-in timestamp with doctor consultation start timestamp.",
      },
      {
        id: "SM-002",
        metric: "Appointment No-Show Rate",
        target: "< 8% across all pre-booked appointments",
        measurementMethod: "Count of uncancelled booked slots marked 'No-Show' divided by total booked slots per calendar month.",
      },
      {
        id: "SM-003",
        metric: "Receptionist Check-In Velocity",
        target: "< 30 seconds per arriving patient",
        measurementMethod: "Time elapsed from searching patient record to confirming arrival status.",
      },
      {
        id: "SM-004",
        metric: "Patient Queue Transparency CSAT",
        target: ">= 90% positive feedback on wait-time clarity",
        measurementMethod: "Post-consultation automated 1-click WhatsApp feedback prompt (1 to 5 stars).",
      },
    ],
    markdownContent: "", // to be filled below
  };

  brd.markdownContent = convertStructuredBrdToMarkdown(brd);
  return brd;
}

export function convertStructuredBrdToMarkdown(brd: StructuredBRD): string {
  const { metadata, summary, businessObjectives, stakeholders, scope, functionalRequirements, nonFunctionalRequirements, userStories, businessRules, dependenciesAndAssumptions, risksAndOpenQuestions, milestones, successMetrics } = brd;

  return `# Business Requirements Document (BRD)
## ${metadata.projectName}

> **Document Engine:** ${metadata.engine}  
> **Generation Mode:** ${metadata.isDemo ? "DEMO MODE (Deterministic Simulation)" : "LIVE (Powered by Sarvam AI)"}  
> **Target Language:** ${metadata.targetLanguage}  
> **Generated Date:** ${new Date(metadata.generatedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}  
> **Model / Engine:** ${metadata.modelUsed || "BhashaBRD Engine"}

---

## 1. Executive Summary & Problem Statement

### 1.1 Executive Summary
${summary.executiveSummary}

### 1.2 Problem Statement
${summary.problemStatement}

### 1.3 Proposed Solution
${summary.proposedSolution}

---

## 2. Business Objectives

The key commercial and operational objectives for this initiative include:
${businessObjectives.map((obj, i) => `${i + 1}. **${obj}**`).join("\n")}

---

## 3. Stakeholders & Target Users

| Role | Operational Responsibilities |
| :--- | :--- |
${stakeholders.map((s) => `| **${s.role}** | ${s.responsibilities} |`).join("\n")}

---

## 4. Scope & Exclusions

### 4.1 In-Scope Deliverables
${scope.inScope.map((item) => `- [x] ${item}`).join("\n")}

### 4.2 Out-of-Scope (Future Phases / Excluded)
${scope.outOfScope.map((item) => `- [ ] ${item}`).join("\n")}

---

## 5. Functional Requirements

| Requirement ID | Feature Title | Detailed Specification | Priority |
| :--- | :--- | :--- | :--- |
${functionalRequirements.map((fr) => `| **${fr.id}** | ${fr.title} | ${fr.description} | \`${fr.priority}\` |`).join("\n")}

---

## 6. Non-Functional Requirements

| ID | Category | Requirement Specification | Verification Metric |
| :--- | :--- | :--- | :--- |
${nonFunctionalRequirements.map((nfr) => `| **${nfr.id}** | \`${nfr.category}\` | ${nfr.description} | ${nfr.metric} |`).join("\n")}

---

## 7. User Stories & Acceptance Criteria

${userStories
  .map(
    (us) => `### Story ${us.id}: ${us.role}
**As a** ${us.role},  
**I want to** ${us.action},  
**So that** ${us.benefit}.

**Acceptance Criteria:**
${us.acceptanceCriteria.map((ac) => `- ${ac}`).join("\n")}
`
  )
  .join("\n")}

---

## 8. Business Rules & Governance

| Rule ID | Rule Statement | System Operational Impact |
| :--- | :--- | :--- |
${businessRules.map((br) => `| **${br.id}** | ${br.rule} | ${br.impact} |`).join("\n")}

---

## 9. Dependencies & Assumptions

> **CRITICAL NOTE ON ASSUMPTIONS:** The following assumptions have been made to proceed with the MVP specification. They are explicitly distinguished from verified operational facts.

### 9.1 Technical & Operational Dependencies
${dependenciesAndAssumptions.dependencies.map((d) => `- **${d.id}**: ${d.description}`).join("\n")}

### 9.2 Explicit Assumptions
${dependenciesAndAssumptions.assumptions.map((a) => `- **${a.id}**: ${a.description}\n  *Risk if invalid:* ${a.impactIfNotMet}`).join("\n")}

---

## 10. Risks & Open Questions

### 10.1 Identified Risks & Mitigation
| Risk ID | Risk Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
${risksAndOpenQuestions.risks.map((r) => `| **${r.id}** | ${r.risk} | \`${r.severity}\` | ${r.mitigation} |`).join("\n")}

### 10.2 Open Questions Requiring Client Confirmation
${risksAndOpenQuestions.openQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

---

## 11. Suggested Delivery Milestones

| Milestone ID | Phase Name | Key Deliverables | Estimated Duration |
| :--- | :--- | :--- | :--- |
${milestones.map((m) => `| **${m.id}** | ${m.phase} | ${m.deliverables.join(", ")} | ${m.estimatedWeeks} Weeks |`).join("\n")}

---

## 12. Success Metrics & KPIs

| Metric ID | Target Metric | Success Benchmark | Measurement Methodology |
| :--- | :--- | :--- | :--- |
${successMetrics.map((sm) => `| **${sm.id}** | ${sm.metric} | **${sm.target}** | ${sm.measurementMethod} |`).join("\n")}
`;
}
