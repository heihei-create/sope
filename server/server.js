const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SOPE API is running',
    endpoints: {
      'POST /api/generate-image': 'Generate single image',
      'POST /api/generate-batch': 'Generate batch images'
    }
  })
})

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const response = await fetch(
      'https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
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
})

app.post('/api/generate-batch', async (req, res) => {
  try {
    const { scenes } = req.body

    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ error: 'Scenes array is required' })
    }

    const results = []
    
    for (const scene of scenes) {
      try {
        const response = await fetch(
          'https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
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
})

app.listen(PORT, () => {
  console.log(`SOPE API server running on port ${PORT}`)
})
