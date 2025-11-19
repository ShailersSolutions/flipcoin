// utils/sendWinEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password
  },
});

async function sendWinEmail(email, amount, side) {
  const mailOptions = {
    from: `FlipBet <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 You Won the Coin Flip!",
    html: `
      <h2>Congratulations!</h2>
      <p>You guessed <strong>${side}</strong> and won ₹${amount * 2}!</p>
      <p>It has been credited to your wallet. 🎉</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (err) {
    console.error("Email error:", err);
  }
}

module.exports = sendWinEmail;
