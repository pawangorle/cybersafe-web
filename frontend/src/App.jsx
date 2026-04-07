import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore"; // Swapped getDoc for onSnapshot
import './App.css';

// Import your components
import AccessTerminal from './AccessTerminal';
import PhishingMission from './PhishingMission';
import PasswordMission from './PasswordMission';
import SocialEngineeringMission from './SocialEngineeringMission';
import ProfileSettings from './ProfileSettings'; 
import Leaderboard from './Leaderboard'; // <-- ADDED LEADERBOARD IMPORT

let globalAudioCtx = null;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeMission, setActiveMission] = useState('home'); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Stats State
  const [missionScores, setMissionScores] = useState({
    phishing: 0,
    password: 0,
    social: 0
  });

  // --- NEW: PROFILE STATE ---
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
    age: '',
    department: 'Field Operator'
  });

  // --- NEW: TUTORIAL STATE ---
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const totalScore = missionScores.phishing + missionScores.password + missionScores.social;

  // DYNAMIC SYSTEM INTEGRITY LOGIC
  let activeModules = 0;
  if (missionScores.phishing > 0) activeModules++;
  if (missionScores.password > 0) activeModules++;
  if (missionScores.social > 0) activeModules++;

  let systemIntegrity = 100; // Default for new accounts
  if (activeModules > 0) {
    const maxPossibleScore = activeModules * 1000; 
    systemIntegrity = Math.round((totalScore / maxPossibleScore) * 100);
  }

  const getIntegrityColor = (integrity) => {
    if (integrity >= 90) return '#10b981'; // Secure (Green)
    if (integrity >= 70) return '#fbbf24'; // Warning (Yellow)
    return '#ef4444'; // Critical (Red)
  };

  // 1. THE GATEKEEPER (REAL-TIME SYNC VERSION)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);

        // REAL-TIME LISTENER: Instantly updates UI when DB changes
        const unsubscribeDoc = onSnapshot(doc(db, "players", authUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            
            // Sync Scores
            if (data.missionScores) {
              setMissionScores(data.missionScores);
            }
            
            // Sync Profile Info
            setProfile({
              displayName: data.displayName || authUser.email.split('@')[0],
              photoURL: data.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.uid}`,
              age: data.age || '',
              department: data.department || 'Field Operator'
            });

            // TUTORIAL CHECK: Show if they haven't seen it
            if (data.hasSeenTutorial === undefined || data.hasSeenTutorial === false) {
              setShowTutorial(true);
            }
          } else {
            // Brand new account, show tutorial
            setShowTutorial(true);
          }
          setLoading(false);
        }, (error) => {
          console.error("Real-time sync failed:", error);
          setLoading(false);
        });

        // Cleanup listener when unmounting
        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. CLOUD SYNC: High-Score Retention Logic
  const handleMissionUpdate = async (type, newMissionScore) => {
    if (!user) return;

    if (newMissionScore <= missionScores[type]) return; 

    const updatedScores = {
      ...missionScores,
      [type]: newMissionScore
    };
    const newTotal = updatedScores.phishing + updatedScores.password + updatedScores.social;

    setMissionScores(updatedScores);

    try {
      const userRef = doc(db, "players", user.uid);
      await setDoc(userRef, {
        missionScores: updatedScores,
        totalScore: newTotal,
        lastActive: new Date()
      }, { merge: true }); 
      
      console.log(`[SYSTEM] Successfully saved ${type} score to cloud!`);
    } catch (error) {
      console.error("[CRITICAL ERROR] Failed to sync score to cloud:", error);
    }
  };

  // --- NEW: TUTORIAL COMPLETION LOGIC ---
  const handleFinishTutorial = async () => {
    playSound('start');
    setShowTutorial(false);
    try {
      if (user) {
        const userRef = doc(db, "players", user.uid);
        await setDoc(userRef, { hasSeenTutorial: true }, { merge: true }); 
      }
    } catch (error) {
      console.error("Failed to save tutorial state:", error);
    }
  };

  const handleLogout = () => {
    playSound('click');
    signOut(auth);
    setActiveMission('home');
    setMissionScores({ phishing: 0, password: 0, social: 0 }); 
  };

  // --- AUDIO ENGINE ---
  const playSound = (type) => {
    if (!audioEnabled) return;
    
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }

    const oscillator = globalAudioCtx.createOscillator();
    const gainNode = globalAudioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(globalAudioCtx.destination);

    if (type === 'click') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, globalAudioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, globalAudioCtx.currentTime + 0.05); 
      gainNode.gain.setValueAtTime(0.1, globalAudioCtx.currentTime); 
      gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + 0.05); 
      oscillator.start(globalAudioCtx.currentTime);
      oscillator.stop(globalAudioCtx.currentTime + 0.05);
    } else if (type === 'start') {
      oscillator.type = 'square'; 
      oscillator.frequency.setValueAtTime(150, globalAudioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, globalAudioCtx.currentTime + 0.2); 
      gainNode.gain.setValueAtTime(0.05, globalAudioCtx.currentTime); 
      gainNode.gain.linearRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.3); 
      oscillator.start(globalAudioCtx.currentTime);
      oscillator.stop(globalAudioCtx.currentTime + 0.3);
    }
  };

  const handleNavClick = (mission) => {
    playSound('click');
    setActiveMission(mission);
  };

  const handleStartMission = (mission) => {
    playSound('start');
    setActiveMission(mission);
  };

  // --- NEW: RENDER TUTORIAL OVERLAY ---
  const renderTutorial = () => {
    const slides = [
      {
        icon: '📧', title: 'MODULE 1: PHISHING DEFENSE',
        desc: 'Hackers use deceptive emails to steal your credentials. In this module, carefully inspect incoming emails. Click on suspicious sender addresses, links, or text to highlight them BEFORE making your final decision.'
      },
      {
        icon: '🔑', title: 'MODULE 2: PASSWORD DEFENSE',
        desc: 'A weak password can be cracked in seconds. Test your password strength against our live brute-force simulator. Avoid using your name, company name, or common words, as our targeted dictionary attack will catch them.'
      },
      {
        icon: '💬', title: 'MODULE 3: SOCIAL ENGINEERING',
        desc: 'Not all attacks are technical. Hackers will manipulate your emotions—using fear, urgency, or authority—in a live chat environment. Choose your responses carefully to de-escalate threats.'
      }
    ];

    const current = slides[tutorialStep];

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '12px', padding: '40px', maxWidth: '600px', width: '90%', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
          
          {/* Progress Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '30px' }}>
            {slides.map((_, i) => (
              <div key={i} style={{ width: '30px', height: '6px', borderRadius: '3px', backgroundColor: i === tutorialStep ? '#3b82f6' : '#1e293b', transition: 'background-color 0.3s' }}></div>
            ))}
          </div>

          <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{current.icon}</div>
          <h2 style={{ color: '#f1f5f9', letterSpacing: '1px', marginBottom: '20px' }}>{current.title}</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '40px' }}>
            {current.desc}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <button onClick={handleFinishTutorial} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #64748b', color: '#94a3b8', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#64748b'; }}>
              Skip Tutorial
            </button>
            
            {tutorialStep < slides.length - 1 ? (
              <button onClick={() => { playSound('click'); setTutorialStep(prev => prev + 1); }} style={{ padding: '12px 30px', backgroundColor: '#3b82f6', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}>
                Next Slide ❯
              </button>
            ) : (
              <button onClick={handleFinishTutorial} style={{ padding: '12px 30px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                Start Training ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2 style={{ color: '#3b82f6', fontFamily: 'monospace', letterSpacing: '2px' }}>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <AccessTerminal />;
  }

  const renderContent = () => {
    switch(activeMission) {
      case 'phishing': 
        return <PhishingMission onUpdateScore={(s) => handleMissionUpdate('phishing', s)} />;
      case 'password': 
        return <PasswordMission onUpdateScore={(s) => handleMissionUpdate('password', s)} />;
      case 'social': 
        return <SocialEngineeringMission onUpdateScore={(s) => handleMissionUpdate('social', s)} />;
      case 'profile': 
        return <ProfileSettings user={user} currentProfile={profile} />; // Passed profile data
      case 'leaderboard': 
        return <Leaderboard currentUser={user} />; // <-- ADDED LEADERBOARD RENDER CASE
      default: return (
        <div className="dashboard-home">
          <h1>Welcome, Operator {profile.displayName}</h1>
          <p style={{color: '#94a3b8', marginBottom: '30px'}}>Status: Active | Sector: {profile.department}</p>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            
            <div className="stat-card">
              <label>System Integrity</label>
              <div className="stat-val" style={{ color: getIntegrityColor(systemIntegrity) }}>
                {systemIntegrity}%
              </div>
            </div>

            <div className="stat-card">
              <label>Total Score</label>
              <div className="stat-val">{totalScore}</div>
            </div>
          </div>

          <h2>Available Modules</h2>
          <div className="mission-grid">
            <div className="mission-card">
              <h3>📧 Phishing Defense</h3>
              <p>Analyze incoming corporate communications for procedural red-flags.</p>
              <button className="start-btn" onClick={() => handleStartMission('phishing')}>Initialize Mission</button>
            </div>
            <div className="mission-card">
              <h3>🔑 Password Hardening</h3>
              <p>Defend your workstation against live brute-force and dictionary attacks.</p>
              <button className="start-btn" onClick={() => handleStartMission('password')}>Initialize Mission</button>
            </div>
            <div className="mission-card">
              <h3>💬 Social Engineering</h3>
              <p>Identify and resist psychological manipulation tactics in live chat.</p>
              <button className="start-btn" onClick={() => handleStartMission('social')}>Initialize Mission</button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* RENDER TUTORIAL IF NEEDED */}
      {showTutorial && activeMission === 'home' && renderTutorial()}

      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ paddingBottom: '10px' }}>
          {!isCollapsed && <div className="logo">CyberSAFE</div>}
          <button className="toggle-btn" onClick={() => { playSound('click'); setIsCollapsed(!isCollapsed); }}>
            {isCollapsed ? '❯' : '❮'}
          </button>
        </div>

        {/* PROFILE MINI-CARD IN SIDEBAR */}
        {!isCollapsed && (
          <div 
            onClick={() => handleNavClick('profile')}
            style={{ 
              margin: '0 15px 15px 15px', padding: '15px', background: '#0f172a', borderRadius: '8px',
              border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
          >
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || 'default'}`} 
              alt="Avatar" 
              style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#020617', border: '2px solid #3b82f6', objectFit: 'cover' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {profile.displayName}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                ID: {user.uid.substring(0, 6)}
              </span>
            </div>
          </div>
        )}

        <div className="sidebar-menu">
          <div className={`nav-item ${activeMission === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
            <span className="nav-icon">🏠</span>
            {!isCollapsed && <span className="nav-label">Dashboard</span>}
          </div>

          <div className={`nav-item ${activeMission === 'leaderboard' ? 'active' : ''}`} onClick={() => handleNavClick('leaderboard')}>
            <span className="nav-icon">🏆</span>
            {!isCollapsed && <span className="nav-label">Global Rankings</span>}
          </div>

          {!isCollapsed && <p className="section-title">MISSIONS</p>}

          <div className={`nav-item ${activeMission === 'phishing' ? 'active' : ''}`} onClick={() => handleNavClick('phishing')}>
            <span className="nav-icon">📧</span>
            {!isCollapsed && <span className="nav-label">Phishing Module</span>}
          </div>

          <div className={`nav-item ${activeMission === 'password' ? 'active' : ''}`} onClick={() => handleNavClick('password')}>
            <span className="nav-icon">🔑</span>
            {!isCollapsed && <span className="nav-label">Password Defense</span>}
          </div>

          <div className={`nav-item ${activeMission === 'social' ? 'active' : ''}`} onClick={() => handleNavClick('social')}>
            <span className="nav-icon">💬</span>
            {!isCollapsed && <span className="nav-label">Social Engineering</span>}
          </div>
        </div>
        
        <div className="sidebar-bottom">
           <div className={`nav-item ${activeMission === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')} title="Profile">
             <span className="nav-icon">👤</span>
             {!isCollapsed && <span className="nav-label">Profile Settings</span>}
           </div>
           
           <div className="nav-item logout" onClick={handleLogout} title="Logout">
             <span className="nav-icon">🔒</span>
             {!isCollapsed && <span className="nav-label">Logout</span>}
           </div>
        </div>
      </nav>

      <main className="main-stage">
        {renderContent()}
      </main>

    </div>
  );
}

export default App;