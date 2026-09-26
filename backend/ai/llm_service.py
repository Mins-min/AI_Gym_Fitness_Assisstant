import os
import httpx


# ============================================================
# GROQ CONFIGURATION
# ============================================================

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

GROQ_MODEL = "llama-3.1-8b-instant"


# ============================================================
# GENERATE RESPONSE
# ============================================================

async def generate_response(prompt: str) -> str:

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        print("GROQ_API_KEY is not configured.")

        return (
            "AI service is not configured. "
            "Please contact the administrator."
        )

    try:

        async with httpx.AsyncClient() as client:

            response = await client.post(

                GROQ_URL,

                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },

                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                },

                timeout=60.0
            )

            response.raise_for_status()

            data = response.json()

            return (
                data["choices"][0]["message"]["content"]
                .strip()
            )


    except httpx.TimeoutException:

        print("Groq request timed out.")

        return (
            "The AI took too long to respond. "
            "Please try again."
        )


    except httpx.HTTPStatusError as e:

        print(
            f"Groq API error: "
            f"{e.response.status_code} - "
            f"{e.response.text}"
        )

        return (
            "The AI service is temporarily unavailable. "
            "Please try again."
        )


    except Exception as e:

        print(f"LLM Error: {e}")

        return (
            "Something went wrong while "
            "communicating with the AI."
        )