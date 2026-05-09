import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useTreeStore } from './treeStore.js'

const API = '/api/v1/projects'
const LAST_PROJECT_KEY = 'mushajjir-last-project-id'

function getToken() {
  return localStorage.getItem('moussawer_token') || ''
}

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers(), ...options.headers } })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])
  const activeProjectId = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  let saveTimer = null

  const activeProject = computed(() =>
    projects.value.find((p) => p.id === activeProjectId.value) || null,
  )

  const hasProjects = computed(() => projects.value.length > 0)

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch(API)
      projects.value = res.data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createProject(input) {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch(API, {
        method: 'POST',
        body: JSON.stringify(input),
      })
      projects.value.unshift(res.data)
      return res.data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, input) {
    saving.value = true
    error.value = null
    try {
      const res = await apiFetch(`${API}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
      const idx = projects.value.findIndex((p) => p.id === id)
      if (idx !== -1) projects.value[idx] = res.data
      return res.data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      saving.value = false
    }
  }

  async function loadProject(id) {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch(`${API}/${id}`)
      const idx = projects.value.findIndex((p) => p.id === id)
      if (idx !== -1) projects.value[idx] = res.data
      else projects.value.unshift(res.data)
      activeProjectId.value = id
      localStorage.setItem(LAST_PROJECT_KEY, id)
      return res.data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    error.value = null
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' })
      projects.value = projects.value.filter((p) => p.id !== id)
      if (activeProjectId.value === id) {
        activeProjectId.value = null
        localStorage.removeItem(LAST_PROJECT_KEY)
      }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  function saveTreeToApi(treePayload) {
    if (!activeProjectId.value) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        await apiFetch(`${API}/${activeProjectId.value}`, {
          method: 'PATCH',
          body: JSON.stringify({ treeData: JSON.stringify(treePayload) }),
        })
      } catch {
        // silent save failure — data stays in localStorage
      }
    }, 500)
  }

  function initFromLocalStorage() {
    const lastId = localStorage.getItem(LAST_PROJECT_KEY)
    if (lastId) {
      activeProjectId.value = lastId
      return true
    }
    return false
  }

  function importFromLocalStorage() {
    const raw = localStorage.getItem('mushajjir-tree-v2')
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      return parsed?.tree || parsed || null
    } catch {
      return null
    }
  }

  async function importLocalTreeToProject(projectName) {
    const treeData = importFromLocalStorage()
    if (!treeData) return null
    const project = await createProject({ name: projectName || 'Imported Project' })
    await updateProject(project.id, { treeData: JSON.stringify(treeData) })
    activeProjectId.value = project.id
    localStorage.setItem(LAST_PROJECT_KEY, project.id)
    return project
  }

  return {
    projects,
    activeProjectId,
    activeProject,
    loading,
    saving,
    error,
    hasProjects,
    fetchProjects,
    createProject,
    updateProject,
    loadProject,
    deleteProject,
    saveTreeToApi,
    initFromLocalStorage,
    importFromLocalStorage,
    importLocalTreeToProject,
  }
})
