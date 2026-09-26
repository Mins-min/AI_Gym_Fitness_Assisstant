import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  FilesetResolver,
  PoseLandmarker
} from '@mediapipe/tasks-vision';

import { API_URL } from "../api";


export default function RepCounterFeed({
  username
}) {

  const [exercise, setExercise] =
    useState('Bicep Curls');

  const [reps, setReps] =
    useState(0);

  const [isTracking, setIsTracking] =
    useState(false);

  const [poseReady, setPoseReady] =
    useState(false);

  const [formStatus, setFormStatus] =
    useState(
      'Ready - start the camera'
    );

  const [llmInsight, setLlmInsight] =
    useState(
      'AI fitness coach standing by...'
    );

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const poseRef =
    useRef(null);

  const animationRef =
    useRef(null);

  const movementStateRef =
    useRef('START');

  const angleHistoryRef =
    useRef([]);

  const stateSinceRef =
    useRef(0);

  const peakAngleRef =
    useRef(null);

  const troughAngleRef =
    useRef(null);

  const lastCountTimeRef =
    useRef(0);

  const lastCoachTimeRef =
    useRef(0);

  const previousExerciseRef =
    useRef(exercise);


  // =========================================================
  // ANGLE
  // =========================================================

  const calculateAngle = (
    a,
    b,
    c
  ) => {

    if (!a || !b || !c) {
      return null;
    }


    const radians =
      Math.atan2(
        c.y - b.y,
        c.x - b.x
      ) -

      Math.atan2(
        a.y - b.y,
        a.x - b.x
      );


    let angle =
      Math.abs(
        radians * 180 / Math.PI
      );


    if (angle > 180) {
      angle = 360 - angle;
    }


    return angle;
  };


  // =========================================================
  // LANDMARK VISIBILITY
  // =========================================================

  const visible = (
    point,
    minimum = 0.45
  ) => {

    return Boolean(
      point &&
      (point.visibility ?? 1) >= minimum &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y)
    );
  };


  // =========================================================
  // BEST ARM
  // =========================================================

  const getBestArm = (
    landmarks
  ) => {

    const left = [
      landmarks[11],
      landmarks[13],
      landmarks[15]
    ];

    const right = [
      landmarks[12],
      landmarks[14],
      landmarks[16]
    ];


    const leftGood =
      left.every(
        p => visible(p)
      );

    const rightGood =
      right.every(
        p => visible(p)
      );


    if (
      leftGood &&
      rightGood
    ) {

      const leftScore =
        left.reduce(
          (sum, p) =>
            sum +
            (p.visibility ?? 1),
          0
        );


      const rightScore =
        right.reduce(
          (sum, p) =>
            sum +
            (p.visibility ?? 1),
          0
        );


      return rightScore >= leftScore
        ? right
        : left;
    }


    if (leftGood) {
      return left;
    }


    if (rightGood) {
      return right;
    }


    return null;
  };


  // =========================================================
  // SMOOTH ANGLE
  // =========================================================

  const smoothAngle = (
    angle
  ) => {

    if (angle === null) {
      return null;
    }


    const history =
      angleHistoryRef.current;


    history.push(angle);


    /*
     * Slightly larger window than before.
     *
     * This prevents single-frame MediaPipe
     * jumps from changing state.
     */

    if (history.length > 8) {
      history.shift();
    }


    return (
      history.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / history.length
    );
  };


  // =========================================================
  // RESET MOVEMENT
  // =========================================================

  const resetMovement = () => {

    movementStateRef.current =
      'START';

    stateSinceRef.current =
      0;

    peakAngleRef.current =
      null;

    troughAngleRef.current =
      null;

    angleHistoryRef.current =
      [];

    lastCountTimeRef.current =
      0;
  };


  // =========================================================
  // DRAW POSE
  // =========================================================

  const drawPose = (
    landmarks
  ) => {

    const canvas =
      canvasRef.current;

    const video =
      videoRef.current;


    if (
      !canvas ||
      !video
    ) {
      return;
    }


    const width =
      video.videoWidth ||
      640;

    const height =
      video.videoHeight ||
      480;


    canvas.width =
      width;

    canvas.height =
      height;


    const ctx =
      canvas.getContext('2d');


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    const connections = [

      [11, 12],

      [11, 13],
      [13, 15],

      [12, 14],
      [14, 16],

      [11, 23],
      [12, 24],

      [23, 24],

      [23, 25],
      [25, 27],

      [24, 26],
      [26, 28]

    ];


    ctx.lineWidth =
      4;

    ctx.strokeStyle =
      '#c29b61';


    connections.forEach(
      ([a, b]) => {

        const pointA =
          landmarks[a];

        const pointB =
          landmarks[b];


        if (
          !visible(
            pointA,
            0.3
          ) ||
          !visible(
            pointB,
            0.3
          )
        ) {
          return;
        }


        ctx.beginPath();


        ctx.moveTo(
          pointA.x *
            width,

          pointA.y *
            height
        );


        ctx.lineTo(
          pointB.x *
            width,

          pointB.y *
            height
        );


        ctx.stroke();

      }
    );


    landmarks.forEach(
      point => {

        if (
          !visible(
            point,
            0.3
          )
        ) {
          return;
        }


        ctx.beginPath();


        ctx.arc(

          point.x *
            width,

          point.y *
            height,

          4,

          0,

          Math.PI * 2

        );


        ctx.fillStyle =
          '#ffffff';

        ctx.fill();

      }
    );

  };


  // =========================================================
  // AI COACH
  // =========================================================

  const getCoachTip = async (
    status,
    currentReps
  ) => {

    const now =
      Date.now();


    if (
      now -
      lastCoachTimeRef.current <
      7000
    ) {
      return;
    }


    lastCoachTimeRef.current =
      now;


    try {

      const prompt =

        `Give one short fitness coaching tip for ${exercise}. ` +

        `The user has completed ${currentReps} reps. ` +

        `Current status: ${status}. ` +

        `Keep it under 15 words.`;


      const response =
        await fetch(`${API_URL}/api/coach-tip`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              prompt
            })
          }
        );


      const data =
        await response.json();


      if (
        response.ok &&
        data.advice
      ) {

        setLlmInsight(
          data.advice.trim()
        );
      }

    } catch (error) {

      console.error(
        'Coach tip error:',
        error
      );

    }
  };


  // =========================================================
  // BICEP CURL
  // =========================================================

  const processBicepCurl = (
    landmarks
  ) => {

    const arm =
      getBestArm(
        landmarks
      );


    if (!arm) {

      setFormStatus(
        'Move into view - show your full arm'
      );

      return;
    }


    const [
      shoulder,
      elbow,
      wrist
    ] = arm;


    const rawAngle =
      calculateAngle(
        shoulder,
        elbow,
        wrist
      );


    const angle =
      smoothAngle(
        rawAngle
      );


    if (angle === null) {
      return;
    }


    /*
     * IMPORTANT:
     *
     * We intentionally use hysteresis.
     *
     * Extended:
     * 155°+
     *
     * Curled:
     * 55°-
     *
     * Exit thresholds are different,
     * so tiny jitter cannot flip states.
     */

    const EXTENDED_ENTER =
      155;

    const CURLED_ENTER =
      55;

    const MIN_STATE_HOLD =
      250;

    const MIN_CURL_RANGE =
      70;


    const now =
      Date.now();


    // =======================================================
    // START
    // =======================================================

    if (
      movementStateRef.current ===
      'START'
    ) {

      if (
        angle >=
        EXTENDED_ENTER
      ) {

        movementStateRef.current =
          'DOWN';

        stateSinceRef.current =
          now;

        peakAngleRef.current =
          angle;

        troughAngleRef.current =
          angle;


        setFormStatus(
          'Arm ready - curl upward 💪'
        );

      } else {

        setFormStatus(
          `Extend your arm - ${Math.round(angle)}°`
        );

      }

      return;
    }


    // =======================================================
    // DOWN / EXTENDED
    // =======================================================

    if (
      movementStateRef.current ===
      'DOWN'
    ) {

      peakAngleRef.current =
        Math.max(

          peakAngleRef.current ??
            angle,

          angle

        );


      troughAngleRef.current =
        Math.min(

          troughAngleRef.current ??
            angle,

          angle

        );


      /*
       * The user must actually reach
       * the curled position.
       */

      if (
        angle <=
        CURLED_ENTER &&

        now -
        stateSinceRef.current >=
        MIN_STATE_HOLD
      ) {

        movementStateRef.current =
          'UP';

        stateSinceRef.current =
          now;

        troughAngleRef.current =
          angle;


        setFormStatus(
          'Curl detected - lower your arm ⬇️'
        );

      }


      return;
    }


    // =======================================================
    // UP / CURLED
    // =======================================================

    if (
      movementStateRef.current ===
      'UP'
    ) {

      troughAngleRef.current =
        Math.min(

          troughAngleRef.current ??
            angle,

          angle

        );


      /*
       * Rep is completed only when
       * the arm returns to extended.
       */

      if (
        angle >=
        EXTENDED_ENTER &&

        now -
        stateSinceRef.current >=
        MIN_STATE_HOLD
      ) {

        const peak =
          peakAngleRef.current ??
          180;


        const trough =
          troughAngleRef.current ??
          180;


        const range =
          peak -
          trough;


        /*
         * Reject small accidental movements.
         */

        if (
          range >=
          MIN_CURL_RANGE &&

          now -
          lastCountTimeRef.current >
          1000
        ) {

          lastCountTimeRef.current =
            now;


          setReps(
            current => {

              const next =
                current + 1;


              const status =
                'Bicep curl completed! 💪';


              setFormStatus(
                status
              );


              getCoachTip(
                status,
                next
              );


              return next;
            }
          );

        }


        /*
         * Prepare for the next repetition.
         */

        movementStateRef.current =
          'DOWN';

        stateSinceRef.current =
          now;

        peakAngleRef.current =
          angle;

        troughAngleRef.current =
          angle;

      }

    }

  };


  // =========================================================
  // SQUAT
  // =========================================================

  const processSquat = (
    landmarks
  ) => {

    const left = [
      landmarks[23],
      landmarks[25],
      landmarks[27]
    ];

    const right = [
      landmarks[24],
      landmarks[26],
      landmarks[28]
    ];


    const leftGood =
      left.every(
        p => visible(p)
      );

    const rightGood =
      right.every(
        p => visible(p)
      );


    if (
      !leftGood &&
      !rightGood
    ) {

      setFormStatus(
        'Move back so your hips and knees are visible'
      );

      return;
    }


    let angle;


    if (
      leftGood &&
      rightGood
    ) {

      angle = (

        calculateAngle(
          left[0],
          left[1],
          left[2]
        ) +

        calculateAngle(
          right[0],
          right[1],
          right[2]
        )

      ) / 2;

    } else if (leftGood) {

      angle =
        calculateAngle(
          left[0],
          left[1],
          left[2]
        );

    } else {

      angle =
        calculateAngle(
          right[0],
          right[1],
          right[2]
        );

    }


    angle =
      smoothAngle(
        angle
      );


    if (angle === null) {
      return;
    }


    const standing =
      angle >= 155;

    const squatting =
      angle <= 105;


    if (
      movementStateRef.current ===
      'START'
    ) {

      if (standing) {

        movementStateRef.current =
          'UP';

        setFormStatus(
          'Ready - squat down ⬇️'
        );

      }

      return;
    }


    if (
      movementStateRef.current ===
      'UP' &&
      squatting
    ) {

      movementStateRef.current =
        'DOWN';

      setFormStatus(
        'Squat detected - stand back up ⬆️'
      );

      return;
    }


    if (
      movementStateRef.current ===
      'DOWN' &&
      standing
    ) {

      const now =
        Date.now();


      if (
        now -
        lastCountTimeRef.current >
        1000
      ) {

        lastCountTimeRef.current =
          now;


        setReps(
          current => {

            const next =
              current + 1;


            const status =
              'Squat completed! 🔥';


            setFormStatus(
              status
            );


            getCoachTip(
              status,
              next
            );


            return next;
          }
        );


        movementStateRef.current =
          'UP';

      }

    }

  };


  // =========================================================
  // PUSH-UP
  // =========================================================

  const processPushUp = (
    landmarks
  ) => {

    const left = [
      landmarks[11],
      landmarks[13],
      landmarks[15]
    ];

    const right = [
      landmarks[12],
      landmarks[14],
      landmarks[16]
    ];


    const leftGood =
      left.every(
        p => visible(p)
      );

    const rightGood =
      right.every(
        p => visible(p)
      );


    if (
      !leftGood &&
      !rightGood
    ) {

      setFormStatus(
        'Move into side view so your arms are visible'
      );

      return;
    }


    let angle;


    if (
      leftGood &&
      rightGood
    ) {

      angle = (

        calculateAngle(
          left[0],
          left[1],
          left[2]
        ) +

        calculateAngle(
          right[0],
          right[1],
          right[2]
        )

      ) / 2;

    } else if (leftGood) {

      angle =
        calculateAngle(
          left[0],
          left[1],
          left[2]
        );

    } else {

      angle =
        calculateAngle(
          right[0],
          right[1],
          right[2]
        );

    }


    angle =
      smoothAngle(
        angle
      );


    if (angle === null) {
      return;
    }


    const up =
      angle >= 150;

    const down =
      angle <= 100;


    if (
      movementStateRef.current ===
      'START'
    ) {

      if (up) {

        movementStateRef.current =
          'UP';

        setFormStatus(
          'Ready - lower your body ⬇️'
        );

      }

      return;
    }


    if (
      movementStateRef.current ===
      'UP' &&
      down
    ) {

      movementStateRef.current =
        'DOWN';

      setFormStatus(
        'Push-up detected - push back up ⬆️'
      );

      return;
    }


    if (
      movementStateRef.current ===
      'DOWN' &&
      up
    ) {

      const now =
        Date.now();


      if (
        now -
        lastCountTimeRef.current >
        1000
      ) {

        lastCountTimeRef.current =
          now;


        setReps(
          current => {

            const next =
              current + 1;


            const status =
              'Push-up completed! 🔥';


            setFormStatus(
              status
            );


            getCoachTip(
              status,
              next
            );


            return next;
          }
        );


        movementStateRef.current =
          'UP';

      }

    }

  };


  // =========================================================
  // PROCESS POSE
  // =========================================================

  const processPose = (
    result
  ) => {

    if (
      !result ||
      !result.landmarks ||
      result.landmarks.length === 0
    ) {

      setPoseReady(false);

      setFormStatus(
        'No body detected - stand clearly in front of camera'
      );

      return;
    }


    const landmarks =
      result.landmarks[0];


    setPoseReady(true);


    drawPose(
      landmarks
    );


    if (
      exercise ===
      'Bicep Curls'
    ) {

      processBicepCurl(
        landmarks
      );

    } else if (
      exercise ===
      'Squats'
    ) {

      processSquat(
        landmarks
      );

    } else if (
      exercise ===
      'Push-ups'
    ) {

      processPushUp(
        landmarks
      );

    }

  };


  // =========================================================
  // INITIALIZE MEDIAPIPE
  // =========================================================

  useEffect(() => {

    let cancelled =
      false;


    const initialize =
      async () => {

        try {

          setFormStatus(
            'Loading AI body tracker...'
          );


          const vision =
            await FilesetResolver.forVisionTasks(

              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'

            );


          const landmarker =
            await PoseLandmarker.createFromOptions(

              vision,

              {

                baseOptions: {

                  modelAssetPath:
                    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',

                  delegate:
                    'GPU'

                },

                runningMode:
                  'VIDEO',

                numPoses:
                  1,

                minPoseDetectionConfidence:
                  0.5,

                minPosePresenceConfidence:
                  0.5,

                minTrackingConfidence:
                  0.5

              }

            );


          if (
            cancelled
          ) {

            landmarker.close();

            return;
          }


          poseRef.current =
            landmarker;


          setPoseReady(
            true
          );


          setFormStatus(
            'AI tracker ready - start the camera'
          );


        } catch (error) {

          console.error(
            'MediaPipe initialization error:',
            error
          );


          setPoseReady(
            false
          );


          setFormStatus(
            'Could not load AI body tracker'
          );

        }

      };


    initialize();


    return () => {

      cancelled =
        true;


      if (
        poseRef.current
      ) {

        poseRef.current.close();

        poseRef.current =
          null;

      }

    };

  }, []);


  // =========================================================
  // RESET WHEN EXERCISE CHANGES
  // =========================================================

  useEffect(() => {

    if (
      previousExerciseRef.current !==
      exercise
    ) {

      resetMovement();

      setReps(0);

      setFormStatus(
        `Ready for ${exercise}`
      );

      previousExerciseRef.current =
        exercise;
    }

  }, [exercise]);


  // =========================================================
  // CAMERA
  // =========================================================

  useEffect(() => {

    if (!isTracking) {

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            track =>
              track.stop()
          );

        streamRef.current =
          null;

      }


      return;
    }


    let cancelled =
      false;


    const start =
      async () => {

        try {

          setFormStatus(
            'Starting camera...'
          );


          const stream =
            await navigator.mediaDevices.getUserMedia({

              video: {

                width: {
                  ideal: 640
                },

                height: {
                  ideal: 480
                },

                facingMode:
                  'user'

              },

              audio:
                false

            });


          if (
            cancelled
          ) {

            stream
              .getTracks()
              .forEach(
                track =>
                  track.stop()
              );

            return;
          }


          streamRef.current =
            stream;


          if (
            videoRef.current
          ) {

            videoRef.current.srcObject =
              stream;


            await videoRef.current.play();


            setFormStatus(
              'Camera ready - keep your full body visible'
            );

          }

        } catch (error) {

          console.error(
            'Camera error:',
            error
          );


          setFormStatus(
            'Camera access denied. Allow camera permission.'
          );


          setIsTracking(
            false
          );

        }

      };


    start();


    return () => {

      cancelled =
        true;

    };

  }, [isTracking]);


  // =========================================================
  // DETECTION LOOP
  // =========================================================

  useEffect(() => {

    if (
      !isTracking
    ) {
      return;
    }


    const detect =
      () => {

        const video =
          videoRef.current;

        const landmarker =
          poseRef.current;


        if (
          !video ||
          !landmarker ||
          video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA
        ) {

          animationRef.current =
            requestAnimationFrame(
              detect
            );

          return;
        }


        try {

          const now =
            performance.now();


          const result =
            landmarker.detectForVideo(

              video,

              now

            );


          processPose(
            result
          );


        } catch (error) {

          console.error(
            'Pose detection error:',
            error
          );

        }


        animationRef.current =
          requestAnimationFrame(
            detect
          );

      };


    animationRef.current =
      requestAnimationFrame(
        detect
      );


    return () => {

      if (
        animationRef.current
      ) {

        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current =
          null;

      }

    };

  }, [
    isTracking,
    exercise
  ]);


  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {

    return () => {

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            track =>
              track.stop()
          );

      }


      if (
        animationRef.current
      ) {

        cancelAnimationFrame(
          animationRef.current
        );

      }

    };

  }, []);


  // =========================================================
  // SAVE PERFORMANCE
  // =========================================================

  const savePerformance =
    async () => {

      if (
        !username ||
        reps <= 0
      ) {

        return;
      }


      try {

        await fetch(
          `${API_URL}/api/performance`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              username:
                username,

              exercise:
                exercise,

              score:
                Math.min(
                  100,
                  Math.max(
                    0,
                    70 + reps * 2
                  )
                ),

              motion_efficiency:
                80,

              completed_reps:
                reps,

              feedback:
                formStatus

            })
          }
        );

      } catch (error) {

        console.error(
          'Performance save error:',
          error
        );

      }

    };


  // =========================================================
  // STOP TRACKING
  // =========================================================

  const stopTracking =
    async () => {

      setIsTracking(
        false
      );

      await savePerformance();

      setFormStatus(
        'Workout session saved.'
      );

    };


  // =========================================================
  // RESET
  // =========================================================

  const resetCounter =
    () => {

      setReps(0);

      resetMovement();

      setLlmInsight(
        'AI fitness coach standing by...'
      );

      setFormStatus(
        'Counter reset - start again'
      );

    };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="max-w-6xl mx-auto space-y-6 text-[#e7e5e4] pb-12">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex flex-col md:flex-row justify-between gap-4">

          <div>

            <span className="text-[11px] font-semibold text-[#c29b61] uppercase tracking-wider">
              AI Gym Trainer
            </span>

            <h2 className="text-lg font-bold mt-1">
              Real-Time AI Rep Counter
            </h2>

            <p className="text-[11px] text-[#a8a29e] mt-1">
              AI tracks your body joints and counts complete repetitions with live coaching.
            </p>

          </div>


          <div className="flex gap-2">

            <select
              value={exercise}
              onChange={(e) =>
                setExercise(
                  e.target.value
                )
              }
              disabled={isTracking}
              className="bg-[#221f1d] border border-[#292524] rounded-xl px-3 py-2 text-xs outline-none"
            >

              <option>
                Bicep Curls
              </option>

              <option>
                Squats
              </option>

              <option>
                Push-ups
              </option>

            </select>


            {!isTracking ? (

              <button
                type="button"
                onClick={() => {

                  resetCounter();

                  setIsTracking(
                    true
                  );

                }}
                className="bg-[#c29b61] text-[#110703] font-bold px-4 py-2 rounded-xl text-xs"
              >

                Start Camera

              </button>

            ) : (

              <button
                type="button"
                onClick={stopTracking}
                className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >

                Stop

              </button>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          CAMERA
      ====================================================== */}

      <div className="relative bg-black rounded-2xl overflow-hidden border border-[#292524] min-h-[500px]">


        <video
          ref={videoRef}
          className="w-full h-[500px] object-cover"
          style={{
            transform:
              'scaleX(-1)'
          }}
          muted
          playsInline
        />


        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform:
              'scaleX(-1)'
          }}
        />


        {!isTracking && (

          <div className="absolute inset-0 flex items-center justify-center bg-[#110703]/80">

            <div className="text-center">

              <div className="text-4xl mb-4">
                📷
              </div>

              <p className="text-sm text-[#a8a29e]">
                Click Start Camera to activate AI body tracking.
              </p>

            </div>

          </div>

        )}


        {/* TARGET */}

        <div className="absolute top-4 left-4 bg-[#1c1917]/90 border border-[#292524] px-4 py-3 rounded-xl">

          <span className="text-[10px] text-[#a8a29e] block">
            Target Exercise
          </span>

          <span className="text-xs font-bold">
            {exercise}
          </span>

        </div>


        {/* REPS */}

        <div className="absolute top-4 right-4 bg-[#1c1917]/90 border border-[#292524] px-5 py-3 rounded-xl text-right">

          <span className="text-[10px] text-[#a8a29e] block">
            Repetition Count
          </span>

          <span className="text-3xl font-mono font-bold text-[#c29b61]">
            {reps}
          </span>

        </div>


        {/* STATUS */}

        <div className="absolute bottom-4 left-4 right-4 bg-[#1c1917]/90 border border-[#292524] px-4 py-3 rounded-xl">

          <p className="text-xs">
            {formStatus}
          </p>

        </div>

      </div>


      {/* =====================================================
          CONTROLS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-4">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            User
          </span>

          <p className="text-sm font-bold mt-1">
            {username}
          </p>

        </div>


        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-4">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            AI Tracker
          </span>

          <p className="text-sm font-bold mt-1">
            {poseReady
              ? 'Ready'
              : 'Loading'}
          </p>

        </div>


        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-4">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            Database Memory
          </span>

          <p className="text-sm font-bold text-[#c29b61] mt-1">
            {reps > 0
              ? 'Ready to save'
              : 'Waiting for reps'}
          </p>

        </div>

      </div>


      {/* =====================================================
          AI COACH
      ====================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-5">

        <span className="text-[10px] text-[#c29b61] uppercase font-bold">
          🤖 AI Coach
        </span>

        <p className="text-xs text-[#e7e5e4] mt-2">
          {llmInsight}
        </p>

      </div>


      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex gap-3">

        <button
          type="button"
          onClick={resetCounter}
          className="bg-[#221f1d] hover:bg-[#292524] border border-[#292524] text-[#e7e5e4] px-5 py-3 rounded-xl text-xs font-bold"
        >

          Reset Reps

        </button>


        {!isTracking &&
          reps > 0 && (

            <button
              type="button"
              onClick={savePerformance}
              className="bg-[#c29b61] text-[#110703] px-5 py-3 rounded-xl text-xs font-bold"
            >

              Save Workout

            </button>

          )}

      </div>


      {/* =====================================================
          INSTRUCTIONS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-4">

          <span className="text-xs text-[#c29b61] font-bold">
            1. POSITION
          </span>

          <p className="text-[11px] text-[#a8a29e] mt-2">
            Keep your full body or exercise joints visible to the camera.
          </p>

        </div>


        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-4">

          <span className="text-xs text-[#c29b61] font-bold">
            2. MOVE
          </span>

          <p className="text-[11px] text-[#a8a29e] mt-2">
            Perform each exercise normally and complete the full movement.
          </p>

        </div>


        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-4">

          <span className="text-xs text-[#c29b61] font-bold">
            3. AI COACH
          </span>

          <p className="text-[11px] text-[#a8a29e] mt-2">
            Receive occasional AI coaching tips while exercising.
          </p>

        </div>

      </div>

    </div>
  );
}