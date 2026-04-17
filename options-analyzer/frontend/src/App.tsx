import { useState, useEffect } from 'react'
import OptionsView from './pages/OptionsView'
import { Activity, Bell, User, Search, Moon, Sun, Link as LinkIcon } from 'lucide-react'

// Simple component to handle the Schwab OAuth redirect
function CallbackHandler() {
  const [status, setStatus] = useState('Connecting to Schwab...')
  
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      fetch('/api/schwab/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(async res => {
        if (!res.ok) {
          let msg = 'Server responded with ' + res.status;
          try {
            const errData = await res.json();
            msg = errData.error || msg;
          } catch(e) {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setStatus('Connected successfully! Redirecting...')
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        } else {
          setStatus('Failed to connect: ' + (data.error || 'Unknown error') + (data.details ? ' (' + (typeof data.details === 'object' ? JSON.stringify(data.details) : data.details) + ')' : ''))
        }
      })
      .catch(err => setStatus('Error: ' + err.message))
    } else {
      setStatus('No authorization code found.')
    }
  }, [])

  return (
    <div className="flex-1 flex items-center justify-center p-20">
      <div className="text-xl font-bold">{status}</div>
    </div>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [schwabStatus, setSchwabStatus] = useState(false)

  // Toggle body class for global dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Check Schwab Status
  useEffect(() => {
    fetch('/api/schwab/status')
      .then(res => {
        if (!res.ok) throw new Error('Server responded with ' + res.status);
        return res.json();
      })
      .then(data => setSchwabStatus(data.connected))
      .catch(err => console.error('Schwab status check failed:', err))
  }, [])

  const handleSchwabLogin = async () => {
    console.log('Connect Broker clicked...');
    try {
      const res = await fetch('/api/schwab/login-url')
      if (!res.ok) {
        let errorMessage = 'Server responded with ' + res.status;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, stick with the status code message
        }
        alert('Server Error: ' + errorMessage);
        return;
      }
      const data = await res.json()
      if (data.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url
      } else {
        alert('Error: No login URL returned from server.');
      }
    } catch (err: any) {
      console.error('Failed to get login URL', err)
      alert('Connection Error: Could not reach the backend server. Make sure it is running on port 3001.');
    }
  }
  
  const isCallback = window.location.pathname === '/callback'

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'bg-[#000000] text-white' : 'bg-white text-[#1a1a1a]'}`}>
      
      {/* ROBINHOOD STYLE NAV */}
      <nav className={`h-16 border-b sticky top-0 z-50 flex items-center px-6 lg:px-20 justify-between transition-colors duration-200 ${darkMode ? 'bg-[#000000] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.href='/'}>
            <div className="w-8 h-8 bg-[#00c805] rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Activity size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight hover:text-[#00c805] transition-colors">Alpha.Lab</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button className="text-sm font-bold text-[#00c805] transition-colors">
              Investing
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-md px-10 hidden lg:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00c805] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search markets..." 
              className={`w-full border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00c805]/20 transition-all outline-none border border-transparent focus:border-[#00c805]/30 ${darkMode ? 'bg-gray-900 text-white placeholder-gray-500 focus:bg-[#000000]' : 'bg-gray-50 text-[#1a1a1a] focus:bg-white'}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              fetch('/api/schwab/mock')
                .then(() => setSchwabStatus(true))
                .catch(err => alert('Failed to mock connection'));
            }}
            className="text-xs text-gray-400 hover:text-[#00c805] underline"
          >
            Dev Bypass
          </button>
          <button 
            onClick={handleSchwabLogin}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${schwabStatus ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}
          >
            <LinkIcon size={14} />
            {schwabStatus ? 'Schwab Connected' : 'Connect Broker'}
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400 cursor-pointer hover:text-[#00c805] transition-colors" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition-colors ${darkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}>
              <User size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT REGION */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
        {isCallback ? <CallbackHandler /> : <OptionsView darkMode={darkMode} />}
      </main>

      {/* MINIMAL FOOTER */}
      <footer className={`px-6 lg:px-20 py-12 border-t transition-colors duration-200 ${darkMode ? 'bg-[#000000] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-500 gap-6">
          <div className="flex items-center gap-2">
            <span>© 2026 Alpha Laboratory</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>All-in-one Trading Intelligence</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#00c805] transition-colors">Brokerage Disclosure</a>
            <a href="#" className="hover:text-[#00c805] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
