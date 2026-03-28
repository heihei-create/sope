import { useState } from 'react'
import './App.css'
import SOP1Page from './pages/SOP1Page'
import SOP2Page from './pages/SOP2Page'
import SOP3Page from './pages/SOP3Page'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'sop1':
        return <SOP1Page onBack={() => setCurrentPage('home')} />
      case 'sop2':
        return <SOP2Page onBack={() => setCurrentPage('home')} />
      case 'sop3':
        return <SOP3Page onBack={() => setCurrentPage('home')} />
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('home')} />
      default:
        return (
          <div className="home-container">
            <header className="app-header">
              <h1>智慧创作工作室</h1>
              <p className="subtitle">专为老年人设计的AI创作工具</p>
            </header>

            <main className="main-content">
              <h2 className="section-title">请选择您想要创建的内容</h2>
              
              <div className="sop-cards">
                <button 
                  className="sop-card sop1"
                  onClick={() => setCurrentPage('sop1')}
                >
                  <div className="card-icon">📚</div>
                  <h3>文本 → 教学视频</h3>
                  <p>将您的文字内容转化为专业的教学视频</p>
                  <div className="card-steps">
                    <span>语音转文字</span>
                    <span>生成教学大纲</span>
                    <span>制作视频</span>
                  </div>
                </button>

                <button 
                  className="sop-card sop2"
                  onClick={() => setCurrentPage('sop2')}
                >
                  <div className="card-icon">📖</div>
                  <h3>故事 → 有声小说</h3>
                  <p>将您的故事转化为动听的有声小说</p>
                  <div className="card-steps">
                    <span>语音转文字</span>
                    <span>编辑文稿</span>
                    <span>配音生成</span>
                  </div>
                </button>

                <button 
                  className="sop-card sop3"
                  onClick={() => setCurrentPage('sop3')}
                >
                  <div className="card-icon">🎭</div>
                  <h3>人生经历 → 心理视频</h3>
                  <p>将您的人生故事转化为火柴人心理视频</p>
                  <div className="card-steps">
                    <span>语音转文字</span>
                    <span>心理分析</span>
                    <span>动画生成</span>
                  </div>
                </button>
              </div>

              <button 
                className="settings-btn"
                onClick={() => setCurrentPage('settings')}
              >
                ⚙️ API设置
              </button>
            </main>

            <footer className="app-footer">
              <p>简单操作 · 轻松创作 · 记录精彩人生</p>
            </footer>
          </div>
        )
    }
  }

  return (
    <div className="app">
      {renderPage()}
    </div>
  )
}

export default App
