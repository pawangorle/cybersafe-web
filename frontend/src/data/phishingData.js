// frontend/src/data/phishingData.js

export const phishingLevels = [
  {
    id: 1,
    senderName: "IT Helpdesk",
    senderEmail: "admin@it-support-portal-update.com", // Red flag: weird domain
    subject: "URGENT: Password Expiry Notice",
    body: "Your corporate password expires in 2 hours. Please click the link below to keep your current password.",
    isPhishing: true,
    learningPoint: "Always check the sender's email address. 'it-support-portal-update.com' is not a standard corporate domain."
  },
  {
    id: 2,
    senderName: "HR Department",
    senderEmail: "hr@yourcompany.com", // Safe domain (assuming this is the player's company)
    subject: "Updated Holiday Schedule",
    body: "Hi team, please find attached the updated holiday schedule for this year. Let us know if you have questions.",
    isPhishing: false,
    learningPoint: "This email comes from a verified internal domain and doesn't use urgent, threatening language."
  }
];