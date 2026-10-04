# AFTERMATH — Privacy Architecture & Data Sovereignty Specification

**Document Version:** 1.0.0  
**Status:** Approved Architectural Standard  

---

## 1. Principles of Data Sovereignty

AFTERMATH is built to evaluate commitments that involve personal finances, salary numbers, home addresses, non-compete geographic restrictions, and intellectual property transfers. 

We adhere to **Three Absolute Privacy Laws**:
1. **The User Owns the Data:** Legal documents, extracted facts, and simulation histories belong 100% to the user.
2. **Zero Third-Party Model Training:** No agreement or excerpt uploaded to AFTERMATH will ever be incorporated into model fine-tuning sets or telemetry logs.
3. **Air-Gapped Local Processing Capability:** The entire document understanding, layout parsing, constraint checking, and scenario engine can execute offline without internet connectivity.

---

## 2. Privacy Mode Architecture

```
[ Ingested Document ]
          │
          ▼
[ Pre-Extraction PII Redaction Filter ]
  ├── SSN Regex Scrubber (\b\d{3}-\d{2}-\d{4}\b) ───────> [SSN_REDACTED]
  ├── Bank IBAN Scrubber ─────────────────────────────────> [BANK_IBAN_REDACTED]
  ├── Phone & Email Scrubber ─────────────────────────────> [EMAIL_REDACTED]
  └── Physical Street Address Scrubber ───────────────────> [STREET_ADDRESS_REDACTED]
          │
          ├─── [ Local-Only Mode: ON ] ───> Local CPU / ONNX Model Core (0 Bytes Egress)
          │
          └─── [ Local-Only Mode: OFF ] ──> Sanitized Tokens with Encrypted TLS 1.3
```

---

## 3. Retention Policies & Cryptographic Purge

Users can configure retention lifecycles at the workspace level:
- **`ZERO_RETENTION`:** All document binaries and derived intermediate representations are purged immediately upon session termination.
- **`RETENTION_30_DAYS`:** Intermediate representations are cached in an encrypted local store for 30 days, then purged automatically.
- **`PERMANENT`:** Data persists until explicit user-directed purge.

### Cryptographic Erasure Certificate
When a purge is executed:
1. Document vault binary files are overwritten and deleted from the filesystem.
2. Relational database rows across `documents`, `document_versions`, `extracted_facts`, `commitments`, and `scenarios` are dropped with cascading foreign key integrity.
3. An immutable SHA-256 cryptographic purge receipt is generated:
   $$\text{Digest} = \text{SHA256}(\text{PurgeID} \parallel \text{WorkspaceID} \parallel \text{DocCount} \parallel \text{Timestamp})$$
