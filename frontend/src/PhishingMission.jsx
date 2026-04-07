import { useState, useEffect, useCallback, useRef } from 'react';

// --- HIGH-REALISM PROCEDURAL SCENARIOS ---

const safeSenders = [
  { 
    name: "IT Support", email: "support@internal-corp.com", subject: "Scheduled VPN Maintenance", 
    body: [
      { id: 's1', text: "Team,\n\n", isFlag: false },
      { id: 's2', text: "Our primary VPN servers will undergo routine maintenance tonight from 1 AM to 3 AM EST. ", isFlag: false },
      { id: 's3', text: "If you are working a late shift, your connection may drop briefly. The system will automatically reconnect you once the patch is applied.\n\n", isFlag: false },
      { id: 's4', text: "No action is required on your part.\n\nThanks,\nIT Infrastructure Team", isFlag: false }
    ] 
  },
  { 
    name: "GitHub", email: "noreply@github.com", subject: "[internal-corp/frontend] New Pull Request #402", 
    body: [
      { id: 's1', text: "User j.smith has requested your review on Pull Request #402.\n\n", isFlag: false },
      { id: 's2', text: "Title: Fix dashboard rendering bug on mobile view.\n\n", isFlag: false },
      { id: 's3', text: "Please review the changes and approve or request modifications when you have a moment. ", isFlag: false },
      { id: 's4', text: "You can view the diff here: https://github.com/internal-corp/frontend/pull/402", isFlag: false }
    ] 
  },
  { 
    name: "Jessica (Creative Agency)", email: "j.miller@creative-design-studio.com", subject: "Final Assets for Q4 Campaign", 
    hasAttachment: true, attachmentName: "Q4_Campaign_Assets_Final.zip", attachmentFlag: false,
    body: [
      { id: 's1', text: "Hi team,\n\n", isFlag: false },
      { id: 's2', text: "I have attached the final high-res image assets for the upcoming Q4 marketing campaign. ", isFlag: false },
      { id: 's3', text: "Let me know if you need these exported in any other formats before our contract closes next week.\n\n", isFlag: false },
      { id: 's4', text: "Best,\nJessica Miller\nArt Director", isFlag: false }
    ] 
  },
  { 
    name: "Slack", email: "notifications@slack.com", subject: "You have 3 unread mentions", 
    body: [
      { id: 's1', text: "Hi there,\n\n", isFlag: false },
      { id: 's2', text: "You have 3 new unread mentions in the #engineering-general channel. ", isFlag: false },
      { id: 's3', text: "Catch up on what you missed while you were offline.\n\n", isFlag: false },
      { id: 's4', text: "Open Slack to reply.", isFlag: false }
    ] 
  },
  { 
    name: "Dunder Mifflin Paper Co.", email: "sales@dunder-mifflin.com", subject: "Invoice for Q3 Office Supplies", 
    hasAttachment: true, attachmentName: "Invoice_99482.pdf", attachmentFlag: false,
    body: [
      { id: 's1', text: "Good afternoon,\n\n", isFlag: false },
      { id: 's2', text: "Attached is the invoice for last week's delivery of printer paper and office supplies. ", isFlag: false },
      { id: 's3', text: "Payment is due within Net-30 days as per our standard vendor agreement.\n\n", isFlag: false },
      { id: 's4', text: "Thank you for your continued business!", isFlag: false }
    ] 
  },
  { 
    name: "HR Portal", email: "benefits@internal-corp.com", subject: "Annual Open Enrollment Begins", 
    body: [
      { id: 's1', text: "Hello everyone,\n\n", isFlag: false },
      { id: 's2', text: "Just a reminder that Open Enrollment for health and dental benefits begins next Monday. ", isFlag: false },
      { id: 's3', text: "Please log into the standard Workday portal to review the new plan options for next year.\n\n", isFlag: false },
      { id: 's4', text: "Let us know if you have any questions!\n- HR Team", isFlag: false }
    ] 
  }
];

