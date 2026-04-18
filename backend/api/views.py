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
    result = []
    is_vision = any(v in model_id for v in VISION_MODELS)
    for m in raw_messages:
        role = 'assistant' if m['role'] == 'ai' else 'user'
        content = m['content']
        if m.get('image'):
            if is_vision:
                result.append({
                    'role' : role,
                    'content': [
                        {'type': 'text', 'text': content or "Analyze this image."},
                        {'type': 'image_url', 'image_url': {'url' : m['image']}}
                    ]
                })
            else:
                text_fallback = f"[USER UPLOADED AN IMAGE] {content}"
                result.append({'role': role, 'content': text_fallback})
        else:
            result.append({'role': role, 'content': content})
    return result

# ---------------------------------------------------------------------------
# EndoAI — personalised endometriosis health assistant
# ---------------------------------------------------------------------------

ENDOAI_SYSTEM = """You are EndoAI, a compassionate and knowledgeable AI health assistant built into EndoPath.
Your role covers six progressive stages of care:
  1. Predict  — pinpoint symptoms and forecast flares.
  2. Prepare  — checklist and prep for the upcoming action.
  3. Action   — immediate relief and treatment implementation.
  4. Manage   — long-term lifestyle and medication routine.
  5. Stabilize — maintaining improvements and mental health.
  6. Recover  — reflection and returning to normal activity.

STRICT TRANSITION MARKERS:
- [MOVE_TO_PREPARE]
- [MOVE_TO_ACTION]
- [MOVE_TO_MANAGE]
- [MOVE_TO_STABILIZE]
- [MOVE_TO_RECOVER]

FORMATTING RULES:
- Use multiple paragraphs. Use clear punctuation.
- Warm, empathetic tone. No clinical diagnoses.
- Every message MUST end with a status block:
  [PHASE: StageName] [PROBABILITY: X%] [MARKER: NONE/TRANSITION_MARKER]

KEY INSIGHT EXTRACTION:
- Whenever the user shares a significant detail (e.g., 'pain in lower right abdomen', 'flares after coffee', 'CA-125 test was 35'), you MUST extract it.
- Append [KEY_INSIGHT: Brief summary of fact] to the end of your message alongside the status block.
- Keep insights short and data-focused (max 6-8 words)."""

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
        
        target_model = body.get('model') or (preferred_vision_model if has_image else default_text_model)

        def get_completion(current_model, is_retry=False):
            messages = _parse_messages(raw_messages, current_model)
            is_multimodal = any(v in current_model for v in VISION_MODELS)
            
            extra_system = ""
            if has_image and not is_multimodal:
                extra_system = "\n\nNOTE: User uploaded an image. Vision is restricted; ask for a description."
            
            system = ENDOAI_SYSTEM + extra_system + f"\n\nCURRENT CONTEXT: User is in '{stage.capitalize()}' stage."
            
            # --- STAGE REQUIREMENTS ---
            if stage == 'predict':
                system += "\nREQUIREMENT: 3-10 pinpointing questions then 2-6 confirmation. If prob > 70%, use [MOVE_TO_PREPARE]."
            elif stage == 'prepare':
                img_ok = "YES" if any(m.get('image') for m in raw_messages) else "NO"
                map_ok = "YES" if any('[Body areas selected:' in (m.get('content') or '') for m in raw_messages) else "NO"
                system += f"\nCHECKLIST: Report:{img_ok}, BodyMap:{map_ok}. Discuss Age, explain Time/Risk/Cost. Then use [MOVE_TO_ACTION]."
            elif stage == 'action':
                system += "\nCHECKLIST: Guide immediate relief. User must confirm they tried a relief strategy. Then use [MOVE_TO_MANAGE]."
            elif stage == 'manage':
                system += "\nCHECKLIST: Discuss long-term diet/supplements. User must confirm consistency. Then use [MOVE_TO_STABILIZE]."
            elif stage == 'stabilize':
                system += "\nCHECKLIST: Mental health check-in and activity levels. Then use [MOVE_TO_RECOVER]."
            elif stage == 'recover':
                system += "\nCHECKLIST: Final reflection. Then use [MOVE_TO_PREDICT] to restart cycle."

            client = _get_client()
            try:
                response = client.chat.completions.create(
                    model=current_model,
                    max_tokens=1024,
                    messages=[{'role': 'system', 'content': system}] + messages,
                )
                return response.choices[0].message.content
            except Exception:
                if not is_retry and (has_image or current_model != default_text_model):
                    return get_completion(default_text_model, is_retry=True)
                raise

        content = get_completion(target_model)
        content = re.sub(r'<[^>]*>', '', content)

        if "[PROBABILITY:" not in content:
            content += f"\n[PHASE: {stage.capitalize()}] [PROBABILITY: 50%] [MARKER: NONE]"

        return JsonResponse({'content': content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ... NerdAI and PuffyAI stay similar ...
@csrf_exempt
@require_POST
def nerdai_chat(request):
    try:
        body = json.loads(request.body)
        message = body.get('message', '').strip()
        history = body.get('history', [])
        model = body.get('model', 'meta-llama/Meta-Llama-3.1-8B-Instruct')

        NERDAI_SYSTEM = """You are NerdAI, the research expert for EndoPath. 
YOUR ROLE:
1. EXPLAIN: Medical terms, conditions, and procedures.
2. SEARCH: Help users find specific topics in their EndoAI chat history (provided below).
3. ANALYZE: Use body maps and reports to provide context.
You are accurate, helpful, and concise. Remind users you are NOT a doctor."""

        history_context = "\n--- USER'S ENDOAI CHAT HISTORY ---\n"
        for m in (history or []):
            history_context += f"[{m.get('stage','').upper()}] {m['role']}: {m['content']}\n"
        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            max_tokens=1024,
            messages=[{'role': 'system', 'content': NERDAI_SYSTEM + history_context}, {'role': 'user', 'content': message}],
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
        context = body.get('context', {})
        model = body.get('model', 'meta-llama/Meta-Llama-3.1-8B-Instruct')
        
        PUFFYAI_SYSTEM = """You are PuffyAI, the friendly support assistant for EndoPath. 
YOUR KNOWLEDGE:
1. DASHBOARD: Shows Health Trends, Flare Risk, and Stage Progression.
2. ENDOAI: Guides users through 6 stages (Predict, Prepare, Action, Manage, Stabilize, Recover).
3. NEW CHAT: Clears current stage memory but remembers previous stages.
4. LIBRARY: Stores Body Maps & Photos. Records are blurred (click 'Reveal').
5. NERDAI: Inside Library, searches chat history.
6. BODY MAPPER: High-precision tool with 8 segments.
If asked about health symptoms, redirect to EndoAI. If asked to find past chats, redirect to NerdAI."""

        app_context = f"\n--- APP CONTEXT ---\nCurrent Stage: {context.get('currentStage')}\nUnlocked: {context.get('unlockedStages')}"
        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            max_tokens=512,
            messages=[{'role': 'system', 'content': PUFFYAI_SYSTEM + app_context}] + _parse_messages(raw_messages, model),
        )
        return JsonResponse({'content': response.choices[0].message.content})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
