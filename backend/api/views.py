import json
import anthropic
from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _get_client():
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _parse_messages(raw_messages):
    """
    Convert frontend message format [{role, content}] to Anthropic format.
    Frontend uses 'ai' role; Anthropic expects 'assistant'.
    """
    result = []
    for m in raw_messages:
        role = 'assistant' if m['role'] == 'ai' else 'user'
        result.append({'role': role, 'content': m['content']})
    return result


def _stream_response(client, system_prompt, messages, model='claude-sonnet-4-6'):
    """Yield SSE-formatted chunks from a streaming Claude call."""
    with client.messages.stream(
        model=model,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
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
- Never make up clinical data or statistics."""

@csrf_exempt
@require_POST
def endoai_chat(request):
    try:
        body = json.loads(request.body)
        raw_messages = body.get('messages', [])
        stage = body.get('stage', 'predict')
        stream = body.get('stream', False)

        if not raw_messages:
            return JsonResponse({'error': 'messages are required'}, status=400)

        messages = _parse_messages(raw_messages)
        # Append current stage context as system note
        system = ENDOAI_SYSTEM + f"\n\nThe user is currently in the '{stage.capitalize()}' stage."

        client = _get_client()

        if stream:
            response = StreamingHttpResponse(
                _stream_response(client, system, messages),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        # Non-streaming (default)
        message = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=1024,
            system=system,
            messages=messages,
        )
        return JsonResponse({'content': message.content[0].text})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'invalid JSON'}, status=400)
    except anthropic.AuthenticationError:
        return JsonResponse({'error': 'invalid API key'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ---------------------------------------------------------------------------
# PuffyAI — EndoPath app support assistant
# ---------------------------------------------------------------------------

PUFFYAI_SYSTEM = """You are PuffyAI, the friendly and helpful support assistant for the EndoPath app.

EndoPath is a health platform for people living with endometriosis. It includes:
- A personalised AI health assistant (EndoAI) with six care stages: Predict, Prepare, Action, Manage, Stabilize, Recover
- A Referral Tool to help users find specialist doctors and clinics
- A Health Library with articles, guides, and research on endometriosis
- A Dashboard showing health trends and stage progress

Your role:
- Answer questions about how to use the EndoPath app and its features
- Help users navigate the app, understand their stage, or troubleshoot common issues
- Explain what EndoAI, the Referral Tool, and the Library can do
- Be encouraging and supportive — many users are dealing with a difficult chronic condition

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

        if not raw_messages:
            return JsonResponse({'error': 'messages are required'}, status=400)

        messages = _parse_messages(raw_messages)
        client = _get_client()

        if stream:
            response = StreamingHttpResponse(
                _stream_response(client, PUFFYAI_SYSTEM, messages),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        message = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=512,
            system=PUFFYAI_SYSTEM,
            messages=messages,
        )
        return JsonResponse({'content': message.content[0].text})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'invalid JSON'}, status=400)
    except anthropic.AuthenticationError:
        return JsonResponse({'error': 'invalid API key'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
