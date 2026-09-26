from fastapi import FastAPI, HTTPException, Depends

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy.orm import Session



import json

import time

import math

import httpx



import models

from database import get_db



from ai.llm_service import generate_response


from ai.context_engine import (

    build_basic_context,

    build_user_context

)





# ============================================================

# FASTAPI APP

# ============================================================



app = FastAPI(

    title="Trivion AI Fitness Backend",

    version="2.0.0"

)





# ============================================================

# CORS

# ============================================================



app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)





# ============================================================

# GLOBAL STATE

# ============================================================



iot_state = {

    "resistance_level": 5,

    "intensity": "Moderate",

    "rest_seconds": 60,

    "last_adjustment": None

}



gym_search_cache = {}

CACHE_DURATION = 600





# ============================================================

# REQUEST MODELS

# ============================================================



class PromptRequest(BaseModel):

    prompt: str





class ChatRequest(BaseModel):

    username: str

    message: str





class MealRequest(BaseModel):

    username: str

    name: str

    calories: int

    protein: float = 0

    carbs: float = 0

    fats: float = 0





class HabitRequest(BaseModel):

    username: str

    name: str

    completed: bool = False





class PerformanceRequest(BaseModel):

    username: str

    exercise: str

    score: float

    motion_efficiency: float

    completed_reps: int

    feedback: str = ""





class ResistanceRequest(BaseModel):

    resistance_level: int





class BehaviorPredictionRequest(BaseModel):

    username: str

    recent_workouts: int = 0

    missed_workouts: int = 0

    average_gap_days: float = 0

    recent_completion_rate: float = 0





class BMIRequest(BaseModel):

    username: str = "guest"

    weight: float

    height: float





class GymRecommendationRequest(BaseModel):

    username: str = "guest"

    goal: str

    location: str

    latitude: float | None = None

    longitude: float | None = None





# ============================================================

# ROOT

# ============================================================



@app.get("/")

def root():

    return {

        "message": "Trivion AI Fitness Backend is running",

        "status": "online"

    }





# ============================================================

# HEALTH CHECK

# ============================================================



@app.get("/api/health")

def health_check():

    return {

        "status": "healthy",

        "service": "Trivion AI Fitness Backend"

    }





# ============================================================

# MEALS - GET

# ============================================================



@app.get("/api/meals")

def get_meals(

    username: str,

    db: Session = Depends(get_db)

):

    username = username.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    meals = (

        db.query(models.MealModel)

        .filter(models.MealModel.username == username)

        .order_by(models.MealModel.id.desc())

        .all()

    )



    return [

        {

            "id": meal.id,

            "username": meal.username,

            "name": meal.name,

            "calories": meal.calories,

            "protein": meal.protein,

            "carbs": meal.carbs,

            "fats": meal.fats

        }

        for meal in meals

    ]





# ============================================================

# MEALS - ADD

# ============================================================



@app.post("/api/meals")

def add_meal(

    request: MealRequest,

    db: Session = Depends(get_db)

):

    username = request.username.strip()

    name = request.name.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    if not name:

        raise HTTPException(

            status_code=400,

            detail="Meal name is required."

        )



    if request.calories < 0:

        raise HTTPException(

            status_code=400,

            detail="Calories cannot be negative."

        )



    meal = models.MealModel(

        username=username,

        name=name,

        calories=request.calories,

        protein=request.protein,

        carbs=request.carbs,

        fats=request.fats

    )



    db.add(meal)

    db.commit()

    db.refresh(meal)



    return {

        "message": "Meal added successfully.",

        "meal": {

            "id": meal.id,

            "username": meal.username,

            "name": meal.name,

            "calories": meal.calories,

            "protein": meal.protein,

            "carbs": meal.carbs,

            "fats": meal.fats

        }

    }





# ============================================================

# HABITS - GET

# ============================================================



@app.get("/api/habits")

