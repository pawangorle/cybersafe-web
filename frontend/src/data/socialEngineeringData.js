export const socialEngineeringLevels = [
  {
    id: 1,
    scenario: "Incoming Phone Call - Unknown Number",
    dialogue: '"Hello, this is Microsoft Tech Support. We detected a severe virus on your IP address. Please go to www.remote-fix.com so I can take control of your screen and remove it."',
    isAttack: true,
    learningPoint: "Tech companies will never cold-call you out of the blue to fix your computer. This is a classic remote-access tech support scam."
  },
  {
    id: 2,
    scenario: "Slack Message from 'CEO'",
    dialogue: '"Hey, I am in a meeting and my corporate card was declined. I need you to go buy five $100 Apple gift cards right now for a client. Send me the codes. - John"',
    isAttack: true,
    learningPoint: "Urgency, unusual requests (gift cards), and bypassing normal procedures are massive red flags for CEO Fraud / Business Email Compromise."
  }
];