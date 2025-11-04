const fs = require('fs');
const path = require('path');
exports.handler = async (event) => {
  const { title } = JSON.parse(event.body);
  const file = path.join(__dirname, '..', '..', 'products.json');
  let products = JSON.parse(fs.readFileSync(file));
  products = products.filter(p => p.title !== title);
  fs.writeFileSync(file, JSON.stringify(products, null, 2));
  return { statusCode: 200 };
};