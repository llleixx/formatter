<script setup>
import { darkModeConfig } from './dark'
import fileTypes from './fileTypes'
import { ref } from 'vue'
import config from './config'

const autocorrectLib = import('@huacnlee/autocorrect');

const fileType = ref('markdown')
const textEditRef = ref(null);

const content = ref('')
const loading = ref(true)
const visible = ref(false)

autocorrectLib.then((ac) => {
  ac.loadConfig(JSON.stringify(config))
  window.autocorrect = ac
  loading.value = false
})

function showToolTip() {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 800);
}

function onFormat() {
  const autocorrect = window.autocorrect

  if (!autocorrect) {
    return
  }

  const res = autocorrect.formatFor(content.value, fileType.value)

  content.value = res.out
  showToolTip()
}

function onPaste(e) {
  e.preventDefault()
  let textEdit = textEditRef.value;
  let clipboardData = e.clipboardData || window.Clipboard
  let pastedData = clipboardData.getData('Text')
  let startPos = textEdit.selectionStart
  let endPos = textEdit.selectionEnd
  let textValue = textEdit.value

  textEdit.value = textValue.substring(0, startPos) + pastedData + textValue.substring(endPos)
  textEdit.selectionStart = textEdit.selectionEnd = startPos + pastedData.length

  textEdit.dispatchEvent(new Event('input'))
  onFormat()
}

darkModeConfig.resolveDarkMode(true)
</script>

<template>
  <svg aria-hidden="true" class="hidden">
    <defs>
      <symbol id="icon-moon-fill" viewBox="-2 -2 36 36">
        <path
          d="M24.633 22.184c-8.188 0-14.82-6.637-14.82-14.82 0-2.695 0.773-5.188 2.031-7.363-6.824 1.968-11.844 8.187-11.844 15.644 0 9.031 7.32 16.355 16.352 16.355 7.457 0 13.68-5.023 15.648-11.844-2.18 1.254-4.672 2.028-7.367 2.028z">
        </path>
      </symbol>
      <symbol id="icon-github" viewBox="-2 -2 36 36">
        <path
          d="M16 0.395c-8.836 0-16 7.163-16 16 0 7.069 4.585 13.067 10.942 15.182 0.8 0.148 1.094-0.347 1.094-0.77 0-0.381-0.015-1.642-0.022-2.979-4.452 0.968-5.391-1.888-5.391-1.888-0.728-1.849-1.776-2.341-1.776-2.341-1.452-0.993 0.11-0.973 0.11-0.973 1.606 0.113 2.452 1.649 2.452 1.649 1.427 2.446 3.743 1.739 4.656 1.33 0.143-1.034 0.558-1.74 1.016-2.14-3.554-0.404-7.29-1.777-7.29-7.907 0-1.747 0.625-3.174 1.649-4.295-0.166-0.403-0.714-2.030 0.155-4.234 0 0 1.344-0.43 4.401 1.64 1.276-0.355 2.645-0.532 4.005-0.539 1.359 0.006 2.729 0.184 4.008 0.539 3.054-2.070 4.395-1.64 4.395-1.64 0.871 2.204 0.323 3.831 0.157 4.234 1.026 1.12 1.647 2.548 1.647 4.295 0 6.145-3.743 7.498-7.306 7.895 0.574 0.497 1.085 1.47 1.085 2.963 0 2.141-0.019 3.864-0.019 4.391 0 0.426 0.288 0.925 1.099 0.768 6.354-2.118 10.933-8.113 10.933-15.18 0-8.837-7.164-16-16-16z">
        </path>
      </symbol>
    </defs>
  </svg>
  <div class="bg-white dark:bg-slate-800 dark:text-gray-100 min-h-dvh flex flex-col">
    <header
      class="sticky inset-x-0 top-0 mb-8 px-3 py-6 flex justify-between border-b-1 border-b-gray-400 shadow-md bg-white dark:bg-slate-700 lg:px-16 z-50">
      <div class="font-bold">Formatter</div>
      <div class="flex flex-row items-center space-x-4">
        <button type="button" @click="darkModeConfig.changeMode" class="flex items-center justify-center">
          <svg class="w-5 h-5 fill-transparent stroke-black stroke-2 dark:stroke-white dark:fill-white">
            <use xlink:href="#icon-moon-fill"></use>
          </svg>
        </button>
        <a href="https://github.com/llleixx/formatter" title="github" target="_blank" rel="noopener noreferrer">
          <svg class="w-5 h-5 fill-transparent stroke-black stroke-2 dark:stroke-white dark:fill-white">
            <use xlink:href="#icon-github"></use>
          </svg>
        </a>
      </div>
    </header>


    <main class="px-3 lg:px-16 flex-1 flex flex-col">
      <div class="flex flex-row justify-between items-center mb-6">
        <select class="rounded-lg h-12 border border-gray-300 shadow-md dark:bg-slate-700 dark:border-slate-800"
          v-model="fileType">
          <option v-for="(val, key) in fileTypes" :value="key">{{ val.title }}</option>
        </select>
        <div class="flex flex-row items-center">
          <Transition name="fade">
            <div v-show="visible"
              class="text-center transition-opacity duration-1000 mr-4">
              Format successfully!
            </div>
          </Transition>
          <button type="button" :disabled="loading"
            class="mr-4 border border-gray-300 shadow-md h-12 px-5 rounded-lg transition dark:bg-slate-700
            dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 active:translate-x-0.5
            active:translate-y-0.5"
            @click="onFormat">format</button>
        </div>
      </div>
      <div class="flex flex-1 mb-6 min-h-36">
        <textarea ref="textEditRef" spellcheck="false" class="w-full dark:bg-slate-700 rounded-lg min-h-full resize-none flex-1"
          v-model="content" @paste="onPaste"></textarea>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>
