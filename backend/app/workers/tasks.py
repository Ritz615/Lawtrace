"""Celery tasks for async AI processing."""
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="tasks.analyze_document")
def analyze_document_task(self, document_id: str, document_text: str):
    """
    Async task: run the full LangGraph analysis pipeline.
    Phase 3: import and invoke analysis_graph from app.ai.orchestrator
    """
    self.update_state(state="PROGRESS", meta={"progress": 10, "step": "starting"})
    # Phase 3 implementation:
    # from app.ai.orchestrator import analysis_graph
    # result = analysis_graph.invoke({
    #     "document_id": document_id,
    #     "raw_text": document_text,
    #     ...
    # })
    # Save result to AIReport table
    return {"status": "complete", "document_id": document_id}


@celery_app.task(bind=True, name="tasks.generate_contract")
def generate_contract_task(self, contract_type: str, form_data: dict):
    """Async task: generate contract via DraftingAgent. Phase 4."""
    return {"status": "complete", "contract_type": contract_type}


@celery_app.task(bind=True, name="tasks.compare_contracts")
def compare_contracts_task(self, doc_id_a: str, doc_id_b: str):
    """Async task: compare two contracts via ComparisonAgent. Phase 3."""
    return {"status": "complete", "doc_a": doc_id_a, "doc_b": doc_id_b}
