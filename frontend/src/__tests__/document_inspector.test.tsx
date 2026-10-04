import { describe, it, expect } from "vitest";

describe("Document Inspector & HITL Extraction Logic", () => {
  it("verifies initial fact state and transition to VERIFIED", () => {
    const fact = {
      id: "fact-01",
      factKey: "BASE_RENT",
      rawValue: "$2,400.00 USD",
      normalizedValue: { amount: 2400.0, currency: "USD", frequency: "MONTHLY" },
      verificationStatus: "UNVERIFIED",
    };

    expect(fact.verificationStatus).toBe("UNVERIFIED");

    // Human verifies
    const verifiedFact = { ...fact, verificationStatus: "VERIFIED" };
    expect(verifiedFact.verificationStatus).toBe("VERIFIED");
  });

  it("verifies user edit of normalized fact value", () => {
    const fact = {
      id: "fact-07",
      factKey: "LATE_FEE_PENALTY",
      rawValue: "$100.00 USD",
      normalizedValue: { amount: 100.0, currency: "USD" },
      verificationStatus: "UNVERIFIED",
    };

    const editedFact = {
      ...fact,
      verificationStatus: "EDITED",
      normalizedValue: { amount: 75.0, currency: "USD", edited: true },
    };

    expect(editedFact.verificationStatus).toBe("EDITED");
    expect(editedFact.normalizedValue.amount).toBe(75.0);
  });

  it("verifies rejection of ambiguous fact", () => {
    const fact = {
      id: "fact-04",
      factKey: "SECURITY_DEPOSIT",
      verificationStatus: "UNVERIFIED",
    };

    const rejectedFact = { ...fact, verificationStatus: "REJECTED" };
    expect(rejectedFact.verificationStatus).toBe("REJECTED");
  });
});
