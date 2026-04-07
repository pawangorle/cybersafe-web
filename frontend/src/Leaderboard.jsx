import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Leaderboard({ currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Query Firebase: Get 'players' collection, order by 'totalScore' highest to lowest, limit to Top 10
        const q = query(collection(db, "players"), orderBy("totalScore", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        const fetchedLeaders = [];
        querySnapshot.forEach((doc) => {
          fetchedLeaders.push({ id: doc.id, ...doc.data() });
        });
        
        setLeaders(fetchedLeaders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div style={{ color: '#3b82f6', textAlign: 'center', marginTop: '50px', fontFamily: 'monospace', fontSize: '1.2rem' }}>&gt; DECRYPTING GLOBAL RANKINGS...</div>;
  }

  return (
    <div className="mission-container" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '30px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '15px', marginBottom: '25px', textAlign: 'center' }}>
        <h2 style={{ color: '#10b981', margin: 0, fontFamily: 'monospace', fontSize: '2rem', letterSpacing: '2px' }}>
          🏆 GLOBAL OPERATOR RANKINGS
        </h2>
        <p style={{ color: '#64748b', marginTop: '10px', fontSize: '1rem' }}>Top 10 highest-scoring cybersecurity operatives.</p>
      </div>

      <div style={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'flex', padding: '15px 20px', backgroundColor: '#1e293b', color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>
          <div style={{ width: '60px', textAlign: 'center' }}>RANK</div>
          <div style={{ flex: 1 }}>OPERATOR</div>
          <div style={{ width: '150px', textAlign: 'center' }}>DEPARTMENT</div>
          <div style={{ width: '100px', textAlign: 'right' }}>SCORE</div>
        </div>

        {/* Leaderboard Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaders.map((leader, index) => {
            const isMe = currentUser && currentUser.uid === leader.id;
            
            // Medals for top 3
            let rankDisplay = `#${index + 1}`;
            if (index === 0) rankDisplay = '🥇 1st';
            if (index === 1) rankDisplay = '🥈 2nd';
            if (index === 2) rankDisplay = '🥉 3rd';

            return (
              <div 
                key={leader.id} 
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '15px 20px', 
                  borderBottom: index === leaders.length - 1 ? 'none' : '1px solid #1e293b',
                  backgroundColor: isMe ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                {/* Rank */}
                <div style={{ width: '60px', textAlign: 'center', color: index < 3 ? '#f59e0b' : '#64748b', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {rankDisplay}
                </div>

                {/* Operator Profile */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={leader.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${leader.id}`} 
                    alt="avatar" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: isMe ? '2px solid #3b82f6' : '1px solid #334155', backgroundColor: '#0f172a' }} 
                  />
                  <div>
                    <div style={{ color: isMe ? '#60a5fa' : '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {leader.displayName || 'Unknown Operator'}
                      {isMe && <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>YOU</span>}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div style={{ width: '150px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  {leader.department || 'Field Operator'}
                </div>

                {/* Score */}
                <div style={{ width: '100px', textAlign: 'right', color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                  {leader.totalScore || 0}
                </div>
              </div>
            );
          })}

          {leaders.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No operator data found.</div>
          )}
        </div>
      </div>
    </div>
  );
}