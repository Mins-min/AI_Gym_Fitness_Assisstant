import React, {
    useEffect,
    useState
} from "react";


export default function DietMacroPlanner({
    username
}) {

    const [meals, setMeals] =
        useState([]);

    const [name, setName] =
        useState("");

    const [calories, setCalories] =
        useState("");

    const [protein, setProtein] =
        useState("");

    const [carbs, setCarbs] =
        useState("");

    const [fats, setFats] =
        useState("");

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (username) {

            fetchMeals();

        }

    }, [username]);


    const fetchMeals = async () => {

        try {

            const response =
                await fetch(
                    `http://localhost:8000/api/meals?username=${encodeURIComponent(username)}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to load meals."
                );
            }


            setMeals(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (err) {

            console.error(
                "Meal loading error:",
                err
            );

            setError(
                "Unable to load meals."
            );
        }
    };


    const handleAddMeal = async (e) => {

        e.preventDefault();

        setError("");


        if (
            !name.trim()
            ||
            !calories
        ) {

            return;
        }


        try {

            const response =
                await fetch(
                    "http://localhost:8000/api/meals",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username,

                            name:
                                name.trim(),

                            calories:
                                parseInt(
                                    calories
                                ),

                            protein:
                                parseFloat(
                                    protein || 0
                                ),

                            carbs:
                                parseFloat(
                                    carbs || 0
                                ),

                            fats:
                                parseFloat(
                                    fats || 0
                                )
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to add meal."
                );
            }


            setName("");

            setCalories("");

            setProtein("");

            setCarbs("");

            setFats("");


            fetchMeals();

        }

        catch (err) {

            console.error(err);

            setError(
                err.message
            );
        }
    };


    const totalCalories =
        meals.reduce(
            (sum, meal) =>
                sum +
                Number(
                    meal.calories || 0
                ),
            0
        );


    const totalProtein =
        meals.reduce(
            (sum, meal) =>
                sum +
                Number(
                    meal.protein || 0
                ),
            0
        );


    return (

        <div className="
            max-w-6xl
            mx-auto
            space-y-6
            text-[#e7e5e4]
        ">

            <div className="
                bg-[#1c1917]
                border
                border-[#292524]
                rounded-2xl
                p-6
            ">

                <span className="
                    text-[11px]
                    font-semibold
                    text-[#c29b61]
                    uppercase
                ">

                    AI Dietician & Calorie Coach

                </span>


                <h2 className="
                    text-xl
                    font-bold
                    mt-2
                ">

                    {username}'s Nutrition

                </h2>


                <div className="
                    grid
                    grid-cols-2
                    gap-3
                    mt-5
                ">

                    <div className="
                        bg-[#221f1d]
                        rounded-xl
                        p-4
                    ">

                        <p className="
                            text-xs
                            text-[#a8a29e]
                        ">

                            Total Calories

                        </p>

                        <p className="
                            text-xl
                            font-bold
                            mt-1
                        ">

                            {totalCalories}

                        </p>

                    </div>


                    <div className="
                        bg-[#221f1d]
                        rounded-xl
                        p-4
                    ">

                        <p className="
                            text-xs
                            text-[#a8a29e]
                        ">

                            Protein

                        </p>

                        <p className="
                            text-xl
                            font-bold
                            mt-1
                        ">

                            {totalProtein.toFixed(1)}g

                        </p>

                    </div>

                </div>

            </div>


            <form
                onSubmit={handleAddMeal}
                className="
                    bg-[#1c1917]
                    border
                    border-[#292524]
                    rounded-2xl
                    p-6
                    space-y-4
                "
            >

                <h3 className="
                    font-bold
                ">

                    Add Meal

                </h3>


                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-3
                ">

                    <input
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                        placeholder="Meal name"
                        className="
                            bg-[#221f1d]
                            border
                            border-[#292524]
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                        "
                    />


                    <input
                        type="number"
                        value={calories}
                        onChange={(e) =>
                            setCalories(
                                e.target.value
                            )
                        }
                        placeholder="Calories"
                        className="
                            bg-[#221f1d]
                            border
                            border-[#292524]
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                        "
                    />


                    <input
                        type="number"
                        value={protein}
                        onChange={(e) =>
                            setProtein(
                                e.target.value
                            )
                        }
                        placeholder="Protein (g)"
                        className="
                            bg-[#221f1d]
                            border
                            border-[#292524]
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                        "
                    />


                    <input
                        type="number"
                        value={carbs}
                        onChange={(e) =>
                            setCarbs(
                                e.target.value
                            )
                        }
                        placeholder="Carbs (g)"
                        className="
                            bg-[#221f1d]
                            border
                            border-[#292524]
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                        "
                    />


                    <input
                        type="number"
                        value={fats}
                        onChange={(e) =>
                            setFats(
                                e.target.value
                            )
                        }
                        placeholder="Fats (g)"
                        className="
                            bg-[#221f1d]
                            border
                            border-[#292524]
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                        "
                    />

                </div>


                {error && (

                    <p className="
                        text-red-400
                        text-xs
                    ">

                        {error}

                    </p>

                )}


                <button
                    type="submit"
                    className="
                        bg-[#c29b61]
                        text-[#110703]
                        font-bold
                        px-5
                        py-3
                        rounded-xl
                        text-xs
                    "
                >

                    Add Meal

                </button>

            </form>


            <div className="
                bg-[#1c1917]
                border
                border-[#292524]
                rounded-2xl
                p-6
            ">

                <h3 className="
                    font-bold
                    mb-4
                ">

                    Recent Meals

                </h3>


                <div className="
                    space-y-2
                ">

                    {meals.length === 0 && (

                        <p className="
                            text-xs
                            text-[#a8a29e]
                        ">

                            No meals recorded yet.

                        </p>

                    )}


                    {meals.map(
                        (meal) => (

                            <div
                                key={meal.id}
                                className="
                                    bg-[#221f1d]
                                    rounded-xl
                                    p-4
                                    flex
                                    justify-between
                                    items-center
                                "
                            >

                                <div>

                                    <p className="
                                        text-sm
                                        font-semibold
                                    ">

                                        {meal.name}

                                    </p>

                                    <p className="
                                        text-[11px]
                                        text-[#a8a29e]
                                        mt-1
                                    ">

                                        Protein:
                                        {" "}
                                        {meal.protein}g

                                        {" · "}

                                        Carbs:
                                        {" "}
                                        {meal.carbs}g

                                        {" · "}

                                        Fats:
                                        {" "}
                                        {meal.fats}g

                                    </p>

                                </div>


                                <p className="
                                    text-sm
                                    font-bold
                                ">

                                    {meal.calories}
                                    {" kcal"}

                                </p>

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
}