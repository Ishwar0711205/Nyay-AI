"""
Nyay AI — Fast, Isolated Unit Test Suite
Mocks out heavy PyTorch/Chroma embeddings to test business logic instantly.
"""

import unittest
from unittest.mock import MagicMock, patch
from pathlib import Path
import os
import json
import time
import sys

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Mock out heavy embedding model loading and Chroma PersistentClient for unit testing
mock_hf = MagicMock()
sys.modules["langchain_huggingface"] = mock_hf
mock_chroma_mod = MagicMock()
sys.modules["langchain_chroma"] = mock_chroma_mod

# Provide a mock official_store collection
mock_store_inst = MagicMock()
mock_store_inst._collection.count.return_value = 5259
mock_chroma_mod.Chroma.return_value = mock_store_inst

from backend.app import (
    _resolve_dir,
    _b64e,
    _b64d,
    _jwt_encode,
    _jwt_decode,
    _password_hash,
    _password_ok,
    _safe_workspace,
    _workspace_for_user,
    clean_text,
    sentence_chunks,
    CitationConfidenceAgent,
    QueryRequest,
    AskRequest,
    CONFIDENCE_THRESHOLD,
)
from langchain_core.documents import Document


class TestConfigurationAndPaths(unittest.TestCase):
    def test_resolve_dir_relative(self):
        resolved = _resolve_dir("CHROMA_PATH", BASE_DIR / "database" / "chroma_final")
        self.assertTrue(resolved.is_absolute())
        self.assertTrue(str(resolved).startswith(str(BASE_DIR)))

    def test_safe_workspace_sanitization(self):
        raw = "../../etc/passwd!@#$Advocate-123"
        safe = _safe_workspace(raw)
        self.assertNotIn("..", safe)
        self.assertNotIn("/", safe)
        self.assertNotIn("\\", safe)
        self.assertTrue(safe.startswith("______etc_passwd____Advocate-123"))


class TestAuthenticationSecurity(unittest.TestCase):
    def test_password_hash_and_verify(self):
        pwd = "SecretLawPassword2026!"
        hashed = _password_hash(pwd)
        self.assertTrue(_password_ok(pwd, hashed))
        self.assertFalse(_password_ok("WrongPassword", hashed))

    def test_jwt_lifecycle(self):
        payload = {"sub": "42", "username": "advocate_test", "workspace_id": "ws_test", "exp": int(time.time()) + 3600}
        token = _jwt_encode(payload)
        decoded = _jwt_decode(token)
        self.assertEqual(decoded["sub"], "42")
        self.assertEqual(decoded["username"], "advocate_test")

    def test_workspace_isolation_guard(self):
        user = {"workspace_id": "tenant_alpha"}
        # Same workspace: allowed
        self.assertEqual(_workspace_for_user(user, "tenant_alpha"), "tenant_alpha")
        # Attempting to access another workspace: raises 403 HTTPException
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            _workspace_for_user(user, "tenant_bravo")
        self.assertEqual(ctx.exception.status_code, 403)


class TestChunkingAndPreprocessing(unittest.TestCase):
    def test_clean_text(self):
        raw = "Maharashtra  \xad  Rent \n\n\n\nControl   Act\n 42 \n"
        cleaned = clean_text(raw)
        self.assertNotIn("\xad", cleaned)
        self.assertEqual(cleaned, "Maharashtra Rent\n\nControl Act")

    def test_sentence_chunks_overlap(self):
        sample = ". ".join([f"Sentence {i} establishes statutory rule {i}" for i in range(1, 100)])
        chunks = sentence_chunks(sample, size=50, overlap=10)
        self.assertGreater(len(chunks), 1)
        for c in chunks:
            self.assertTrue(len(c.strip()) > 0)


class TestCitationConfidenceAgentDecoupling(unittest.TestCase):
    def setUp(self):
        self.agent = CitationConfidenceAgent()
        self.mock_docs = [
            Document(page_content="Section 16: Grounds for eviction include bonafide requirement.",
                     metadata={"similarity": 0.85, "law_name": "MRC Act", "page": 12, "retrieval_source": "official_corpus"}),
            Document(page_content="Section 24: Recovery of possession on expiry of leave and license.",
                     metadata={"similarity": 0.75, "law_name": "MRC Act", "page": 18, "retrieval_source": "official_corpus"}),
        ]

    def test_corpus_grounded_when_supported(self):
        answer_result = {
            "answer": "Under Section 16, a landlord may recover possession for bonafide requirement [S1].",
            "input_tokens": 100,
            "output_tokens": 30,
            "total_tokens": 130,
            "used_model": "gemini-3-flash-preview",
        }
        res = self.agent.assemble(answer_result, self.mock_docs)
        self.assertEqual(res["confidence"], "Corpus-Grounded")
        self.assertEqual(res["evidence_sufficiency"], "Corpus-Supported")
        self.assertEqual(res["citation_accuracy"], 1.0)
        self.assertEqual(res["cited_source_ids"], ["S1"])

    def test_insufficient_evidence_never_labeled_corpus_grounded(self):
        # Even with high retrieval similarity (0.85), if the model returns Insufficient Evidence,
        # confidence MUST be Insufficient-Evidence, NOT Corpus-Grounded!
        answer_result = {
            "answer": "Insufficient Evidence: The retrieved sources do not contain provisions on this issue.",
            "input_tokens": 100,
            "output_tokens": 15,
            "total_tokens": 115,
            "used_model": "gemini-3-flash-preview",
        }
        res = self.agent.assemble(answer_result, self.mock_docs)
        self.assertEqual(res["confidence"], "Insufficient-Evidence")
        self.assertEqual(res["evidence_sufficiency"], "Insufficient Evidence")

    def test_marathi_insufficient_evidence_decoupled(self):
        answer_result = {
            "answer": "अपुरा पुरावा (Insufficient Evidence) — उपलब्ध कागदपत्रांमध्ये पुरेशी माहिती उपलब्ध नाही.",
            "input_tokens": 100,
            "output_tokens": 15,
            "total_tokens": 115,
            "used_model": "gemini-3-flash-preview",
        }
        res = self.agent.assemble(answer_result, self.mock_docs)
        self.assertEqual(res["confidence"], "Insufficient-Evidence")
        self.assertEqual(res["evidence_sufficiency"], "Insufficient Evidence")


class TestAPIInputSchemas(unittest.TestCase):
    def test_query_request_validation(self):
        # Valid query
        q = QueryRequest(query="Valid legal question", mode="official", language="en")
        self.assertEqual(q.query, "Valid legal question")

        # Invalid mode
        with self.assertRaises(Exception):
            QueryRequest(query="Valid legal question", mode="invalid_mode")


if __name__ == "__main__":
    unittest.main()
