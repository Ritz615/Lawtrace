"""LLM provider factory — supports Ollama, OpenAI, Anthropic, Google."""
from langchain_core.language_models import BaseChatModel
from app.core.config import settings


def get_llm(temperature: float = 0.1) -> BaseChatModel:
    """Return the configured LLM based on LLM_PROVIDER env var."""
    provider = settings.LLM_PROVIDER.lower()

    if provider == "ollama":
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            temperature=temperature,
        )
    elif provider == "openai":
        from langchain_community.chat_models import ChatOpenAI
        return ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model="gpt-4o",
            temperature=temperature,
        )
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            api_key=settings.ANTHROPIC_API_KEY,
            model="claude-3-5-sonnet-20241022",
            temperature=temperature,
        )
    elif provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            google_api_key=settings.GOOGLE_API_KEY,
            model="gemini-2.0-flash",
            temperature=temperature,
        )
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}. Choose: ollama, openai, anthropic, google")