def get_habits(

    username: str,

    db: Session = Depends(get_db)

):

    username = username.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    habits = (

        db.query(models.HabitModel)

        .filter(models.HabitModel.username == username)

        .order_by(models.HabitModel.id.desc())

        .all()

    )



    return [

        {

            "id": habit.id,

            "username": habit.username,

            "name": habit.name,

            "completed": habit.completed

        }

        for habit in habits

    ]





# ============================================================

# HABITS - ADD

# ============================================================



@app.post("/api/habits")

def add_habit(

    request: HabitRequest,

    db: Session = Depends(get_db)

):

    username = request.username.strip()

    name = request.name.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    if not name:

        raise HTTPException(

            status_code=400,

            detail="Habit name is required."

        )



    habit = models.HabitModel(

        username=username,

        name=name,

        completed=request.completed

    )



    db.add(habit)

    db.commit()

    db.refresh(habit)



    return {

        "message": "Habit added successfully.",

        "habit": {

            "id": habit.id,

            "username": habit.username,

            "name": habit.name,

            "completed": habit.completed

        }

    }





# ============================================================

# HABITS - UPDATE

# ============================================================



@app.put("/api/habits/{habit_id}")

def update_habit(

    habit_id: int,

    completed: bool,

    username: str,

    db: Session = Depends(get_db)

):

    username = username.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    habit = (

        db.query(models.HabitModel)

        .filter(

            models.HabitModel.id == habit_id,

            models.HabitModel.username == username

        )

        .first()

    )



    if not habit:

        raise HTTPException(

            status_code=404,

            detail="Habit not found."

        )



    habit.completed = completed



    db.commit()

    db.refresh(habit)



    return {

        "message": "Habit updated successfully.",

        "habit": {

            "id": habit.id,

            "username": habit.username,

            "name": habit.name,

            "completed": habit.completed

        }

    }





# ============================================================

# BMI CALCULATOR

# ============================================================



@app.post("/api/fitness/bmi")

def calculate_bmi(

    request: BMIRequest

):

    if request.weight <= 0:

        raise HTTPException(

            status_code=400,

            detail="Weight must be greater than zero."

        )



    if request.height <= 0:

        raise HTTPException(

            status_code=400,

            detail="Height must be greater than zero."

        )



    height_m = request.height / 100



    bmi = request.weight / (height_m * height_m)



    if bmi < 18.5:

        category = "Underweight"

    elif bmi < 25:

        category = "Normal weight"

    elif bmi < 30:

        category = "Overweight"

    else:

        category = "Obesity"



    return {

        "username": request.username,

        "weight": request.weight,

        "height": request.height,

        "bmi": round(bmi, 2),

        "category": category

    }





# ============================================================

# ADVANCED BEHAVIOR PREDICTION

# ============================================================



@app.post("/api/behavior/advanced-predict")

async def advanced_behavior_prediction(

    request: BehaviorPredictionRequest,

    db: Session = Depends(get_db)

):

    username = request.username.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    habits = (

        db.query(models.HabitModel)

        .filter(models.HabitModel.username == username)

        .all()

    )



    if habits:

        completed = sum(

            1 for habit in habits if habit.completed

        )



        completion_rate = (

            completed / len(habits)

        ) * 100

    else:

        completion_rate = request.recent_completion_rate



    missed = request.missed_workouts



    if completion_rate >= 80 and missed <= 1:

        risk = "Low"

        recommendation = (

            "Your consistency looks strong. "

            "Continue following your current routine."

        )



    elif completion_rate >= 50 and missed <= 3:

        risk = "Moderate"

        recommendation = (

            "Your consistency could improve. "

            "Try keeping workouts shorter and more manageable."

        )



    else:

        risk = "High"

        recommendation = (

            "Your recent pattern suggests you may benefit "

            "from a simpler and more consistent workout schedule."

        )



    return {

        "username": username,

        "skip_risk": risk,

        "completion_rate": round(completion_rate, 1),

        "missed_workouts": missed,

        "recommendation": recommendation

    }





# ============================================================

# OPENSTREETMAP GYM SEARCH

# ============================================================



