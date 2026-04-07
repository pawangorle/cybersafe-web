import { useState, useEffect } from 'react';

// A realistic hacker dictionary (Notice it includes targeted identity words!)
const dictionary = ['password', '123456', '123456789', 'qwerty', 'admin', 'welcome', 'kalyan', 'pawan', 'centurion', 'student', 'security', 'cybersafe'];

export default function PasswordMission({ onUpdateScore }) {
  const [password, setPassword] = useState('');
  const [gameState, setGameState] = useState('typing'); // typing, analyzing, result
  const [strength, setStrength] = useState(0);
  const [timeToCrack, setTimeToCrack] = useState('Instant');
  const [feedback, setFeedback] = useState([]);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // --- LIVE ENTROPY & STRENGTH CALCULATOR ---
  useEffect(() => {
    if (gameState !== 'typing') return;

    let currentStrength = 0;
    let issues = [];
    const lower = password.toLowerCase();

    // 1. Dictionary Check (Instant Fail)
    const isDictionaryWord = dictionary.some(word => lower.includes(word));
    if (isDictionaryWord) {
      issues.push("🚨 TARGETED ATTACK RISK: Contains a common dictionary word, your name, or known identity data.");
      currentStrength = 5; 
    } else {
      // 2. Length Check
      if (password.length === 0) {
        issues.push("Password is empty.");
      } else if (password.length < 8) {
        issues.push("❌ CRITICAL: Extremely short. Minimum 8 characters required.");
        currentStrength += 10;
      } else if (password.length >= 8 && password.length < 12) {
        issues.push("⚠️ WARNING: Length is okay, but 12+ characters is recommended.");
        currentStrength += 30;
      } else if (password.length >= 12) {
        issues.push("✅ Excellent length (12+ characters).");
        currentStrength += 50;
      }

      // 3. Complexity Check
      let poolSize = 0;
      if (/[a-z]/.test(password)) { poolSize += 26; } else { issues.push("❌ Missing lowercase letters."); }
      if (/[A-Z]/.test(password)) { poolSize += 26; currentStrength += 15; } else { issues.push("❌ Missing uppercase letters."); }
      if (/[0-9]/.test(password)) { poolSize += 10; currentStrength += 15; } else { issues.push("❌ Missing numbers."); }
      if (/[^A-Za-z0-9]/.test(password)) { poolSize += 32; currentStrength += 20; } else { issues.push("❌ Missing special symbols (!@#$%)."); }

      // 4. Calculate Math "Time to Crack"
      if (password.length > 0 && !isDictionaryWord) {
        // Combinations = poolSize ^ length
        const combinations = Math.pow(poolSize, password.length);
        // Assume a modern cracking rig guesses 100 Billion times per second
        const secondsToCrack = combinations / 100000000000; 

        if (secondsToCrack < 1) setTimeToCrack("Instantly");
        else if (secondsToCrack < 60) setTimeToCrack(`${Math.round(secondsToCrack)} Seconds`);
        else if (secondsToCrack < 3600) setTimeToCrack(`${Math.round(secondsToCrack / 60)} Minutes`);
        else if (secondsToCrack < 86400) setTimeToCrack(`${Math.round(secondsToCrack / 3600)} Hours`);
        else if (secondsToCrack < 31536000) setTimeToCrack(`${Math.round(secondsToCrack / 86400)} Days`);
        else if (secondsToCrack < 3153600000) setTimeToCrack(`${Math.round(secondsToCrack / 31536000)} Years`);
        else setTimeToCrack("Centuries (Secure)");
      } else if (isDictionaryWord) {
        setTimeToCrack("Instantly (Dictionary Match)");
      } else {
        setTimeToCrack("---");
      }
    }

    setStrength(Math.min(currentStrength, 100));
    setFeedback(issues);
  }, [password, gameState]);

  // --- SUBMIT LOGIC ---
  const handleDeployDefense = () => {
    if (password.length === 0) return;
    
    setGameState('analyzing');
    
    setTimeout(() => {
      // Calculate Score based on strength
      let finalScore = 0;
      if (strength >= 90) finalScore = 500;       // Perfect
      else if (strength >= 70) finalScore = 300;  // Good
      else if (strength >= 40) finalScore = 100;  // Weak
      else finalScore = -50;                      // Compromised

      setScoreEarned(finalScore);
      if (onUpdateScore) onUpdateScore(finalScore);
      setGameState('result');
    }, 2000);
  };

  const handleReset = () => {
    setPassword('');
    setGameState('typing');
    setStrength(0);
    setTimeToCrack('Instant');
    setScoreEarned(0);
  };

  // --- RENDER HELPERS ---
  const getShieldColor = () => {
    if (strength >= 80) return '#10b981'; // Green
    if (strength >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  if (gameState === 'analyzing') {
    return (
      <div className="mission-container" style={{ backgroundColor: '#020617', padding: '40px', border: '1px solid #1e293b', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ color: '#f59e0b', fontFamily: 'monospace' }}>&gt; SIMULATING BRUTE FORCE ATTACK...</h2>
        <p style={{ color: '#64748b' }}>Testing password against 100 billion guesses per second...</p>
        <div style={{ width: '100%', backgroundColor: '#1e293b', height: '4px', marginTop: '40px', overflow: 'hidden' }}>
           <div style={{ width: '50%', backgroundColor: '#f59e0b', height: '100%', animation: 'slideRight 0.5s infinite linear' }}></div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const isCompromised = strength < 50;
    return (
      <div className="mission-container" style={{ backgroundColor: '#0f172a', border: `1px solid ${isCompromised ? '#ef4444' : '#10b981'}`, padding: '40px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '32px', textAlign: 'center', color: isCompromised ? '#ef4444' : '#10b981', letterSpacing: '2px', marginTop: 0 }}>
          {isCompromised ? 'DEFENSES BREACHED' : 'DEFENSES HOLDING'}
        </h1>
        
        <div style={{ backgroundColor: '#020617', padding: '30px', borderRadius: '6px', border: '1px solid #1e293b', marginTop: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#f1f5f9', margin: '0 0 10px 0' }}>Time Survived: <span style={{ color: getShieldColor() }}>{timeToCrack}</span></h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '20px' }}>
            {isCompromised 
              ? "Your password was too weak. Attackers cracked your encryption and compromised the network." 
              : "Excellent work. Your encryption is highly resilient to standard cracking rigs."}
          </p>
          
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '15px 30px', borderRadius: '8px', border: '1px solid #3b82f6', marginBottom: '30px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.2rem' }}>SCORE IMPACT: {scoreEarned > 0 ? `+${scoreEarned}` : scoreEarned}</span>
          </div>

          <button onClick={handleReset} style={{ display: 'block', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', letterSpacing: '1px' }}>
            TEST ANOTHER PASSWORD
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN GAME UI ---
  return (
    <div className="mission-container" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '30px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      
      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ color: '#f59e0b', margin: 0, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🔑</span> &gt; PASSWORD STRENGTH TESTER
        </h2>
        <p style={{ color: '#64748b', marginTop: '10px', fontSize: '0.95rem' }}>
          Hackers use automated programs to guess millions of passwords every second. Create a strong, complex password to stop them from breaching the network.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: Input & Shield */}
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', color: '#f1f5f9', fontWeight: 'bold', marginBottom: '10px' }}>ENTER A STRONG PASSWORD</label>
          
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password here..."
              style={{ 
                width: '100%', padding: '15px', paddingRight: '50px', backgroundColor: '#020617', 
                border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '1.2rem',
                boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s'
              }}
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              title="Toggle visibility"
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          {/* Shield Integrity Bar */}
          <div style={{ marginTop: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>PASSWORD STRENGTH</span>
              <span style={{ color: getShieldColor(), fontWeight: 'bold', fontSize: '0.85rem' }}>{strength}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#1e293b', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', width: `${strength}%`, 
                backgroundColor: getShieldColor(),
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s'
              }}></div>
            </div>
          </div>

          <button 
            onClick={handleDeployDefense}
            disabled={password.length === 0}
            style={{ 
              width: '100%', padding: '16px', marginTop: '30px', backgroundColor: password.length === 0 ? '#1e293b' : '#3b82f6', 
              color: password.length === 0 ? '#64748b' : 'white', border: 'none', borderRadius: '6px', 
              fontWeight: 'bold', fontSize: '1.1rem', cursor: password.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', boxShadow: password.length > 0 ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            TEST PASSWORD STRENGTH
          </button>
        </div>

        {/* RIGHT COLUMN: Live Analysis */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#020617', padding: '25px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #334155' }}>
            <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>ESTIMATED TIME TO CRACK</span>
            <span style={{ color: getShieldColor(), fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {timeToCrack}
            </span>
          </div>

          <h3 style={{ color: '#f1f5f9', fontSize: '1rem', marginBottom: '15px' }}>SECURITY FEEDBACK:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {feedback.length === 0 && password.length === 0 ? (
              <li style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>Start typing to see feedback...</li>
            ) : (
              feedback.map((issue, idx) => (
                <li key={idx} style={{ 
                  color: issue.includes('✅') ? '#10b981' : issue.includes('⚠️') ? '#f59e0b' : '#ef4444',
                  fontSize: '0.9rem', lineHeight: '1.4', backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px'
                }}>
                  {issue}
                </li>
              ))
            )}
          </ul>
        </div>
        
      </div>
    </div>
  );
}