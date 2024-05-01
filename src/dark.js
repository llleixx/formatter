export const darkModeConfig = {
  resolveDarkMode(set = false) {
    if (sessionStorage.theme === 'dark' || (!('theme' in sessionStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      if (set) this.setDarkMode()
      return true
    } else {
      if (set) this.setLightMode()
      return false
    }
  },

  setDarkMode() {
    sessionStorage.theme = 'dark'
    document.documentElement.classList.add('dark')
  },

  setLightMode() {
    sessionStorage.theme = 'light'
    document.documentElement.classList.remove('dark')
  },

  removeDarkMode() {
    sessionStorage.removeItem('theme')
  },

  changeMode() {
    if (this.resolveDarkMode()) {
      this.setLightMode()
    } else {
      this.setDarkMode()
    }
  }
}