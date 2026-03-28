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
    const { scenes } = req.body

    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ error: 'Scenes array is required' })
    }

    const results = []
    
    for (const scene of scenes) {
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HF_API_KEY || ''}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: scene.prompt,
              parameters: {
                negative_prompt: 'blurry, bad quality, distorted'
              }
            })
          }
        )

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer()
          const base64 = Buffer.from(imageBuffer).toString('base64')
          results.push({
            title: scene.title,
            image: `data:image/png;base64,${base64}`,
            success: true
          })
        } else {
          results.push({
            title: scene.title,
            error: '生成失败',
            success: false
          })
        }
      } catch (err) {
        results.push({
          title: scene.title,
          error: err.message,
          success: false
        })
      }
    }

    res.json({ scenes: results })

  } catch (error) {
    console.error('Batch generation error:', error)
    res.status(500).json({ error: '服务器错误: ' + error.message })
  }
}
