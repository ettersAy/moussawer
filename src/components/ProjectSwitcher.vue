<template>
  <div class="ps-root">
    <button class="ps-trigger" @click="open = !open" title="Projects">
      <span class="ps-icon">P</span>
      <span class="ps-label">{{ label }}</span>
      <span class="ps-arrow">&#9662;</span>
    </button>

    <div v-if="open" class="ps-dropdown" @click.stop>
      <div class="ps-header">
        <strong>Projects</strong>
        <button class="ps-new-btn" @click="openCreateModal">+ New</button>
      </div>

      <div v-if="loading" class="ps-loading">Loading...</div>

      <div v-else-if="!projects.length" class="ps-empty">
        <p>No projects yet.</p>
        <button class="ps-create-link" @click="openCreateModal">Create your first project</button>
      </div>

      <ul v-else class="ps-list">
        <li
          v-for="project in projects"
          :key="project.id"
          class="ps-item"
          :class="{ active: project.id === activeProjectId }"
          @click="switchTo(project)"
        >
          <div class="ps-item-main">
            <span class="ps-item-name">{{ project.name }}</span>
            <span class="ps-item-meta">
              <span v-if="project.githubRepoOwner" class="ps-gh-icon">GH</span>
              {{ formatDate(project.updatedAt) }}
            </span>
          </div>
          <button class="ps-delete" @click.stop="confirmDelete(project)" title="Delete project">&times;</button>
        </li>
      </ul>
    </div>

    <Teleport to="body">
      <ProjectModal
        v-if="showCreateModal"
        mode="create"
        @close="showCreateModal = false"
        @created="onCreated"
      />
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
        <section class="panel">
          <header class="panel-header">
            <h2>Delete project</h2>
            <button class="icon" @click="deleteTarget = null">&times;</button>
          </header>
          <div class="content">
            <p class="warn-text">Delete "{{ deleteTarget.name }}" and all its mind-map data? This cannot be undone.</p>
            <div class="actions-row">
              <button class="cancel-btn" @click="deleteTarget = null">Cancel</button>
              <button class="danger-btn" @click="doDelete">Delete</button>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useProjectStore } from '../stores/projectStore.js'
import { useTreeStore } from '../stores/treeStore.js'
import ProjectModal from './ProjectModal.vue'

const projectStore = useProjectStore()
const treeStore = useTreeStore()

const open = ref(false)
const showCreateModal = ref(false)
const deleteTarget = ref(null)

const projects = computed(() => projectStore.projects)
const activeProjectId = computed(() => projectStore.activeProjectId)
const loading = computed(() => projectStore.loading)

const label = computed(() => {
  if (!activeProjectId.value) return 'No project'
  const p = projectStore.activeProject
  return p ? p.name : 'Select...'
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}

function openCreateModal() {
  open.value = false
  showCreateModal.value = true
}

async function onCreated(project) {
  showCreateModal.value = false
  projectStore.activeProjectId = project.id
  localStorage.setItem('mushajjir-last-project-id', project.id)
  if (project.treeData && project.treeData.nodes?.length) {
    treeStore.importTree(project.treeData)
  }
  await projectStore.fetchProjects()
}

async function switchTo(project) {
  open.value = false
  try {
    const full = await projectStore.loadProject(project.id)
    if (full.treeData && full.treeData.nodes?.length) {
      treeStore.importTree(full.treeData)
    }
  } catch {
    // just select it locally
    projectStore.activeProjectId = project.id
    localStorage.setItem('mushajjir-last-project-id', project.id)
  }
}

function confirmDelete(project) {
  deleteTarget.value = project
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await projectStore.deleteProject(deleteTarget.value.id)
  } catch {
    // already removed from list
  }
  deleteTarget.value = null
}
</script>

<style scoped>
.ps-root { position: relative; }
.ps-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--panel-border);
  border-radius: 7px;
  padding: 6px 10px;
  background: var(--field);
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
}
.ps-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}
.ps-label { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ps-arrow { font-size: 10px; margin-left: auto; }
.ps-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 360px;
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-strong);
  z-index: 100;
}
.ps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--panel-border);
  position: sticky;
  top: 0;
  background: var(--surface);
}
.ps-new-btn {
  border: 0;
  border-radius: 6px;
  padding: 5px 10px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}
.ps-loading, .ps-empty { padding: 20px 14px; color: var(--muted); text-align: center; }
.ps-create-link { border: 0; background: none; color: var(--accent); cursor: pointer; font-weight: 700; }
.ps-list { list-style: none; margin: 0; padding: 4px 0; }
.ps-item {
  display: flex;
  align-items: center;
  padding: 9px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba(128,128,128,0.08);
}
.ps-item:hover { background: var(--field); }
.ps-item.active { background: var(--code); }
.ps-item-main { flex: 1; min-width: 0; }
.ps-item-name { display: block; font-weight: 700; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ps-item-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); margin-top: 2px; }
.ps-gh-icon { font-size: 10px; padding: 1px 4px; border-radius: 3px; background: var(--button); }
.ps-delete { border: 0; background: none; color: var(--muted); cursor: pointer; font-size: 18px; padding: 0 4px; opacity: 0; transition: opacity 0.15s; }
.ps-item:hover .ps-delete { opacity: 1; }
.ps-delete:hover { color: var(--danger); }

/* Delete confirm */
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
  width: min(400px, 100%);
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
.content { padding: 16px 18px; }
.warn-text { color: var(--danger); margin: 0 0 14px; }
.actions-row { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn {
  border: 1px solid var(--panel-border); border-radius: 7px; padding: 8px 16px;
  background: var(--button); color: var(--button-text); cursor: pointer; font-weight: 700;
}
.danger-btn {
  border: 0; border-radius: 7px; padding: 8px 16px;
  background: var(--danger); color: #fff; cursor: pointer; font-weight: 700;
}
</style>
