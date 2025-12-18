import { supabase } from '../lib/supabase'

const Login = () => {
  const handleGoogleLogin = async () => {
    // Supabaseを使ってGoogleログインを呼び出す魔法の言葉
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.error('Login error:', error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">在庫予測アプリ</h1>
        <p className="text-gray-600 mb-8">Googleアカウントでログインして始めましょう</p>
        
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
          Googleでログイン
        </button>
      </div>
    </div>
  )
}

export default Login