const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

exports.handler = async () => {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','products.json')));
  const log = JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','sales-log.json')));
  const today = new Date().toLocaleDateString();
  const todaySales = log.filter(s => s.date === today);
  const revenue = todaySales.reduce((s,v)=>s+v.total,0).toFixed(2);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `Daily Report: $${revenue}`,
    html: `<h2>Sales Today: ${todaySales.length}</h2><p>Revenue: $${revenue}</p><p>Inventory: ${products.length} items</p>`
  });
  return { statusCode: 200 };
};