const spoofSenders = [
  { 
    name: "GitHub Security", email: "admin@githuh.com", 
    feedback: "Typo in the domain name (githuh.com instead of github.com). A classic typo-squatting attack.",
    subject: "URGENT: Unauthorized Access Detected", expectedFlags: 3,
    content: [
      { id: 'c1', text: "Dear Developer,\n\n", isFlag: false },
      { id: 'c2', text: "We detected an unauthorized login to your repository from an unknown IP address. ", isFlag: false },
      { id: 'c3', text: "If you do not secure your account within 1 hour, your repository access will be suspended.\n\n", isFlag: true, feedback: "Artificial urgency designed to make you panic and click." },
      { id: 'c4', text: "Secure your account here:\n\n", isFlag: false },
      { id: 'c5', text: `🔗 https://github-security-auth.net/login\n\n`, isFlag: true, feedback: "Fake URL. Real GitHub security links go to github.com." }
    ]
  },
  { 
    name: "CEO Office", email: "executive.director.ceo@gmail.com", 
    feedback: "Executives do not conduct highly sensitive corporate business using public Gmail accounts.",
    subject: "Quick Favor Needed", expectedFlags: 3,
    content: [
      { id: 'c1', text: "Are you at your desk right now?\n\n", isFlag: false },
      { id: 'c2', text: "I am in a meeting with clients and need you to purchase five $100 Apple gift cards immediately to use as client gifts.\n\n", isFlag: true, feedback: "Highly unusual request. Gift cards are essentially untraceable cash." },
      { id: 'c3', text: "Do not tell anyone else in the office, this is a surprise. I need you to scratch off the backs and email me the codes.\n\n", isFlag: true, feedback: "Attempting to isolate the victim and bypass standard purchasing protocols." },
      { id: 'c4', text: "Let me know when you have the codes.", isFlag: false }
    ]
  },
  { 
    name: "HR Department", email: "hr@internal-corp-benefits.net", 
    feedback: "Spoofed internal domain. Attackers often add words like '-benefits' or '-portal' to make fake domains look real.",
    subject: "CONFIDENTIAL: Immediate Disciplinary Action", expectedFlags: 3, 
    hasAttachment: true, attachmentName: "Disciplinary_Report.pdf.exe", attachmentFlag: true, attachmentFeedback: "Double extension trick! It looks like a .pdf, but the real extension is .exe (an executable virus).",
    content: [
      { id: 'c1', text: "We have received multiple complaints regarding your recent workplace behavior.\n\n", isFlag: false },
      { id: 'c2', text: "You must review the attached formal complaint and sign the acknowledgment form by the end of the day, or your employment will be suspended.\n\n", isFlag: true, feedback: "High emotional manipulation (fear of firing) designed to make you click without thinking." },
      { id: 'c3', text: "Please download the attachment to review the claims.\n\n", isFlag: false },
      { id: 'c4', text: "Human Resources", isFlag: false }
    ]
  },
  { 
    name: "Slack Support", email: "update@slack-notifications-portal.com", 
    feedback: "Fake SaaS domain. Real Slack emails come from @slack.com.",
    subject: "Your Workspace is Expiring", expectedFlags: 2,
    content: [
      { id: 'c1', text: "Your team's Slack workspace subscription has failed to renew.\n\n", isFlag: false },
      { id: 'c2', text: "To prevent all channels and message history from being deleted permanently, please update your billing information immediately:\n\n", isFlag: false },
      { id: 'c3', text: "🔗 Update Billing Profile Here\n\n", isFlag: true, feedback: "Billing issues are handled by admins, not blasted to regular users via external links." },
      { id: 'c4', text: "Slack Billing Team", isFlag: false }
    ]
  },
  { 
    name: "Accounts Payable", email: "billing@vend0r-services.com", 
    feedback: "Suspicious vendor domain using a zero instead of an 'o' (vend0r).",
    subject: "OVERDUE: Invoice #884920", expectedFlags: 2, 
    hasAttachment: true, attachmentName: "Overdue_Invoice_884920.zip", attachmentFlag: true, attachmentFeedback: "Invoices should be PDFs. A .zip file from an unknown vendor is highly likely to contain ransomware.",
    content: [
      { id: 'c1', text: "Good morning,\n\n", isFlag: false },
      { id: 'c2', text: "Our records indicate that your company's payment for Invoice #884920 is now 30 days overdue. ", isFlag: false },
      { id: 'c3', text: "If payment is not remitted immediately, we will be forced to send this account to collections and involve legal counsel.\n\n", isFlag: true, feedback: "Aggressive threats of legal action are a classic social engineering tactic." },
      { id: 'c4', text: "Please review the attached invoice archive to verify the balance.", isFlag: false }
    ]
  },
  { 
    name: "IT Helpdesk", email: "support@1nternal-corp.com", 
    feedback: "Look closely at the email address: The hacker used a '1' instead of an 'i' in the domain name (1nternal-corp.com).",
    subject: "Required: Mandatory Security Update", expectedFlags: 3,
    content: [
      { id: 'c1', text: "Dear Employee,\n\n", isFlag: true, feedback: "Generic greeting. Internal IT knows your actual name." },
      { id: 'c2', text: "A critical security vulnerability has been discovered in your operating system. ", isFlag: false },
      { id: 'c3', text: "You must click the link below to install the patch, otherwise you will be disconnected from the company network.\n\n", isFlag: false },
      { id: 'c4', text: `🔗 http://bit.ly/corp-patch-v2\n\n`, isFlag: true, feedback: "IT departments push patches through internal software centers, they do not ask users to download patches via shortened bit.ly links." }
    ]
  }
];

