const TIMEOUT_MS = 30000

async function callAI(provider, messages, responseFormat) {
  const { baseUrl, model, apiKey } = provider
  if (!baseUrl || !model) {
    throw new Error('AI provider not configured — set baseUrl and model in settings')
  }

  const url = baseUrl.replace(/\/+$/, '') + '/chat/completions'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || 'none'}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        response_format: responseFormat,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`AI API error ${response.status}: ${text.slice(0, 300)}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('AI returned empty response')
    return content
  } finally {
    clearTimeout(timer)
  }
}

function buildSystemPrompt(basePrompt) {
  return `${basePrompt}

Return ONLY a JSON array of task objects. Each task object must have:
- "title": short descriptive title
- "content": one-sentence description of what to implement
- "tags": array of relevant category strings

DO NOT include markdown code fences or any text outside the JSON array.`
}

export async function divideTask({ provider, node, ancestors, count, systemPrompt }) {
  const ancestorTitles = (ancestors || []).map((a) => a.title).join(' > ')
  const userMessage = ancestorTitles
    ? `Break down "${node.title}" into ${count || 4} sub-tasks.\nContext: this task is a child of "${ancestorTitles}".\n\nThe task description: ${node.content || 'No description provided.'}`
    : `Break down "${node.title}" into ${count || 4} sub-tasks.\n\nThe task description: ${node.content || 'No description provided.'}`

  const content = await callAI(
    provider,
    [
      { role: 'system', content: buildSystemPrompt(systemPrompt) },
      { role: 'user', content: userMessage },
    ],
    { type: 'json_object' },
  )

  try {
    const parsed = JSON.parse(content)
    const tasks = Array.isArray(parsed) ? parsed : parsed.tasks || parsed.children || []
    if (!tasks.length) throw new Error('No tasks returned')
    return tasks.map((t) => ({
      title: String(t.title || 'Untitled').slice(0, 200),
      content: String(t.content || '').slice(0, 1000),
      tags: (Array.isArray(t.tags) ? t.tags : []).map(String).slice(0, 6),
    }))
  } catch (error) {
    if (error.message.includes('No tasks') || error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response: ${content.slice(0, 200)}`)
    }
    throw error
  }
}

export async function reformulateTask({ provider, node, ancestors }) {
  const ancestorTitles = (ancestors || []).map((a) => a.title).join(' > ')
  const userMessage = ancestorTitles
    ? `Reformulate and improve this task: "${node.title}".\nContext: parent tasks = "${ancestorTitles}".\nDescription: ${node.content || 'None'}`
    : `Reformulate and improve this task: "${node.title}".\nDescription: ${node.content || 'None'}`

  const content = await callAI(
    provider,
    [
      { role: 'system', content: 'You are a technical editor. Improve task titles and descriptions. Return ONLY a JSON object with "title", "content", and "tags" fields. No markdown, no code fences.' },
      { role: 'user', content: userMessage },
    ],
    { type: 'json_object' },
  )

  try {
    const parsed = JSON.parse(content)
    return {
      title: String(parsed.title || node.title).slice(0, 200),
      content: String(parsed.content || node.content).slice(0, 1000),
      tags: (Array.isArray(parsed.tags) ? parsed.tags : node.tags || []).map(String).slice(0, 6),
    }
  } catch {
    throw new Error(`Failed to parse reformulated task response: ${content.slice(0, 200)}`)
  }
}
