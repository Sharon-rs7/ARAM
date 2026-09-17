from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseLLMProvider(ABC):
    """
    Abstract base class for all ARAM LLM generation providers.
    Enforces strict signature and health check requirements.
    """
    
    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the provider is configured and available for inference."""
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Returns diagnostic health info for the provider."""
        pass

    @abstractmethod
    def generate_guidance(
        self,
        query: str,
        retrieved_context: str,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates structured legal guidance adhering to the ARAM output schema.
        Raises exception if generation fails or times out.
        """
        pass
