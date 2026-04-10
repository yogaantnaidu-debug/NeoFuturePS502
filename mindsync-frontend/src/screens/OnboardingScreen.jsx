import React, { useState } from 'react';

export default function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("Maintain");
  const [aiPersonality, setAiPersonality] = useState("Friendly Buddy");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, aiPersonality })
      });
      if (res.ok) {
        const updatedUser = { ...user, goal, aiPersonality };
        localStorage.setItem('mindsync_user', JSON.stringify(updatedUser));
        onComplete(updatedUser);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 20px' }}>
      <div className="card" style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
           <div className="prog-track"><div className="prog-fill" style={{ width: step===1?'100%':'100%', background: 'var(--purple)' }} /></div>
           <div className="prog-track"><div className="prog-fill" style={{ width: step===2?'100%':'0%', background: 'var(--purple)' }} /></div>
        </div>

        {step === 1 && (
          <div>
            <div className="page-title" style={{ fontSize: 24 }}>What's your primary goal?</div>
            <div className="page-sub" style={{ marginBottom: 24 }}>We'll tailor your insights accordingly.</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Fat Loss', 'Muscle Gain', 'Maintain', 'Improve Sleep', 'Reduce Stress'].map(g => (
                <button 
                  key={g} 
                  className={`btn ${goal === g ? 'btn-primary' : ''}`}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 8, borderColor: goal === g ? '' : 'var(--border2)' }}
                  onClick={() => setGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={() => setStep(2)}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="page-title" style={{ fontSize: 24 }}>Choose your AI companion</div>
            <div className="page-sub" style={{ marginBottom: 24 }}>How do you want VitalAI to sound?</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'Friendly Buddy', desc: 'Casual, warm, supportive' },
                { id: 'Strict Coach', desc: 'Tough love, pushing your limits' },
                { id: 'Motivational Mentor', desc: 'Inspiring, philosophical growth' },
                { id: 'Data Analyst', desc: 'Analytical, precise insights' }
              ].map(p => (
                <div 
                  key={p.id}
                  onClick={() => setAiPersonality(p.id)}
                  style={{ 
                    padding: 16, 
                    border: `1px solid ${aiPersonality === p.id ? 'var(--purple-lt)' : 'var(--border2)'}`, 
                    borderRadius: 8, 
                    cursor: 'pointer',
                    background: aiPersonality === p.id ? 'rgba(108,92,231,0.1)' : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 500, color: aiPersonality === p.id ? 'var(--purple-lt)' : 'var(--text)' }}>{p.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{p.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleFinish} disabled={loading}>
                {loading ? "Saving..." : "Start Dashboard"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
