class AudioRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.stream = null
    this.isRecording = false
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.start(100)
      this.isRecording = true
      
      return true
    } catch (error) {
      console.error('录音启动失败:', error)
      throw new Error('无法访问麦克风，请检查权限设置')
    }
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null)
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.stopStream()
        this.isRecording = false
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
  }

  getIsRecording() {
    return this.isRecording
  }
}

export const audioRecorder = new AudioRecorder()

export async function transcribeAudio(audioBlob, apiConfig) {
  if (!apiConfig || !apiConfig.apiKey) {
    throw new Error('请先配置API密钥')
  }

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', apiConfig.sttModel || 'whisper-large-v3')

  const sttEndpoint = apiConfig.sttEndpoint || 'https://api.groq.com/openai/v1/audio/transcriptions'

  const response = await fetch(sttEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiConfig.apiKey}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || '语音转文字失败')
  }

  const result = await response.json()
  return result.text
}

export async function generateText(systemPrompt, userContent, apiConfig) {
  if (!apiConfig || !apiConfig.apiKey) {
    throw new Error('请先配置API密钥')
  }

  const baseEndpoint = apiConfig.endpoint || 'https://api.groq.com/openai/v1'
  const chatEndpoint = baseEndpoint.endsWith('/chat/completions') 
    ? baseEndpoint 
    : `${baseEndpoint}/chat/completions`

  const response = await fetch(chatEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiConfig.apiKey}`
    },
    body: JSON.stringify({
      model: apiConfig.model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || 'AI生成失败')
  }

  const result = await response.json()
  return result.choices[0].message.content
}

export function saveApiConfig(config) {
  localStorage.setItem('sope_api_config', JSON.stringify(config))
}

export function loadApiConfig() {
  const saved = localStorage.getItem('sope_api_config')
  return saved ? JSON.parse(saved) : null
}
