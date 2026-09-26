import { API_URL } from "../api";
import React, { useEffect, useState } from "react";

export default function GymRecommenderPlanner({
  username = "guest",
}) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiLoading, setBmiLoading] = useState(false);

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [goal, setGoal] = useState(
    "Muscle Gain & Hypertrophy"
  );

  const [recommendations, setRecommendations] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    detectLocation();
  }, []);

  // =========================================================
  // LOCATION
  // =========================================================

  const detectLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const detectedLatitude =
          position.coords.latitude;

        const detectedLongitude =
          position.coords.longitude;

        const detectedAccuracy =
          position.coords.accuracy;

        console.log(
          "Detected coordinates:",
          detectedLatitude,
          detectedLongitude
        );

        setLatitude(detectedLatitude);
        setLongitude(detectedLongitude);
        setAccuracy(detectedAccuracy);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${detectedLatitude}&lon=${detectedLongitude}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Reverse geocoding failed"
            );
          }

          const data = await response.json();

          const address = data.address || {};

          const detectedArea =
            address.suburb ||
            address.neighbourhood ||
            address.town ||
            address.city_district ||
            address.city ||
            address.village ||
            address.county ||
            "Current Location";

          setLocation(detectedArea);
        } catch (error) {
          console.error(
            "Reverse geocoding error:",
            error
          );

          setLocation("Current Location");
        }

        setLocationLoading(false);
      },

      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        if (geoError.code === 1) {
          setLocationError(
            "Location permission denied. Allow location access and try again."
          );
        } else if (geoError.code === 2) {
          setLocationError(
            "Your location could not be determined."
          );
        } else if (geoError.code === 3) {
          setLocationError(
            "Location detection timed out."
          );
        } else {
          setLocationError(
            "Unable to detect your location."
          );
        }

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  // =========================================================
  // BMI
  // =========================================================

  const handleCalculateBMI = async (e) => {
    e.preventDefault();

    if (!weight || !height) {
      return;
    }

    setBmiLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/fitness/bmi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            weight: Number(weight),
            height: Number(height),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "BMI calculation failed."
        );
      }

      setBmiResult(data);
    } catch (error) {
      console.error(
        "BMI calculation error:",
        error
      );
    } finally {
      setBmiLoading(false);
    }
  };

  // =========================================================
  // AI GYM PLAN
  // =========================================================

  const handleFindGyms = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setRecommendations(null);

    try {
      if (!location.trim()) {
        throw new Error(
          "Please detect or enter your location first."
        );
      }

      const requestBody = {
        username: username || "guest",
        goal,
        location: location.trim(),

        latitude:
          latitude !== null
            ? Number(latitude)
            : null,

        longitude:
          longitude !== null
            ? Number(longitude)
            : null,
      };

      console.log(
        "Sending AI gym recommendation request:",
        requestBody
      );

      const response = await fetch(
        `${API_URL}/api/gyms/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      console.log(
        "AI gym recommendation response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to generate AI workout plan."
        );
      }

      setRecommendations(data);
    } catch (error) {
      console.error(
        "AI gym planner error:",
        error
      );

      setError(
        error.message ||
          "Unable to generate AI workout plan."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // WORKOUT SCHEDULE
  // =========================================================

  const getDayName = (day) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (typeof day === "number") {
      return (
        days[day - 1] ||
        `Day ${day}`
      );
    }

    return day || "Workout Day";
  };

  const renderWorkoutSchedule = () => {
    const schedule =
      recommendations?.workout_program
        ?.weekly_schedule;

    if (!Array.isArray(schedule)) {
      return (
        <p className="text-xs text-[#a8a29e]">
          No weekly schedule was generated.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {schedule.map((day, index) => {
          if (
            typeof day !== "object" ||
            day === null
          ) {
            return (
              <div
                key={index}
                className="bg-[#141210] border border-[#292524] p-4 rounded-xl"
              >
                <p className="text-xs">
                  {String(day)}
                </p>
              </div>
            );
          }

          const dayName = getDayName(
            day.day || index + 1
          );

          const workoutType =
            day.workout_type ||
            day.type ||
            "Workout";

          const exercises =
            Array.isArray(day.exercises)
              ? day.exercises
              : [];

          return (
            <div
              key={index}
              className="bg-[#141210] border border-[#292524] p-4 rounded-xl"
            >
              <div className="flex justify-between gap-3">
                <h4 className="text-xs font-bold">
                  {dayName}
                </h4>

                <span className="text-[10px] text-[#c29b61] uppercase text-right">
                  {workoutType}
                </span>
              </div>

              {exercises.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {exercises.map(
                    (exercise, exerciseIndex) => (
                      <li
                        key={exerciseIndex}
                        className="text-[11px] text-[#a8a29e]"
                      >
                        • {String(exercise)}
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-[#e7e5e4]">

      {/* BMI */}
      <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex items-center gap-2 mb-5">
          <span>⚖️</span>

          <h2 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider">
            BMI & Health Calculator
          </h2>
        </div>

        <form
          onSubmit={handleCalculateBMI}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-[11px] text-[#a8a29e] mb-1.5">
              Weight (kg)
            </label>

            <input
              type="number"
              min="1"
              step="0.1"
              value={weight}
              onChange={(e) =>
                setWeight(e.target.value)
              }
              placeholder="70"
              className="w-full bg-[#221f1d] border border-[#292524] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c29b61]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#a8a29e] mb-1.5">
              Height (cm)
            </label>

            <input
              type="number"
              min="1"
              step="0.1"
              value={height}
              onChange={(e) =>
                setHeight(e.target.value)
              }
              placeholder="175"
              className="w-full bg-[#221f1d] border border-[#292524] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c29b61]"
            />
          </div>

          <button
            type="submit"
            disabled={bmiLoading}
            className="bg-[#c29b61] hover:bg-[#b08852] disabled:opacity-50 text-[#141210] font-bold py-2.5 rounded-xl text-xs"
          >
            {bmiLoading
              ? "Calculating..."
              : "Calculate BMI"}
          </button>
        </form>

        {bmiResult && (
          <div className="mt-5 p-4 bg-[#221f1d] border border-[#292524] rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs">
                  Category:{" "}
                  <strong>
                    {bmiResult.category}
                  </strong>
                </p>

                {bmiResult.advice && (
                  <p className="text-[11px] text-[#a8a29e] mt-1">
                    {bmiResult.advice}
                  </p>
                )}
              </div>

              <div className="text-[#c29b61] font-mono font-bold">
                BMI {bmiResult.bmi}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* AI GYM PLANNER */}
      <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span>🤖</span>

            <h2 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider">
              AI Gym Recommender & Workout Planner
            </h2>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={locationLoading}
            className="text-xs bg-[#221f1d] border border-[#292524] px-3 py-2 rounded-xl hover:bg-[#292524]"
          >
            {locationLoading
              ? "Detecting..."
              : "📍 Use My Location"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-[11px] text-[#a8a29e] mb-1.5">
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="Kochi"
              className="w-full bg-[#221f1d] border border-[#292524] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c29b61]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#a8a29e] mb-1.5">
              Fitness Goal
            </label>

            <select
              value={goal}
              onChange={(e) =>
                setGoal(e.target.value)
              }
              className="w-full bg-[#221f1d] border border-[#292524] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#c29b61]"
            >
              <option>
                Muscle Gain & Hypertrophy
              </option>

              <option>
                Weight Loss & Fat Burn
              </option>

              <option>
                Endurance & General Fitness
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleFindGyms}
            disabled={loading || !location}
            className="bg-[#c29b61] hover:bg-[#b08852] disabled:opacity-40 text-[#141210] font-bold rounded-xl text-xs"
          >
            {loading
              ? "AI Is Generating..."
              : "Generate AI Plan"}
          </button>
        </div>

        {locationError && (
          <p className="text-[11px] text-red-400 mt-4">
            ⚠️ {locationError}
          </p>
        )}

        {!locationLoading &&
          latitude !== null &&
          longitude !== null && (
            <p className="text-[10px] text-[#57534e] mt-3">
              GPS: {latitude.toFixed(6)},{" "}
              {longitude.toFixed(6)}
              {accuracy
                ? ` • Accuracy: ${Math.round(
                    accuracy
                  )}m`
                : ""}
            </p>
          )}
      </section>

      {/* ERROR */}
      {error && (
        <section className="bg-[#1c1917] border border-red-900/50 rounded-2xl p-5">
          <p className="text-xs text-red-400">
            ⚠️ {error}
          </p>
        </section>
      )}

      {/* AI RESULTS */}
      {recommendations && (
        <div className="space-y-6">

          {/* WORKOUT */}
          {recommendations.workout_program && (
            <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

              <div className="flex items-center gap-2 mb-4">
                <span>🏋️</span>

                <h2 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider">
                  AI Workout Program
                </h2>
              </div>

              <h3 className="text-xl font-bold">
                {
                  recommendations
                    .workout_program.title
                }
              </h3>

              {recommendations
                .workout_program
                .description && (
                <p className="text-xs text-[#a8a29e] mt-3">
                  {
                    recommendations
                      .workout_program
                      .description
                  }
                </p>
              )}

              <div className="mt-6">
                <h4 className="text-xs font-semibold text-[#c29b61] uppercase mb-3">
                  Weekly Schedule
                </h4>

                {renderWorkoutSchedule()}
              </div>
            </section>
          )}

          {/* CHALLENGE */}
          {recommendations.fitness_challenge && (
            <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

              <div className="flex items-center gap-2 mb-4">
                <span>🔥</span>

                <h2 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider">
                  AI Fitness Challenge
                </h2>
              </div>

              <h3 className="text-xl font-bold">
                {
                  recommendations
                    .fitness_challenge.title
                }
              </h3>

              <p className="text-xs text-[#a8a29e] mt-3">
                {
                  recommendations
                    .fitness_challenge.description
                }
              </p>

              <div className="inline-block mt-4 bg-[#141210] border border-[#292524] px-3 py-2 rounded-lg">
                <span className="text-[10px] text-[#c29b61] font-bold">
                  {
                    recommendations
                      .fitness_challenge
                      .duration_days
                  }{" "}
                  DAYS
                </span>
              </div>
            </section>
          )}

          {/* REAL GYMS */}
          <section>

            <div className="flex justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase">
                Real Gyms Near{" "}
                {recommendations.location}
              </h3>

              <span className="text-[10px] text-[#78716c]">
                {recommendations.real_gyms_found ??
                  0}{" "}
                found
              </span>
            </div>

            {Array.isArray(
              recommendations.recommended_gyms
            ) &&
            recommendations
              .recommended_gyms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.recommended_gyms.map(
                  (gym, index) => (
                    <div
                      key={index}
                      className="bg-[#1c1917] border border-[#292524] p-4 rounded-xl"
                    >
                      <h4 className="text-xs font-bold">
                        {gym.name}
                      </h4>

                      {gym.reason && (
                        <p className="text-[11px] text-[#a8a29e] mt-2">
                          {gym.reason}
                        </p>
                      )}

                      {gym.source && (
                        <p className="text-[9px] text-[#57534e] mt-3">
                          Source: {gym.source}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-5">
                <p className="text-xs text-[#a8a29e]">
                  📍 No real gym data was found near
                  this location.
                </p>

                <p className="text-[11px] text-[#57534e] mt-2">
                  The AI workout plan is still
                  available above.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}