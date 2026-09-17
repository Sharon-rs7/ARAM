import os
from pydantic import BaseModel, Field

class RAGConfig(BaseModel):
    # Embedding Settings
    embedding_model: str = Field(
        default=os.environ.get("EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"),
        description="SentenceTransformer multilingual embedding model"
    )
    embedding_dimension: int = Field(default=384, description="Embedding vector dimensionality")
    
    # Retrieval Settings
    top_k: int = Field(
        default=int(os.environ.get("RAG_TOP_K", "5")),
        description="Number of top context chunks to retrieve"
    )
    similarity_threshold: float = Field(
        default=float(os.environ.get("RAG_SIMILARITY_THRESHOLD", "0.45")),
        description="Minimum cosine similarity threshold for context inclusion"
    )
    max_context_chunks: int = Field(
        default=int(os.environ.get("RAG_MAX_CONTEXT_CHUNKS", "5")),
        description="Maximum number of context chunks passed to generator"
    )
    
    # Storage Paths
    vector_store_path: str = Field(
        default=os.environ.get("VECTOR_STORE_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "chatbot_retriever.pkl")),
        description="File path to the persistent vector store index"
    )
    metadata_path: str = Field(
        default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "legal_rag_metadata.json"),
        description="Metadata JSON file path for RAG index provenance"
    )
    
    # Gemini LLM Settings
    gemini_model: str = Field(
        default=os.environ.get("GEMINI_MODEL", "gemini-1.5-flash"),
        description="Gemini LLM model name for generation"
    )
    gemini_timeout_seconds: int = Field(default=15, description="Timeout for external LLM API calls")
    gemini_max_retries: int = Field(default=2, description="Max retries for malformed/failed LLM calls")

rag_config = RAGConfig()
