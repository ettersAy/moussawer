<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="close">
      <section class="modal-panel">
        <header class="modal-header">
          <input
            class="modal-title"
            :value="node.data.title"
            placeholder="Task title"
            @input="update({ title: $event.target.value })"
          />
          <button class="icon-btn" @click="close">×</button>
        </header>

        <div class="modal-body">
          <div class="field-group">
            <label>Description</label>
            <textarea
              class="modal-textarea"
              :value="node.data.content"
              placeholder="Describe the task..."
              @input="update({ content: $event.target.value })"
            />
          </div>

          <div class="field-row">
            <div class="field-group">
              <label>Status</label>
              <select
                class="modal-select"
                :value="node.data.taskStatus"
                @change="update({ taskStatus: $event.target.value })"
              >
                <option v-for="status in store.statusOptions" :key="status.id" :value="status.id">
                  {{ status.label }}
                </option>
              </select>
            </div>
            <div class="field-group">
              <label>Progress</label>
              <div class="progress-display">
                <div class="progress-bar">
                  <span :style="{ width: `${node.data.progress}%` }" />
                </div>
                <strong>{{ node.data.progress }}%</strong>
              </div>
            </div>
          </div>

          <div class="field-group">
            <label>Tags</label>
            <div class="tags-row">
              <span v-for="tag in node.data.tags" :key="tag" class="modal-tag" :style="tagStyle(tag)">
                {{ tag }}
                <button class="tag-remove" @click="store.removeTag(node.id, tag)">x</button>
              </span>
              <input
                v-model="newTag"
                class="tag-input"
                placeholder="+ tag"
                @keydown.enter.prevent="commitTag"
                @blur="commitTag"
              />
            </div>
          </div>

          <div class="field-group">
            <label>Notes</label>
            <textarea
              class="modal-textarea"
              :value="node.data.notes"
              placeholder="Markdown notes..."
              @input="update({ notes: $event.target.value })"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="node.data.notes" class="markdown-preview" v-html="notesHtml" />
          </div>

          <div v-if="node.data.systemMessage" class="system-message">
            {{ node.data.systemMessage }}
          </div>
        </div>

        <footer class="modal-footer">
          <label class="child-count" title="Leave empty for AI to decide">
            Children
            <input
              type="number"
              min="1"
              max="12"
              :value="node.data.childCount"
              :placeholder="node.data.childCount == null ? 'auto' : ''"
              @input="onChildCountInput"
            />
          </label>
          <button :disabled="busy" @click="store.quickAddChild(node.id)">+ Child</button>
          <button :disabled="busy" @click="store.aiDivide(node.id)">AI Divide</button>
          <button :disabled="busy" class="secondary" @click="store.aiReformulate(node.id)">Refine</button>
          <button :disabled="busy" class="secondary" @click="store.duplicateNode(node.id)">Duplicate</button>
          <button v-if="node.id !== 'root'" class="danger" @click="deleteNode">Delete</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTreeStore } from '../stores/treeStore.js'
import { getTagColor } from '../utils/treeUtils.js'
import { renderMarkdown } from '../utils/markdown.js'

const props = defineProps({
  nodeId: { type: String, required: true },
})

const emit = defineEmits(['close'])

const store = useTreeStore()
const newTag = ref('')

const node = computed(() => store.nodeById.get(props.nodeId))
const busy = computed(() => store.loadingNodeIds.includes(props.nodeId))
const notesHtml = computed(() => renderMarkdown(node.value?.data?.notes))

function update(patch) {
  store.updateNodeData(props.nodeId, patch)
}

function close() {
  emit('close')
}

function tagStyle(tag) {
  const color = getTagColor(tag)
  return { '--tag-bg': color.background, '--tag-text': color.color }
}

function commitTag() {
  const value = newTag.value.trim()
  if (!value) return
  store.addTag(props.nodeId, value)
  newTag.value = ''
}

function onChildCountInput(event) {
  const value = event.target.value
  if (value === '' || value === null) {
    store.updateNodeData(props.nodeId, { childCount: null })
  } else {
    store.updateNodeData(props.nodeId, { childCount: Number(value) })
  }
}

function deleteNode() {
  store.deleteNode(props.nodeId)
  close()
}
</script>

<style scoped src="./TaskModal.css"></style>
