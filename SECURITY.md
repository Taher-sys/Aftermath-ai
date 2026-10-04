# Security Policy — AFTERMATH

## 1. Security Architecture & Commitments

AFTERMATH processes sensitive human legal instruments: employment agreements, residential leases, intellectual property assignments, debt instruments, and financial covenants. Security is treated as an immutable core constraint.

### Core Architectural Guarantees:
1. **Local-Only Execution:** Users can run all extraction, layout parsing, and what-if simulation offline via local CPU/ONNX with **zero bytes of network egress**.
2. **Zero AI Training Guarantee:** User contracts and extracted facts are **never** used to train commercial or open foundation models.
3. **Pre-Extraction PII Redaction:** Sensitive personal identifiers (SSNs, bank accounts, credit cards, telephone numbers, and street addresses) are redacted client-side or before model dispatch.
4. **Safe Logging (Zero Log Leakage):** All application log sinks pass through a deterministic PII scrubber that redacts secrets, tokens, and personal descriptors.
5. **Cryptographic Erasure:** Workspace purges execute immediate file deletion, database record deletion with cascading integrity, and issuance of a SHA-256 erasure receipt.

---

## 2. Threat Defense Mechanisms

| Threat Vector | Defense Mechanism | Enforcement Point |
| :--- | :--- | :--- |
| **Malicious Executables (PE, ELF, Mach-O)** | Magic byte header inspection (`MZ`, `\x7fELF`, Mach-O magic numbers) and file extension rejection | Ingestion Barrier (`ThreatGate.scan_file_binary`) |
| **Oversized Payloads / DoS** | Strict 20 MB file size cap enforced before memory allocation | Upload Validator (`ThreatGate.scan_file_binary`) |
| **Malformed PDF Exploits** | Strict `%PDF-` header and `%%EOF` trailer verification | Parser Validator (`ThreatGate.validate_pdf_safety`) |
| **Adversarial Prompt Injections** | Regex pattern matching for system prompt override attempts; neutralized before parsing | Extraction Gate (`ThreatGate.scan_and_neutralize_prompt_injection`) |
| **SSRF & Loopback Probing** | Blocking of loopback (`127.0.0.1`), cloud metadata (`169.254.169.254`), and RFC 1918 private subnets | Web Ingestion (`ThreatGate.validate_ssrf`) |
| **Sensitive Log Leakage** | Automated token scrubber redacting SSNs, passwords, and API keys | Application Log Sinks (`ThreatGate.sanitize_log_message`) |

---

## 3. Reporting a Vulnerability

We welcome security vulnerability reports from the open-source and security research communities.

To report a vulnerability:
- **Email:** `security@aftermath-ai.org` (or open a confidential security advisory on GitHub).
- **PGP Key:** Available upon request or in repository metadata.
- **Response Timeline:** We acknowledge receipt within 24 hours and aim to release a remediation patch within 72 hours for critical severity findings.
- **Public Disclosure:** Please allow 30 days for remediation before public disclosure.