export default function PhishingMission({ onUpdateScore }) {
  const [activeEmail, setActiveEmail] = useState(null);
  const [gameState, setGameState] = useState('playing'); 
  const [foundFlags, setFoundFlags] = useState([]); 
  const [lastDecision, setLastDecision] = useState(null); 
  const [totalScore, setTotalScore] = useState(0);
  const [emailsProcessed, setEmailsProcessed] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(100); 
  const timerRef = useRef(null);
  const streakRef = useRef({ isPhishing: null, count: 0 });

  const generateNewEmail = useCallback(() => {
    let nextIsPhishing;
    if (streakRef.current.count >= 2) {
      nextIsPhishing = !streakRef.current.isPhishing; 
      streakRef.current = { isPhishing: nextIsPhishing, count: 1 };
    } else {
      nextIsPhishing = Math.random() > 0.5; 
      if (streakRef.current.isPhishing === nextIsPhishing) {
        streakRef.current.count += 1;
      } else {
        streakRef.current = { isPhishing: nextIsPhishing, count: 1 };
      }
    }

    let generatedEmail = { isPhishing: nextIsPhishing };

    if (nextIsPhishing) {
      const sender = spoofSenders[Math.floor(Math.random() * spoofSenders.length)];
      generatedEmail.senderName = sender.name;
      generatedEmail.senderEmail = sender.email;
      generatedEmail.senderFlag = true;
      generatedEmail.feedback = sender.feedback;
      generatedEmail.subject = sender.subject;
      generatedEmail.content = sender.content;
      generatedEmail.hasAttachment = sender.hasAttachment || false;
      generatedEmail.attachmentName = sender.attachmentName || '';
      generatedEmail.attachmentFlag = sender.attachmentFlag || false;
      generatedEmail.attachmentFeedback = sender.attachmentFeedback || '';
      generatedEmail.expectedFlags = sender.expectedFlags;
    } else {
      const sender = safeSenders[Math.floor(Math.random() * safeSenders.length)];
      generatedEmail.senderName = sender.name;
      generatedEmail.senderEmail = sender.email;
      generatedEmail.senderFlag = false;
      generatedEmail.subject = sender.subject;
      generatedEmail.content = sender.body;
      generatedEmail.hasAttachment = sender.hasAttachment || false;
      generatedEmail.attachmentName = sender.attachmentName || '';
      generatedEmail.attachmentFlag = false;
      generatedEmail.expectedFlags = 0;
    }
    
    setActiveEmail(generatedEmail);
    setFoundFlags([]);
    setLastDecision(null);
    setGameState('playing');
    setTimeLeft(100); 
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 150); 
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing' && activeEmail) {
      clearInterval(timerRef.current);
      setGameState('analyzing');
      setLastDecision('timeout');
      
      setTimeout(() => {
        if (activeEmail.isPhishing) {
          setGameState('hacked');
        } else {
          setTotalScore(prev => prev - 50);
          setEmailsProcessed(prev => prev + 1);
          generateNewEmail();
        }
      }, 1000);
    }
  }, [timeLeft, gameState, activeEmail, generateNewEmail]);

  useEffect(() => { generateNewEmail(); }, [generateNewEmail]);
  useEffect(() => { if (onUpdateScore) onUpdateScore(totalScore); }, [totalScore, onUpdateScore]);

  const toggleFlag = (id) => {
    if (gameState !== 'playing') return;
    setFoundFlags(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleDecision = (decision) => {
    clearInterval(timerRef.current); 
    setLastDecision(decision);
    setGameState('analyzing');

    setTimeout(() => {
      const timeBonus = Math.floor(timeLeft / 2);

      if (decision === 'phishing' && activeEmail.isPhishing) {
        // SCORING FIX: Explicitly check if they found the attachment flag if one exists
        const correctFlags = foundFlags.filter(id => 
          (id === 'sender' && activeEmail.senderFlag) || 
          (id === 'attachment' && activeEmail.attachmentFlag) || 
          activeEmail.content.find(c => c.id === id && c.isFlag)
        ).length;
        
        const accuracy = correctFlags / activeEmail.expectedFlags;
        setTotalScore(prev => prev + 100 + Math.floor(accuracy * 100) + timeBonus);
        setEmailsProcessed(prev => prev + 1);
        setGameState('feedback');

      } else if (decision === 'safe' && !activeEmail.isPhishing) {
        setTotalScore(prev => prev + 50 + timeBonus);
        setEmailsProcessed(prev => prev + 1);
        setGameState('feedback');

      } else if (decision === 'safe' && activeEmail.isPhishing) {
        setGameState('hacked'); 

      } else if (decision === 'phishing' && !activeEmail.isPhishing) {
        setTotalScore(prev => prev - 25);
        setEmailsProcessed(prev => prev + 1);
        setGameState('feedback'); 
      }
    }, 1500);
  };

  if (!activeEmail) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Initializing Secure Sandbox...</div>;

  // --- RENDERING VARIOUS STATES ---
  if (gameState === 'analyzing') {
    return (
      <div className="mission-container" style={{ backgroundColor: '#020617', padding: '40px', border: '1px solid #1e293b', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ color: '#3b82f6', fontFamily: 'monospace' }}>&gt; RUNNING HEURISTIC SCAN...</h2>
        <div style={{ width: '100%', backgroundColor: '#1e293b', height: '4px', marginTop: '40px', overflow: 'hidden' }}>
           <div style={{ width: '50%', backgroundColor: '#3b82f6', height: '100%', animation: 'slideRight 1s infinite linear' }}></div>
        </div>
      </div>
    );
  }

  if (gameState === 'hacked') {
    return (
      <div className="mission-container" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid #ef4444', padding: '40px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '36px', textAlign: 'center', color: '#ef4444', letterSpacing: '2px', textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>NETWORK COMPROMISED</h1>
        <div style={{ backgroundColor: '#020617', padding: '25px', borderRadius: '6px', border: '1px solid #7f1d1d', marginTop: '20px' }}>
          <h2 style={{ color: '#fca5a5', marginTop: 0 }}>Payload Executed.</h2>
          <p style={{ color: '#f87171' }}>A malicious payload bypassed your filters because you marked a phishing email as safe. You cleared {emailsProcessed} emails before terminal failure.</p>
          <h2 style={{ color: '#fff', borderTop: '1px solid #333', paddingTop: '15px' }}>Final Score: {totalScore}</h2>
          <button onClick={() => { setTotalScore(0); setEmailsProcessed(0); streakRef.current = {isPhishing: null, count: 0}; generateNewEmail(); }} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '15px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', width: '100%' }}>
            Reboot Sandbox
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'feedback') {
    if (!activeEmail.isPhishing && lastDecision === 'safe') {
      return (
        <div className="mission-container" style={{ backgroundColor: '#0f172a', border: `1px solid #10b981`, padding: '40px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '24px', textAlign: 'center', color: '#10b981', letterSpacing: '1px', marginTop: 0 }}>✓ CORRECT: LEGITIMATE EMAIL</h1>
          <div style={{ backgroundColor: '#020617', padding: '25px', borderRadius: '6px', border: '1px solid #1e293b', marginTop: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>You correctly allowed a safe email to pass through. Maintaining the flow of legitimate business communications is just as important as blocking threats!</p>
            <button onClick={generateNewEmail} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', width: '100%' }}>
              PROCEED TO NEXT EMAIL
            </button>
          </div>
        </div>
      );
    } 
    
    if (!activeEmail.isPhishing && lastDecision === 'phishing') {
      return (
        <div className="mission-container" style={{ backgroundColor: '#0f172a', border: `1px solid #f59e0b`, padding: '40px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '24px', textAlign: 'center', color: '#f59e0b', letterSpacing: '1px', marginTop: 0 }}>⚠️ FALSE ALARM</h1>
          <div style={{ backgroundColor: '#020617', padding: '25px', borderRadius: '6px', border: '1px solid #1e293b', marginTop: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>You reported a completely legitimate email. While being cautious is good, false alarms slow down IT security and disrupt company operations. (-25 Points)</p>
            <button onClick={generateNewEmail} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', width: '100%' }}>
              PROCEED TO NEXT EMAIL
            </button>
          </div>
        </div>
      );
    }

    const isPerfect = foundFlags.length === activeEmail.expectedFlags;
    return (
      <div className="mission-container" style={{ backgroundColor: '#0f172a', border: `1px solid ${isPerfect ? '#10b981' : '#f59e0b'}`, padding: '40px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', color: isPerfect ? '#10b981' : '#f59e0b', letterSpacing: '1px', marginTop: 0 }}>
          {isPerfect ? '✓ THREAT NEUTRALIZED PERFECTLY' : '⚠️ THREAT BLOCKED - REVIEW REQUIRED'}
        </h1>
        <div style={{ backgroundColor: '#020617', padding: '25px', borderRadius: '6px', border: '1px solid #1e293b', marginTop: '20px' }}>
          <ul style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '1rem', listStyleType: 'none', paddingLeft: 0 }}>
            {/* Sender Feedback */}
            {activeEmail.senderFlag && (
              <li style={{ marginBottom: '15px', padding: '10px', backgroundColor: foundFlags.includes('sender') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `4px solid ${foundFlags.includes('sender') ? '#10b981' : '#ef4444'}` }}>
                {foundFlags.includes('sender') ? '✅ Found: ' : '❌ Missed: '} <strong style={{ color: '#f1f5f9' }}>Sender Address.</strong> {activeEmail.feedback}
              </li>
            )}
            
            {/* Content Feedback */}
            {activeEmail.content.filter(c => c.isFlag).map((flag) => (
              <li key={flag.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: foundFlags.includes(flag.id) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `4px solid ${foundFlags.includes(flag.id) ? '#10b981' : '#ef4444'}` }}>
                {foundFlags.includes(flag.id) ? '✅ Found: ' : '❌ Missed: '} <strong style={{ color: '#f1f5f9' }}>"{flag.text.trim()}"</strong><br/><span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{flag.feedback}</span>
              </li>
            ))}

            {/* Attachment Feedback */}
            {activeEmail.attachmentFlag && (
               <li style={{ marginBottom: '15px', padding: '10px', backgroundColor: foundFlags.includes('attachment') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `4px solid ${foundFlags.includes('attachment') ? '#10b981' : '#ef4444'}` }}>
                {foundFlags.includes('attachment') ? '✅ Found: ' : '❌ Missed: '} <strong style={{ color: '#f1f5f9' }}>Attachment ({activeEmail.attachmentName}).</strong> {activeEmail.attachmentFeedback}
              </li>
            )}
          </ul>
          <button onClick={generateNewEmail} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', width: '100%' }}>
            PROCEED TO NEXT EMAIL
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN GAME UI ---
  return (
    <div className="mission-container" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '30px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      
      {/* HEADER & SCORE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '15px', alignItems: 'center' }}>
        <h2 style={{ color: '#3b82f6', margin: 0, fontFamily: 'monospace' }}>&gt; INBOX_SCANNER</h2>
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '8px 20px', borderRadius: '4px', color: '#60a5fa', fontWeight: 'bold', border: '1px solid #3b82f6' }}>
          SCORE: {totalScore} | CLEARED: {emailsProcessed}
        </div>
      </div>

      {/* THREAT TIMER BAR */}
      <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', marginTop: '20px', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${timeLeft}%`, backgroundColor: timeLeft > 50 ? '#10b981' : timeLeft > 25 ? '#f59e0b' : '#ef4444', transition: 'width 0.15s linear, background-color 0.3s' }}></div>
      </div>

      {/* EXPLICIT MISSION BRIEFING BANNER */}
      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', padding: '15px', borderRadius: '6px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <div>
          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '4px' }}>TRAINING DIRECTIVE:</strong>
          <span style={{ color: '#fde68a', fontSize: '0.95rem' }}>Review the email carefully. You may click on the sender address, email text, or attachments to flag them as suspicious <strong>BEFORE</strong> making your final decision.</span>
        </div>
      </div>

      {/* REALISTIC WEBMAIL INTERFACE */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', color: '#334155', marginTop: '25px', display: 'flex', height: '480px' }}>
        
        {/* Fake Sidebar */}
        <div style={{ width: '180px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '20px 0' }}>
          <div style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', borderLeft: '4px solid #3b82f6', cursor: 'default' }}>📥 Inbox <span style={{ float: 'right', backgroundColor: '#3b82f6', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '0.7rem' }}>1</span></div>
          <div style={{ padding: '10px 20px', color: '#64748b', cursor: 'not-allowed' }}>📤 Sent</div>
          <div style={{ padding: '10px 20px', color: '#64748b', cursor: 'not-allowed' }}> drafts</div>
          <div style={{ padding: '10px 20px', color: '#64748b', cursor: 'not-allowed' }}>🗑️ Trash</div>
        </div>

        {/* Fake Email Body */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          <h2 style={{ margin: '0 0 25px 0', fontSize: '1.5rem', color: '#0f172a' }}>{activeEmail.subject}</h2>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 }}>
              {activeEmail.senderName ? activeEmail.senderName.charAt(0) : '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a' }}>
                {activeEmail.senderName} 
                <span 
                  onClick={() => toggleFlag('sender')} 
                  style={{ 
                    fontWeight: 'normal', color: '#64748b', fontSize: '0.9rem', marginLeft: '8px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px',
                    backgroundColor: foundFlags.includes('sender') ? 'rgba(239, 68, 68, 0.15)' : 'transparent', 
                    border: foundFlags.includes('sender') ? '1px dashed #ef4444' : '1px dashed transparent', 
                    transition: 'all 0.2s' 
                  }}
                  title="Click to flag sender as suspicious"
                >
                  &lt;{activeEmail.senderEmail}&gt;
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>To: me, cc: team</div>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'right' }}>
              Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              <div style={{ marginTop: '8px', fontSize: '1.2rem', color: '#cbd5e1' }}>⭐ ↩️ ⋮</div>
            </div>
          </div>

          <div style={{ fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#1e293b', flex: 1 }}>
            {activeEmail.content.map((segment) => (
              <span 
                key={segment.id} 
                onClick={() => toggleFlag(segment.id)} 
                style={{ 
                  cursor: 'pointer', borderRadius: '3px', padding: '2px 0', 
                  backgroundColor: foundFlags.includes(segment.id) ? 'rgba(239, 68, 68, 0.2)' : 'transparent', 
                  borderBottom: foundFlags.includes(segment.id) ? '2px solid #ef4444' : '2px solid transparent', 
                  transition: 'all 0.1s' 
                }} 
                title="Click to flag text as suspicious"
              >
                {segment.text}
              </span>
            ))}
          </div>

          {/* FAKE ATTACHMENT UI */}
          {activeEmail.hasAttachment && (
             <div style={{ marginTop: '20px', padding: '10px 15px', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', width: 'fit-content', cursor: 'pointer' }} onClick={() => toggleFlag('attachment')} >
                <span style={{ fontSize: '1.5rem' }}>📎</span>
                <div style={{ 
                  backgroundColor: foundFlags.includes('attachment') ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  padding: '2px 5px', borderRadius: '3px', borderBottom: foundFlags.includes('attachment') ? '2px solid #ef4444' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}>
                   <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>{activeEmail.attachmentName}</div>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>File Scanned by Network</div>
                </div>
             </div>
          )}

          {/* FAKE REPLY BUTTONS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #cbd5e1', background: 'white', cursor: 'not-allowed', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>↩️ Reply</button>
            <button style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #cbd5e1', background: 'white', cursor: 'not-allowed', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>↪️ Forward</button>
          </div>
          
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <button onClick={() => handleDecision('safe')} style={{ flex: 1, backgroundColor: 'transparent', color: '#10b981', border: '2px solid #10b981', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
          ✓ MARK AS SAFE
        </button>
        <button onClick={() => handleDecision('phishing')} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: '2px solid #ef4444', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)' }}>
          🚨 REPORT PHISHING
        </button>
      </div>
    </div>
  );
}