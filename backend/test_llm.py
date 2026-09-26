import asyncio
from ai.llm_service import generate_response


async def main():

    prompt = """
You are an AI fitness coach.

Give me one short and practical fitness tip.
Keep it under 30 words.
"""

    response = await generate_response(prompt)

    print("\nAI RESPONSE:")
    print(response)


if __name__ == "__main__":
    asyncio.run(main())