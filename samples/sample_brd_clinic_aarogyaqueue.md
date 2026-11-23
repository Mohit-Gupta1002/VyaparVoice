# Business Requirements Document (BRD)
## AarogyaQueue - Smart Clinic Appointment & Queue Manager

> **Document Engine:** BhashaBRD Engine  
> **Generation Mode:** DEMO MODE (Deterministic Simulation)  
> **Target Language:** en-IN  
> **Generated Date:** October 31, 2026  
> **Model / Engine:** Deterministic Simulation (No Sarvam API Key Configured)

---

## 1. Executive Summary & Problem Statement

### 1.1 Executive Summary
A streamlined digital management solution designed for single-specialty and multi-doctor outpatient clinics. It bridges the gap between pre-booked appointments and physical waiting rooms, providing transparent real-time wait estimation for patients while automating receptionist triage and doctor consultation flow.

### 1.2 Problem Statement
Small clinics currently struggle with chaotic waiting room congestion, unpredictable patient waiting durations (often exceeding 45-60 minutes), frequent no-shows, and receptionist burnout caused by repetitive manual queue inquiries. Patients lack visibility into real-time delay status.

### 1.3 Proposed Solution
A cloud-based responsive web application that enables multi-channel appointment booking, automated appointment reminders, on-arrival QR check-in, dynamic live queue token tracking, and a real-time status dashboard for doctors and receptionists.

---

## 2. Business Objectives

The key commercial and operational objectives for this initiative include:
1. **Reduce average patient waiting room congestion by 40% within 90 days of clinic deployment.**
2. **Lower appointment no-show rates from the industry baseline of 28% to under 10% via proactive automated reminders.**
3. **Eliminate manual paper token registers and cut receptionist triage time per patient from 4 minutes to under 45 seconds.**
4. **Achieve patient satisfaction (CSAT) rating of >= 4.5/5 on transparency of consultation scheduling.**

---

## 3. Stakeholders & Target Users

| Role | Operational Responsibilities |
| :--- | :--- |
| **Patients / Caregivers** | Book appointment slots, view queue position from mobile browser, check-in upon arrival, and receive schedule notifications. |
| **Clinic Receptionist / Admin Staff** | Validate bookings, generate tokens for walk-in patients, mark patient arrivals, handle emergency queue overrides, and collect fees. |
| **Consulting Doctors** | View current waiting queue, call the next patient, log consultation start/end timestamps, and mark break/delay intervals. |
| **Clinic Owner / Practice Manager** | Review daily footfall reports, monitor peak waiting times, audit doctor turnaround benchmarks, and configure clinic timings. |

---

## 4. Scope & Exclusions

### 4.1 In-Scope Deliverables
- [x] Patient mobile-friendly web portal for slot selection and token status tracking without mandatory app downloads.
- [x] Receptionist desk console for queue management, walk-in creation, and check-in confirmation.
- [x] Doctor consultation room view with 'Call Next Patient' and 'Start/Complete Consultation' controls.
- [x] Automated WhatsApp & SMS reminder alerts (24-hour and 2-hour pre-appointment).
- [x] Dynamic estimated wait time calculation based on real-time doctor consultation pace.
- [x] End-of-day analytics export in CSV format covering patient volume and queue wait times.

### 4.2 Out-of-Scope (Future Phases / Excluded)
- [ ] Full Electronic Health Records (EHR) or complex diagnostic prescription writing (Phase 2).
- [ ] Direct insurance pre-authorization or TPA claim settlements.
- [ ] In-app video teleconsultation streaming (in-person physical clinic visits prioritized).
- [ ] Pharmacy inventory management and drug dispensing hardware integration.

---

## 5. Functional Requirements

