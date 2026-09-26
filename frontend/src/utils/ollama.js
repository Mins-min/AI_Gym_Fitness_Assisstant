export async function askOllama(
  prompt,
  systemInstruction = ""
) {
  try {
    const finalPrompt = systemInstruction
      ? `${systemInstruction}

USER REQUEST:
${prompt}`
      : prompt;

    const response = await fetch(
      "/api/coach-tip",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          `AI server error: ${response.status}`
      );
    }

    if (!data.advice) {
      throw new Error(
        "AI backend returned no advice."
      );
    }

    return data.advice;
  } catch (error) {
    console.error(
      "AI Coach request failed:",
      error
    );

    throw error;
  }
}