async def find_real_gyms(

    location: str,

    latitude: float | None = None,

    longitude: float | None = None

):

    """

    Search for real gyms and fitness facilities using

    OpenStreetMap.



    Search strategy:



    1. Use exact browser GPS coordinates when available.

    2. Otherwise use Nominatim to geocode the location.

    3. Overpass searches a 25 km radius.

    4. Multiple OSM fitness tags are checked.

    5. Nominatim POI search is used as a fallback.

    6. Duplicate gym names are removed.

    """



    global gym_search_cache



    location = location.strip()



    if not location:

        return []



    # Include browser GPS coordinates in the cache key.

    cache_key = (

        f"{location.lower()}|"

        f"{round(latitude, 5) if latitude is not None else 'none'}|"

        f"{round(longitude, 5) if longitude is not None else 'none'}"

    )



    # --------------------------------------------------------

    # CACHE

    # --------------------------------------------------------



    if cache_key in gym_search_cache:



        cached_time, cached_data = gym_search_cache[cache_key]



        if time.time() - cached_time < CACHE_DURATION:



            print(

                f"Using cached gym results for: {location}"

            )



            return cached_data



    # --------------------------------------------------------

    # HTTP CLIENT

    # --------------------------------------------------------



    headers = {

        "User-Agent": (

            "Trivion-AI-Fitness-Assistant/1.0 "

            "contact\@example.com"

        )

    }



    try:



        async with httpx.AsyncClient(

            timeout=30.0,

            headers=headers

        ) as client:



            # ------------------------------------------------

            # STEP 1 — GET SEARCH COORDINATES

            # ------------------------------------------------



            # Prefer exact browser GPS coordinates.

            # Fall back to Nominatim if GPS is unavailable.



            if latitude is None or longitude is None:



                geocode_response = await client.get(

                    "https\://nominatim.openstreetmap.org/search",

                    params={

                        "q": location,

                        "format": "jsonv2",

                        "limit": 1,

                        "countrycodes": "in"

                    }

                )



                geocode_response.raise_for_status()



                geocode_data = geocode_response.json()



                if not geocode_data:



                    print(

                        f"Nominatim could not find: {location}"

                    )



                    return []



                search_latitude = float(

                    geocode_data[0]["lat"]

                )



                search_longitude = float(

                    geocode_data[0]["lon"]

                )



                coordinate_source = "Nominatim"



            else:



                search_latitude = float(latitude)

                search_longitude = float(longitude)

                coordinate_source = "Browser GPS"



            print(

                f"Gym search location: {location}"

            )



            print(

                f"Coordinates ({coordinate_source}): "

                f"{search_latitude}, {search_longitude}"

            )



            # ------------------------------------------------

            # STEP 2 — OVERPASS SEARCH

            # ------------------------------------------------



            radius = 25000



            overpass_query = f"""

[out:json][timeout:60];



(

  nwr["leisure"="fitness_centre"]

    (around:{radius},{search_latitude},{search_longitude});



  nwr["sport"="fitness"]

    (around:{radius},{search_latitude},{search_longitude});



  nwr["amenity"="gym"]

    (around:{radius},{search_latitude},{search_longitude});



  nwr["leisure"="sports_centre"]

    (around:{radius},{search_latitude},{search_longitude});



  nwr["sport"="weightlifting"]

    (around:{radius},{search_latitude},{search_longitude});



  nwr["sport"="crossfit"]

    (around:{radius},{search_latitude},{search_longitude});



  nwr["sport"="bodybuilding"]

    (around:{radius},{search_latitude},{search_longitude});

);



out center tags;

"""



            overpass_urls = [

                "https\://overpass-api.de/api/interpreter",

                "https\://overpass.kumi.systems/api/interpreter",

                "https\://overpass.private.coffee/api/interpreter"

            ]



            elements = []



            # Try multiple Overpass servers.



            for overpass_url in overpass_urls:



                try:



                    print(

                        f"Trying Overpass server: "

                        f"{overpass_url}"

                    )



                    response = await client.post(

                        overpass_url,

                        content=overpass_query

                    )



                    response.raise_for_status()



                    data = response.json()



                    elements = data.get(

                        "elements",

                        []

                    )



                    print(

                        f"Overpass returned "

                        f"{len(elements)} elements."

                    )



                    if elements:

                        break



                except Exception as overpass_error:



                    print(

                        f"Overpass server failed: "

                        f"{overpass_error}"

                    )



            # ------------------------------------------------

            # STEP 3 — PROCESS OVERPASS RESULTS

            # ------------------------------------------------



            gyms = []

            seen_names = set()



            for element in elements:



                tags = element.get(

                    "tags",

                    {}

                )



                name = (

                    tags.get("name")

                    or tags.get("brand")

                    or tags.get("operator")

                )



                if not name:

                    continue



                name = name.strip()



                normalized_name = name.lower()



                if normalized_name in seen_names:

                    continue



                seen_names.add(

                    normalized_name

                )



                # ------------------------------

                # Coordinates

                # ------------------------------



                if element.get("lat") is not None:



                    gym_lat = element.get("lat")

                    gym_lon = element.get("lon")



                else:



                    center = element.get(

                        "center",

                        {}

                    )



                    gym_lat = center.get(

                        "lat"

                    )



                    gym_lon = center.get(

                        "lon"

                    )



                # ------------------------------

                # Build gym object

                # ------------------------------



                gym = {

                    "name": name,

                    "latitude": gym_lat,

                    "longitude": gym_lon,



                    "operator": tags.get(

                        "operator"

                    ),



                    "brand": tags.get(

                        "brand"

                    ),



                    "opening_hours": tags.get(

                        "opening_hours"

                    ),



                    "phone": (

                        tags.get("phone")

                        or tags.get("contact:phone")

                    ),



                    "website": (

                        tags.get("website")

                        or tags.get("contact:website")

                    ),



                    "personal_trainer": tags.get(

                        "personal_trainer"

                    ),



                    "sport": tags.get(

                        "sport"

                    ),



                    "source": "OpenStreetMap"

                }



                gyms.append(gym)



            # ------------------------------------------------

            # STEP 4 — NOMINATIM FALLBACK

            # ------------------------------------------------



            if not gyms:



                print(

                    "Overpass returned no named gyms."

                )



                print(

                    "Trying Nominatim gym search..."

                )



                search_queries = [

                    f"gym near {location}",

                    f"fitness centre near {location}",

                    f"fitness center near {location}",

                    f"fitness near {location}",

                    f"crossfit near {location}",

                    f"health club near {location}"

                ]



                for query in search_queries:



                    try:



                        search_response = await client.get(

                            "https\://nominatim.openstreetmap.org/search",

                            params={

                                "q": query,

                                "format": "jsonv2",

                                "limit": 20,

                                "countrycodes": "in"

                            }

                        )



                        search_response.raise_for_status()



                        search_data = (

                            search_response.json()

                        )



                        for item in search_data:



                            name = (

                                item.get("name")

                                or item.get("display_name")

                            )



                            if not name:

                                continue



                            if name.lower() in seen_names:

                                continue



                            item_type = (

                                item.get("type")

                                or ""

                            ).lower()



                            display_name = (

                                item.get(

                                    "display_name",

                                    ""

                                )

                            ).lower()



                            fitness_keywords = [

                                "gym",

                                "fitness",

                                "fitness centre",

                                "fitness center",

                                "health club",

                                "crossfit",

                                "workout"

                            ]



                            is_fitness = (

                                any(

                                    keyword in name.lower()

                                    for keyword in fitness_keywords

                                )

                                or

                                any(

                                    keyword in display_name

                                    for keyword in fitness_keywords

                                )

                                or

                                item_type in [

                                    "fitness_centre",

                                    "sports_centre",

                                    "gym"

                                ]

                            )



                            if not is_fitness:

                                continue



                            seen_names.add(

                                name.lower()

                            )



                            gyms.append({

                                "name": name.strip(),



                                "latitude": float(

                                    item["lat"]

                                )

                                if item.get("lat")

                                else None,



                                "longitude": float(

                                    item["lon"]

                                )

                                if item.get("lon")

                                else None,



                                "operator": None,

                                "brand": None,

                                "opening_hours": None,

                                "phone": None,

                                "website": None,

                                "personal_trainer": None,

                                "sport": None,

                                "source": "OpenStreetMap"

                            })



                    except Exception as search_error:



                        print(

                            f"Nominatim fallback error: "

                            f"{search_error}"

                        )



            # ------------------------------------------------

            # STEP 5 — REMOVE DUPLICATES

            # ------------------------------------------------



            unique_gyms = []



            final_names = set()



            for gym in gyms:



                name = gym["name"].strip()



                normalized = name.lower()



                if normalized in final_names:

                    continue



                final_names.add(

                    normalized

                )



                unique_gyms.append(

                    gym

                )



            # Limit response.



            unique_gyms = unique_gyms[:30]



            print(

                f"Final real gym count for "

                f"{location}: {len(unique_gyms)}"

            )



            # ------------------------------------------------

            # CACHE

            # ------------------------------------------------



            gym_search_cache[cache_key] = (

                time.time(),

                unique_gyms

            )



            return unique_gyms



    except httpx.TimeoutException:



        print(

            "OpenStreetMap request timed out."

        )



        return []



    except Exception as e:



        print(

            f"Gym search error: {e}"

        )



        return []





