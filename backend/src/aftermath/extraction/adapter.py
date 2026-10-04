from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Type, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class ModelAdapter(ABC):
    """Abstract interface for LLM extraction and reasoning providers."""

    @abstractmethod
    async def extract_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Type[T],
        temperature: float = 0.0,
    ) -> T:
        """Enforces schema-constrained decoding with deterministic zero temperature."""
        pass

    @abstractmethod
    async def generate_explanation(
        self,
        causal_graph_context: str,
        user_query: str,
    ) -> str:
        """Generates evidence-backed natural language explanations."""
        pass


class LocalMockAdapter(ModelAdapter):
    """Deterministic local mock adapter for testing, development, and offline execution."""

    def __init__(self, mock_responses: Optional[Dict[str, Any]] = None):
        self.mock_responses = mock_responses or {}

    async def extract_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Type[T],
        temperature: float = 0.0,
    ) -> T:
        # If response exists in mock dict, use it
        for key, resp in self.mock_responses.items():
            if key in prompt:
                if isinstance(resp, dict):
                    return response_schema.model_validate(resp)
                return response_schema.model_validate_json(resp)

        # Fallback to schema default instantiation if available
        return response_schema.model_validate({})

    async def generate_explanation(
        self,
        causal_graph_context: str,
        user_query: str,
    ) -> str:
        return (
            f"Explanation based on contractual evidence:\n"
            f"Context: {causal_graph_context[:100]}...\n"
            f"Query: {user_query}\n"
            f"Finding: Obligations are mathematically verified against verbatim source spans."
        )


class CloudAdapterFactory:
    """Factory creating configured model adapters based on environment settings."""

    @staticmethod
    def create_adapter(provider: str = "mock", api_key: Optional[str] = None) -> ModelAdapter:
        provider_lower = provider.strip().lower()
        if provider_lower in ("mock", "local", "offline"):
            return LocalMockAdapter()
        # Additional adapters (Gemini, Claude, OpenAI) can be instantiated with their respective keys
        return LocalMockAdapter()
