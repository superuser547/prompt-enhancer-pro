from __future__ import annotations

from dataclasses import dataclass

from app.schemas.enhancement import EnhanceRequest


@dataclass(frozen=True)
class _AiModel:
    value: str
    label: str
    is_image_model: bool = False


_AI_MODELS: tuple[_AiModel, ...] = (
    _AiModel(value="chatgpt-4", label="ChatGPT-4 / GPT-4o (Text)"),
    _AiModel(value="claude-3-opus", label="Claude 3 Opus (Text)"),
    _AiModel(value="gemini-advanced", label="Gemini Advanced (Text)"),
    _AiModel(value="midjourney", label="Midjourney (Image)", is_image_model=True),
    _AiModel(value="dall-e-3", label="DALL-E 3 (Image)", is_image_model=True),
    _AiModel(
        value="stable-diffusion-xl",
        label="Stable Diffusion XL (Image)",
        is_image_model=True,
    ),
    _AiModel(value="imagen-3", label="Imagen 3 (Image)", is_image_model=True),
)


def _find_model(value: str) -> _AiModel | None:
    for model in _AI_MODELS:
        if model.value == value:
            return model
    return None


def get_model_label(value: str) -> str:
    model = _find_model(value)
    return model.label if model else value


def is_image_model(value: str) -> bool:
    model = _find_model(value)
    return model.is_image_model if model else False


def build_meta_prompt(params: EnhanceRequest) -> str:
    """
    Python-аналог src/core/promptEngine.ts::buildMetaPrompt.

    Использует ту же структуру инструкций и параметры, что и фронт.
    """
    target_model_name = get_model_label(params.targetAiModel)
    image_model = is_image_model(params.targetAiModel)
    output_language_name = params.promptLanguage.upper()

    meta_prompt = (
        "You are a world-class prompt engineering assistant.\n"
        "Your primary goal is to enhance the user's initial prompt to make it highly effective for the specified target AI model.\n"
        f"The final enhanced prompt MUST be in the target output language: **{output_language_name}**.\n\n"
        "User's original prompt:\n"
        f"\"{params.initialPrompt}\"\n\n"
        f"Target AI Model: **{target_model_name}**.\n"
        "Tailor the prompt structure, syntax, and keywords considering the specific strengths and requirements of this model. "
        "For example, Midjourney uses '--ar' for aspect ratio, DALL-E prefers descriptive sentences.\n\n"
        f"Target output language for the ENHANCED PROMPT: **{output_language_name}**.\n\n"
        "Enhance this prompt by incorporating the following details and instructions.\n"
        'If a parameter is "Default" or empty, use your best judgment or omit it if not applicable.\n'
        f"Remember to generate the final prompt in **{output_language_name}**.\n\n"
        "**Core Enhancement Parameters:**\n"
        f"- **Style/Tone:** {params.styleOrTone} (Interpret and apply this in {output_language_name})\n"
        f"- **Detail Level:** {params.detailLevel} (Adjust verbosity and detail in {output_language_name})\n"
        f"- **Keywords/Concepts to Add/Emphasize:** {params.keywordsToAdd or 'None specified'} (Incorporate these into the {output_language_name} prompt)\n"
        f"- **Elements to Avoid/Negative Prompts:** {params.negativePrompts or 'None specified'} (Ensure these are excluded in the {output_language_name} prompt)\n"
    )

    if image_model:
        meta_prompt += (
            "\n"
            f"**Image Specific Parameters (for {target_model_name}, in {output_language_name}):**\n"
            f"- **Artistic Medium:** {params.artisticMedium}\n"
            f"- **Camera Angle/Shot Type:** {params.cameraAngle}\n"
            f"- **Lighting:** {params.lighting}\n"
            f"- **Color Palette:** {params.colorPalette}\n"
        )

    meta_prompt += (
        "\n"
        "**Specific Instructions for You (The Prompt Enhancer AI):**\n"
        f"{params.specificInstructions or f'Generate the most effective and creative prompt in {output_language_name} based on the above.'}\n\n"
        "**Output Requirements:**\n"
        f"- Generate ONLY the enhanced prompt text, in **{output_language_name}**.\n"
        '- Do NOT include any explanations, apologies, or conversational filler like "Here is the enhanced prompt:" before or after the prompt.\n'
        f"- The output should be ready to be copied and pasted directly into the target AI model ({target_model_name}).\n"
        f"- If the target model uses specific syntax (e.g., parameters like --v 6 or --ar 16:9 for Midjourney), try to incorporate them intelligently if relevant, ensuring they are compatible with the {output_language_name} prompt.\n"
        "- For image models, focus on vivid descriptions and artistic styles. For text models, focus on clarity, completeness, and appropriate tone. All in "
        f"**{output_language_name}**.\n\n"
        f"Enhanced Prompt for {target_model_name} (in {output_language_name}):\n"
    )
    return meta_prompt
