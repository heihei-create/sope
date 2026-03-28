import { useState, useRef } from 'react'
import './SOPPage.css'
import { audioRecorder, transcribeAudio, generateText, loadApiConfig } from '../services/audioService'
import { textToImage } from '../services/videoService'

function SOP1Page({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [teachingOutline, setTeachingOutline] = useState('')
  const [videoMode, setVideoMode] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioInfo, setAudioInfo] = useState(null)
  const [hasApiConfig, setHasApiConfig] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const audioRef = useRef(null)

  const steps = [
    { id: 1, title: '语音转文字', desc: '点击录音，说出您的内容' },
    { id: 2, title: '生成教学大纲', desc: 'AI将为您整理教学内容' },
    { id: 3, title: '制作视频', desc: '选择视频风格并生成' }
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
              setCurrentStep(2)
            } catch (err) {
              setError('语音转文字失败: ' + err.message)
            }
            setIsGenerating(false)
          } else {
            setHasApiConfig(false)
            setTranscribedText('')
          }
        }
      } catch (err) {
        setError('录音停止失败: ' + err.message)
        setIsRecording(false)
      }
    }
  }

  const handleGenerateOutline = async () => {
    setIsGenerating(true)
    setError('')
    
    const contentToProcess = transcribedText || '大家好，今天我们来学习如何使用智能手机拍照。首先，打开相机应用，然后对准您想要拍摄的画面，点击屏幕上的圆形按钮即可完成拍照。'
    
    const apiConfig = loadApiConfig()
    if (apiConfig && apiConfig.apiKey) {
      try {
        const systemPrompt = `你是一位专业的教学设计师。请将用户提供的自然语言内容转化为有条理、有逻辑的教学大纲和话术。

要求：
1. 分章节组织内容，每个章节有明确的标题
2. 包含教学话术提示，用引号标注
3. 语言通俗易懂，适合老年人理解
4. 结构清晰，层次分明

请直接输出教学大纲，不要有多余的说明：`
        
        const outline = await generateText(systemPrompt, contentToProcess, apiConfig)
        setTeachingOutline(outline)
      } catch (err) {
        setError('生成失败: ' + err.message)
      }
    } else {
      setTeachingOutline(`【教学大纲】智能手机拍照入门

一、课程导入
   - 欢迎语与课程介绍

二、核心内容
   1. 打开相机应用
      - 找到相机图标
      - 点击打开
   
   2. 对准拍摄对象
      - 保持手机稳定
      - 构图技巧
   
   3. 完成拍照
      - 点击快门按钮
      - 查看照片

三、课程总结
   - 要点回顾
   - 练习建议`)
    }
    setIsGenerating(false)
  }

  const handleGenerateVideo = async () => {
    setIsGenerating(true)
    setError('')
    
    try {
      const imagePrompt = `Educational illustration, ${videoMode === 'digital' ? 'professional teacher presenting lesson, friendly expression, classroom setting' : 'infographic diagram explaining concepts clearly with icons and arrows'}, clean modern style, warm colors, suitable for elderly audience, high quality, detailed`
      
      const imageUrl = await textToImage(imagePrompt)
      setGeneratedImage(imageUrl)
    } catch (err) {
      setError(err.message)
    }
    
    setIsGenerating(false)
  }

  return (
    <div className="sop-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回首页</button>
        <h1>📚 文本 → 教学视频</h1>
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
            <p className="hint">请点击下方按钮开始录音，支持方言识别（需配置API）</p>
            
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
                  <p>配置后，您的语音将被准确转写为文字。</p>
                </div>
                <button className="action-btn" onClick={() => setCurrentStep(2)}>
                  继续下一步（使用模拟文本） →
                </button>
              </div>
            )}

            {transcribedText && (
              <div className="result-area">
                <h3>转写结果：</h3>
                <p className="transcribed-text">{transcribedText}</p>
                <button className="action-btn" onClick={() => setCurrentStep(2)}>
                  下一步 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2>第二步：生成教学大纲</h2>
            <p className="hint">AI将把您的自然语言转化为有条理的教学内容</p>
            
            {transcribedText ? (
              <div className="original-text">
                <h3>原始文本：</h3>
                <p>{transcribedText}</p>
              </div>
            ) : (
              <div className="original-text">
                <h3>提示：</h3>
                <p>未配置API，将使用模拟文本生成教学大纲</p>
              </div>
            )}

            <button 
              className="action-btn"
              onClick={handleGenerateOutline}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '✨ 生成教学大纲'}
            </button>

            {teachingOutline && (
              <div className="result-area">
                <h3>✅ 教学大纲已生成：</h3>
                <pre className="outline-text">{teachingOutline}</pre>
                <button className="action-btn" onClick={() => setCurrentStep(3)}>
                  下一步：选择视频风格 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2>第三步：选择视频风格</h2>
            <p className="hint">请选择您想要的视频呈现方式</p>
            
            <div className="video-modes">
              <button 
                className={`mode-card ${videoMode === 'digital' ? 'selected' : ''}`}
                onClick={() => setVideoMode('digital')}
              >
                <div className="mode-icon">👤</div>
                <h3>数字人讲解</h3>
                <p>生成虚拟人物进行口播讲解</p>
                <span className="mode-tag">专业亲切</span>
              </button>

              <button 
                className={`mode-card ${videoMode === 'auto' ? 'selected' : ''}`}
                onClick={() => setVideoMode('auto')}
              >
                <div className="mode-icon">🎬</div>
                <h3>自动配图解说</h3>
                <p>自动匹配图片视频配合AI配音</p>
                <span className="mode-tag">生动形象</span>
              </button>
            </div>

            <button 
              className="action-btn generate-btn"
              onClick={handleGenerateVideo}
              disabled={!videoMode || isGenerating}
            >
              {isGenerating ? '生成中...' : '🎬 生成视频'}
            </button>

            {generatedImage && (
              <div className="result-area">
                <h3>✅ 教学图片已生成：</h3>
                <div className="generated-image">
                  <img src={generatedImage} alt="生成的教学图片" />
                </div>
                <p className="hint">提示：右键点击图片可保存到本地</p>
                <div className="download-btns">
                  <a href={generatedImage} download="teaching-image.png" className="action-btn">📥 下载图片</a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default SOP1Page
