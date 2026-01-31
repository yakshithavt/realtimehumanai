import base64
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def analyze_screen(image_bytes: bytes, user_lang: str = "English") -> str:
    """
    Takes screenshot bytes and returns instructions based on what's on the screen.
    """

    # convert image -> base64
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")

    prompt = f"""
You are a real-time screen tutor assistant.

Your job:
- Look at the user's screen screenshot
- Understand what app/page is open
- Give step-by-step instructions clearly
- Be interactive like a teacher
- Answer ONLY in {user_lang}

Rules:
- Use bullet points / numbered steps
- If something is unclear, ask 1 short question
- If user is stuck, provide an alternative method
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this screen and guide me."},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_b64}"},
                    },
                ],
            },
        ],
        max_tokens=400,
    )

    return response.choices[0].message.content
