<template>
  <div class="overlay" @click.self="$emit('close')">
    <section class="panel">
      <header class="panel-header">
        <div>
          <h2>Settings</h2>
          <p>Local browser settings for Mushajjir.</p>
        </div>
        <button class="icon" @click="$emit('close')">×</button>
      </header>

      <div class="content">
        <aside class="tabs">
          <button :class="{ active: tab === 'general' }" @click="tab = 'general'">General</button>
          <button :class="{ active: tab === 'save' }" @click="tab = 'save'">Save</button>
          <button :class="{ active: tab === 'api' }" @click="tab = 'api'">API Keys</button>
          <button :class="{ active: tab === 'prompts' }" @click="tab = 'prompts'">Prompts</button>
        </aside>

        <main class="section">
          <div v-if="tab === 'general'" class="form-grid">
            <label>
              App name
              <input
                :value="settings.settings.general.appName"
                @input="settings.updateGeneral({ appName: $event.target.value })"
              />
            </label>
            <label>
              Default children
              <input
                type="number"
                min="1"
                max="12"
                :value="settings.settings.general.defaultChildCount"
                @input="settings.updateGeneral({ defaultChildCount: Number($event.target.value) })"
              />
            </label>
            <label>
              Theme
              <select
                :value="settings.settings.general.theme"
                @change="settings.updateGeneral({ theme: $event.target.value })"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>

          <div v-if="tab === 'save'" class="form-grid">
            <label>
              Local project path
              <input
                :value="settings.settings.save.folderPath"
                placeholder="Example: ~/dev/my-project"
                @input="onFolderPathChange($event.target.value)"
              />
            </label>
            <p v-if="pathSaved" class="hint success">Path saved to active project.</p>
            <label>
              Preferred export format
              <select
                :value="settings.settings.save.format"
                @change="settings.updateSave({ format: $event.target.value })"
              >
                <option value="md">Markdown</option>
                <option value="txt">Text</option>
                <option value="json">JSON</option>
              </select>
            </label>
          </div>

          <div v-if="tab === 'api'" class="api-section">
            <label>
              Active provider
              <select
                :value="settings.settings.ai.selectedProviderId"
                @change="settings.selectProvider($event.target.value)"
              >
                <option v-for="provider in settings.settings.ai.providers" :key="provider.id" :value="provider.id">
                  {{ provider.name }} — {{ provider.model || 'no model' }}
                </option>
              </select>
            </label>

            <div v-for="provider in settings.settings.ai.providers" :key="provider.id" class="provider-card">
              <div class="provider-head">
                <strong>{{ provider.name }}</strong>
                <button class="small danger" @click="settings.removeProvider(provider.id)">Remove</button>
              </div>
              <label>
                Name
                <input
                  :value="provider.name"
                  @input="settings.updateProvider(provider.id, { name: $event.target.value })"
                />
              </label>
              <label>
                API key
                <input
                  type="password"
                  :value="provider.apiKey"
                  placeholder="sk-..."
                  @input="settings.updateProvider(provider.id, { apiKey: $event.target.value })"
                />
              </label>
              <label>
                API URL
                <input
                  :value="provider.baseUrl"
                  @input="settings.updateProvider(provider.id, { baseUrl: $event.target.value })"
                />
              </label>
              <label>
                Model
                <input
                  :value="provider.model"
                  @input="settings.updateProvider(provider.id, { model: $event.target.value })"
                />
              </label>
            </div>

            <button class="add" @click="settings.addProvider">+ Add custom provider</button>
            <p class="hint">
              Keys are stored only in this browser localStorage. This is fine for local personal use, but not for a
              public hosted app.
            </p>
          </div>

          <div v-if="tab === 'prompts'" class="api-section">
            <label>
              Active divide prompt
              <select
                :value="settings.settings.prompts.selectedDividePromptId"
                @change="settings.selectDividePrompt($event.target.value)"
              >
                <option v-for="prompt in settings.settings.prompts.dividePrompts" :key="prompt.id" :value="prompt.id">
                  {{ prompt.name }}
                </option>
              </select>
            </label>

            <div v-for="prompt in settings.settings.prompts.dividePrompts" :key="prompt.id" class="provider-card">
              <div class="provider-head">
                <strong>{{ prompt.name }}</strong>
                <button class="small danger" @click="settings.removeDividePrompt(prompt.id)">Remove</button>
              </div>
              <label>
                Name
                <input
                  :value="prompt.name"
                  @input="settings.updateDividePrompt(prompt.id, { name: $event.target.value })"
                />
              </label>
              <label>
                System prompt
                <textarea
                  class="prompt-textarea"
                  rows="6"
                  :value="prompt.content"
                  @input="settings.updateDividePrompt(prompt.id, { content: $event.target.value })"
                />
              </label>
            </div>

            <button class="add" @click="settings.addDividePrompt">+ Add custom prompt</button>
            <p class="hint">
              The active prompt is used when the AI divides a task into child tasks. Customize prompts to match your
              domain and preferred task-splitting logic.
            </p>
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settingsStore.js'
import { useProjectStore } from '../stores/projectStore.js'

defineEmits(['close'])

const tab = ref('general')
const settings = useSettingsStore()
const projectStore = useProjectStore()
const pathSaved = ref(false)
let pathTimer = null

function onFolderPathChange(value) {
  settings.updateSave({ folderPath: value })
  if (projectStore.activeProjectId) {
    clearTimeout(pathTimer)
    pathTimer = setTimeout(async () => {
      try {
        await projectStore.updateProject(projectStore.activeProjectId, { localPath: value })
        pathSaved.value = true
        setTimeout(() => (pathSaved.value = false), 2000)
      } catch {
        // silent
      }
    }, 500)
  }
}
</script>

<style scoped src="./SettingsPanel.css"></style>
