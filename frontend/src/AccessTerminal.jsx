import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail // <-- NEW: Added for password recovery
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AccessTerminal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // <-- NEW: Tracks recovery mode
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // <-- NEW: Success messages
  const [isLoading, setIsLoading] = useState(false);

  // CLEANUP: Prevents React errors if the component closes mid-load
  useEffect(() => {
    return () => setIsLoading(false);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    // SAFETY NET: Force stop the loading screen if Firebase takes more than 8 seconds
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      setError("SYSTEM TIMEOUT: The secure server took too long to respond. Check your network connection or refresh the page.");
    }, 8000);

    try {
      if (isRegistering) {
        console.log("[SYSTEM] 1. Attempting to create new Operator Auth...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("[SYSTEM] 2. Auth successful! UID:", userCredential.user.uid);
        
        console.log("[SYSTEM] 3. Attempting to write initial save file to Firestore...");
        await setDoc(doc(db, "players", userCredential.user.uid), {
          email: email,
          displayName: email.split('@')[0], 
          missionScores: { phishing: 0, password: 0, social: 0 }, // Added default scores to prevent crashes
          totalScore: 0,
          rank: "NOVICE",
          joinedDate: new Date()
        });
        console.log("[SYSTEM] 4. Firestore save complete! Handing over to Dashboard...");

      } else {
        console.log("[SYSTEM] 1. Attempting to authorize existing Operator...");
        await signInWithEmailAndPassword(auth, email, password);
        console.log("[SYSTEM] 2. Login successful! Handing over to Dashboard...");
      }
      
      clearTimeout(fallbackTimer); // SUCCESS: Clear the timeout so it doesn't throw an error

    } catch (err) {
      clearTimeout(fallbackTimer); // FAILED QUICKLY: Clear the timeout
      console.error("[CRITICAL ERROR] Authentication failed:", err);
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("ACCESS DENIED: Incorrect credentials.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("ACCESS DENIED: Operator already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("SECURITY WARNING: Password must be at least 6 characters.");
      } else {
        setError("SYSTEM ERROR: " + err.message);
      }
      
      // FIX: Only turn off loading on error so the user can try again. 
      // On success, we leave it loading until App.jsx unmounts this screen smoothly.
      setIsLoading(false); 
    } 
  };

  // --- NEW: PASSWORD RECOVERY LOGIC ---
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError("SYSTEM ERROR: Please enter your Operator ID (Email) first.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("RECOVERY LINK SENT: Check your secure inbox to reset your passphrase.");
      setIsResetting(false); // Send them back to the login screen so they can log in with their new password
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError("ACCESS DENIED: No operator found with that ID.");
      } else if (err.code === 'auth/invalid-email') {
        setError("SYSTEM ERROR: Invalid email format.");
      } else {
        setError("SYSTEM ERROR: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="terminal-auth-overlay">
      <div className="auth-card">
        <h2 style={{ color: '#3b82f6', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '20px' }}>
          &gt; CyberSAFE_GATEWAY
        </h2>
        
        {/* CONDITIONAL RENDERING: Show Loader OR Form */}
        {isLoading ? (
          
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <h3 style={{ color: '#10b981', margin: '0 0 20px 0', letterSpacing: '1px', fontFamily: 'monospace' }}>
              {isRegistering ? 'ENCRYPTING_NEW_OPERATOR...' : 'VERIFYING_CREDENTIALS...'}
            </h3>
            
            {/* Animated Scanning Bar */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
              <div className="scanner-bar"></div>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '25px', fontFamily: 'monospace', lineHeight: '1.5' }}>
              [ Handshaking with secure server ]<br/>
              Please do not disconnect.
            </p>
          </div>

        ) : (

          <>
            {error && <div className="error-text">{error}</div>}
            
            {/* NEW: SUCCESS MESSAGE BANNER */}
            {successMsg && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', marginBottom: '15px', borderLeft: '3px solid #10b981', fontFamily: 'monospace', fontSize: '0.9rem' }}>{successMsg}</div>}

            {isResetting ? (
              /* --- RECOVERY FORM --- */
              <form onSubmit={handlePasswordReset}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>Enter your Operator ID to receive a secure password reset link.</p>
                <input 
                  type="email" 
                  placeholder="OPERATOR_EMAIL" 
                  value={email}
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
                <button type="submit" style={{ background: '#fbbf24', color: '#000' }}>
                  TRANSMIT_RECOVERY_LINK
                </button>
                <p className="toggle-auth" onClick={() => { setIsResetting(false); setError(''); }}>
                  [ Cancel Recovery / Return to Login ]
                </p>
              </form>
            ) : (
              /* --- STANDARD LOGIN/REGISTER FORM --- */
              <form onSubmit={handleAuth}>
                <input 
                  type="email" 
                  placeholder="OPERATOR_EMAIL" 
                  value={email}
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
                <input 
                  type="password" 
                  placeholder="SECURITY_KEY" 
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button type="submit">
                  {isRegistering ? 'INITIALIZE_CREDENTIALS' : 'AUTHORIZE_SESSION'}
                </button>

                {/* FORGOT PASSWORD LINK (Only show on Login screen, not Register) */}
                {!isRegistering && (
                  <p style={{ textAlign: 'center', marginTop: '15px', color: '#fbbf24', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'monospace' }} onClick={() => { setIsResetting(true); setError(''); setSuccessMsg(''); }}>
                    &gt; FORGOT_SECURITY_KEY?
                  </p>
                )}
              </form>
            )}

            {/* TOGGLE BETWEEN LOGIN AND REGISTER */}
            {!isResetting && (
              <p className="toggle-auth" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
                {isRegistering ? "[ Existing Operator? Login Here ]" : "[ New Recruit? Register Here ]"}
              </p>
            )}
          </>

        )}
      </div>
    </div>
  );
}