import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function ProfileSettings({ user, currentProfile }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Local state for the form, initialized with the global profile data
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    department: '',
    photoURL: ''
  });

  // When the component loads, fill the form with the user's current data
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        displayName: currentProfile.displayName || '',
        age: currentProfile.age || '',
        department: currentProfile.department || '',
        photoURL: currentProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
      });
    }
  }, [currentProfile, user.uid]);

  // Preset Avatars for selection (using DiceBear API for cool robot/hacker avatars)
  const avatarPresets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`, // User's unique default
    `https://api.dicebear.com/7.x/bottts/svg?seed=Shadow`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Ghost`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Neon`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Byte`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Titan`
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await setDoc(doc(db, "players", user.uid), {
        displayName: formData.displayName,
        age: formData.age,
        department: formData.department,
        photoURL: formData.photoURL,
        lastUpdated: new Date()
      }, { merge: true });
      
      setMessage('SUCCESS: Profile Securely Updated.');
    } catch (error) {
      setMessage(`ERROR: ${error.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="dashboard-home">
      <h1>Operator Identity</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Update your secure network credentials and visual identifier.</p>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Side: Avatar Selection */}
        <div className="stat-card" style={{ flex: '1 1 300px', padding: '25px' }}>
          <label style={{ color: '#94a3b8', display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>SELECT_AVATAR_MODEL</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {avatarPresets.map(url => (
              <img 
                key={url} 
                src={url} 
                alt="Avatar preset"
                onClick={() => setFormData({...formData, photoURL: url})}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer', 
                  borderRadius: '8px', 
                  border: formData.photoURL === url ? '3px solid #3b82f6' : '3px solid transparent',
                  background: '#020617',
                  padding: '5px',
                  transition: 'border 0.2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Info Fields */}
        <div className="mission-card" style={{ flex: '2 1 400px', padding: '30px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>OPERATOR_NAME</label>
              <input 
                type="text" 
                value={formData.displayName} 
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 100px' }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>AGE</label>
                <input 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                />
              </div>
              <div style={{ flex: '2 1 200px' }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>IDENTITY</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g. Student"
                  style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                />
              </div>
            </div>

            {message && (
              <div style={{ 
                padding: '12px', 
                background: message.startsWith('SUCCESS') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                color: message.startsWith('SUCCESS') ? '#10b981' : '#ef4444', 
                borderLeft: `3px solid ${message.startsWith('SUCCESS') ? '#10b981' : '#ef4444'}`,
                fontFamily: 'monospace'
              }}>
                {message}
              </div>
            )}

            <button type="submit" className="start-btn" disabled={saving} style={{ marginTop: '10px' }}>
              {saving ? 'SYNCING...' : 'SAVE CHANGES'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}