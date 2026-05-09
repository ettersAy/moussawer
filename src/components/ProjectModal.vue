<template>
  <div class="overlay" @click.self="$emit('close')">
    <section class="panel">
      <header class="panel-header">
        <h2>{{ mode === 'create' ? 'New Project' : 'Edit Project' }}</h2>
        <button class="icon" @click="$emit('close')">&times;</button>
      </header>

      <div class="content">
        <div class="form-grid">
          <label>
            Project name
            <input
              v-model="form.name"
              placeholder="My Project"
              maxlength="200"
              @input="clearError"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </label>

          <label>
            Description
            <textarea
              v-model="form.description"
              placeholder="What is this project about?"
              rows="2"
              maxlength="1000"
            />
          </label>

          <label>
            GitHub repository URL
            <div class="url-row">
              <input
                v-model="form.githubUrl"
                placeholder="https://github.com/owner/repo"
                @blur="validateGithub"
              />
              <span v-if="githubStatus === 'valid'" class="gh-valid">&#10003;</span>
              <span v-if="githubStatus === 'invalid'" class="gh-invalid">&#10007;</span>
            </div>
            <span v-if="errors.githubUrl" class="field-error">{{ errors.githubUrl }}</span>
            <span v-if="githubMeta" class="gh-meta">
              {{ githubMeta.description || githubMeta.name }}
              <template v-if="githubMeta.stars"> · &#9733; {{ githubMeta.stars }}</template>
              <template v-if="githubMeta.language"> · {{ githubMeta.language }}</template>
            </span>
          </label>

          <label>
            Local path
            <input
              v-model="form.localPath"
              placeholder="~/dev/my-project"
              maxlength="500"
            />
          </label>
        </div>

        <div class="actions-row">
          <button class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button class="save-btn" :disabled="saving" @click="submit">
            {{ saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useProjectStore } from '../stores/projectStore.js'

const props = defineProps({
  mode: { type: String, default: 'create' },
  project: { type: Object, default: null },
})

const emit = defineEmits(['close', 'created', 'updated'])

const projectStore = useProjectStore()
const saving = ref(false)
const githubStatus = ref(null)
const githubMeta = ref(null)
const errors = reactive({})

const form = reactive({
  name: props.project?.name || '',
  description: props.project?.description || '',
  githubUrl: props.project?.githubUrl || '',
  localPath: props.project?.localPath || '',
})

function clearError() {
  errors.name = ''
}

function isValidGithubUrl(url) {
  if (!url) return true
  try {
    const p = new URL(url)
    return p.hostname === 'github.com' && p.pathname.split('/').filter(Boolean).length >= 2
  } catch {
    return false
  }
}

async function validateGithub() {
  githubStatus.value = null
  githubMeta.value = null
  if (!form.githubUrl) return
  if (!isValidGithubUrl(form.githubUrl)) {
    githubStatus.value = 'invalid'
    return
  }
  githubStatus.value = 'valid'
  // Try to fetch metadata
  try {
    const parts = new URL(form.githubUrl).pathname.replace(/^\//, '').replace(/\.git$/, '').split('/')
    const [owner, repo] = parts
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (res.ok) {
      const data = await res.json()
      githubMeta.value = {
        name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        language: data.language,
      }
    }
  } catch {
    // metadata fetch failed — non-blocking
  }
}

async function submit() {
  errors.name = ''
  errors.githubUrl = ''

  if (!form.name.trim()) {
    errors.name = 'Name is required'
    return
  }
  if (form.githubUrl && !isValidGithubUrl(form.githubUrl)) {
    errors.githubUrl = 'Must be a valid github.com URL'
    return
  }

  saving.value = true
  try {
    if (props.mode === 'create') {
      const project = await projectStore.createProject({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        localPath: form.localPath.trim() || undefined,
      })
      emit('created', project)
    } else if (props.project) {
      const updated = await projectStore.updateProject(props.project.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        localPath: form.localPath.trim() || undefined,
      })
      emit('updated', updated)
    }
  } catch (e) {
    errors.name = e.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.38);
}
.panel {
  width: min(500px, 100%);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-strong);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--panel-border);
}
.panel-header h2 { margin: 0; }
.icon {
  width: 32px; height: 32px; border: 0; border-radius: 7px;
  background: var(--button); color: var(--button-text); font-size: 20px; cursor: pointer;
}
.content { padding: 18px; }
.form-grid { display: grid; gap: 14px; }
label { display: grid; gap: 4px; font-size: 13px; font-weight: 800; }
input, textarea, select {
  width: 100%; border: 1px solid var(--panel-border); border-radius: 7px;
  padding: 9px 11px; background: var(--field); color: var(--text); font-family: inherit;
}
textarea { resize: vertical; }
.url-row { display: flex; align-items: center; gap: 8px; }
.url-row input { flex: 1; }
.gh-valid { color: #22c55e; font-weight: 800; }
.gh-invalid { color: var(--danger); font-weight: 800; }
.gh-meta { font-size: 12px; color: var(--muted); font-weight: 400; margin-top: 2px; }
.field-error { font-size: 12px; color: var(--danger); font-weight: 400; }
.actions-row { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }
.cancel-btn {
  border: 1px solid var(--panel-border); border-radius: 7px; padding: 8px 16px;
  background: var(--button); color: var(--button-text); cursor: pointer; font-weight: 700;
}
.save-btn {
  border: 0; border-radius: 7px; padding: 8px 20px;
  background: var(--accent); color: #fff; cursor: pointer; font-weight: 700;
}
.save-btn:disabled { opacity: 0.5; cursor: default; }
</style>
