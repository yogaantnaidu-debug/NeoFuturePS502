import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_BASE = "http://localhost:5000";
    const endpoint = isLogin ? "/api/users/login" : "/api/users/signup";
    
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }
      
      localStorage.setItem('mindsync_token', data.token);
      localStorage.setItem('mindsync_user', JSON.stringify(data.user));
      onLogin(data.user, !isLogin); // If signup, pass isNewUser=true
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 20px', background: 'var(--bg)' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '40px 32px' }}>
        <div className="logo" style={{ padding: '0 0 16px', justifyContent: 'center' }}>
          <div className="logo-mark" style={{ width: 34, height: 34, fontSize: 16 }}>✦</div>
          <span style={{ fontSize: 26 }}>MindSync</span>
        </div>
        
        <div className="page-sub" style={{ textAlign: 'center', marginBottom: 32, fontSize: 15 }}>
          {isLogin ? "Welcome back to your health companion." : "Create an account to start your journey."}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          )}

          <input 
            type="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required 
          />

          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required 
              style={{ width: '100%', paddingRight: '60px' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', 
                background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text2)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            type="button"
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--purple-lt)', 
              cursor: 'pointer', fontWeight: 500, fontSize: 14, padding: 0 
            }} 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
