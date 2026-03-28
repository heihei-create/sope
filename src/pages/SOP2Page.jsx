import { useState, useRef } from 'react'
import './SOPPage.css'
import { audioRecorder, transcribeAudio, generateText, loadApiConfig } from '../services/audioService'

function SOP2Page({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverGenerated, setCoverGenerated] = useState(false)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioInfo, setAudioInfo] = useState(null)
  const [hasApiConfig, setHasApiConfig] = useState(false)
  const audioRef = useRef(null)

  const steps = [
    { id: 1, title: '语音转文字', desc: '录制您的故事' },
    { id: 2, title: '编辑文稿', desc: '整理故事内容' },
    { id: 3, title: '选择声音', desc: '挑选合适的声音' },
    { id: 4, title: '配音音效', desc: '生成音频' },
    { id: 5, title: '生成封面', desc: '创建封面图片' }
  ]

  const voices = [
    { id: 1, name: '温暖男声', desc: '适合温情故事', icon: '👨' },
    { id: 2, name: '温柔女声', desc: '适合童话故事', icon: '👩' },
    { id: 3, name: '磁性男声', desc: '适合悬疑故事', icon: '🎤' },
    { id: 4, name: '活泼女声', desc: '适合儿童故事', icon: '🎵' }
  ]

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}分${secs}秒`
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleRecord = async () => {
    setError('')
    
    if (!isRecording) {
      try {
        await audioRecorder.start()
        setIsRecording(true)
        setAudioInfo({ startTime: Date.now() })
      } catch (err) {
        setError(err.message)
      }
    } else {
      try {
        const audioBlob = await audioRecorder.stop()
        setIsRecording(false)
        
        if (audioBlob) {
          const url = URL.createObjectURL(audioBlob)
          setAudioUrl(url)
          
          const duration = (Date.now() - audioInfo.startTime) / 1000
          setAudioInfo({
            duration: duration,
            size: audioBlob.size,
            type: audioBlob.type
          })
          
          const apiConfig = loadApiConfig()
          if (apiConfig && apiConfig.apiKey) {
            setHasApiConfig(true)
            setIsGenerating(true)
            try {
              const text = await transcribeAudio(audioBlob, apiConfig)
              setTranscribedText(text)
              setEditedText(text)
              setCurrentStep(2)
            } catch (err) {
              setError('语音转文字失败: ' + err.message)
            }
            setIsGenerating(false)
          } else {
            setHasApiConfig(false)
            setTranscribedText('')
            setEditedText('')
          }
        }
      } catch (err) {
        setError('录音停止失败: ' + err.message)
        setIsRecording(false)
      }
    }
  }

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const handleGenerateAudio = () => {
    const apiConfig = loadApiConfig()
    if (!apiConfig || !apiConfig.apiKey) {
      setError('请先在首页点击"API设置"配置API密钥，才能生成音频')
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStep(5)
    }, 2000)
  }

  const handleGenerateCover = () => {
    const apiConfig = loadApiConfig()
    if (!apiConfig || !apiConfig.apiKey) {
      setError('请先在首页点击"API设置"配置API密钥，才能生成封面')
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCoverGenerated(true)
    }, 2000)
  }

  return (
    <div className="sop-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回首页</button>
        <h1>📖 故事 → 有声小说</h1>
      </header>

      <div className="progress-bar">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`progress-step ${currentStep >= step.id ? 'active' : ''}`}
          >
            <div className="step-number">{step.id}</div>
            <div className="step-info">
              <span className="step-title">{step.title}</span>
              <span className="step-desc">{step.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <main className="page-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {currentStep === 1 && (
          <div className="step-content">
            <h2>第一步：语音转文字</h2>
            <p className="hint">请点击下方按钮开始录制您的故事，支持方言识别</p>
            
            <div className="record-area">
              <button 
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={handleRecord}
                disabled={isGenerating}
              >
                {isRecording ? '🔴 录音中...点击停止' : isGenerating ? '⏳ 处理中...' : '🎤 点击开始录音'}
              </button>
            </div>

            {audioUrl && (
              <div className="audio-preview">
                <h3>录音回放：</h3>
                <audio ref={audioRef} src={audioUrl} controls />
                {audioInfo && (
                  <div className="audio-info">
                    <span>时长：{formatDuration(audioInfo.duration)}</span>
                    <span>大小：{formatFileSize(audioInfo.size)}</span>
                  </div>
                )}
              </div>
            )}

            {audioUrl && !hasApiConfig && !transcribedText && (
              <div className="result-area">
                <h3>录音信息：</h3>
                <div className="recording-info">
                  <p>✅ 录音已完成！</p>
                  <p>时长：{audioInfo && formatDuration(audioInfo.duration)}</p>
                  <p>大小：{audioInfo && formatFileSize(audioInfo.size)}</p>
                </div>
                <div className="api-notice">
                  <p>💡 提示：请先在首页点击"API设置"配置API密钥，才能使用语音转文字功能。</p>
                </div>
                <button className="action-btn" onClick={() => {
                  const mockText = '从前有一个小村庄，村里住着一位老奶奶。她每天都会在村口的大树下给孩子们讲故事。有一天，她讲了一个关于勇敢的小兔子的故事...'
                  setTranscribedText(mockText)
                  setEditedText(mockText + '\n\n【音效：鸟叫声】\n\n"孩子们，今天我要讲一个特别的故事..."老奶奶慈祥地说道。')
                  handleNextStep()
                }}>
                  继续下一步（使用模拟文本） →
                </button>
              </div>
            )}

            {transcribedText && (
              <div className="result-area">
                <h3>转写结果：</h3>
                <p className="transcribed-text">{transcribedText}</p>
                <button className="action-btn" onClick={handleNextStep}>
                  下一步 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2>第二步：编辑文稿</h2>
            <p className="hint">您可以修改文本、添加章节标记和音效提示</p>
            
            <div className="edit-area">
              <textarea 
                className="text-editor"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="在这里编辑您的故事文稿..."
              />
              <div className="edit-tips">
                <p>💡 提示：可以用【音效：xxx】标记音效位置</p>
              </div>
            </div>

            <button className="action-btn" onClick={handleNextStep}>
              确认并继续 →
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2>第三步：选择声音</h2>
            <p className="hint">请选择一个最适合您故事风格的声音</p>
            
            <div className="voice-grid">
              {voices.map(voice => (
                <button
                  key={voice.id}
                  className={`voice-card ${selectedVoice === voice.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                  <div className="voice-icon">{voice.icon}</div>
                  <h3>{voice.name}</h3>
                  <p>{voice.desc}</p>
                </button>
              ))}
            </div>

            <button 
              className="action-btn"
              onClick={handleNextStep}
              disabled={!selectedVoice}
            >
              确认选择 →
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h2>第四步：生成配音与音效</h2>
            <p className="hint">AI将根据您的文稿自动生成配音和音效</p>
            
            <div className="preview-area">
              <div className="preview-item">
                <span>文稿字数：</span>
                <strong>{editedText.length} 字</strong>
              </div>
              <div className="preview-item">
                <span>选择声音：</span>
                <strong>{voices.find(v => v.id === selectedVoice)?.name}</strong>
              </div>
              <div className="preview-item">
                <span>预计时长：</span>
                <strong>约 {Math.ceil(editedText.length / 200)} 分钟</strong>
              </div>
            </div>

            <button 
              className="action-btn generate-btn"
              onClick={handleGenerateAudio}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '🎵 生成音频'}
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-content">
            <h2>第五步：生成封面图片</h2>
            <p className="hint">为您的有声小说创建一个精美的封面</p>
            
            {!coverGenerated ? (
              <button 
                className="action-btn generate-btn"
                onClick={handleGenerateCover}
                disabled={isGenerating}
              >
                {isGenerating ? '生成中...' : '🖼️ 生成封面图片'}
              </button>
            ) : (
              <div className="result-area">
                <div className="cover-preview">
                  <div className="cover-image">
                    <span>📖</span>
                    <h3>我的有声小说</h3>
                    <p>一个温暖的故事</p>
                  </div>
                </div>
                <div className="success-message">
                  <h3>🎉 恭喜！您的有声小说已完成！</h3>
                  <p>您可以下载音频文件和封面图片</p>
                </div>
                <div className="download-btns">
                  <button className="action-btn">📥 下载音频</button>
                  <button className="action-btn">📥 下载封面</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default SOP2Page
