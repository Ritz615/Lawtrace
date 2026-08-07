"""Celery tasks — fully implemented AI processing pipeline."""
import time
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="tasks.analyze_document")
def analyze_document_task(self, document_id: str, document_text: str):
    """Run the full LangGraph AI analysis pipeline on a document."""
    try:
        self.update_state(state="PROGRESS", meta={"progress": 5, "step": "starting analysis"})

        # Import here to avoid circular imports at worker startup
        from app.ai.chains.rag import analyze_contract

        self.update_state(state="PROGRESS", meta={"progress": 20, "step": "extracting clauses"})
        result = analyze_contract(document_text)

        self.update_state(state="PROGRESS", meta={"progress": 70, "step": "scoring risks"})

        if "error" in result:
            return {"status": "error", "document_id": document_id, "error": result["error"]}

        # Save to DB
        self.update_state(state="PROGRESS", meta={"progress": 85, "step": "saving report"})
        _save_ai_report(document_id, result)

        self.update_state(state="PROGRESS", meta={"progress": 100, "step": "complete"})
        return {"status": "complete", "document_id": document_id, "risk_level": result.get("risk_level")}

    except Exception as e:
        self.update_state(state="FAILURE", meta={"error": str(e)})
        raise


def _save_ai_report(document_id: str, analysis: dict):
    """Synchronously save AI analysis result to PostgreSQL."""
    import asyncio
    from app.core.database import AsyncSessionLocal
    from app.models.models import Document, AIReport, DocumentStatus, RiskLevel, ContractType
    from sqlalchemy import select

    async def _save():
        async with AsyncSessionLocal() as db:
            doc_result = await db.execute(select(Document).where(Document.id == document_id))
            doc = doc_result.scalar_one_or_none()
            if not doc:
                return

            # Parse risk level
            risk_map = {"low": RiskLevel.LOW, "medium": RiskLevel.MEDIUM, "high": RiskLevel.HIGH, "critical": RiskLevel.CRITICAL}
            risk_level = risk_map.get(analysis.get("risk_level", "").lower())

            # Parse contract type
            type_map = {ct.value: ct for ct in ContractType}
            contract_type = type_map.get(analysis.get("contract_type", ""), ContractType.OTHER)

            report = AIReport(
                document_id=document_id,
                contract_type=contract_type,
                parties=analysis.get("parties", []),
                effective_date=analysis.get("effective_date"),
                expiration_date=analysis.get("expiration_date"),
                clauses=analysis.get("clauses", {}),
                executive_summary=analysis.get("executive_summary"),
                rights=analysis.get("rights", []),
                obligations=analysis.get("obligations", []),
                key_risks=[analysis.get("risk_explanation", "")],
                missing_clauses=analysis.get("missing_clauses", []),
                recommendations=analysis.get("recommendations", []),
                risk_level=risk_level,
                risk_score=analysis.get("risk_score"),
                risk_explanation=analysis.get("risk_explanation"),
                ai_confidence=0.85,
                model_used="llama3",
            )
            db.add(report)
            doc.status = DocumentStatus.ANALYZED
            await db.commit()

    asyncio.run(_save())


@celery_app.task(bind=True, name="tasks.generate_contract")
def generate_contract_task(self, contract_type: str, form_data: dict):
    """Generate a contract draft via DraftingAgent."""
    self.update_state(state="PROGRESS", meta={"progress": 10, "step": "drafting"})
    from app.ai.chains.rag import generate_contract
    draft = generate_contract(contract_type, form_data)
    self.update_state(state="PROGRESS", meta={"progress": 100, "step": "complete"})
    return {"status": "complete", "contract_type": contract_type, "draft": draft}


@celery_app.task(bind=True, name="tasks.compare_contracts")
def compare_contracts_task(self, doc_id_a: str, doc_id_b: str, text_a: str, text_b: str):
    """Compare two contracts via ComparisonAgent."""
    self.update_state(state="PROGRESS", meta={"progress": 10, "step": "comparing"})
    from app.ai.chains.rag import compare_contracts
    result = compare_contracts(text_a, text_b)
    self.update_state(state="PROGRESS", meta={"progress": 100, "step": "complete"})
    return {"status": "complete", "result": result}
