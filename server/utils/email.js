const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationCode(email, code, userName) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'FoundrGeeks <noreply@foundrgeeks.com>',
      to: email,
      subject: 'Verify Your Email - FoundrGeeks',
      html: this.getVerificationTemplate(code, userName)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification code sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  getVerificationTemplate(code, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { font-size: 32px; font-weight: bold; color: #0d9488; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FoundrGeeks</h1>
            <p>Are you READY to build?</p>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for registering with FoundrGeeks! Use the following verification code to complete your registration:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account with FoundrGeeks, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 FoundrGeeks. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }


  async sendMatchNotification(creatorEmail, projectTitle, matches) {
  const subject = `Top Matches for Your Project: ${projectTitle}`;
  const html = this.getMatchTemplate(projectTitle, matches);

  const mailOptions = {
    from: process.env.SMTP_FROM || 'FoundrGeeks <noreply@foundrgeeks.com>',
    to: creatorEmail,
    subject,
    html
  };

  try {
    await this.transporter.sendMail(mailOptions);
    console.log(`Match notification sent to ${creatorEmail}`);
    return true;
  } catch (error) {
    console.error('Match email failed:', error);
    return false;
  }
}

getMatchTemplate(projectTitle, matches) {
  let matchesHtml = '';
  matches.forEach(match => {
    matchesHtml += `
      <div style="background: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 5px; color: #0d9488;">${match.userName} for ${match.role}</h3>
        <p style="margin: 0; font-size: 14px;">Score: ${match.score}/10</p>
        <p style="margin: 5px 0; font-size: 14px;">Why: ${match.explanation}</p>
        <a href="${process.env.APP_URL}/profile/${match.userId}" style="color: #0d9488; text-decoration: none;">View Profile</a>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FoundrGeeks</h1>
          <p>Student Innovation Platform</p>
        </div>
        <div class="content">
          <h2>Top Matches for ${projectTitle}</h2>
          <p>We found potential collaborators based on your project's needs. Review and reach out!</p>
          ${matchesHtml}
          <p>If none fit, edit your project for better matches.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 FoundrGeeks. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

}

module.exports = new EmailService();