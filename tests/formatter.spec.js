import { expect, test } from '@playwright/test'

async function openFormatter(page) {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'format', exact: true })).toBeEnabled()
}

async function paste(page, text) {
  await page.getByRole('textbox').evaluate((element, text) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/plain', text)
    // Provide clipboard data explicitly: Firefox sanitizes synthetic ClipboardEvents.
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: clipboardData })
    element.dispatchEvent(event)
  }, text)
}

test('loads WASM and formats every supported file type without browser errors', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await openFormatter(page)
  const editor = page.getByRole('textbox')
  await editor.fill('你好World')
  await page.getByRole('button', { name: 'format', exact: true }).click()
  await expect(editor).toHaveValue('你好 World')
  await expect(page.getByText('Format successfully!')).toBeVisible()
  const examples = {
    markdown: '# 你好World',
    javascript: '// 你好World',
    html: '<p>你好World</p>',
    scss: '/* 你好World */',
    rust: '// 你好World',
    go: '// 你好World',
    python: '# 你好World',
    java: '// 你好World',
    sql: '-- 你好World',
    yaml: '# 你好World',
    json: '{"text":"你好World"}',
    text: '你好World'
  }
  for (const [type, input] of Object.entries(examples)) {
    await page.getByLabel('File type').selectOption(type)
    await editor.fill(input)
    await page.getByRole('button', { name: 'format', exact: true }).click()
    await expect(editor).toHaveValue(input.replace('你好World', '你好 World'))
    await expect(page.getByRole('alert')).toHaveCount(0)
  }
  expect(errors).toEqual([])
})

test('pasting replaces the selection and updates the model before formatting', async ({ page }) => {
  await openFormatter(page)
  await page.getByLabel('File type').selectOption('text')
  const editor = page.getByRole('textbox')
  await editor.fill('前缀REPLACE后缀')
  await editor.evaluate(element => element.setSelectionRange(2, 9))
  await paste(page, '你好World\r\n第二行Test')
  await expect(editor).toHaveValue('前缀你好 World\n第二行 Test 后缀')
  await page.getByRole('button', { name: 'format', exact: true }).click()
  await expect(editor).toHaveValue('前缀你好 World\n第二行 Test 后缀')
})

test('class-based dark mode overrides the system preference and survives reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await openFormatter(page)
  const editor = page.getByRole('textbox')
  const darkBackground = await editor.evaluate(element => getComputedStyle(element).backgroundColor)
  await expect(page.locator('html')).toHaveClass('dark')
  await page.getByRole('button', { name: 'Toggle dark mode' }).click()
  await expect(page.locator('html')).not.toHaveClass('dark')
  expect(await editor.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(darkBackground)
  await page.reload()
  await expect(page.locator('html')).not.toHaveClass('dark')
  await page.getByRole('button', { name: 'Toggle dark mode' }).click()
  await expect(page.locator('html')).toHaveClass('dark')
})

test('failed WASM loading shows an error and preserves pasted text', async ({ page }) => {
  await page.route('**/*.wasm', route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Unable to load the formatter')
  await expect(page.getByRole('button', { name: 'format', exact: true })).toBeDisabled()
  await paste(page, '你好World')
  await expect(page.getByRole('textbox')).toHaveValue('你好World')
})

test('text pasted while WASM is loading is preserved and can be formatted later', async ({ page }) => {
  let releaseWasm
  const gate = new Promise(resolve => { releaseWasm = resolve })
  await page.route('**/*.wasm', async route => {
    await gate
    await route.continue()
  })
  await page.goto('/')
  const button = page.getByRole('button', { name: 'format', exact: true })
  await expect(button).toBeDisabled()
  await paste(page, '你好World')
  await expect(page.getByRole('textbox')).toHaveValue('你好World')
  releaseWasm()
  await expect(button).toBeEnabled()
  await button.click()
  await expect(page.getByRole('textbox')).toHaveValue('你好 World')
})