# ============================================================

# GYM RECOMMENDER

# ============================================================



@app.post("/api/gyms/recommend")

async def recommend_gyms(

    request: GymRecommendationRequest,

    db: Session = Depends(get_db)

):

    username = request.username.strip()

    goal = request.goal.strip()

    location = request.location.strip()



    if not location:

        raise HTTPException(

            status_code=400,

            detail="Location is required."

        )



    if not goal:

        raise HTTPException(

            status_code=400,

            detail="Fitness goal is required."

        )



    # --------------------------------------------------------

    # Find REAL gyms

    # --------------------------------------------------------



    real_gyms = await find_real_gyms(

        location,

        request.latitude,

        request.longitude

    )



    print(

        f"Real gyms available for AI: "

        f"{len(real_gyms)}"

    )



    # --------------------------------------------------------

    # Create AI-friendly gym list

    # --------------------------------------------------------



    gym_list_for_ai = []



    for index, gym in enumerate(real_gyms):



        gym_list_for_ai.append({

            "id": index + 1,

            "name": gym["name"],

            "opening_hours": gym.get(

                "opening_hours"

            ),

            "sport": gym.get(

                "sport"

            ),

            "personal_trainer": gym.get(

                "personal_trainer"

            )

        })



    # --------------------------------------------------------

    # Generate personalized workout

    # --------------------------------------------------------



    gyms_text = json.dumps(

        gym_list_for_ai,

        ensure_ascii=False,

        indent=2

    )



    if real_gyms:



        gym_instruction = f"""

REAL GYMS FOUND FROM OPENSTREETMAP



{gyms_text}



IMPORTANT GYM RULES:



\- Only recommend gyms from this list.

\- Never invent a gym name.

\- Never create fake ratings.

\- Never claim a gym has equipment unless the

  available data supports it.

\- If there are fewer than 3 suitable gyms,

  return only the suitable gyms.

"""



    else:



        gym_instruction = """

No named gyms were found in OpenStreetMap

for this location.



Do not invent gym names.



Return an empty recommended_gyms list.

"""



    prompt = f"""

You are the Gym Recommender AI inside Trivion AI.



USER

Username: {username}

Location: {location}

Fitness Goal: {goal}



{gym_instruction}



Create a personalized fitness plan.



Return ONLY valid JSON.



Use exactly this structure:



{{

    "workout_program": {{

        "title": "",

        "description": "",

        "weekly_schedule": []

    }},



    "fitness_challenge": {{

        "title": "",

        "description": "",

        "duration_days": 30

    }},



    "recommended_gyms": []

}}



For recommended_gyms use:



[

    {{

        "name": "",

        "reason": "",

        "source": "OpenStreetMap"

    }}

]



Do NOT invent:



\- age

\- height

\- weight

\- medical conditions

\- calorie requirements

\- protein requirements

\- dietary requirements



Do not make up gym ratings.



Keep the workout realistic and practical.

"""



    # --------------------------------------------------------

    # Ask Llama

    # --------------------------------------------------------



    ai_response = await generate_response(

        prompt

    )



    recommendations = None



    try:



        cleaned = ai_response.strip()



        # Remove markdown fences if Llama adds them.



        if cleaned.startswith("\`\`\`"):



            cleaned = cleaned.replace(

                "\`\`\`json",

                ""

            )



            cleaned = cleaned.replace(

                "\`\`\`",

                ""

            )



            cleaned = cleaned.strip()



        recommendations = json.loads(

            cleaned

        )



    except Exception as e:



        print(

            f"Gym AI JSON parsing failed: {e}"

        )



        recommendations = {

            "workout_program": {

                "title": f"{goal} Program",



                "description": (

                    "A personalized training program "

                    "based on your selected fitness goal."

                ),



                "weekly_schedule": [

                    "Day 1 - Strength Training",

                    "Day 2 - Rest or Light Cardio",

                    "Day 3 - Strength Training",

                    "Day 4 - Rest",

                    "Day 5 - Strength Training",

                    "Day 6 - Optional Cardio",

                    "Day 7 - Rest"

                ]

            },



            "fitness_challenge": {

                "title": f"30-Day {goal} Challenge",



                "description": (

                    "Stay consistent with your workouts "

                    "for the next 30 days."

                ),



                "duration_days": 30

            },



            "recommended_gyms": []

        }



    # --------------------------------------------------------

    # VERIFY AI GYM NAMES

    # --------------------------------------------------------



    valid_gym_names = {

        gym["name"].strip().lower()

        for gym in real_gyms

    }



    verified_recommendations = []



    ai_gyms = recommendations.get(

        "recommended_gyms",

        []

    )



    if isinstance(ai_gyms, list):



        for gym in ai_gyms:



            if not isinstance(gym, dict):

                continue



            name = str(

                gym.get("name", "")

            ).strip()



            if not name:

                continue



            if name.lower() not in valid_gym_names:



                print(

                    f"Rejected invented gym: {name}"

                )



                continue



            verified_recommendations.append(

                gym

            )



    # --------------------------------------------------------

    # Fallback if AI doesn't choose gyms

    # --------------------------------------------------------



    if (

        not verified_recommendations

        and real_gyms

    ):



        for gym in real_gyms[:3]:



            verified_recommendations.append({

                "name": gym["name"],



                "reason": (

                    f"Real fitness facility found "

                    f"near {location}."

                ),



                "source": "OpenStreetMap"

            })



    recommendations[

        "recommended_gyms"

    ] = verified_recommendations



    # --------------------------------------------------------

    # Response

    # --------------------------------------------------------



    return {

        "username": username,



        "location": location,



        "goal": goal,



        "workout_program": recommendations.get(

            "workout_program",

            {}

        ),



        "fitness_challenge": recommendations.get(

            "fitness_challenge",

            {}

        ),



        "recommended_gyms": verified_recommendations,



        "gym_data_source": "OpenStreetMap",



        "real_gyms_found": len(

            real_gyms

        )

    }





