"""Initial migration – create all LexAI tables.

Revision ID: 0001_initial
Revises: 
Create Date: 2026-08-07
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSON
import uuid

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ───────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id",                 UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("email",              sa.String(255),  nullable=False, unique=True),
        sa.Column("full_name",          sa.String(255),  nullable=False),
        sa.Column("hashed_password",    sa.String(255),  nullable=False),
        sa.Column("role",               sa.Enum("admin","lawyer","hr_manager","business_user","client", name="userrole"), default="client"),
        sa.Column("is_active",          sa.Boolean,      default=True),
        sa.Column("is_verified",        sa.Boolean,      default=False),
        sa.Column("avatar_url",         sa.String(500),  nullable=True),
        sa.Column("department",         sa.String(100),  nullable=True),
        sa.Column("last_login",         sa.DateTime(timezone=True), nullable=True),
        sa.Column("reset_token",        sa.String(255),  nullable=True),
        sa.Column("reset_token_expires",sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at",         sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",         sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_users_email",       "users", ["email"])
    op.create_index("ix_users_reset_token", "users", ["reset_token"])

    # ── documents ───────────────────────────────────────────────────────────────
    op.create_table(
        "documents",
        sa.Column("id",                UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("owner_id",          UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("parent_id",         UUID(as_uuid=True), sa.ForeignKey("documents.id"), nullable=True),
        sa.Column("title",             sa.String(500),  nullable=False),
        sa.Column("original_filename", sa.String(500),  nullable=False),
        sa.Column("file_type",         sa.String(20),   nullable=False),
        sa.Column("file_size",         sa.Integer,      nullable=False),
        sa.Column("storage_path",      sa.String(1000), nullable=False),
        sa.Column("extracted_text",    sa.Text,         nullable=True),
        sa.Column("page_count",        sa.Integer,      default=0),
        sa.Column("folder",            sa.String(255),  nullable=True),
        sa.Column("tags",              ARRAY(sa.String), default=[]),
        sa.Column("version",           sa.Integer,      default=1),
        sa.Column("status",            sa.Enum("uploaded","processing","analyzed","error","archived", name="documentstatus"), default="uploaded"),
        sa.Column("created_at",        sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",        sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_documents_owner_id", "documents", ["owner_id"])
    op.create_index("ix_documents_status",   "documents", ["status"])

    # ── ai_reports ──────────────────────────────────────────────────────────────
    op.create_table(
        "ai_reports",
        sa.Column("id",               UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("document_id",      UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("contract_type",    sa.Enum("employment","nda","rental","partnership","service","freelance","internship","privacy_policy","terms_conditions","other", name="contracttype"), nullable=True),
        sa.Column("parties",          ARRAY(sa.String), default=[]),
        sa.Column("effective_date",   sa.String(50),  nullable=True),
        sa.Column("expiration_date",  sa.String(50),  nullable=True),
        sa.Column("clauses",          JSON,           default={}),
        sa.Column("executive_summary",sa.Text,        nullable=True),
        sa.Column("rights",           ARRAY(sa.String), default=[]),
        sa.Column("obligations",      ARRAY(sa.String), default=[]),
        sa.Column("key_risks",        ARRAY(sa.String), default=[]),
        sa.Column("missing_clauses",  ARRAY(sa.String), default=[]),
        sa.Column("recommendations",  ARRAY(sa.String), default=[]),
        sa.Column("risk_level",       sa.Enum("low","medium","high","critical", name="risklevel"), nullable=True),
        sa.Column("risk_score",       sa.Float,       nullable=True),
        sa.Column("risk_explanation", sa.Text,        nullable=True),
        sa.Column("ai_confidence",    sa.Float,       nullable=True),
        sa.Column("model_used",       sa.String(100), nullable=True),
        sa.Column("created_at",       sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",       sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_ai_reports_document_id", "ai_reports", ["document_id"])

    # ── notifications ───────────────────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id",          UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id",     UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("type",        sa.Enum("expiry_warning","renewal_due","pending_review","ai_complete","high_risk", name="notificationtype"), nullable=True),
        sa.Column("title",       sa.String(255), nullable=False),
        sa.Column("body",        sa.Text,        nullable=True),
        sa.Column("is_read",     sa.Boolean,     default=False),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    # ── audit_logs ──────────────────────────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id",          UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id",     UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action",      sa.String(100), nullable=False),
        sa.Column("resource",    sa.String(100), nullable=True),
        sa.Column("resource_id", sa.String(100), nullable=True),
        sa.Column("ip_address",  sa.String(50),  nullable=True),
        sa.Column("details",     JSON,           default={}),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("ai_reports")
    op.drop_table("documents")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS documentstatus")
    op.execute("DROP TYPE IF EXISTS risklevel")
    op.execute("DROP TYPE IF EXISTS contracttype")
    op.execute("DROP TYPE IF EXISTS notificationtype")
