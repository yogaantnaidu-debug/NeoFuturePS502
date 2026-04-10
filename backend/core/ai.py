import requests

OPENROUTER_API_KEY = "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"

def health_ai(message, history,profile=None):

    system_prompt = """
You are a strict health assistant.

Rules:
- Only answer health-related queries
- Keep answers SHORT (max 4–5 lines)
- Do NOT use symbols like *, **, or markdown
- Use simple plain text
- Use numbered points like:
  1. ...
  2. ...
- Keep it clean and readable
-dont use any bold statements and give a normal answer like if we are creating or trying to create bold statements its generating a *** thing which would not look nice

"""
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    if profile:
        messages.append({
        "role": "system",
        "content": f"User goal: {profile.goal}, lifestyle: {profile.lifestyle}"
    })
    # add memory
    for chat in history:
        messages.append({"role": "user", "content": chat.message})
        messages.append({"role": "assistant", "content": chat.response})

    # current message
    messages.append({"role": "user", "content": message})
    

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "meta-llama/llama-3-8b-instruct",
            "messages": messages
        }
    )

    result = response.json()

    return result['choices'][0]['message']['content']
    