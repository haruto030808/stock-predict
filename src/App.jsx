import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. 現在のログイン状態（セッション）を取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. ログイン・ログアウトの状態変化をリアルタイムで監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ログインしてれば Home 画面、してなければ Login 画面を表示
  return (
    <>
      {session ? <Home /> : <Login />}
    </>
  )
}

export default App
// redeploy for env vars