# ============================================================

# PERFORMANCE - SAVE

# ============================================================



@app.post("/api/performance")

def save_performance(

    request: PerformanceRequest,

    db: Session = Depends(get_db)

):

    username = request.username.strip()

    exercise = request.exercise.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    if not exercise:

        raise HTTPException(

            status_code=400,

            detail="Exercise is required."

        )



    score = max(

        0,

        min(100, request.score)

    )



    efficiency = max(

        0,

        min(100, request.motion_efficiency)

    )



    performance = models.PerformanceModel(

        username=username,

        exercise=exercise,

        score=score,

        motion_efficiency=efficiency,

        completed_reps=max(

            0,

            request.completed_reps

        ),

        feedback=request.feedback

    )



    db.add(performance)

    db.commit()

    db.refresh(performance)



    return {

        "message": "Performance saved successfully.",



        "performance": {

            "id": performance.id,

            "username": performance.username,

            "exercise": performance.exercise,

            "score": performance.score,

            "motion_efficiency": performance.motion_efficiency,

            "completed_reps": performance.completed_reps,

            "feedback": performance.feedback,



            "created_at": (

                performance.created_at.isoformat()

                if performance.created_at

                else None

            )

        }

    }





# ============================================================

# PERFORMANCE REPORT

# ============================================================



