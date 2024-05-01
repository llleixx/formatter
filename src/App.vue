<script setup>
import { darkModeConfig } from './dark'
import fileTypes from './fileTypes'
import { ref } from 'vue'
import config from './config'

const autocorrectLib = import('@huacnlee/autocorrect');

const fileType = ref('markdown')
const content = ref('')
const loading = ref(true)

autocorrectLib.then((ac) => {
  ac.loadConfig(JSON.stringify(config))
  window.autocorrect = ac
  loading.value = false
})

function onFormat() {
  const autocorrect = window.autocorrect

  if (!autocorrect) {
    return
  }

  const res = autocorrect.formatFor(content.value, fileType.value)

  content.value = res.out
}

function onPaste(e) {
  e.preventDefault()
  content.value = e.clipboardData.getData('text')
  
  onFormat() 
}

darkModeConfig.resolveDarkMode(true)
</script>

<template>
  <svg aria-hidden="true" class="w-0 h-0 absolute">
    <defs>
      <symbol id="icon-moon-fill" viewBox="0 0 32 32">
        <path
          d="M24.633 22.184c-8.188 0-14.82-6.637-14.82-14.82 0-2.695 0.773-5.188 2.031-7.363-6.824 1.968-11.844 8.187-11.844 15.644 0 9.031 7.32 16.355 16.352 16.355 7.457 0 13.68-5.023 15.648-11.844-2.18 1.254-4.672 2.028-7.367 2.028z">
        </path>
      </symbol>
    </defs>
  </svg>
  <div class="bg-white dark:bg-slate-800 dark:text-gray-100 min-h-dvh flex flex-col">
    <header
      class="sticky inset-x-0 top-0 mb-8 px-3 py-6 flex justify-between border-b-1 border-b-gray-400 shadow-md bg-white dark:bg-slate-700 lg:px-16 z-50">
      <div class="font-bold">Formatter</div>
      <button type="button" @click="darkModeConfig.changeMode" class="flex items-center justify-center">
        <svg class="w-4 h-4 fill-transparent stroke-black stroke-2 dark:stroke-white dark:fill-white">
          <use xlink:href="#icon-moon-fill"></use>
        </svg>
        <span class="ml-1">Dark Mode</span>
      </button>
    </header>


    <main class="px-3 lg:px-16 flex-1 flex flex-col">
      <div class="flex flex-row justify-between items-center mb-6">
        <select
          class="rounded-lg h-12 border border-gray-300 shadow-md dark:bg-slate-700 dark:border-slate-800" v-model="fileType">
          <option v-for="(val, key) in fileTypes" :value="key">{{ val.title }}</option>
        </select>
        <button type="button" :disabled="loading" class="mr-4 border border-gray-300 shadow-md h-12 px-5 rounded-lg dark:bg-slate-700 dark:border-slate-800" @click="onFormat">format</button>
      </div>
      <div class="flex flex-1 mb-6 min-h-36">
        <textarea spellcheck="false" class="w-full dark:bg-slate-700 rounded-lg min-h-full resize-none flex-1" v-model="content" @paste="onPaste"></textarea>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
