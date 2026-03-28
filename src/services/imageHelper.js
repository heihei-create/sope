export function generateImagePrompt(content, type = 'teaching') {
  if (type === 'teaching') {
    return `Educational illustration showing: ${content}. Style: Clean, modern, warm colors, suitable for elderly audience, professional quality.`
  } else if (type === 'stickman') {
    return `Simple stick figure illustration: ${content}. Style: Minimalist, white background, black lines, clean and clear.`
  }
  return content
}

export function getFreeImageSites() {
  return [
    {
      name: 'Nano Banana Free',
      url: 'https://nanobananafree.org/',
      desc: '免费使用，无需注册'
    },
    {
      name: 'Leonardo.ai',
      url: 'https://leonardo.ai',
      desc: '每天150免费积分'
    },
    {
      name: 'Playground AI',
      url: 'https://playground.com',
      desc: '每天500免费图片'
    },
    {
      name: 'Pika.art',
      url: 'https://pika.art',
      desc: '免费视频/图片生成'
    }
  ]
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

export function openImageSite(url) {
  window.open(url, '_blank')
}
