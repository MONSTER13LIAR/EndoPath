import json
import openai
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


def _parse_messages(raw_messages):
    """
    Convert frontend message format [{role, content, image?}] to OpenAI format.
    """
    result = []
    for m in raw_messages:
        role = 'assistant' if m['role'] == 'ai' else 'user'
        content = m['content']
        
        # If there's an image, OpenAI expects a list of content items
        if m.get('image'):
            # m['image'] is a data URL: data:image/png;base64,xxxx
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
            # SSE format: "data: <payload>\n\n"
            yield f"data: {json.dumps({'delta': text})}\n\n"
    yield "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# EndoAI — personalised endometriosis health assistant
# ---------------------------------------------------------------------------

ENDOAI_SYSTEM = """You are EndoAI, a compassionate and knowledgeable AI health assistant built into EndoPath — \
an app designed to help people living with endometriosis manage their health journey.

Your role covers six progressive stages of care:
  1. Predict  — identify patterns and forecast flare-ups from symptom and cycle data
  2. Prepare  — help the user prepare physically and mentally for upcoming difficult periods
  3. Action   — guide immediate relief strategies during a flare
  4. Manage   — support long-term lifestyle, medication, and treatment management
  5. Stabilize — help sustain improvements and prevent regression
  6. Recover  — support healing and return to normal activity post-flare

Guidelines:
- Be warm, empathetic, and non-judgmental — endometriosis is a chronic, often invisible illness.
- Always clarify you are an AI and not a doctor; encourage consulting healthcare professionals for diagnoses or medication changes.
- Keep responses concise and actionable. Use bullet points for plans or steps.
- Respect the user's current unlocked stage — don't give advice beyond their active stage unless asked.
- Never make up clinical data or statistics.
- If the user provides an image (e.g., a photo of a symptom, a medical report, or a food diary), analyze it carefully within the context of endometriosis care."""

@csrf_exempt
@require_POST
def endoai_chat(request):
    try:
        body = json.loads(request.body)
        raw_messages = body.get('messages', [])
        stage = body.get('stage', 'predict')
        stream = body.get('stream', False)
        
        # Switch to a Vision model if an image is provided in the last message
        has_image = any(m.get('image') for m in raw_messages)
        default_model = 'meta-llama/Meta-Llama-3.1-8B-Instruct'
        # Featherless often has Llama 3.2 Vision models
        vision_model = 'meta-llama/Llama-3.2-11B-Vision-Instruct'
        
        model = body.get('model', vision_model if has_image else default_model)

        if not raw_messages:
            return JsonResponse({'error': 'messages are required'}, status=400)

        messages = _parse_messages(raw_messages)
        # Append current stage context as system note
        system = ENDOAI_SYSTEM + f"\n\nThe user is currently in the '{stage.capitalize()}' stage."

        client = _get_client()

        if stream:
            response = StreamingHttpResponse(
                _stream_response(client, system, messages, model=model),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        # Non-streaming (default)
        full_messages = [{'role': 'system', 'content': system}] + messages
        response = client.chat.completions.create(
            model=model,
            max_tokens=1024,
            messages=full_messages,
        )
        return JsonResponse({'content': response.choices[0].message.content})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'invalid JSON'}, status=400)
    except openai.AuthenticationError:
        return JsonResponse({'error': 'invalid API key'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ---------------------------------------------------------------------------
# NerdAI — Library research & health-record assistant
# ---------------------------------------------------------------------------

NERDAI_SYSTEM = """You are NerdAI, the knowledgeable research assistant inside EndoPath's Health Library.

Your personality: precise, a little nerdy, genuinely enthusiastic about medical knowledge — but always clear and jargon-free when it matters.

Your job:
- Explain medical terms, conditions, and procedures related to endometriosis and women's health
- Help users understand entries in their health library (body maps, symptom logs, chat history)
- Provide research context: what a symptom might mean, what a treatment does, what a test measures
- Answer questions about endometriosis stages, treatments, hormones, pain management, fertility

Rules:
- Keep answers concise — 2-4 short paragraphs max. The user can see the library behind you.
- Always remind users you are an AI and not a substitute for their doctor when giving clinical guidance.
- Be accurate. If unsure, say so rather than guessing.
- Use plain language; introduce medical terms only when helpful, then immediately explain them."""

@csrf_exempt
@require_POST
def nerdai_chat(request):
    try:
        body = json.loads(request.body)
        message = body.get('message', '').strip()
        model = body.get('model', 'meta-llama/Meta-Llama-3.1-8B-Instruct')
        if not message:
            return JsonResponse({'error': 'message is required'}, status=400)

        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            max_tokens=512,
            messages=[
                {'role': 'system', 'content': NERDAI_SYSTEM},
                {'role': 'user', 'content': message}
            ],
        )
        return JsonResponse({'content': response.choices[0].message.content})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'invalid JSON'}, status=400)
    except openai.AuthenticationError:
        return JsonResponse({'error': 'invalid API key'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ---------------------------------------------------------------------------
# PuffyAI — EndoPath app support assistant
# ---------------------------------------------------------------------------

PUFFYAI_SYSTEM = """You are PuffyAI, the friendly and helpful support assistant for the EndoPath app.

EndoPath App Structure (Post-Login):
- Dashboard: The home screen showing Health Trends, Flare Risk, and progress through the 6 Care Stages.
- EndoAI: Personalised AI chat for health management (Predict, Prepare, Action, Manage, Stabilize, Recover).
- Library: Contains medical articles, health guides, and MOST IMPORTANTLY:
    * All your previous Chat History with EndoAI and NerdAI.
    * Your saved symptom logs and body maps.
- Referral Tool: Helps you find and connect with endometriosis specialist doctors and clinics.
- Support: Where users can find FAQs and talk to you (PuffyAI).

Your role:
- Answer questions about how to use the EndoPath app and where to find things.
- If a user asks where their chat history is, tell them it's in the 'Library'.
- Help users navigate the app, understand their stage, or troubleshoot issues.
- Be encouraging and supportive — users are dealing with a difficult chronic condition.

Guidelines:
- Keep answers short, friendly, and clear.
- If a question is about personal health symptoms, gently redirect to EndoAI.
- Do not make up features that don't exist in EndoPath."""

@csrf_exempt
@require_POST
def puffyai_chat(request):
    try:
        body = json.loads(request.body)
        raw_messages = body.get('messages', [])
        stream = body.get('stream', False)
        model = body.get('model', 'meta-llama/Meta-Llama-3.1-8B-Instruct')

        if not raw_messages:
            return JsonResponse({'error': 'messages are required'}, status=400)

        messages = _parse_messages(raw_messages)
        client = _get_client()

        if stream:
            response = StreamingHttpResponse(
                _stream_response(client, PUFFYAI_SYSTEM, messages, model=model),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        full_messages = [{'role': 'system', 'content': PUFFYAI_SYSTEM}] + messages
        response = client.chat.completions.create(
            model=model,
            max_tokens=512,
            messages=full_messages,
        )
        return JsonResponse({'content': response.choices[0].message.content})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'invalid JSON'}, status=400)
    except openai.AuthenticationError:
        return JsonResponse({'error': 'invalid API key'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
