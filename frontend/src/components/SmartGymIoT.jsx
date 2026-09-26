import React, {
  useEffect,
  useState
} from 'react';

import { API_URL } from '../api';


export default function SmartGymIoT({ username }) {

  const [iotState, setIotState] =
    useState(null);

  const [resistance, setResistance] =
    useState(10);

  const [completedReps, setCompletedReps] =
    useState(12);

  const [recommendation, setRecommendation] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [recommendationLoading, setRecommendationLoading] =
    useState(false);

  const [statusMsg, setStatusMsg] =
    useState('');

  const [error, setError] =
    useState('');


  // =========================================================
  // READ RESPONSE SAFELY
  // =========================================================

  const readResponse = async (response) => {

    const text =
      await response.text();

    let data = {};

    try {

      data =
        text
          ? JSON.parse(text)
          : {};

    } catch {

      throw new Error(
        text || 'Server returned an invalid response.'
      );
    }

    if (!response.ok) {

      throw new Error(
        data.detail ||
        data.message ||
        `Server error: ${response.status}`
      );
    }

    return data;
  };


  // =========================================================
  // GET IOT STATUS
  // =========================================================

  const fetchIotStatus = async () => {

    try {

      setError('');

      const response =
        await fetch(
          `${API_URL}/api/iot/status`
        );

      const data =
        await readResponse(response);

      setIotState(data);

      if (
        data.resistance_level !== undefined
      ) {

        setResistance(
          Number(
            data.resistance_level
          )
        );
      }

    } catch (err) {

      console.error(
        'IoT status error:',
        err
      );

      setError(
        err.message ||
        'Could not connect to Smart Gym.'
      );
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchIotStatus();

  }, []);


  // =========================================================
  // CHANGE RESISTANCE
  // =========================================================

  const handleUpdateResistance = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    setStatusMsg('');


    try {

      const response =
        await fetch(
          `${API_URL}/api/iot/adjust-resistance`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              resistance_level:
                Number(resistance)

            })
          }
        );


      const data =
        await readResponse(response);


      setIotState(prev => ({

        ...(prev || {}),

        ...data

      }));


      if (
        data.resistance_level !== undefined
      ) {

        setResistance(
          Number(
            data.resistance_level
          )
        );
      }


      setStatusMsg(
        data.message ||
        'Resistance adjusted successfully.'
      );


    } catch (err) {

      console.error(
        'Resistance error:',
        err
      );

      setError(
        err.message ||
        'Could not adjust resistance.'
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // AI RECOMMENDATION
  // =========================================================

  const handleRecommendation = async () => {

    setRecommendationLoading(true);

    setError('');

    setRecommendation('');


    try {

      const query =
        username
          ? `?username=${encodeURIComponent(username)}`
          : '';


      /*
       * IMPORTANT:
       *
       * Backend endpoint is GET.
       *
       * Do NOT change this to POST.
       */

      const response =
        await fetch(
          `${API_URL}/api/iot/recommendation${query}`,
          {
            method: 'GET'
          }
        );


      const data =
        await readResponse(response);


      setRecommendation(
        data.recommendation ||
        'No recommendation was generated.'
      );


    } catch (err) {

      console.error(
        'AI recommendation error:',
        err
      );

      setError(
        err.message ||
        'Could not generate AI recommendation.'
      );

    } finally {

      setRecommendationLoading(false);

    }
  };


  // =========================================================
  // CURRENT VALUES
  // =========================================================

  const currentResistance =
    iotState?.resistance_level ??
    resistance;


  const currentIntensity =
    iotState?.intensity ??
    'Moderate';


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="max-w-5xl mx-auto space-y-6 text-[#e7e5e4] pb-12">


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">

          <span className="text-[10px] font-bold uppercase text-red-400">
            Smart Gym Error
          </span>

          <p className="text-xs text-red-300 mt-1">
            {error}
          </p>

        </div>

      )}


      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex flex-col sm:flex-row justify-between gap-4">

          <div>

            <span className="text-[11px] font-semibold text-[#c29b61] uppercase tracking-wider">
              Smart Gym Assistant
            </span>

            <h2 className="text-base font-bold mt-1">
              AI + IoT Equipment Control
            </h2>

            <p className="text-[11px] text-[#a8a29e] mt-1">
              Monitor resistance and receive AI-powered workout recommendations.
            </p>

          </div>


          <span className="self-start text-xs bg-[#221f1d] border border-[#292524] text-[#c29b61] px-3 py-1.5 rounded-lg font-mono">

            {iotState?.status || 'Connecting...'}

          </span>

        </div>


        {/* ===================================================
            CURRENT STATE
        ==================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">


          <div className="bg-[#221f1d] border border-[#292524] p-5 rounded-xl">

            <span className="text-[10px] text-[#a8a29e] uppercase">
              Resistance
            </span>

            <p className="text-2xl font-bold text-[#c29b61] mt-2">
              {currentResistance} kg
            </p>

          </div>


          <div className="bg-[#221f1d] border border-[#292524] p-5 rounded-xl">

            <span className="text-[10px] text-[#a8a29e] uppercase">
              Intensity
            </span>

            <p className="text-xl font-bold mt-2">
              {currentIntensity}
            </p>

          </div>


          <div className="bg-[#221f1d] border border-[#292524] p-5 rounded-xl">

            <span className="text-[10px] text-[#a8a29e] uppercase">
              Completed Reps
            </span>

            <input
              type="number"
              min="0"
              value={completedReps}
              onChange={(e) =>
                setCompletedReps(
                  Number(e.target.value)
                )
              }
              className="mt-2 w-full bg-[#141210] border border-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b61]"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          RESISTANCE CONTROL
      ====================================================== */}

      <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <h3 className="text-sm font-bold uppercase">
          Adjust Cable Resistance
        </h3>

        <p className="text-[11px] text-[#a8a29e] mt-1">
          Set the equipment resistance between 1 kg and 20 kg.
        </p>


        <form
          onSubmit={handleUpdateResistance}
          className="mt-6 space-y-5"
        >

          <div className="flex items-center gap-4">

            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={resistance}
              onChange={(e) =>
                setResistance(
                  Number(e.target.value)
                )
              }
              className="flex-1 accent-[#c29b61]"
            />

            <span className="text-sm font-bold text-[#c29b61] w-20 text-right">
              {resistance} kg
            </span>

          </div>


          <button
            type="submit"
            disabled={loading}
            className="bg-[#c29b61] hover:bg-[#b08852] disabled:opacity-50 text-[#110703] font-bold px-6 py-3 rounded-xl text-xs"
          >

            {loading
              ? 'Updating...'
              : 'Push Resistance via MQTT'}

          </button>

        </form>


        {statusMsg && (

          <div className="mt-4 bg-[#221f1d] border border-[#292524] rounded-xl p-3 text-xs text-[#c29b61]">

            ⚡ {statusMsg}

          </div>

        )}

      </section>


      {/* =====================================================
          AI RECOMMENDATION
      ====================================================== */}

      <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <span className="text-[11px] font-semibold text-[#c29b61] uppercase tracking-wider">
          Smart Gym AI
        </span>

        <h2 className="text-lg font-bold mt-1">
          Workout Recommendation
        </h2>

        <p className="text-[11px] text-[#a8a29e] mt-1">
          Let the AI analyze your current equipment state.
        </p>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">


          <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-5">

            <span className="text-[10px] text-[#a8a29e]">
              Current Resistance
            </span>

            <p className="text-xl font-bold text-[#c29b61] mt-2">
              {currentResistance} kg
            </p>

          </div>


          <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-5">

            <span className="text-[10px] text-[#a8a29e]">
              Completed Reps
            </span>

            <p className="text-xl font-bold mt-2">
              {completedReps}
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={handleRecommendation}
          disabled={recommendationLoading}
          className="w-full mt-5 bg-[#c29b61] hover:bg-[#b08852] disabled:opacity-50 text-[#110703] font-bold py-3 rounded-xl text-xs"
        >

          {recommendationLoading
            ? 'AI is analyzing...'
            : '🤖 Get AI Workout Recommendation'}

        </button>


        {recommendation && (

          <div className="mt-5 bg-[#221f1d] border border-[#292524] rounded-xl p-5">

            <span className="text-[10px] text-[#c29b61] font-bold uppercase">
              AI Recommendation
            </span>

            <p className="text-xs leading-relaxed mt-3 whitespace-pre-wrap">
              {recommendation}
            </p>

          </div>

        )}

      </section>

    </div>
  );
}