# AFTERMATH — Threat Model & Security Posture

**Document Version:** 1.0.0  
**Classification:** STRIDE Threat Analysis  

---

## 1. Asset Classification

| Asset | Sensitivity | Impact of Compromise |
| :--- | :--- | :--- |
| **Executed Contracts & Leases** | High / Confidential | Disclosure of private salary, financial liability, or proprietary terms. |
| **Personal Identifiers (SSN, IBAN)** | Critical / PII | Identity theft, unauthorized financial access. |
| **Commitment Graph & Scenarios** | High / Proprietary | Exposing prospective career moves, business decisions, or personal life changes. |
| **Document Vault Hashes** | Medium / Integrity | Risk of evidence tampering or offset spoofing. |

---

## 2. STRIDE Threat Analysis & Mitigations

### 2.1 Spoofing (Identity & Origin)
- **Threat:** Malicious actor uploads forged agreement claiming to be counterparty.
- **Mitigation:** Cryptographic hashing (`sha256`) of uploaded blobs; human-in-the-loop verification gate; document versioning immutability.

### 2.2 Tampering (Data Modification)
- **Threat:** Modification of character offsets in evidence spans to cite unrelated or fabricated clauses.
- **Mitigation:** Character boundaries `[StartChar..EndChar]` verified against raw immutable blob text before creating evidence records. Any offset drift immediately invalidates citation integrity.

### 2.3 Repudiation (Denial of Action)
- **Threat:** User or system disputes whether a fact was verified or rejected.
- **Mitigation:** Immutable `VerificationAction` audit log recording user action, timestamp, and edited value.

### 2.4 Information Disclosure (Leakage)
- **Threat:** Sensitive salaries or SSNs leaked through application logs, error traces, or prompt completions.
- **Mitigation:** Pre-extraction regex PII redactor; `ThreatGate.sanitize_log_message` actively cleans stdout/stderr log streams; local-only execution mode.

### 2.5 Denial of Service (DoS)
- **Threat:** Attacker uploads multi-gigabyte files, ZIP decompression bombs, or recursive nested PDF object loops.
- **Mitigation:** Hard 20 MB size ceiling; magic header validation before parser invocation; strict timeout limits on document layout parsers.

### 2.6 Elevation of Privilege / Injection
- **Threat:** Prompt injection payloads embedded within user contracts attempting to commandeer LLM extraction logic or induce SSRF.
- **Mitigation:** `ThreatGate.scan_and_neutralize_prompt_injection` strips adversarial instruction prefixes; SSRF barrier blocks internal subnets (`169.254.169.254`, `127.0.0.1`, RFC 1918).
