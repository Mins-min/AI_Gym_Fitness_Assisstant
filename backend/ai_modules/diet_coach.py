def get_diet_recommendation(weight: float, height: float, goal: str, preference: str) -> dict:
    """Calculates BMI and builds custom diet plans and grocery lists[cite: 1]."""
    bmi = weight / ((height / 100) ** 2)
    calories = 2200 if goal.lower() == "gain" else 1800
    
    return {
        "bmi": round(bmi, 2),
        "target_calories": calories,
        "meal_plan": [
            f"Breakfast: High protein smoothie ({preference})",
            "Lunch: Grilled paneer/chicken salad",
            "Dinner: Steamed fish with brown rice"
        ],
        "grocery_list": ["Almond Milk", "Protein Powder", "Paneer/Chicken", "Brown Rice", "Spinach"]
    }