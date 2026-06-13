<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-slate-900/50 flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="$emit('close')">
      <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col overflow-hidden max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <h3 class="font-semibold text-base text-slate-900">
            {{ existing ? 'Edit Fragment' : 'New Text Fragment' }}
          </h3>
          <button @click="$emit('close')" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Title <span class="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              v-model="title"
              type="text"
              placeholder="Fragment title…"
              class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Colour accent</label>
            <ColorPicker v-model="color" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <div class="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <!-- Toolbar -->
              <div class="flex flex-wrap gap-0.5 p-1.5 border-b border-slate-200 bg-slate-50">
                <ToolbarBtn title="Bold" :active="editor?.isActive('bold')" @click="editor?.chain().focus().toggleBold().run()">
                  <strong class="text-xs">B</strong>
                </ToolbarBtn>
                <ToolbarBtn title="Italic" :active="editor?.isActive('italic')" @click="editor?.chain().focus().toggleItalic().run()">
                  <em class="text-xs">I</em>
                </ToolbarBtn>
                <ToolbarBtn title="Underline" :active="editor?.isActive('underline')" @click="editor?.chain().focus().toggleUnderline().run()">
                  <span class="text-xs underline">U</span>
                </ToolbarBtn>
                <ToolbarBtn title="Strike" :active="editor?.isActive('strike')" @click="editor?.chain().focus().toggleStrike().run()">
                  <span class="text-xs line-through">S</span>
                </ToolbarBtn>
                <div class="w-px h-5 bg-slate-200 mx-0.5 self-center"/>
                <ToolbarBtn title="H1" :active="editor?.isActive('heading', { level: 1 })" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">
                  <span class="text-xs font-semibold">H1</span>
                </ToolbarBtn>
                <ToolbarBtn title="H2" :active="editor?.isActive('heading', { level: 2 })" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">
                  <span class="text-xs font-semibold">H2</span>
                </ToolbarBtn>
                <ToolbarBtn title="H3" :active="editor?.isActive('heading', { level: 3 })" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">
                  <span class="text-xs font-semibold">H3</span>
                </ToolbarBtn>
                <div class="w-px h-5 bg-slate-200 mx-0.5 self-center"/>
                <ToolbarBtn title="Bullet list" :active="editor?.isActive('bulletList')" @click="editor?.chain().focus().toggleBulletList().run()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </ToolbarBtn>
                <ToolbarBtn title="Ordered list" :active="editor?.isActive('orderedList')" @click="editor?.chain().focus().toggleOrderedList().run()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                </ToolbarBtn>
                <ToolbarBtn title="Blockquote" :active="editor?.isActive('blockquote')" @click="editor?.chain().focus().toggleBlockquote().run()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
                </ToolbarBtn>
                <div class="w-px h-5 bg-slate-200 mx-0.5 self-center"/>
                <ToolbarBtn title="Link" :active="editor?.isActive('link')" @click="insertLink">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </ToolbarBtn>
                <ToolbarBtn title="Image URL" @click="insertImageUrl">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </ToolbarBtn>
                <ToolbarBtn title="Horizontal rule" @click="editor?.chain().focus().setHorizontalRule().run()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </ToolbarBtn>
              </div>
              <EditorContent :editor="editor" />
            </div>
            <p class="text-xs text-slate-400 mt-1">You can paste images directly into the editor.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 px-4 sm:px-5 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button @click="$emit('close')" class="flex-1 sm:flex-none sm:px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button @click="save" class="flex-1 sm:flex-none sm:px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import ColorPicker from './ColorPicker.vue'
import ToolbarBtn from './ToolbarBtn.vue'

const props = defineProps({
  existing: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const title = ref(props.existing?.title || '')
const color = ref(props.existing?.color || '#2563eb')

const editor = useEditor({
  content: props.existing?.content || '',
  extensions: [
    StarterKit,
    Image.configure({ inline: false, allowBase64: true }),
    Link.configure({ openOnClick: false }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    Placeholder.configure({ placeholder: 'Paste or type your content here…' }),
  ],
  editorProps: {
    handlePaste(view, event) {
      const items = Array.from(event.clipboardData?.items || [])
      const imgItem = items.find(i => i.type.startsWith('image/'))
      if (!imgItem) return false
      event.preventDefault()
      const file = imgItem.getAsFile()
      const reader = new FileReader()
      reader.onload = ev => {
        editor.value?.chain().focus().setImage({ src: ev.target.result }).run()
      }
      reader.readAsDataURL(file)
      return true
    },
  },
})

function insertLink() {
  const url = prompt('Enter URL:')
  if (url) editor.value?.chain().focus().setLink({ href: url }).run()
}

function insertImageUrl() {
  const url = prompt('Image URL:')
  if (url) editor.value?.chain().focus().setImage({ src: url }).run()
}

function save() {
  emit('saved', {
    title: title.value.trim(),
    color: color.value,
    content: editor.value?.getHTML() || '',
  })
}

onBeforeUnmount(() => editor.value?.destroy())
</script>