| Requirement ID | Feature Title | Detailed Specification | Priority |
| :--- | :--- | :--- | :--- |
| **FR-001** | Patient Self-Service Appointment Booking | System shall allow patients to select a doctor, consultation date, available 15-minute slot, enter patient name, phone number, and brief reason for visit. | `High` |
| **FR-002** | Walk-In Token Registration | System shall allow the receptionist to create instant walk-in tokens with auto-assigned priority numbers interleaved seamlessly into the active queue. | `High` |
| **FR-003** | Patient Arrival Check-In | System shall permit receptionists to mark pre-booked patients as 'Arrived', changing their status from 'Booked' to 'Waiting in Clinic' and activating their live queue spot. | `High` |
| **FR-004** | Dynamic Wait Time Calculation | System shall compute estimated waiting time dynamically: (Patients ahead in 'Arrived' state) x (Rolling average duration of doctor's last 3 consultations). | `Medium` |
| **FR-005** | Live Token Tracker URL | System shall generate a secure, tokenized web link sent to patient via SMS/WhatsApp showing: Current Token Serving, Your Token Number, and Estimated Waiting Minutes. | `High` |
| **FR-006** | Doctor Calling Console | Doctor interface shall present a single-click 'Call Next Patient' button, which updates reception displays and triggers a buzz/notification to the target patient. | `High` |
| **FR-007** | Emergency Queue Priority Override | Clinic staff shall have privileged permission to elevate an urgent emergency case to 'Immediate Next' with mandatory reason logging for audit. | `Medium` |
| **FR-008** | Automated Multi-Channel Reminders | System shall automatically trigger WhatsApp and SMS notifications for booking confirmation, 2-hour pre-visit alert, and '2 patients ahead of you' queue warning. | `Medium` |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement Specification | Verification Metric |
| :--- | :--- | :--- | :--- |
| **NFR-001** | `Performance` | Patient mobile live tracker and receptionist dashboard must refresh status within 1.5 seconds under standard 4G/LTE mobile networks. | < 1.5s page load; WebSocket/SSE status sync latency < 500ms. |
| **NFR-002** | `Security` | All patient Personal Identifiable Information (PII) including phone numbers and visit notes must be encrypted at rest (AES-256) and in transit (TLS 1.3). | 100% compliance with India Digital Personal Data Protection Act (DPDP) 2023. |
| **NFR-003** | `Reliability` | The core queue management engine must maintain high availability during clinic operating hours (8:00 AM to 10:00 PM IST). | 99.9% uptime during operational business hours. |
| **NFR-004** | `Usability` | Receptionist check-in action must require no more than two screen taps or barcode scans to handle high rush hours smoothly. | Check-in completion time <= 15 seconds per patient. |
| **NFR-005** | `Compliance` | System must retain audit logs for all queue overrides, cancellations, and staff actions for a minimum of 180 days. | Tamper-proof append-only audit trail. |

---

## 7. User Stories & Acceptance Criteria

### Story US-001: Patient
**As a** Patient,  
**I want to** book an appointment slot from my phone and receive an instant confirmation link,  
**So that** I don't have to call during clinic rush hours or wait indefinitely in a crowded room.

**Acceptance Criteria:**
- Given an available slot on the calendar, when the patient submits their name and 10-digit mobile number, then a booking confirmation is displayed immediately.
- Given a confirmed booking, when the automated messaging service executes, then a WhatsApp confirmation containing booking ID and directions is dispatched within 60 seconds.

### Story US-002: Arriving Patient
**As a** Arriving Patient,  
**I want to** view my live position in line and estimated minutes left from a mobile link,  
**So that** I can wait comfortably in a nearby coffee shop or park instead of an overcrowded waiting hall.

**Acceptance Criteria:**
- Given the patient has arrived and checked in, when they open their tracking link, then they see: (a) Doctor Name, (b) Token Currently In Room, (c) Their Token, and (d) Dynamic Estimated Wait Time.
- Given another patient ahead completes consultation, when the doctor calls next, then the tracker updates the remaining count without requiring a manual browser refresh.

### Story US-003: Clinic Receptionist
**As a** Clinic Receptionist,  
**I want to** mark a patient arrived or issue a walk-in token in under 15 seconds,  
**So that** the front desk queue clears rapidly and the doctor's queue stays continuously populated.

**Acceptance Criteria:**
- Given a patient standing at the counter, when the receptionist searches by phone number or booking ID, then clicking 'Mark Arrived' immediately moves them to active waiting status.
- Given a walk-in visitor without an advance booking, when the receptionist clicks 'New Walk-In', then the system assigns the next sequential token and displays estimated time.

### Story US-004: Doctor
**As a** Doctor,  
**I want to** click 'Call Next Patient' on my tablet or laptop when ready for the next consultation,  
**So that** the next patient enters promptly without me having to step outside or ring a bell repeatedly.

**Acceptance Criteria:**
- Given the doctor finishes with patient A, when they click 'Call Next', then patient B's status changes to 'In Consultation' and the waiting room display chimes and highlights Token B.

---

## 8. Business Rules & Governance

| Rule ID | Rule Statement | System Operational Impact |
| :--- | :--- | :--- |
| **BR-001** | Grace Period for Late Arrivals | If a pre-booked patient fails to arrive within 15 minutes past their slot start time, their slot is downgraded to standby walk-in status to prevent blocking punctual patients. |
| **BR-002** | Booking Cancellation Window | Patients may self-cancel or reschedule up to 2 hours prior to scheduled appointment time; later cancellations require receptionist approval. |
| **BR-003** | Emergency Queue Priority Interleaving | Marking a patient as 'Emergency' inserts them directly into position #1 of the waiting queue; the previously scheduled patient receives an automated courtesy delay notification. |

---

## 9. Dependencies & Assumptions

> **CRITICAL NOTE ON ASSUMPTIONS:** The following assumptions have been made to proceed with the MVP specification. They are explicitly distinguished from verified operational facts.

### 9.1 Technical & Operational Dependencies
- **DEP-001**: WhatsApp Business Cloud API account approval and SMS Gateway (e.g. Gupshup / Twilio / Kaleyra) for OTP and notification dispatch.
- **DEP-002**: Stable Wi-Fi or 4G broadband connectivity at the clinic premises for reception desk and doctor consoles.
- **DEP-003**: Standard modern browser (Chrome, Edge, Safari) compatible hardware (iPad, Android tablet, or desktop PC) at clinic front desk.

### 9.2 Explicit Assumptions
- **ASM-001**: [ASSUMPTION] Walk-in and advance booking coordination: The system will support both advance slot bookings and on-the-spot walk-in token generation, with priority given to scheduled slots within a 15-minute window.  
  *Risk if invalid:* Without clear walk-in interleaving, walk-in patients may wait indefinitely or booked patients will face unannounced delays.
- **ASM-002**: [ASSUMPTION] Notification channel strategy: Automated reminders will be dispatched via WhatsApp Business API and fallback SMS 24 hours and 2 hours before the appointment.  
  *Risk if invalid:* Patients without smartphone WhatsApp access will miss digital wait alerts if fallback SMS is omitted.
- **ASM-003**: [ASSUMPTION] Billing and payment flow: Phase 1 will record payment status upon clinic arrival (Cash / Clinic UPI QR), with integrated online pre-payment deferred to Phase 2.  
  *Risk if invalid:* Adding upfront payment processing in Phase 1 would expand MVP scope to include payment gateway KYC, refund reconciliation, and transaction fees.
- **ASM-004**: [ASSUMPTION] Wait-time estimation logic: Dynamic rolling average based on the last 3 completed consultations plus the count of arrived patients ahead in the queue.  
  *Risk if invalid:* Fixed 15-minute assumption causes severe estimation drift during complicated diagnostic appointments.

---

## 10. Risks & Open Questions

### 10.1 Identified Risks & Mitigation
| Risk ID | Risk Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **RSK-001** | Elderly or tech-reluctant patients may not use the digital live tracking link. | `Medium` | Install a simple physical TV/monitor in the waiting room mirroring current token numbers and announce tokens via audio chime. |
| **RSK-002** | Frequent WhatsApp API rate limiting or delivery delays during peak festival rush. | `High` | Implement automated fallback to transactional SMS when WhatsApp delivery receipts are not acknowledged within 90 seconds. |
| **RSK-003** | Doctor consultation overrun causing accumulated backlog and patient complaints. | `Medium` | Auto-adjust subsequent estimated times in real-time and send proactive 'Doctor running 20 mins behind' notifications. |

### 10.2 Open Questions Requiring Client Confirmation
1. Will multiple doctors share the same receptionist desk concurrently, requiring segregated doctor queues on a single clinic landing screen?
2. Do specific recurring patients require automated recurring weekly slot reservations (e.g., physiotherapy or dialysis clinics)?
3. Should patients be allowed to select specific appointment types (e.g., First Consultation 30m vs Follow-up 10m) with variable default durations?

---

## 11. Suggested Delivery Milestones

| Milestone ID | Phase Name | Key Deliverables | Estimated Duration |
| :--- | :--- | :--- | :--- |
| **M-001** | Sprint 1: Core Foundation & Booking Engine | Clinic setup wizard, Doctor slot configuration, Patient mobile booking portal, SMS/WhatsApp booking confirmation integration | 2 Weeks |
| **M-002** | Sprint 2: Queue Engine & Receptionist Console | Receptionist counter dashboard, Walk-in token generation, Arrival check-in status toggles, Emergency priority override mechanism | 2 Weeks |
| **M-003** | Sprint 3: Doctor Calling View & Live Patient Tracker | Doctor single-click consultation room view, Dynamic wait-time computation engine, Patient real-time live link with WebSocket updates, Waiting room TV display view | 2 Weeks |
| **M-004** | Sprint 4: Pilot Deployment & Optimization | Pilot launch in 2 partner clinics, Receptionist onboarding & training, Performance latency tuning, Daily volume & wait-time analytics reporting | 1 Weeks |

---

## 12. Success Metrics & KPIs

| Metric ID | Target Metric | Success Benchmark | Measurement Methodology |
| :--- | :--- | :--- | :--- |
| **SM-001** | Average Patient Waiting Room Duration | **<= 18 minutes from arrival check-in to doctor entry** | System timestamps comparing check-in timestamp with doctor consultation start timestamp. |
| **SM-002** | Appointment No-Show Rate | **< 8% across all pre-booked appointments** | Count of uncancelled booked slots marked 'No-Show' divided by total booked slots per calendar month. |
| **SM-003** | Receptionist Check-In Velocity | **< 30 seconds per arriving patient** | Time elapsed from searching patient record to confirming arrival status. |
| **SM-004** | Patient Queue Transparency CSAT | **>= 90% positive feedback on wait-time clarity** | Post-consultation automated 1-click WhatsApp feedback prompt (1 to 5 stars). |
