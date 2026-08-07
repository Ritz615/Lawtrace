"""RAG chain — answer questions about a specific contract using ChromaDB context."""
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.ai.chains.llm_factory import get_llm
from app.ai.embeddings.chroma import semantic_search

RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are LexAI, an expert AI legal assistant specialized in contract analysis.
You answer questions about uploaded contracts using ONLY the provided contract excerpts.

Rules:
- Be precise and factual. Cite specific clauses when possible.
- If the answer is not found in the excerpts, say "This information was not found in the contract."
- Flag HIGH RISK clauses with ⚠️
- Use plain English — avoid excessive legal jargon
- Format responses clearly with bullet points when listing multiple items

Contract excerpts:
{context}
"""),
    ("human", "{question}"),
])


def answer_contract_question(
    question: str,
    document_id: str,
    conversation_history: list[dict] = None,
) -> dict:
    """
    Answer a question about a contract using RAG.
    Returns answer text + source chunks.
    """
    # Retrieve relevant chunks
    chunks = semantic_search(query=question, document_id=document_id, n_results=5)
    if not chunks:
        return {
            "answer": "No document content found. Please ensure the document has been processed first.",
            "sources": [],
        }

    context = "\n\n---\n\n".join([c["text"] for c in chunks])

    # Build chain
    llm = get_llm(temperature=0.1)
    chain = RAG_PROMPT | llm | StrOutputParser()

    answer = chain.invoke({"context": context, "question": question})

    sources = [
        {
            "text": c["text"][:200] + "…",
            "score": round(c["score"], 3),
            "chunk_index": c["metadata"].get("chunk_index"),
        }
        for c in chunks[:3]
    ]

    return {"answer": answer, "sources": sources}


CLAUSE_EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a legal contract analysis AI. Extract the following information from the contract text.
Return a valid JSON object with these exact keys (use null if not found):
{{
  "parties": ["Party A", "Party B"],
  "effective_date": "YYYY-MM-DD or null",
  "expiration_date": "YYYY-MM-DD or null",
  "contract_type": "employment|nda|rental|partnership|service|freelance|internship|privacy_policy|terms_conditions|other",
  "clauses": {{
    "renewal": "clause text or null",
    "payment_terms": "clause text or null",
    "confidentiality": "clause text or null",
    "termination": "clause text or null",
    "liability": "clause text or null",
    "ip": "clause text or null",
    "governing_law": "clause text or null",
    "arbitration": "clause text or null",
    "penalty": "clause text or null",
    "notice_period": "clause text or null",
    "force_majeure": "clause text or null"
  }},
  "executive_summary": "2-3 sentence summary",
  "rights": ["right 1", "right 2"],
  "obligations": ["obligation 1", "obligation 2"],
  "missing_clauses": ["missing 1", "missing 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "risk_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "risk_explanation": "explanation of main risks"
}}
"""),
    ("human", "Contract text:\n\n{text}"),
])


def analyze_contract(text: str) -> dict:
    """Full contract analysis — returns structured clause extraction + risk assessment."""
    import json
    import re

    llm = get_llm(temperature=0.0)
    chain = CLAUSE_EXTRACTION_PROMPT | llm | StrOutputParser()

    raw = chain.invoke({"text": text[:8000]})  # Truncate for context window

    # Extract JSON from response
    json_match = re.search(r"\{[\s\S]*\}", raw)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return {"error": "Failed to parse AI response", "raw": raw}


CONTRACT_GENERATION_PROMPTS = {
    "employment": "Generate a professional employment agreement between {employer} and {employee} for the role of {role} with salary {salary} starting {start_date}.",
    "nda": "Generate a mutual NDA between {party_a} and {party_b} effective {effective_date} with confidentiality period of {period} years.",
    "service": "Generate a service agreement between {client} and {provider} for {service_description} at {rate} per {rate_unit}.",
    "rental": "Generate a rental agreement for {property_address} between {landlord} and {tenant} at {rent}/month from {start_date} to {end_date}.",
    "freelance": "Generate a freelance contract between {client} and {freelancer} for {project_description} with payment of {amount}.",
    "partnership": "Generate a partnership agreement between {partner_a} and {partner_b} for {business_name} with profit split {split_a}%/{split_b}%.",
    "internship": "Generate an internship agreement between {company} and {intern_name} for {duration} starting {start_date} with stipend {stipend}.",
    "privacy_policy": "Generate a comprehensive privacy policy for {company_name} ({website_url}) that complies with GDPR and CCPA.",
    "terms_conditions": "Generate terms and conditions for {company_name} ({website_url}) covering {services_description}.",
}

GENERATION_SYSTEM = """You are a professional legal document drafter. Generate a complete, professional legal contract.
Include all standard clauses. Format with clear sections and numbering.
Add [PARTY A SIGNATURE] and [PARTY B SIGNATURE] blocks at the end.
Mark any fields that need customization with [PLACEHOLDER].
"""


def generate_contract(contract_type: str, form_data: dict) -> str:
    """Generate a contract from a template + form data using LLM."""
    template = CONTRACT_GENERATION_PROMPTS.get(contract_type, "Generate a {contract_type} contract.")
    try:
        user_prompt = template.format(**form_data)
    except KeyError:
        user_prompt = f"Generate a {contract_type} contract with these details: {form_data}"

    prompt = ChatPromptTemplate.from_messages([
        ("system", GENERATION_SYSTEM),
        ("human", user_prompt),
    ])
    llm = get_llm(temperature=0.3)
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({})


def compare_contracts(text_a: str, text_b: str) -> dict:
    """Compare two contracts and return structured diff."""
    import json, re
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Compare these two contracts and return a JSON object:
{{
  "summary": "brief comparison summary",
  "total_differences": 0,
  "added": [{{"clause": "name", "text": "added text"}}],
  "removed": [{{"clause": "name", "text": "removed text"}}],
  "modified": [{{"clause": "name", "before": "old text", "after": "new text", "risk_change": "increased|decreased|unchanged"}}],
  "risk_changes": "overall risk assessment comparison"
}}"""),
        ("human", "CONTRACT A:\n{text_a}\n\n---\n\nCONTRACT B:\n{text_b}"),
    ])
    llm = get_llm(temperature=0.0)
    chain = prompt | llm | StrOutputParser()
    raw = chain.invoke({"text_a": text_a[:4000], "text_b": text_b[:4000]})
    json_match = re.search(r"\{[\s\S]*\}", raw)
    if json_match:
        try:
            return json.loads(json_match.group())
        except Exception:
            pass
    return {"error": "Comparison failed", "raw": raw}