@app.get("/api/performance/report/{username}")

def performance_report(

    username: str,

    db: Session = Depends(get_db)

):

    username = username.strip()



    if not username:

        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    performances = (

        db.query(models.PerformanceModel)

        .filter(

            models.PerformanceModel.username

            == username

        )

        .order_by(

            models.PerformanceModel.id.desc()

        )

        .all()

    )



    if not performances:



        return {

            "username": username,

            "total_workouts": 0,

            "average_score": 0,

            "average_motion_efficiency": 0,

            "total_reps": 0,

            "records": []

        }



    total = len(

        performances

    )



    average_score = (

        sum(

            p.score

            for p in performances

        )

        / total

    )



    average_efficiency = (

        sum(

            p.motion_efficiency

            for p in performances

        )

        / total

    )



    total_reps = sum(

        p.completed_reps

        for p in performances

    )



    records = []



    for performance in performances:



        records.append({

            "id": performance.id,

            "exercise": performance.exercise,

            "score": performance.score,



            "motion_efficiency": (

                performance.motion_efficiency

            ),



            "completed_reps": (

                performance.completed_reps

            ),



            "feedback": performance.feedback,



            "created_at": (

                performance.created_at.isoformat()

                if performance.created_at

                else None

            )

        })



    return {

        "username": username,



        "total_workouts": total,



        "average_score": round(

            average_score,

            1

        ),



        "average_motion_efficiency": round(

            average_efficiency,

            1

        ),



        "total_reps": total_reps,



        "records": records

    }





