import httpx


# ============================================================
# OLLAMA CONFIGURATION
# ============================================================

OLLAMA_URL = (
    "http://localhost:11434/api/generate"
)

OLLAMA_MODEL = "llama3.2:latest"


# ============================================================
# GENERATE RESPONSE
# ============================================================

async def generate_response(
    prompt: str
) -> str:

    try:

        async with httpx.AsyncClient() as client:

            response = await client.post(

                OLLAMA_URL,

                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                },

                timeout=60.0
            )

            response.raise_for_status()

            data = response.json()

            return (
                data.get(
                    "response",
                    "I'm unable to generate a response right now."
                )
                .strip()
            )


    except httpx.ConnectError:

        return (
            "AI service is offline. "
            "Please make sure Ollama is running."
        )


    except httpx.TimeoutException:

        return (
            "The AI took too long to respond. "
            "Please try again."
        )


    except Exception as e:

        print(
            f"LLM Error: {e}"
        )

        return (
            "Something went wrong while "
            "communicating with the AI."
        )