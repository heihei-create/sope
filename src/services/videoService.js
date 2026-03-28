const PROXY_URL = 'https://sope-u1yx.onrender.com'

export async function textToImage(prompt) {
  try {
    const response = await fetch(`${PROXY_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      if (error.loading) {
        throw new Error('模型正在加载中，请等待30秒后重试')
      }
      throw new Error(error.error || '图片生成失败')
    }

    const imageBlob = await response.blob()
    return URL.createObjectURL(imageBlob)
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw err
  }
}

export async function generateBatchImages(scenes) {
  try {
    const response = await fetch(`${PROXY_URL}/api/generate-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scenes })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || '批量生成失败')
    }

    const result = await response.json()
    return result.scenes
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw err
  }
}

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
