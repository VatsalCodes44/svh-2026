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
    toEmail,       // Custom To email string (optional)
    bccRecipients  // Array of email strings (BCC)
  } = req.body;

  if (!subject || !body || !Array.isArray(bccRecipients) || bccRecipients.length === 0) {
    return res.status(400).json({ message: 'Missing required fields: subject, body, or bccRecipients array.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const primaryTo = toEmail && toEmail.trim() 
      ? toEmail.trim() 
      : `"Blockchain Club, VIT Bhopal" <blockchainvitb@gmail.com>`;

    // Setup basic mail options
    const mailOptions = {
      from: `"Blockchain Club, VIT Bhopal" <blockchainvitb@gmail.com>`,
      to: primaryTo,
      bcc: bccRecipients.join(', '),
      subject: subject,
    };

    // Set body as HTML or Text based on isHtml flag
    if (isHtml) {
      mailOptions.html = body;
    } else {
      mailOptions.text = body;
    }

    console.log(`[Bulk Email Dispatch] To: ${mailOptions.to}, BCC Count: ${bccRecipients.length}, Subject: "${subject}"`);

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: `Successfully sent email to ${bccRecipients.length} recipients.` });
  } catch (error) {
    console.error('Nodemailer Bulk Send Error:', error);
    return res.status(500).json({ message: 'Failed to send bulk email.', error: error.message });
  }
}
