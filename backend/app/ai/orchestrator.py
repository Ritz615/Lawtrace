"""
LangGraph Orchestration Graph — LexAI Multi-Agent Pipeline

Agent flow:
  DocumentAgent → ClauseAgent → [SummaryAgent, RiskAgent]
  ComparisonAgent (parallel, if 2 docs)
  DraftingAgent (standalone for generation)
  ResearchAgent (standalone for legal research)
  ReportAgent (final assembly)
"""
from typing import TypedDict, Optional, List
from langgraph.graph import StateGraph, END


class ContractAnalysisState(TypedDict):
    """Shared state flowing through the agent graph."""
    document_id: str
    raw_text: str
    chunks: List[str]
    clauses: dict
    parties: List[str]
    effective_date: Optional[str]
    expiration_date: Optional[str]
    executive_summary: Optional[str]
    rights: List[str]
    obligations: List[str]
    key_risks: List[str]
    missing_clauses: List[str]
    recommendations: List[str]
    risk_score: Optional[float]
    risk_level: Optional[str]
    risk_explanation: Optional[str]
    report: Optional[dict]
    errors: List[str]


def document_agent(state: ContractAnalysisState) -> ContractAnalysisState:
    """
    Phase 3: Parse and chunk document text.
    Uses PyMuPDF + EasyOCR for extraction, LangChain splitter for chunks.
    """
    # Placeholder — implemented in Phase 3
    state["chunks"] = [state["raw_text"]] if state["raw_text"] else []
    return state


def clause_agent(state: ContractAnalysisState) -> ContractAnalysisState:
    """
    Phase 3: Extract 14 clause types using LLM + spaCy NER.
    Clause types: renewal, payment_terms, confidentiality, termination,
    liability, ip, governing_law, arbitration, penalty, notice_period,
    force_majeure, parties, effective_date, expiration_date.
    """
    # Placeholder — implemented in Phase 3
    state["clauses"] = {}
    state["parties"] = []
    return state


def summary_agent(state: ContractAnalysisState) -> ContractAnalysisState:
    """Phase 3: Generate executive summary, rights, obligations, missing clauses."""
    state["executive_summary"] = None
    state["rights"] = []
    state["obligations"] = []
    state["missing_clauses"] = []
    state["recommendations"] = []
    return state


def risk_agent(state: ContractAnalysisState) -> ContractAnalysisState:
    """Phase 3: Calculate overall risk score (0-100) and risk level."""
    state["risk_score"] = None
    state["risk_level"] = None
    state["risk_explanation"] = None
    return state


def report_agent(state: ContractAnalysisState) -> ContractAnalysisState:
    """Phase 5: Assemble all agent outputs into a structured report."""
    state["report"] = {
        "executive_summary": state.get("executive_summary"),
        "clauses": state.get("clauses"),
        "risk_score": state.get("risk_score"),
        "risk_level": state.get("risk_level"),
    }
    return state


def build_analysis_graph() -> StateGraph:
    """Build and compile the LangGraph analysis pipeline."""
    graph = StateGraph(ContractAnalysisState)

    graph.add_node("document_agent", document_agent)
    graph.add_node("clause_agent", clause_agent)
    graph.add_node("summary_agent", summary_agent)
    graph.add_node("risk_agent", risk_agent)
    graph.add_node("report_agent", report_agent)

    graph.set_entry_point("document_agent")
    graph.add_edge("document_agent", "clause_agent")
    graph.add_edge("clause_agent", "summary_agent")
    graph.add_edge("clause_agent", "risk_agent")
    graph.add_edge("summary_agent", "report_agent")
    graph.add_edge("risk_agent", "report_agent")
    graph.add_edge("report_agent", END)

    return graph.compile()


# Compiled graph — import this in Celery tasks
analysis_graph = build_analysis_graph()
