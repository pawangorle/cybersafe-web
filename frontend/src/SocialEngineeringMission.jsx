import { useState, useEffect, useRef } from 'react';

// --- MASSIVE DIALOGUE DATABASE ---
// To add hundreds of these later, you can move this array into a separate file or Firebase!
const scenarios = [
  {
    id: 'fake_it_password',
    npcName: 'Dave (IT Support)', avatar: '👨‍💻',
    description: "Someone claiming to be from IT is messaging you directly.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "Hey there! We are seeing some critical synchronization errors coming from your workstation. Are you at your desk?",
        options: [
          { text: "Yes, I'm here. What's wrong?", next: 'node_2', score: 0 },
          { text: "I didn't submit a ticket. Can you verify your employee ID?", next: 'node_suspicious', score: 20 }
        ]
      },
      'node_2': {
        text: "Great. We need to push a mandatory security patch to your profile immediately or your account will be locked out. I just need you to confirm your current password so I can authenticate the push.",
        options: [
          { text: "Sure, my password is...", next: 'fail_data', score: -100, isTerminal: true },
          { text: "IT should never ask for my password. I'm reporting this chat.", next: 'win_report', score: 100, isTerminal: true }
        ]
      },
      'node_suspicious': {
        text: "I'm Senior Tech Lead Dave Harrison, badge #4992. Listen, if we don't fix this sync issue in the next 5 minutes, you're going to lose all your local files. Just give me your password quickly so I can bypass the lock.",
        options: [
          { text: "Okay, fine. It's...", next: 'fail_data', score: -100, isTerminal: true },
          { text: "Nice try. IT policy clearly states you will never ask for passwords. Reported.", next: 'win_report', score: 100, isTerminal: true }
        ]
      }
    }
  },
  {
    id: 'fake_ceo_wire',
    npcName: 'Alexander (CEO)', avatar: '👔',
    description: "The CEO is messaging you directly. This is highly unusual.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "Are you available right now? I need a task handled discreetly and immediately.",
        options: [
          { text: "Yes sir, how can I help?", next: 'node_2', score: 0 },
          { text: "Who is this? Your username looks strange.", next: 'node_suspicious', score: 20 }
        ]
      },
      'node_2': {
        text: "I'm in a meeting with a vendor and our corporate card was declined. I need you to wire $5,000 to the account I'm about to link you. Do not tell anyone else, this is a confidential acquisition.",
        options: [
          { text: "I'll get right on it. Send the link.", next: 'fail_wire', score: -100, isTerminal: true },
          { text: "This violates corporate financial policy. I am reporting this request.", next: 'win_report', score: 100, isTerminal: true }
        ]
      },
      'node_suspicious': {
        text: "It's Alexander. Look, I don't have time to explain, I need you to initiate a wire transfer of $5,000 immediately to secure a vendor contract.",
        options: [
          { text: "Okay, please send the vendor details.", next: 'fail_wire', score: -100, isTerminal: true },
          { text: "I cannot bypass financial protocols, even for you. I must call you to verify.", next: 'win_report', score: 100, isTerminal: true }
        ]
      }
    }
  },
  {
    id: 'sympathy_intern',
    npcName: 'Ryan (New Intern)', avatar: '🎒',
    description: "A panic-stricken intern is asking for a huge favor.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "Hey! Oh man, I am freaking out. I think I just accidentally deleted the marketing folder from the shared drive!",
        options: [
          { text: "Calm down, what happened?", next: 'node_2', score: 10 },
          { text: "You need to call IT immediately.", next: 'win_report', score: 50, isTerminal: true }
        ]
      },
      'node_2': {
        text: "I was trying to clean up my desktop and I dragged the wrong folder! If my manager finds out I'm going to get fired on my first week. You have admin rights, right? Can you just give me your login for 2 minutes so I can restore it from the backup bin?",
        options: [
          { text: "That's against policy, but I'll do it for you this once.", next: 'fail_data', score: -100, isTerminal: true },
          { text: "I can't share my credentials. I will restore it for you from my machine.", next: 'win_good_policy', score: 100, isTerminal: true },
          { text: "Absolutely not. Do not ask people for their passwords.", next: 'win_report', score: 100, isTerminal: true }
        ]
      }
    }
  },
  {
    id: 'angry_vendor',
    npcName: 'Apex Logistics (Vendor)', avatar: '🚚',
    description: "An external vendor is furious about a missed payment.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "I have been trying to get a hold of your accounts payable team for THREE DAYS. Invoice #9928 is severely overdue. If this isn't paid today, we are halting all your shipments.",
        options: [
          { text: "I'm sorry, let me look into this. Do you have the invoice?", next: 'node_2', score: 10 },
          { text: "I don't handle billing. Please email finance@internal-corp.com.", next: 'win_report', score: 100, isTerminal: true }
        ]
      },
      'node_2': {
        text: "Finally, someone answers. Yes, I'm dropping a ZIP file in this chat with the PDF invoice and our updated banking routing numbers. Open it right now and tell me when the wire is initiated.",
        options: [
          { text: "Okay, downloading the ZIP file now.", next: 'fail_malware', score: -100, isTerminal: true },
          { text: "I cannot accept ZIP files over chat due to security rules. Send a standard PDF via email.", next: 'win_good_policy', score: 100, isTerminal: true }
        ]
      }
    }
  },
  {
    id: 'fake_hr',
    npcName: 'HR Payroll Portal', avatar: '📊',
    description: "The HR Bot is requesting sensitive information.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "AUTOMATED ALERT: Your direct deposit routing information has bounced. Your upcoming paycheck cannot be processed.",
        options: [
          { text: "Wait, what? How do I fix this?", next: 'node_2', score: 0 },
          { text: "Ignore the bot and verify via the official Workday app.", next: 'win_report', score: 100, isTerminal: true }
        ]
      },
      'node_2': {
        text: "To avoid a delay in your pay schedule, please reply to this secure chat with your Social Security Number (SSN) and new bank routing number to verify your identity.",
        options: [
          { text: "Okay, my SSN is...", next: 'fail_data', score: -100, isTerminal: true },
          { text: "Automated systems don't ask for SSNs in a chat box. Reported for phishing.", next: 'win_report', score: 100, isTerminal: true }
        ]
      }
    }
  },
  {
    id: 'fake_recruiter',
    npcName: 'Sarah (Executive Recruiter)', avatar: '🤝',
    description: "An external recruiter is sliding into your DMs with a tempting offer.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "Hi there! I've been reviewing your work and I have an unlisted Senior Operator role at a rival tech firm. Base salary is $250k. Are you open to a quick chat?",
        options: [
          { text: "Wow, yes I'm interested.", next: 'node_2', score: 0 },
          { text: "I'm happy where I am, thank you.", next: 'win_good_policy', score: 50, isTerminal: true }
        ]
      },
      'node_2': {
        text: "Excellent. Because this role is stealth-mode, I need you to sign a quick NDA before I can tell you the company name. I'm sending over a secure link. You'll need to log in with your Microsoft 365 work credentials to verify your industry identity.",
        options: [
          { text: "Makes sense, clicking the link to log in.", next: 'fail_data', score: -100, isTerminal: true },
          { text: "I will NEVER use my corporate credentials to log into a third-party site. Nice try.", next: 'win_report', score: 100, isTerminal: true }
        ]
      }
    }
  },
  {
    id: 'data_exfiltration',
    npcName: 'Mark (Sales Team)', avatar: '📈',
    description: "A coworker needs help bypassing security controls.",
    startNode: 'node_1',
    nodes: {
      'node_1': {
        text: "Hey! I'm stuck at an airport lounge and the corporate VPN won't connect on this public Wi-Fi. I have a massive client pitch in 10 minutes.",
        options: [
          { text: "That sucks, how can I help?", next: 'node_2', score: 10 },
          { text: "Don't connect to public Wi-Fi without the VPN, it's a security risk.", next: 'win_good_policy', score: 50, isTerminal: true }
        ]
      },
      'node_2': {
        text: "Can you go into the secure client database, download the 'Q3 Financial Projections' spreadsheet, and just email it to my personal Gmail account? (mark.sales123@gmail.com). The firewall blocks me from accessing it here.",
        options: [
          { text: "Sure, sending it to your Gmail now.", next: 'fail_data', score: -100, isTerminal: true },
          { text: "No way. Sending confidential financial data to a personal Gmail is a massive DLP violation.", next: 'win_report', score: 100, isTerminal: true }
        ]
      }
    }
  }
];

