const nodemailer = require('nodemailer');
exports.handler = async (event) => {
  const { items, total, pickup, address } = JSON.parse(event.body);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `New Sale: $${total}`,
    html: `<p>Sale: $${total}</p><ul>${items.map(i=>`<li>${i.name} - $${i.price}</li>`).join('')}</ul>`
  });
  return { statusCode: 200 };
};