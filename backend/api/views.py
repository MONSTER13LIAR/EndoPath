import json
import openai
import re
from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _get_client():
    return openai.OpenAI(
        api_key=settings.FEATHERLESS_API_KEY,
        base_url=settings.FEATHERLESS_BASE_URL
    )

# Known multimodal models on Featherless.AI
VISION_MODELS = [
    'Kaushika04/Qwen2-VL-2B-Instruct-LoRA-FT_video_finetuned',
    'Qwen/Qwen3-VL-30B-A3B-Instruct',
    'xtuner/llava-llama-3-8b-v1_1',
    'alibayram/doktor-gemma3-12b-vision3',
    'OptimusePrime/Magistral-Small-2506-Vision'
]

def _parse_messages(raw_messages, model_id=''):
    """
    Convert frontend message format to OpenAI format.
    If the model is NOT a known vision model, we strip the image to prevent 400 errors.
    """
    result = []
    is_vision = any(v in model_id for v in VISION_MODELS)
    
    for m in raw_messages:
        role = 'assistant' if m['role'] == 'ai' else 'user'
        content = m['content']
        
        if m.get('image'):
            if is_vision:
                result.append({
                    'role': role,
                    'content': [
                        {'type': 'text', 'text': content or "Analyze this image."},
                        {
                            'type': 'image_url',
                            'image_url': {'url': m['image']}
                        }
                    ]
                })
            else:
                # Text-only fallback
                text_fallback = f"[USER UPLOADED AN IMAGE] {content}"
                result.append({'role': role, 'content': text_fallback})
        else:
            result.append({'role': role, 'content': content})
    return result


def _stream_response(client, system_prompt, messages, model='meta-llama/Meta-Llama-3.1-8B-Instruct'):
    """Yield SSE-formatted chunks from a streaming OpenAI call."""
    full_messages = [{'role': 'system', 'content': system_prompt}] + messages
    stream = client.chat.completions.create(
        model=model,
        messages=full_messages,
        stream=True,
        max_tokens=1024,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content:
            text = chunk.choices[0].delta.content
            yield f"data: {json.dumps({'delta': text})}\n\n"
    yield "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# EndoAI — personalised endometriosis health assistant
# ---------------------------------------------------------------------------

ENDOAI_SYSTEM = """You are EndoAI, a compassionate and knowledgeable AI health assistant built into EndoPath.

Your role covers six progressive stages: Predict, Prepare, Action, Manage, Stabilize, Recover.

Predict Stage: Ask 3-10 pinpointing questions, then 2-6 confirmation questions.
Prepare Stage: Use checklist (Report, Body Map, Age) and explain (Time, Risk, Cost) before moving to Action.
Action Stage: Immediate relief and treatment guidance.

Guidelines:
- Warm, empathetic, non-medical advice.
- MEDICAL REPORT ANALYSIS: If an image is provided, extract all text and summarize key findings.
- STRUCTURED STATUS: Every message MUST end with:
  [PHASE: Pinpointing/Confirmation/Preparation/Action] [PROBABILITY: X%] [MARKER: NONE/MOVE_TO_PREPARE/MOVE_TO_ACTION]
- DO NOT simulate UI buttons with text/HTML. Just use markers.

FORMATTING RULES:
- Use multiple paragraphs to separate different thoughts or sections of your response.
- NEVER send a single large block of text.
- Use clear punctuation (periods, commas) to make your empathetic tone feel natural and readable.
- Use bullet points for lists or steps when appropriate."""

@csrf_exempt
@require_POST
def endoai_chat(request):
    try:
        body = json.loads(request.body)
        raw_messages = body.get('messages', [])
        stage = body.get('stage', 'predict')
        has_image = any(m.get('image') for m in raw_messages)
        
        default_text_model = 'meta-llama/Meta-Llama-3.1-8B-Instruct'
        preferred_vision_model = 'Kaushika04/Qwen2-VL-2B-Instruct-LoRA-FT_video_finetuned'
        
        target_model = body.get('model')
        if not target_model:
            target_model = preferred_vision_model if has_image else default_text_model

        if not raw_messages:
            return JsonResponse({'error': 'messages are required'}, status=400)

        def get_completion(current_model, is_retry=False):
            messages = _parse_messages(raw_messages, current_model)
            is_multimodal = any(v in current_model for v in VISION_MODELS)
            
            extra_system = ""
            if has_image and not is_multimodal:
                extra_system = "\n\nNOTE: User uploaded an image. Ask for a detailed description since vision is currently restricted."
            
            system = ENDOAI_SYSTEM + extra_system + f"\n\nCURRENT CONTEXT: User is in '{stage.capitalize()}'."
            
            if stage == 'predict':
                system += f"\n- Progress: {len([m for m in raw_messages if m['role']=='user'])} user responses."
            elif stage == 'prepare':
                img_ok = "YES" if any(m.get('image') for m in raw_messages) else "NO"
                map_ok = "YES" if any('[Body areas selected:' in (m.get('content') or '') for m in raw_messages) else "NO"
                system += f"\n- Checklist: Report:{img_ok}, BodyMap:{map_ok}. Rule: Use MOVE_TO_ACTION only when all YES and info explained."

            client = _get_client()
            try:
                response = client.chat.completions.create(
                    model=current_model,
                    max_tokens=1024,
                    messages=[{'role': 'system', 'content': system}] + messages,
                )
                return response.choices[0].message.content
            except Exception as e:
                # Automatic Fallback for vision model failures
                if not is_retry and (has_image or current_model != default_text_model):
                    return get_completion(default_text_model, is_retry=True)
                raise e

        content = get_completion(target_model)
        content = re.sub(r'<[^>]*>', '', content) # Strip hallucinated HTML

        # Fallback block if AI forgets
        if "[PROBABILITY:" not in content:
            prob = min(len(raw_messages) * 10, 60)
            content += f"\n[PHASE: {stage.capitalize()}] [PROBABILITY: {prob}%] [MARKER: NONE]"

        return JsonResponse({'content': content})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def nerdai_chat(request):
    try:
        body = json.loads(request.body)
        message = body.get('message', '').strip()
        model = body.get('model', 'meta-llama/Meta-Llama-3.1-8B-Instruct')
        if not message: return JsonResponse({'error': 'message required'}, status=400)

        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            max_tokens=512,
            messages=[{'role': 'system', 'content': "You are NerdAI assistant."}, {'role': 'user', 'content': message}],
        )
        return JsonResponse({'content': response.choices[0].message.content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def puffyai_chat(request):
    try:
        body = json.loads(request.body)
        raw_messages = body.get('messages', [])
        model = body.get('model', 'meta-llama/Meta-Llama-3.1-8B-Instruct')
        if not raw_messages: return JsonResponse({'error': 'messages required'}, status=400)

        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            max_tokens=512,
            messages=[{'role': 'system', 'content': "You are PuffyAI support."}] + _parse_messages(raw_messages),
        )
        return JsonResponse({'content': response.choices[0].message.content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
