const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Notification System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent → ${to}`);
  } catch (error) {
    console.error('Email error:', error.message);
    throw error;
  }
};

const buildEmailTemplate = (title, message, type) => {
  const colors = {
    order: '#4CAF50',
    payment: '#f44336',
    promo: '#FF9800',
    system: '#2196F3'
  };

  const color = colors[type] || '#2196F3';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${color}; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">${title}</h2>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333;">${message}</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
};

module.exports = { sendEmail, buildEmailTemplate };