# ============================================================

# IOT - STATUS

# ============================================================



@app.get("/api/iot/status")

def get_iot_status():



    return {

        "status": "connected",



        "resistance_level": (

            iot_state["resistance_level"]

        ),



        "intensity": (

            iot_state["intensity"]

        ),



        "rest_seconds": (

            iot_state["rest_seconds"]

        ),



        "last_adjustment": (

            iot_state["last_adjustment"]

        )

    }





# ============================================================

# IOT - ADJUST RESISTANCE

# ============================================================



@app.post("/api/iot/adjust-resistance")

def adjust_resistance(

    request: ResistanceRequest

):



    resistance = max(

        1,

        min(20, request.resistance_level)

    )



    iot_state[

        "resistance_level"

    ] = resistance



    if resistance <= 5:



        intensity = "Light"



    elif resistance <= 10:



        intensity = "Moderate"



    elif resistance <= 15:



        intensity = "High"



    else:



        intensity = "Very High"



    iot_state[

        "intensity"

    ] = intensity



    iot_state[

        "last_adjustment"

    ] = time.time()



    return {

        "message": "Resistance adjusted.",



        "resistance_level": resistance,



        "intensity": intensity

    }





# ============================================================

# IOT - AI RECOMMENDATION

# ============================================================



@app.get("/api/iot/recommendation")

async def iot_recommendation(

    username: str = "guest"

):



    username = username.strip()



    if not username:



        username = "guest"



    recommendation_prompt = f"""

You are a smart gym equipment assistant.



User:

{username}



Current resistance:

{iot_state["resistance_level"]}



Current intensity:

{iot_state["intensity"]}



Provide a short recommendation for:



1\. Resistance

2\. Rest period

3\. Training intensity



Do not invent user medical information.



Return practical general fitness guidance.

"""



    response = await generate_response(

        recommendation_prompt

    )



    return {

        "username": username,



        "current_resistance": (

            iot_state["resistance_level"]

        ),



        "current_intensity": (

            iot_state["intensity"]

        ),



        "recommendation": response

    }





