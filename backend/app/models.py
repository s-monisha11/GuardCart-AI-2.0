from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, ForeignKey, JSON, Numeric, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180))
    merchant: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    category: Mapped[str] = mapped_column(String(80), default="electronics")
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    features: Mapped[list[str]] = mapped_column(JSON, default=list)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Policy(Base):
    __tablename__ = "policies"
    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    max_transaction: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    daily_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    merchants: Mapped[list[str]] = mapped_column(JSON)
    blocked_categories: Mapped[list[str]] = mapped_column(JSON)
    require_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(default=1)


class Purchase(Base):
    __tablename__ = "purchases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int]
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3))
    merchant: Mapped[str] = mapped_column(String(100))
    policy_version: Mapped[int]
    status: Mapped[str] = mapped_column(String(40))
    snapshot_json: Mapped[dict[str, Any]] = mapped_column(JSON)
    snapshot_sha256: Mapped[str] = mapped_column(String(64))
    snapshot_hmac: Mapped[str] = mapped_column(String(64))
    approved_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    checks_json: Mapped[list[dict[str, str]]] = mapped_column(JSON)
    original_request: Mapped[str] = mapped_column(Text, default="User selected catalog product")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    purchase_id: Mapped[str] = mapped_column(ForeignKey("purchases.id"), unique=True)
    order_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    capture_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    state: Mapped[str] = mapped_column(String(40))
    create_request_id: Mapped[str] = mapped_column(String(36), unique=True)
    capture_request_id: Mapped[str] = mapped_column(String(36), unique=True)
    last_response: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class SpendReservation(Base):
    __tablename__ = "spend_reservations"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    purchase_id: Mapped[str] = mapped_column(ForeignKey("purchases.id"), unique=True)
    day_utc: Mapped[date] = mapped_column(Date)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(String(30))


class SecurityTest(Base):
    __tablename__ = "security_tests"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    scenario: Mapped[str] = mapped_column(String(60))
    decision: Mapped[str] = mapped_column(String(10))
    rule: Mapped[str] = mapped_column(String(80))
    reason: Mapped[str] = mapped_column(Text)
    product_name: Mapped[str] = mapped_column(String(180))
    merchant: Mapped[str] = mapped_column(String(100))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    fixture_used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Audit(Base):
    __tablename__ = "audit_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    event: Mapped[str] = mapped_column(String(80))
    reference: Mapped[str] = mapped_column(String(80))
    details: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
