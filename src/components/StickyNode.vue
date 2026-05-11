<template>
  <article
    class="task-node"
    :class="{
      busy,
      selected: store.selectedNodeId === id,
      dimmed: data.dimmed,
      matched: data.searchMatch,
      collapsed: data.collapsed,
    }"
    :style="nodeStyle"
    @click.stop="store.selectNode(id)"
  >
    <Handle type="target" :position="Position.Top" />

    <header class="node-header">
      <span class="status-dot" :class="`status-${data.taskStatus}`" />
      <input
        class="title nodrag"
        :value="data.title"
        placeholder="Task title"
        @input="update({ title: $event.target.value })"
      />
      <button
        class="icon-button nodrag"
        :title="data.collapsed ? 'Expand' : 'Collapse'"
        @click="store.toggleCollapse(id)"
      >
        {{ data.collapsed ? '+' : '-' }}
      </button>
      <button class="expand-btn nodrag" title="Open in modal" @click="openModal">↔</button>
    </header>

    <textarea
      class="content nodrag"
      :value="data.content"
      placeholder="Describe the task..."
      @input="update({ content: $event.target.value })"
    />

    <div class="status-row">
      <select
        class="status-select nodrag"
        :value="data.taskStatus"
        @change="update({ taskStatus: $event.target.value })"
      >
        <option v-for="status in store.statusOptions" :key="status.id" :value="status.id">
          {{ status.label }}
        </option>
      </select>
      <div class="progress" :title="`${data.progress}% complete`">
        <span :style="{ width: `${data.progress}%` }" />
      </div>
      <strong>{{ data.progress }}%</strong>
    </div>

    <div class="tags">
      <span v-for="tag in data.tags" :key="tag" class="tag" :style="tagStyle(tag)">
        {{ tag }}
        <button class="tag-remove nodrag" @click="store.removeTag(id, tag)">x</button>
      </span>
      <input
        v-model="newTag"
        class="tag-input nodrag"
        placeholder="+ tag"
        @keydown.enter.prevent="commitTag"
        @blur="commitTag"
      />
    </div>

    <section class="notes">
      <button class="notes-toggle nodrag" @click="update({ notesOpen: !data.notesOpen })">Notes</button>
      <div v-if="data.notesOpen" class="notes-body">
        <textarea
          class="notes-input nodrag"
          :value="data.notes"
          placeholder="Markdown notes..."
          @input="update({ notes: $event.target.value })"
        />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="data.notes" class="markdown-preview" v-html="notesHtml" />
      </div>
    </section>

    <div v-if="data.collapsed && data.hiddenDescendantCount" class="hidden-count">
      {{ data.hiddenDescendantCount }} hidden
    </div>

    <p v-if="data.systemMessage" class="system-message">{{ data.systemMessage }}</p>

    <footer class="actions">
      <label class="child-count nodrag" title="Leave empty for AI to decide">
        Children
        <input
          type="number"
          min="1"
          max="12"
          :value="data.childCount"
          :placeholder="data.childCount == null ? 'auto' : ''"
          @input="onChildCountInput"
        />
      </label>
      <button class="nodrag" :disabled="busy" @click="store.quickAddChild(id)">+ Child</button>
      <button class="nodrag" :disabled="busy" @click="store.aiDivide(id)">AI</button>
      <button class="nodrag secondary" :disabled="busy" @click="store.aiReformulate(id)">Refine</button>
      <button class="nodrag secondary" :disabled="busy" @click="store.duplicateNode(id)">Duplicate</button>
      <button v-if="canCompleteRelation" class="nodrag relation" @click="completeRelation">Connect</button>
      <button v-else class="nodrag relation" :class="{ active: isRelationSource }" @click="store.beginRelation(id)">
        {{ isRelationSource ? 'Cancel link' : 'Link' }}
      </button>
      <button v-if="id !== 'root'" class="nodrag danger" :disabled="busy" @click="store.deleteNode(id)">Delete</button>
    </footer>

    <button class="resizer nodrag" title="Resize" @pointerdown.stop.prevent="startResize" />

    <Handle type="source" :position="Position.Bottom" />
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useTreeStore } from '../stores/treeStore.js'
import { clamp, getTagColor } from '../utils/treeUtils.js'
import { renderMarkdown } from '../utils/markdown.js'

const props = defineProps({
  id: { type: String, required: true },
  data: { type: Object, required: true },
})

const emit = defineEmits(['open-modal'])

const store = useTreeStore()
const newTag = ref('')
const busy = computed(() => store.loadingNodeIds.includes(props.id))
const isRelationSource = computed(() => props.data.relationDraftSourceId === props.id)
const canCompleteRelation = computed(
  () => props.data.relationDraftSourceId && props.data.relationDraftSourceId !== props.id,
)
const notesHtml = computed(() => renderMarkdown(props.data.notes))
const nodeStyle = computed(() => ({
  width: `${props.data.width || 320}px`,
  minHeight: `${props.data.height || 250}px`,
}))

let resizeStart = null

function update(patch) {
  store.updateNodeData(props.id, patch)
}

function tagStyle(tag) {
  const color = getTagColor(tag)
  return {
    '--tag-bg': color.background,
    '--tag-text': color.color,
  }
}

function commitTag() {
  const value = newTag.value.trim()
  if (!value) return
  store.addTag(props.id, value)
  newTag.value = ''
}

function completeRelation() {
  const label = window.prompt('Optional relation label', '') || ''
  store.completeRelation(props.id, label.trim())
}

function onChildCountInput(event) {
  const value = event.target.value
  if (value === '' || value === null) {
    store.updateNodeData(props.id, { childCount: null })
  } else {
    store.updateNodeData(props.id, { childCount: Number(value) })
  }
}

function onResizeMove(event) {
  if (!resizeStart) return

  store.updateNodeSize(props.id, {
    width: clamp(resizeStart.width + event.clientX - resizeStart.x, 280, 560),
    height: clamp(resizeStart.height + event.clientY - resizeStart.y, 230, 760),
  })
}

function stopResize() {
  resizeStart = null
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', stopResize)
}

function startResize(event) {
  resizeStart = {
    x: event.clientX,
    y: event.clientY,
    width: props.data.width || 320,
    height: props.data.height || 260,
  }
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', stopResize)
}

function openModal() {
  emit('open-modal', props.id)
}

onBeforeUnmount(stopResize)
</script>

<style scoped src="./StickyNode.css"></style>
