import { useState, useEffect } from 'react'
import './SOPPage.css'
import { loadApiConfig, saveApiConfig } from '../services/audioService'

const providers = [
  {
    id: 'groq',
    name: 'Groq（免费推荐）',
    endpoint: 'https://api.groq.com/openai/v1',
    sttEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model: 'llama-3.3-70b-versatile',
    sttModel: 'whisper-large-v3',
    desc: '免费使用，速度快'
  },
  {
    id: 'zhipu',
    name: '智谱AI（国内推荐）',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    sttEndpoint: 'https://open.bigmodel.cn/api/paas/v4/audio/transcriptions',
    model: 'glm-4-flash',
    sttModel: 'whisper-1',
    desc: '国内服务，新用户免费'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    sttEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
    model: 'gpt-3.5-turbo',
    sttModel: 'whisper-1',
    desc: '官方API，需要付费'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1',
    sttEndpoint: 'https://openrouter.ai/api/v1/audio/transcriptions',
    model: 'openai/gpt-3.5-turbo',
    sttModel: 'openai/whisper-1',
    desc: '聚合多个AI模型'
  },
  {
    id: 'custom',
    name: '自定义',
    endpoint: '',
    sttEndpoint: '',
    model: '',
    sttModel: '',
    desc: '自定义API配置'
  }
]

function SettingsPage({ onBack }) {
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: '',
    model: '',
    sttEndpoint: '',
    sttModel: '',
    provider: 'groq'
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedConfig = loadApiConfig()
    if (savedConfig) {
      setConfig(savedConfig)
    }
  }, [])

  const handleProviderChange = (providerId) => {
    const provider = providers.find(p => p.id === providerId)
    if (provider && provider.id !== 'custom') {
      setConfig({
        ...config,
        provider: providerId,
        endpoint: provider.endpoint,
        sttEndpoint: provider.sttEndpoint,
        model: provider.model,
        sttModel: provider.sttModel
      })
    } else {
      setConfig({ ...config, provider: providerId })
    }
  }

  const handleSave = () => {
    saveApiConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="sop-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回首页</button>
        <h1>⚙️ API设置</h1>
      </header>

      <main className="page-content">
        <div className="step-content">
          <h2>配置AI服务</h2>
          <p className="hint">只需配置一个API密钥即可使用全部功能</p>

          <div className="provider-grid">
            {providers.map(provider => (
              <button
                key={provider.id}
                className={`provider-card ${config.provider === provider.id ? 'selected' : ''}`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <h3>{provider.name}</h3>
                <p>{provider.desc}</p>
              </button>
            ))}
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>API密钥</label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="输入您的API密钥"
              />
              <span className="form-hint">
                {config.provider === 'groq' && '前往 console.groq.com 免费获取'}
                {config.provider === 'zhipu' && '前往 open.bigmodel.cn 注册获取'}
                {config.provider === 'openrouter' && '前往 openrouter.ai 获取'}
                {config.provider === 'openai' && '前往 platform.openai.com 获取'}
              </span>
            </div>

            {config.provider === 'custom' && (
              <>
                <div className="form-group">
                  <label>API端点</label>
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                    placeholder="https://api.example.com/v1"
                  />
                </div>

                <div className="form-group">
                  <label>语音转文字端点</label>
                  <input
                    type="text"
                    value={config.sttEndpoint}
                    onChange={(e) => setConfig({ ...config, sttEndpoint: e.target.value })}
                    placeholder="https://api.example.com/v1/audio/transcriptions"
                  />
                </div>

                <div className="form-group">
                  <label>文本生成模型</label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    placeholder="gpt-3.5-turbo"
                  />
                </div>

                <div className="form-group">
                  <label>语音转文字模型</label>
                  <input
                    type="text"
                    value={config.sttModel}
                    onChange={(e) => setConfig({ ...config, sttModel: e.target.value })}
                    placeholder="whisper-1"
                  />
                </div>
              </>
            )}

            <button className="action-btn" onClick={handleSave}>
              {saved ? '✅ 已保存！' : '💾 保存设置'}
            </button>
          </div>

          <div className="settings-tips">
            <h3>✨ 功能说明</h3>
            
            <div className="tutorial-item">
              <h4>🎤 语音转文字 + 文本生成</h4>
              <p>需要配置 Groq 或其他 API 密钥</p>
            </div>

            <div className="tutorial-item">
              <h4>🖼️ 图片生成</h4>
              <p>✅ 已内置 Pollinations.ai，<strong>完全免费，无需额外配置！</strong></p>
            </div>

            <div className="tutorial-item">
              <h4>🎬 视频生成</h4>
              <p>建议使用外部工具：</p>
              <ul>
                <li><a href="https://pika.art" target="_blank" rel="noopener">Pika.art</a> - 免费视频生成</li>
                <li><a href="https://runwayml.com" target="_blank" rel="noopener">Runway</a> - 专业视频生成</li>
              </ul>
            </div>

            <div className="tutorial-item">
              <h4>🚀 Groq 获取教程（推荐）</h4>
              <ol>
                <li>访问 <a href="https://console.groq.com" target="_blank" rel="noopener">console.groq.com</a></li>
                <li>点击 "Sign Up" 注册账号</li>
                <li>进入 Dashboard → API Keys</li>
                <li>点击 "Create API Key" 创建密钥</li>
                <li>复制密钥粘贴到上方输入框</li>
              </ol>
            </div>

            <div className="tutorial-item">
              <h4>🇨🇳 智谱AI（国内推荐）</h4>
              <ol>
                <li>访问 <a href="https://open.bigmodel.cn" target="_blank" rel="noopener">open.bigmodel.cn</a></li>
                <li>注册/登录账号</li>
                <li>进入控制台 → API密钥</li>
                <li>创建并复制API Key</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
