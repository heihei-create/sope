export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, bad quality, distorted'
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      
      if (response.status === 503) {
        return res.status(503).json({ 
          error: '模型正在加载中，请等待30秒后重试',
          loading: true
        })
      }
      
      return res.status(response.status).json({ 
        error: error.error || '图片生成失败' 
      })
    }

    const imageBuffer = await response.arrayBuffer()
    
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(Buffer.from(imageBuffer))

  } catch (error) {
    console.error('Image generation error:', error)
    res.status(500).json({ error: '服务器错误: ' + error.message })
  }
}