export default function SocialEngineeringMission({ onUpdateScore }) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [gameState, setGameState] = useState('briefing'); 
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackData, setFeedbackData] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const startNewScenario = () => {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setActiveScenario(randomScenario);
    setChatLog([]);
    setGameState('playing');
    setFeedbackData(null);
    
    setIsTyping(true);
    setTimeout(() => {
      setChatLog([{ sender: 'npc', text: randomScenario.nodes[randomScenario.startNode].text }]);
      setCurrentNode(randomScenario.startNode);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (onUpdateScore) onUpdateScore(totalScore);
  }, [totalScore, onUpdateScore]);

  const handleChoice = (option) => {
    if (isTyping) return;

    setChatLog(prev => [...prev, { sender: 'user', text: option.text }]);
    
    if (option.isTerminal) {
      endScenario(option);
    } else {
      setIsTyping(true);
      setCurrentNode(null); 
      
      setTimeout(() => {
        const nextNodeData = activeScenario.nodes[option.next];
        setChatLog(prev => [...prev, { sender: 'npc', text: nextNodeData.text }]);
        setCurrentNode(option.next);
        setIsTyping(false);
        setTotalScore(prev => prev + option.score);
      }, 2000);
    }
  };

  const endScenario = (option) => {
    setTotalScore(prev => prev + option.score);
    setIsTyping(true);
    setCurrentNode(null);

    setTimeout(() => {
      setIsTyping(false);
      setGameState('feedback');
      
      // Dynamic Feedback Engine
      if (option.next === 'fail_password' || option.next === 'fail_data') {
        setFeedbackData({ success: false, title: "DATA BREACH", message: "You surrendered sensitive information (passwords, PII, or confidential files). Attackers use fear, sympathy, or greed to make you bypass policy. You have compromised the network." });
      } else if (option.next === 'fail_wire') {
        setFeedbackData({ success: false, title: "FINANCIAL LOSS", message: "You fell for wire fraud. Attackers impersonate executives or vendors to create panic and force you to bypass security rules. The company lost funds." });
      } else if (option.next === 'fail_malware') {
        setFeedbackData({ success: false, title: "MALWARE INFECTION", message: "You accepted an unverified file over chat. The file contained malware that has now infected your workstation and is spreading through the network." });
      } else if (option.next === 'win_report') {
        setFeedbackData({ success: true, title: "THREAT NEUTRALIZED", message: "Excellent work! You recognized the psychological manipulation tactics and successfully shut down the social engineering attack by sticking to security protocols." });
      } else if (option.next === 'win_good_policy') {
        setFeedbackData({ success: true, title: "POLICY UPHELD", message: "Good job. You refused to bypass security policies, protecting both yourself and the company's data. Attackers rely on employees bending the rules." });
      }
    }, 1500);
  };

  if (gameState === 'briefing') {
    return (
      <div className="mission-container" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>💬</span>
        <h1 style={{ color: '#3b82f6', marginTop: '10px' }}>SOCIAL ENGINEERING SIMULATOR</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
          Hackers don't just attack computers; they attack human psychology. You will be placed into a live chat environment. Beware of manipulation tactics like false urgency, authority intimidation, sympathy, or fake helpfulness.
        </p>
        <button onClick={startNewScenario} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
          ENTER LIVE CHAT
        </button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    return (
      <div className="mission-container" style={{ backgroundColor: '#0f172a', border: `1px solid ${feedbackData.success ? '#10b981' : '#ef4444'}`, padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', color: feedbackData.success ? '#10b981' : '#ef4444', letterSpacing: '1px', marginTop: 0 }}>
          {feedbackData.title}
        </h1>
        <div style={{ backgroundColor: '#020617', padding: '30px', borderRadius: '6px', border: '1px solid #1e293b', marginTop: '20px' }}>
          <p style={{ color: '#f1f5f9', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '30px' }}>
            {feedbackData.message}
          </p>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '15px 30px', borderRadius: '8px', border: '1px solid #3b82f6', marginBottom: '30px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.2rem' }}>CURRENT SCORE: {totalScore}</span>
          </div>
          <button onClick={startNewScenario} style={{ display: 'block', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', letterSpacing: '1px' }}>
            INITIALIZE NEXT SCENARIO
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN CHAT UI ---
  const activeNodeData = activeScenario && currentNode ? activeScenario.nodes[currentNode] : null;

  return (
    <div className="mission-container" style={{ display: 'flex', flexDirection: 'column', height: '80vh', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      
      {/* CHAT HEADER */}
      <div style={{ backgroundColor: '#f1f5f9', padding: '15px 25px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            {activeScenario?.avatar}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{activeScenario?.npcName}</h2>
            <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>● Online</span>
          </div>
        </div>
        <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
          Score: {totalScore}
        </div>
      </div>

      {/* CHAT HISTORY AREA */}
      <div style={{ flex: 1, padding: '25px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
          <span style={{ backgroundColor: '#e2e8f0', color: '#64748b', padding: '5px 15px', borderRadius: '10px', fontSize: '0.8rem' }}>
            {activeScenario?.description}
          </span>
        </div>

        {chatLog.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', marginLeft: '5px', marginRight: '5px' }}>
              {msg.sender === 'user' ? 'You' : activeScenario.npcName}
            </span>
            <div style={{ 
              maxWidth: '70%', padding: '12px 18px', lineHeight: '1.5', fontSize: '1.05rem',
              backgroundColor: msg.sender === 'user' ? '#3b82f6' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#334155',
              borderRadius: msg.sender === 'user' ? '18px 18px 0px 18px' : '18px 18px 18px 0px',
              border: msg.sender === 'npc' ? '1px solid #e2e8f0' : 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 18px', borderRadius: '18px 18px 18px 0px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
              Typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* CHAT OPTIONS (USER INPUT) */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderTop: '1px solid #cbd5e1' }}>
        {activeNodeData && !isTyping ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>CHOOSE YOUR RESPONSE:</p>
            {activeNodeData.options.map((option, idx) => (
              <button 
                key={idx} 
                onClick={() => handleChoice(option)}
                style={{ 
                  textAlign: 'left', padding: '12px 20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', 
                  borderRadius: '6px', fontSize: '1rem', color: '#334155', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                {option.text}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
            {isTyping ? 'Waiting for response...' : 'Conversation ended.'}
          </div>
        )}
      </div>

    </div>
  );
}