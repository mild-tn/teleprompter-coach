import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { fullText, taskType, userAnswer } = await req.json()

  const taskDesc =
    taskType === 'translate' ? 'translate it into Thai' : 'summarize it in English'

  const prompt = `You are a language coach reviewing a student's work.

ORIGINAL TEXT:
${fullText}

TASK: The student was asked to ${taskDesc}.

STUDENT'S RESPONSE:
${userAnswer}

Provide a structured review. Return ONLY a JSON object with no markdown:
{"score":85,"scoreLabel":"Good","positives":["strength 1","strength 2"],"corrections":[{"original":"student wrote this","correction":"should be this","explanation":"reason"}],"vocab":[{"word":"key word","definition":"meaning in context"}]}

Give 2-3 positives, 0-3 corrections (only real errors), and 4-6 vocab words from the original text. Score 0-100.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const raw = data.content.map((i: { type: string; text?: string }) => i.text || '').join('')
  const clean = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return NextResponse.json(parsed)
}
