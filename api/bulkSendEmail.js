import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    subject,
    body,
    isHtml,
    recipients,   // Array of email strings (To)
    ccRecipients  // Array of email strings (CC, optional)
  } = req.body;

  if (!subject || !body || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ message: 'Missing required fields: subject, body, or recipients array.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Setup basic mail options
    const mailOptions = {
      from: `"Blockchain Club, VIT Bhopal" <blockchainvitb@gmail.com>`,
      to: recipients.join(', '), // Send to selected team leaders / participants
      subject: subject,
    };

    // If CC recipients are specified, append them
    if (Array.isArray(ccRecipients) && ccRecipients.length > 0) {
      mailOptions.cc = ccRecipients.join(', ');
    }

    // Set body as HTML or Text based on isHtml flag
    if (isHtml) {
      mailOptions.html = body;
    } else {
      mailOptions.text = body;
    }

    console.log(`[Bulk Email Dispatch] To: ${mailOptions.to}, CC: ${mailOptions.cc || 'None'}, Subject: "${subject}"`);

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: `Successfully sent email to ${recipients.length} recipients.` });
  } catch (error) {
    console.error('Nodemailer Bulk Send Error:', error);
    return res.status(500).json({ message: 'Failed to send bulk email.', error: error.message });
  }
}
