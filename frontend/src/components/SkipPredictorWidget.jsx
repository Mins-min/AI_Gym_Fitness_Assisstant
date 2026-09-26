import { API_URL } from "../api";
import React, { useEffect, useState } from "react";


export default function SkipPredictorWidget({
    username
}) {

    const [habits, setHabits] =
        useState([]);

    const [newHabit, setNewHabit] =
        useState("");

    const [prediction, setPrediction] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {

        if (username) {

            fetchHabits();

        }

    }, [username]);


    const fetchHabits = async () => {

        try {

            const response =
              await fetch(
              `${API_URL}/api/habits?username=${encodeURIComponent(username)}`
           );

            const data =
                await response.json();

            if (Array.isArray(data)) {

                setHabits(data);

            }

        }

        catch (error) {

            console.error(
                "Habit loading error:",
                error
            );
        }
    };


    const addHabit = async (e) => {

        e.preventDefault();

        if (!newHabit.trim()) {

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/habits`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username,

                            name:
                                newHabit.trim(),

                            completed:
                                false
                        })
                    }
                );


            if (response.ok) {

                setNewHabit("");

                fetchHabits();

            }

        }

        catch (error) {

            console.error(error);
        }
    };


    const toggleHabit = async (
        habit
    ) => {

        try {

            await fetch(
                `${API_URL}/api/habits/${habit.id}?completed=${!habit.completed}&username=${encodeURIComponent(username)}`,
                {
                    method: "PUT"
                }
            );

            fetchHabits();

        }

        catch (error) {

            console.error(error);
        }
    };


    const predict = async () => {

        setLoading(true);

        try {

            const completed =
                habits.filter(
                    h => h.completed
                ).length;


            const completionRate =
                habits.length
                    ? (
                        completed /
                        habits.length
                    ) * 100
                    : 0;


            const response =
                await fetch(
                    `${API_URL}/api/behavior/advanced-predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username,

                            recent_workouts:
                                completed,

                            missed_workouts:
                                Math.max(
                                    habits.length -
                                    completed,
                                    0
                                ),

                            recent_completion_rate:
                                completionRate
                        })
                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                setPrediction(data);

            }

        }

        catch (error) {

            console.error(
                "Prediction error:",
                error
            );
        }

        finally {

            setLoading(false);
        }
    };


    return (

        <div className="
            max-w-4xl
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

                <p className="
                    text-[11px]
                    uppercase
                    text-[#c29b61]
                    font-semibold
                ">

                    AI Fitness Habit Tracker

                </p>


                <h2 className="
                    text-xl
                    font-bold
                    mt-2
                ">

                    {username}'s Habits

                </h2>


                <form
                    onSubmit={addHabit}
                    className="
                        flex
                        gap-2
                        mt-5
                    "
                >

                    <input
                        value={newHabit}
                        onChange={(e) =>
                            setNewHabit(
                                e.target.value
                            )
                        }
                        placeholder="Add a habit..."
                        className="
                            flex-1
                            bg-[#221f1d]
                            border
                            border-[#292524]
                            rounded-xl
                            px-4
                            py-3
                            text-xs
                        "
                    />


                    <button
                        type="submit"
                        className="
                            bg-[#c29b61]
                            text-[#110703]
                            font-bold
                            px-5
                            rounded-xl
                            text-xs
                        "
                    >

                        Add

                    </button>

                </form>

            </div>


            <div className="
                bg-[#1c1917]
                border
                border-[#292524]
                rounded-2xl
                p-6
            ">

                <div className="space-y-2">

                    {habits.length === 0 && (

                        <p className="
                            text-xs
                            text-[#a8a29e]
                        ">

                            No habits added yet.

                        </p>

                    )}


                    {habits.map(
                        habit => (

                            <button
                                key={habit.id}
                                onClick={() =>
                                    toggleHabit(
                                        habit
                                    )
                                }
                                className="
                                    w-full
                                    text-left
                                    bg-[#221f1d]
                                    rounded-xl
                                    p-4
                                    flex
                                    justify-between
                                "
                            >

                                <span>

                                    {habit.name}

                                </span>


                                <span className="
                                    text-xs
                                    text-[#c29b61]
                                ">

                                    {
                                        habit.completed
                                            ? "Completed"
                                            : "Not completed"
                                    }

                                </span>

                            </button>

                        )
                    )}

                </div>


                <button
                    onClick={predict}
                    disabled={loading}
                    className="
                        mt-5
                        bg-[#c29b61]
                        text-[#110703]
                        font-bold
                        px-5
                        py-3
                        rounded-xl
                        text-xs
                    "
                >

                    {loading
                        ? "Analyzing..."
                        : "Predict Skip Risk"}

                </button>


                {prediction && (

                    <div className="
                        mt-5
                        bg-[#221f1d]
                        rounded-xl
                        p-5
                    ">

                        <p className="
                            text-xs
                            text-[#a8a29e]
                        ">

                            Skip Risk

                        </p>

                        <p className="
                            text-xl
                            font-bold
                            mt-1
                        ">

                            {prediction.skip_risk}

                        </p>


                        <p className="
                            text-xs
                            text-[#a8a29e]
                            mt-3
                        ">

                            Completion:
                            {" "}
                            {prediction.completion_rate}%

                        </p>


                        <p className="
                            text-xs
                            mt-3
                        ">

                            {prediction.recommendation}

                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}