"""ChromaDB embedding service for RAG pipeline."""
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

from app.core.config import settings as app_settings

# Lazy-load to avoid startup cost
_chroma_client = None
_embedding_model = None


def get_chroma_client() -> chromadb.HttpClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.HttpClient(
            host=app_settings.CHROMA_HOST,
            port=app_settings.CHROMA_PORT,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _chroma_client


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(app_settings.EMBEDDING_MODEL)
    return _embedding_model


def get_or_create_collection(collection_name: str = None):
    client = get_chroma_client()
    name = collection_name or app_settings.CHROMA_COLLECTION_NAME
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )


def embed_document(document_id: str, text: str, metadata: dict = None) -> int:
    """Chunk a document and store embeddings in ChromaDB."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_text(text)
    if not chunks:
        return 0

    model = get_embedding_model()
    embeddings = model.encode(chunks).tolist()

    collection = get_or_create_collection()
    ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
    meta = [{"document_id": document_id, "chunk_index": i, **(metadata or {})} for i in range(len(chunks))]

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=meta,
    )
    return len(chunks)


def semantic_search(query: str, document_id: str = None, n_results: int = 5) -> list[dict]:
    """Search ChromaDB for chunks relevant to a query."""
    model = get_embedding_model()
    query_embedding = model.encode([query]).tolist()

    collection = get_or_create_collection()
    where = {"document_id": document_id} if document_id else None

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results,
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    output = []
    for i, doc in enumerate(results["documents"][0]):
        output.append({
            "text": doc,
            "metadata": results["metadatas"][0][i],
            "score": 1 - results["distances"][0][i],
        })
    return output


def delete_document_embeddings(document_id: str):
    """Remove all embeddings for a document."""
    collection = get_or_create_collection()
    collection.delete(where={"document_id": document_id})
