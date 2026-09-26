from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime
)

from database import Base


# ============================================================
# MEALS
# ============================================================

class MealModel(Base):

    __tablename__ = "meals"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        index=True
    )

    name = Column(
        String,
        index=True
    )

    calories = Column(Integer)

    protein = Column(Float)

    carbs = Column(Float)

    fats = Column(Float)


# ============================================================
# HABITS
# ============================================================

class HabitModel(Base):

    __tablename__ = "habits"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        index=True
    )

    name = Column(
        String,
        index=True
    )

    completed = Column(
        Boolean,
        default=False
    )


# ============================================================
# USERS
# ============================================================

class UserModel(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        index=True
    )

    password_hash = Column(
        String
    )


# ============================================================
# CHAT MESSAGES
# ============================================================

class ChatMessageModel(Base):

    __tablename__ = "chat_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        index=True
    )

    sender = Column(
        String
    )

    message = Column(
        String
    )


# ============================================================
# PERFORMANCE
# ============================================================

class PerformanceModel(Base):

    __tablename__ = "performance"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        index=True
    )

    exercise = Column(
        String,
        index=True
    )

    score = Column(
        Float
    )

    motion_efficiency = Column(
        Float
    )

    completed_reps = Column(
        Integer
    )

    feedback = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )