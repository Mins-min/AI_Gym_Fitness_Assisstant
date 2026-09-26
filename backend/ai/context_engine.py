from datetime import datetime

import models


# ============================================================
# BASIC SYSTEM CONTEXT
# ============================================================

def build_basic_context(
    username: str = "Guest"
):

    return f"""
TRIVION AI FITNESS ASSISTANT

Current user:
{username}

You are an intelligent personal fitness assistant.

Your capabilities include:

- AI Gym Trainer
- AI Dietician
- Fitness Habit Coach
- Workout Assistant
- Performance Coach
- Virtual Gym Buddy
- Gym Recommender
- Fitness Planning Assistant

General rules:

- Do not invent user information.
- Do not invent workout history.
- Do not invent meals.
- Do not invent habits.
- Do not invent performance statistics.
- Do not invent medical information.
- Use available user information when relevant.
- Give practical and safe general fitness guidance.
- Be concise unless the user requests detail.
"""


# ============================================================
# CENTRAL USER CONTEXT
# ============================================================

def build_user_context(
    username: str,
    db
):

    username = (
        username.strip()
        if username
        else "Guest"
    )

    context_parts = []


    # ========================================================
    # USER ACCOUNT
    # ========================================================

    user = (
        db.query(models.UserModel)
        .filter(
            models.UserModel.username
            == username
        )
        .first()
    )

    if user:

        context_parts.append(
            f"""
ACCOUNT

Username:
{user.username}

Account:
Registered user
"""
        )

    else:

        context_parts.append(
            f"""
ACCOUNT

Username:
{username}

Account:
No registered account information available.
"""
        )


    # ========================================================
    # RECENT CHAT HISTORY
    # ========================================================

    messages = (
        db.query(
            models.ChatMessageModel
        )
        .filter(
            models.ChatMessageModel.username
            == username
        )
        .order_by(
            models.ChatMessageModel.id.desc()
        )
        .limit(10)
        .all()
    )

    messages.reverse()

    if messages:

        chat_text = """
RECENT CONVERSATION
"""

        for message in messages:

            sender = (
                "User"
                if message.sender == "user"
                else "Trivion AI"
            )

            chat_text += (
                f"\n{sender}: "
                f"{message.message}"
            )

        context_parts.append(
            chat_text
        )

    else:

        context_parts.append(
            """
RECENT CONVERSATION

No previous conversation available.
"""
        )


    # ========================================================
    # RECENT MEALS
    # ========================================================

    meals = (
        db.query(
            models.MealModel
        )
        .filter(
            models.MealModel.username
            == username
        )
        .order_by(
            models.MealModel.id.desc()
        )
        .limit(10)
        .all()
    )

    if meals:

        meal_text = """
RECENT MEALS
"""

        for meal in meals:

            meal_text += (
                f"\n- {meal.name}"
                f" | Calories: {meal.calories}"
                f" | Protein: {meal.protein}g"
                f" | Carbs: {meal.carbs}g"
                f" | Fats: {meal.fats}g"
            )

        context_parts.append(
            meal_text
        )

    else:

        context_parts.append(
            """
RECENT MEALS

No meal information available.
"""
        )


    # ========================================================
    # FITNESS HABITS
    # ========================================================

    habits = (
        db.query(
            models.HabitModel
        )
        .filter(
            models.HabitModel.username
            == username
        )
        .order_by(
            models.HabitModel.id.desc()
        )
        .limit(20)
        .all()
    )

    if habits:

        habit_text = """
FITNESS HABITS
"""

        completed_count = 0

        for habit in habits:

            status = (
                "Completed"
                if habit.completed
                else "Not completed"
            )

            if habit.completed:
                completed_count += 1

            habit_text += (
                f"\n- {habit.name}"
                f" | {status}"
            )

        completion_rate = (
            completed_count
            / len(habits)
            * 100
        )

        habit_text += (
            f"\n\nRecent habit completion rate: "
            f"{completion_rate:.1f}%"
        )

        context_parts.append(
            habit_text
        )

    else:

        context_parts.append(
            """
FITNESS HABITS

No habit information available.
"""
        )


    # ========================================================
    # WORKOUT PERFORMANCE
    # ========================================================

    performances = (
        db.query(
            models.PerformanceModel
        )
        .filter(
            models.PerformanceModel.username
            == username
        )
        .order_by(
            models.PerformanceModel.id.desc()
        )
        .limit(20)
        .all()
    )

    if performances:

        total_records = len(
            performances
        )

        average_score = (
            sum(
                p.score or 0
                for p in performances
            )
            / total_records
        )

        average_efficiency = (
            sum(
                p.motion_efficiency or 0
                for p in performances
            )
            / total_records
        )

        total_reps = sum(
            p.completed_reps or 0
            for p in performances
        )

        performance_text = f"""
WORKOUT PERFORMANCE

Recorded workout sessions:
{total_records}

Average performance score:
{average_score:.1f}

Average motion efficiency:
{average_efficiency:.1f}

Total recorded repetitions:
{total_reps}

Recent workout records:
"""

        for performance in performances[:10]:

            created_at = (
                performance.created_at.isoformat()
                if performance.created_at
                else "Unknown date"
            )

            performance_text += (
                f"\n- "
                f"{performance.exercise}"
                f" | Score: {performance.score}"
                f" | Efficiency: "
                f"{performance.motion_efficiency}"
                f" | Reps: "
                f"{performance.completed_reps}"
                f" | Date: {created_at}"
            )

        context_parts.append(
            performance_text
        )

    else:

        context_parts.append(
            """
WORKOUT PERFORMANCE

No recorded workout performance available.
"""
        )


    # ========================================================
    # FINAL CONTEXT
    # ========================================================

    final_context = """

============================================================
TRIVION AI CENTRAL USER MEMORY
============================================================

""" + "\n".join(
        context_parts
    )

    final_context += """

============================================================
MEMORY RULES
============================================================

Only use information that is actually present above.

Never assume missing:

- weight
- height
- age
- gender
- fitness goal
- diet preference
- medical condition
- workout history
- meals
- habits
- performance statistics

If information is missing, say that you do not have
that information yet.

============================================================
END USER MEMORY
============================================================
"""

    return final_context