# ============================================================

# AI COACH TIP

# ============================================================



@app.post("/api/coach-tip")

async def coach_tip(

    request: PromptRequest

):



    context = build_basic_context(

        "Guest"

    )



    prompt = f"""

You are the central AI fitness assistant

for Trivion AI.



Use the following system context:



{context}



USER REQUEST

\------------



{request.prompt}



INSTRUCTIONS



Give practical and useful fitness guidance.



Do not invent information about the user.



Keep the response concise unless the

user asks for detail.



Do not mention internal system architecture.

"""



    response = await generate_response(

        prompt

    )



    return {

        "advice": response

    }





# ============================================================

# AI GYM BUDDY CHAT

# ============================================================



@app.post("/api/chat")

async def chat(

    request: ChatRequest,

    db: Session = Depends(get_db)

):



    username = request.username.strip()

    message = request.message.strip()



    # --------------------------------------------------------

    # Validate

    # --------------------------------------------------------



    if not username:



        raise HTTPException(

            status_code=400,

            detail="Username is required."

        )



    if not message:



        raise HTTPException(

            status_code=400,

            detail="Message is required."

        )



    # --------------------------------------------------------

    # Save user message

    # --------------------------------------------------------



    try:



        user_message = models.ChatMessageModel(

            username=username,

            sender="user",

            message=message

        )



        db.add(

            user_message

        )



        db.commit()



    except Exception as e:



        db.rollback()



        print(

            f"Database error while saving "

            f"user message: {e}"

        )



    # --------------------------------------------------------

    # Build user context

    # --------------------------------------------------------



    context = build_user_context(

        username=username,

        db=db

    )



    # --------------------------------------------------------

    # AI prompt

    # --------------------------------------------------------



    prompt = f"""

You are Trivion AI, an intelligent

personal fitness assistant.



You act as:



\- AI Gym Trainer

\- AI Dietician

\- Fitness Habit Coach

\- Workout Assistant

\- Performance Coach

\- Virtual Gym Buddy



The following information belongs to

the CURRENT logged-in user.



\============================================================

USER CONTEXT

\============================================================



{context}



\============================================================

CURRENT USER

\============================================================



{username}



\============================================================

CURRENT USER MESSAGE

\============================================================



{message}



\============================================================

INSTRUCTIONS

\============================================================



Answer naturally and practically.



Use available user context when relevant.



Maintain continuity with previous conversations

when useful.



Use recent meal information when answering

nutrition questions.



Use habit information when discussing

fitness consistency and motivation.



Use workout performance information when

discussing recorded workout progress.



Do NOT invent:



\- weight

\- height

\- age

\- fitness goals

\- diet preferences

\- workout history

\- medical information

\- performance data

\- habits

\- meals



unless that information is actually available.



If information is unavailable, say that you

do not have that information yet.



For fitness questions, provide safe general

guidance.



For nutrition questions, provide general

nutritional guidance without pretending to

know exact nutritional requirements.



For motivation, be encouraging without

being repetitive.



Keep responses reasonably concise unless

the user asks for detail.



Do not mention:



\- database

\- context engine

\- system prompt

\- internal architecture


\- implementation details



Speak naturally as the user's AI fitness

companion.

"""



    # --------------------------------------------------------

    # Generate response

    # --------------------------------------------------------



    try:



        reply = await generate_response(

            prompt

        )



    except Exception as e:



        print(

            f"LLM Error: {e}"

        )



        reply = (

            "I'm having trouble connecting "

            "to my AI service right now. "

            "Please try again in a moment."

        )



    # --------------------------------------------------------

    # Save AI response

    # --------------------------------------------------------



    try:



        ai_message = models.ChatMessageModel(

            username=username,

            sender="buddy",

            message=reply

        )



        db.add(

            ai_message

        )



        db.commit()



    except Exception as e:



        db.rollback()



        print(

            f"Database error while saving "

            f"AI response: {e}"

        )



    # --------------------------------------------------------

    # Return

    # --------------------------------------------------------



    return {

        "reply": reply

    }