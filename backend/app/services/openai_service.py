import base64
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")

def analyze_screen(image_bytes: bytes, user_lang: str = "English") -> str:
    b64 = image_to_base64(image_bytes)

    prompt = f"""
You are a realtime AI tutor.
The user is sharing their computer screen.
Your job: guide them step-by-step like a teacher.

Rules:
- Give short clear steps
- Mention exact buttons/text you see
- If you are unsure, ask user to zoom or scroll
- Reply in {user_lang}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this screen and guide the user live."},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                ],
            },
        ],
        max_tokens=250,
    )

    return response.choices[0].message.content
