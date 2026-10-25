import { describe, it, expect } from "vitest";
import { generateDemoBRD, convertStructuredBrdToMarkdown, DEMO_CLARIFICATION_QUESTIONS } from "../lib/demo-data";
import { DEFAULT_SAMPLE_IDEA } from "../lib/constants";

describe("BhashaBRD Engine & BRD Generation", () => {
  it("generates all 12 required enterprise BRD sections", () => {
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);

    // 1. Summary and problem statement
    expect(brd.summary.executiveSummary).toBeTruthy();
    expect(brd.summary.problemStatement).toBeTruthy();
    expect(brd.summary.proposedSolution).toBeTruthy();

    // 2. Business objectives
    expect(brd.businessObjectives.length).toBeGreaterThanOrEqual(3);

    // 3. Stakeholders and target users
    expect(brd.stakeholders.length).toBeGreaterThanOrEqual(3);
    const roles = brd.stakeholders.map((s) => s.role);
    expect(roles.some((r) => r.includes("Patient"))).toBe(true);
    expect(roles.some((r) => r.includes("Doctor"))).toBe(true);

    // 4. Scope and exclusions
    expect(brd.scope.inScope.length).toBeGreaterThanOrEqual(3);
    expect(brd.scope.outOfScope.length).toBeGreaterThanOrEqual(2);

    // 5. Functional requirements with IDs
    expect(brd.functionalRequirements.length).toBeGreaterThanOrEqual(5);
    brd.functionalRequirements.forEach((fr) => {
      expect(fr.id).toMatch(/^FR-\d{3}$/);
      expect(fr.title).toBeTruthy();
      expect(fr.description).toBeTruthy();
      expect(["High", "Medium", "Low"]).toContain(fr.priority);
    });

    // 6. Non-functional requirements with IDs
    expect(brd.nonFunctionalRequirements.length).toBeGreaterThanOrEqual(4);
    brd.nonFunctionalRequirements.forEach((nfr) => {
      expect(nfr.id).toMatch(/^NFR-\d{3}$/);
      expect(nfr.metric).toBeTruthy();
    });

    // 7. User stories and acceptance criteria
    expect(brd.userStories.length).toBeGreaterThanOrEqual(3);
    brd.userStories.forEach((us) => {
      expect(us.id).toMatch(/^US-\d{3}$/);
      expect(us.role).toBeTruthy();
      expect(us.acceptanceCriteria.length).toBeGreaterThanOrEqual(1);
    });

    // 8. Business rules and constraints
    expect(brd.businessRules.length).toBeGreaterThanOrEqual(2);
    brd.businessRules.forEach((brItem) => {
      expect(brItem.id).toMatch(/^BR-\d{3}$/);
      expect(brItem.impact).toBeTruthy();
    });

    // 9. Dependencies and assumptions
    expect(brd.dependenciesAndAssumptions.dependencies.length).toBeGreaterThanOrEqual(2);
    expect(brd.dependenciesAndAssumptions.assumptions.length).toBeGreaterThanOrEqual(2);
    brd.dependenciesAndAssumptions.assumptions.forEach((a) => {
      expect(a.id).toMatch(/^ASM-\d{3}$/);
      // Verify assumptions are explicitly labelled and never presented as confirmed facts
      expect(a.description).toContain("[ASSUMPTION]");
      expect(a.impactIfNotMet).toBeTruthy();
    });

    // 10. Risks and open questions
    expect(brd.risksAndOpenQuestions.risks.length).toBeGreaterThanOrEqual(2);
    expect(brd.risksAndOpenQuestions.openQuestions.length).toBeGreaterThanOrEqual(2);

    // 11. Suggested milestones
    expect(brd.milestones.length).toBeGreaterThanOrEqual(3);
    brd.milestones.forEach((m) => {
      expect(m.id).toMatch(/^M-\d{3}$/);
      expect(m.estimatedWeeks).toBeGreaterThan(0);
    });

    // 12. Success metrics
    expect(brd.successMetrics.length).toBeGreaterThanOrEqual(3);
    brd.successMetrics.forEach((sm) => {
      expect(sm.id).toMatch(/^SM-\d{3}$/);
      expect(sm.target).toBeTruthy();
    });
  });

  it("incorporates custom clarification answers while retaining explicit assumptions", () => {
    const customAnswers = {
      "Q-1": "Strictly advance bookings only; no walk-ins allowed.",
      "Q-2": "SMS only, no WhatsApp.",
    };

    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA, customAnswers);
    const assumption1 = brd.dependenciesAndAssumptions.assumptions.find((a) => a.id === "ASM-001");
    expect(assumption1?.description).toContain("Strictly advance bookings only");
  });

  it("produces valid markdown with tables and proper headers", () => {
    const brd = generateDemoBRD(DEFAULT_SAMPLE_IDEA);
    const markdown = convertStructuredBrdToMarkdown(brd);

    expect(markdown).toContain("# Business Requirements Document (BRD)");
    expect(markdown).toContain("## 1. Executive Summary & Problem Statement");
    expect(markdown).toContain("## 2. Business Objectives");
    expect(markdown).toContain("## 3. Stakeholders & Target Users");
    expect(markdown).toContain("## 4. Scope & Exclusions");
    expect(markdown).toContain("## 5. Functional Requirements");
    expect(markdown).toContain("## 6. Non-Functional Requirements");
    expect(markdown).toContain("## 7. User Stories & Acceptance Criteria");
    expect(markdown).toContain("## 8. Business Rules & Governance");
    expect(markdown).toContain("## 9. Dependencies & Assumptions");
    expect(markdown).toContain("## 10. Risks & Open Questions");
    expect(markdown).toContain("## 11. Suggested Delivery Milestones");
    expect(markdown).toContain("## 12. Success Metrics & KPIs");
    expect(markdown).toContain("| Requirement ID | Feature Title | Detailed Specification | Priority |");
  });

  it("provides deterministic clarification questions", () => {
    expect(DEMO_CLARIFICATION_QUESTIONS.length).toBeGreaterThanOrEqual(3);
    DEMO_CLARIFICATION_QUESTIONS.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.defaultAssumption).toBeTruthy();
    });
  });
});
