import logging
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
logger = logging.getLogger(__name__)


class OpenAIClient:
    """Simple wrapper around the OpenAI SDK with a chat interface."""

    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("UPSTAGE_API_KEY"),
            base_url="https://api.upstage.ai/v1",
        )

    def chat(
        self,
        messages: list,
        model: str = "solar-pro",
        temperature: float = 0,
    ) -> str:
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
        )
        text = response.choices[0].message.content.strip()
        logger.debug("OpenAI chat response: %s", text)
        return text

    # backwards compatibility
    def generate(self, *args, **kwargs):
        return self.chat(*args, **kwargs)