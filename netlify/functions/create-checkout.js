const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { items, total, pickup, phone, success_url, cancel_url } = JSON.parse(event.body);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(i => ({
      price_data: {
        currency: 'usd',
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: 1,
    })),
    mode: 'payment',
    success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url,
    metadata: {
      items: JSON.stringify(items),
      total,
      pickup: pickup,
      phone
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ id: session.id })
  };
};