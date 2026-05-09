const STORAGE_KEY = 'mushajjir-settings-v1'
const SCHEMA_VERSION = 1

function storage() {
  return typeof localStorage === 'undefined' ? null : localStorage
}

function defaultSettings() {
  return {
    general: {
      appName: 'Mushajjir',
      defaultChildCount: 4,
      theme: 'light',
    },
    save: {
      folderPath: '',
      format: 'md',
      autoExportEnabled: false,
    },
    ai: {
      selectedProviderId: 'default',
      providers: [
        {
          id: 'default',
          name: 'Ollama (local)',
          baseUrl: 'http://localhost:11434/v1',
          model: 'llama3.2',
          apiKey: 'ollama',
        },
      ],
    },
    prompts: {
      selectedDividePromptId: 'default',
      dividePrompts: [
        {
          id: 'default',
          name: 'Software architect',
          content: 'You are a senior software architect. Break the work into clear, independent tasks that can be executed by a coding agent. For each task, provide: title, short description (content), and relevant tags. Return JSON only.',
        },
      ],
    },
  }
}

export function loadSettings() {
  try {
    const local = storage()
    if (!local) return defaultSettings()

    const raw = local.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings()

    const parsed = JSON.parse(raw)
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) return defaultSettings()

    return parsed.settings || defaultSettings()
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(settings) {
  const local = storage()
  if (!local) return
  local.setItem(
    STORAGE_KEY,
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt: new Date().toISOString(), settings }),
  )
}
