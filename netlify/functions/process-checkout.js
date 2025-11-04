const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const { session_id } = JSON.parse(event.body);
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return { statusCode: 200 };

    const metadata = session.metadata;
    const items = JSON.parse(metadata.items);
    const total = parseFloat(metadata.total);
    const pickup = metadata.pickup === 'true';
    const customerPhone = metadata.phone;

    const logFile = path.join(__dirname, '..', '..', 'sales-log.json');
    const log = JSON.parse(fs.readFileSync(logFile));
    log.push({ items, total, pickup, date: new Date().toLocaleDateString() });
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));

    const productsFile = path.join(__dirname, '..', '..', 'products.json');
    let products = JSON.parse(fs.readFileSync(productsFile));
    items.forEach(i => {
      products = products.filter(p => p.title !== i.name);
    });
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    const baseUrl = process.env.URL || 'http://localhost:8888';
    await fetch(`${baseUrl}/.netlify/functions/send-sms`, {
      method: 'POST',
      body: JSON.stringify({ message: `NEW SALE: $${total} - ${items.map(i=>i.name).join(', ')}`, to: process.env.SMS_TO })
    });
    await fetch(`${baseUrl}/.netlify/functions/send-sms`, {
      method: 'POST',
      body: JSON.stringify({ message: `Thank you! Order: ${items.map(i=>i.name).join(', ')} Total: $${total}`, to: customerPhone })
    });
    await fetch(`${baseUrl}/.netlify/functions/send-sale-email`, {
      method: 'POST',
      body: JSON.stringify({ items, total, pickup })
    });

    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};