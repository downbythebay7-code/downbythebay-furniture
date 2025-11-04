const twilio = require('twilio');
exports.handler = async (event) => {
  const { message, to } = JSON.parse(event.body);
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_FROM,
    to: to || process.env.SMS_TO
  });
  return { statusCode: 200 };
};