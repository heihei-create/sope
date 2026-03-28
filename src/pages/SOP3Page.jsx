import { useState, useRef } from 'react'
import './SOPPage.css'
import { audioRecorder, transcribeAudio, generateText, loadApiConfig } from '../services/audioService'
import { generateBatchImages } from '../services/videoService'

function SOP3Page({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [psychAnalysis, setPsychAnalysis] = useState('')
  const [visualInstructions, setVisualInstructions] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [animationGenerated, setAnimationGenerated] = useState(false)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioInfo, setAudioInfo] = useState(null)
  const [hasApiConfig, setHasApiConfig] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const audioRef = useRef(null)

  const steps = [
    { id: 1, title: '语音转文字', desc: '讲述人生经历' },
    { id: 2, title: '心理意象分析', desc: 'AI分析情感' },
    { id: 3, title: '视觉化指令', desc: '生成画面描述' },
    { id: 4, title: '动画生成', desc: '创建火柴人动画' }
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

  const handleAnalyze = async () => {
    setIsGenerating(true)
    setError('')
    
    const contentToProcess = transcribedText || '我年轻时经历过一段很困难的时期。那时候刚到城市，没有工作，没有住处，每天都在为生计发愁。但是我没有放弃，一步一步地努力，终于有了自己的小生意。现在回想起来，那段艰难的日子反而让我变得更坚强。'
    
    const apiConfig = loadApiConfig()
    if (apiConfig && apiConfig.apiKey) {
      try {
        const systemPrompt = `你是一位专业的心理咨询师和意象分析师。请分析用户提供的人生经历故事中的情感和心理意象。

请从以下角度分析：
1. 核心情感识别
2. 心理发展阶段
3. 关键心理意象
4. 情感曲线变化

请用简洁清晰的语言输出分析报告：`
        
        const analysis = await generateText(systemPrompt, contentToProcess, apiConfig)
        setPsychAnalysis(analysis)
      } catch (err) {
        setError('分析失败: ' + err.message)
      }
    } else {
      setPsychAnalysis(`【心理意象分析报告】

核心情感识别：
• 困境与挣扎 → 坚韧与希望
• 孤独与迷茫 → 成长与蜕变

心理发展阶段：
1. 困境期：迷茫、无助、焦虑
2. 奋斗期：坚持、努力、不放弃
3. 成长期：收获、坚强、感恩

关键心理意象：
• 黑暗中的行走 → 寻找光明
• 攀登山峰 → 克服困难
• 破茧成蝶 → 蜕变成长

情感曲线：低谷 → 上升 → 高峰`)
    }
    setIsGenerating(false)
  }

  const handleVisualize = async () => {
    setIsGenerating(true)
    
    const apiConfig = loadApiConfig()
    if (apiConfig && apiConfig.apiKey) {
      try {
        const systemPrompt = `你是一位动画导演。请根据以下心理分析报告，生成火柴人动画的视觉化指令。

要求：
1. 分场景描述
2. 每个场景包含：画面、动作、配色
3. 场景数量5个左右
4. 语言简洁明确

请直接输出视觉化指令：`
        
        const instructions = await generateText(systemPrompt, psychAnalysis, apiConfig)
        setVisualInstructions(instructions)
      } catch (err) {
        setError('生成失败: ' + err.message)
      }
    } else {
      setVisualInstructions(`【AI视觉化指令】

场景一：迷茫的起点
画面：火柴人独自站在黑暗的十字路口
动作：四处张望，表情困惑
配色：灰暗色调

场景二：艰难的旅程
画面：火柴人背着行囊走在崎岖的山路上
动作：一步一步艰难前行
配色：冷色调渐变

场景三：转折点
画面：火柴人看到远处的光亮
动作：眼神变得坚定，加快脚步
配色：暖色调开始出现

场景四：成长与收获
画面：火柴人站在山顶，阳光照耀
动作：张开双臂，表情欣慰
配色：明亮温暖的色调

场景五：回望与感恩
画面：火柴人转身，身后是一串脚印
动作：微笑着看向远方
配色：温馨的金色`)
    }
    setIsGenerating(false)
  }

  const handleGenerateAnimation = async () => {
    setIsGenerating(true)
    setError('')
    setGeneratedImages([])
    
    try {
      const scenes = [
        { prompt: 'Simple stick figure standing alone at dark crossroads, confused expression, minimalist style, white background, black lines', title: '迷茫的起点' },
        { prompt: 'Stick figure walking on winding mountain path with backpack, determination, minimalist illustration, white background', title: '艰难的旅程' },
        { prompt: 'Stick figure seeing bright light in distance, hopeful expression, minimalist style, warm colors emerging', title: '转折点' },
        { prompt: 'Stick figure on mountain top with arms raised celebrating, bright sunlight, golden warm colors, minimalist', title: '成长与收获' },
        { prompt: 'Stick figure looking back at footprints on path, peaceful smile, golden warm colors, minimalist illustration', title: '回望与感恩' }
      ]
      
      const results = await generateBatchImages(scenes)
      
      const images = results
        .filter(r => r.success)
        .map(r => ({ url: r.image, title: r.title }))
      
      setGeneratedImages(images)
      setAnimationGenerated(true)
    } catch (err) {
      setError(err.message)
    }
    
    setIsGenerating(false)
  }

  return (
    <div className="sop-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回首页</button>
        <h1>🎭 人生经历 → 心理视频</h1>
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
            <h2>第一步：讲述您的人生经历</h2>
            <p className="hint">请点击下方按钮，讲述您的人生故事，支持方言识别</p>
            
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
                  setTranscribedText('我年轻时经历过一段很困难的时期。那时候刚到城市，没有工作，没有住处，每天都在为生计发愁。但是我没有放弃，一步一步地努力，终于有了自己的小生意。现在回想起来，那段艰难的日子反而让我变得更坚强。')
                  setCurrentStep(2)
                }}>
                  继续下一步（使用模拟文本） →
                </button>
              </div>
            )}

            {transcribedText && (
              <div className="result-area">
                <h3>您的故事：</h3>
                <p className="transcribed-text">{transcribedText}</p>
                <button className="action-btn" onClick={() => setCurrentStep(2)}>
                  开始心理分析 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2>第二步：AI心理意象分析</h2>
            <p className="hint">AI将分析您故事中的情感和心理意象</p>
            
            {transcribedText ? (
              <div className="original-text">
                <h3>原始故事：</h3>
                <p>{transcribedText}</p>
              </div>
            ) : (
              <div className="original-text">
                <h3>提示：</h3>
                <p>未配置API，将使用模拟文本进行分析</p>
              </div>
            )}

            <button 
              className="action-btn"
              onClick={handleAnalyze}
              disabled={isGenerating}
            >
              {isGenerating ? '分析中...' : '🧠 开始心理分析'}
            </button>

            {psychAnalysis && (
              <div className="result-area">
                <h3>✅ 心理分析报告已生成：</h3>
                <pre className="analysis-text">{psychAnalysis}</pre>
                <button className="action-btn" onClick={() => setCurrentStep(3)}>
                  下一步：生成视觉化指令 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2>第三步：生成视觉化指令</h2>
            <p className="hint">AI将根据心理分析生成火柴人动画的画面指令</p>
            
            <button 
              className="action-btn"
              onClick={handleVisualize}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '🎨 生成视觉化指令'}
            </button>

            {visualInstructions && (
              <div className="result-area">
                <h3>✅ 视觉化指令已生成：</h3>
                <pre className="visual-text">{visualInstructions}</pre>
                <button className="action-btn" onClick={() => setCurrentStep(4)}>
                  下一步：生成动画 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h2>第四步：生成火柴人动画</h2>
            <p className="hint">AI将根据视觉化指令创建火柴人心理视频</p>
            
            {!animationGenerated ? (
              <button 
                className="action-btn generate-btn"
                onClick={handleGenerateAnimation}
                disabled={isGenerating}
              >
                {isGenerating ? '生成中，请稍候（约需1-2分钟）...' : '🎬 生成动画图片'}
              </button>
            ) : generatedImages.length > 0 ? (
              <div className="result-area">
                <h3>✅ 火柴人故事图片已生成：</h3>
                <div className="story-images">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="story-image-item">
                      <img src={img.url} alt={img.title} />
                      <p>{index + 1}. {img.title}</p>
                    </div>
                  ))}
                </div>
                <div className="success-message">
                  <h3>🎉 您的火柴人心理故事图片已完成！</h3>
                  <p>图片生动地展现了您的人生故事和心理历程</p>
                </div>
                <div className="download-btns">
                  <button className="action-btn" onClick={() => {
                    generatedImages.forEach((img, i) => {
                      const a = document.createElement('a')
                      a.href = img.url
                      a.download = `scene-${i + 1}.png`
                      a.click()
                    })
                  }}>📥 下载全部图片</button>
                </div>
              </div>
            ) : (
              <div className="result-area">
                <div className="animation-preview">
                  <div className="stickman-demo">
                    <div className="stickman-scene">
                      <span className="stickman">🚶</span>
                      <span className="path">～～～</span>
                      <span className="sun">☀️</span>
                    </div>
                  </div>
                </div>
                <div className="success-message">
                  <h3>🎉 演示模式</h3>
                  <p>请配置 Hugging Face Token 以生成真实图片</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default SOP3Page
