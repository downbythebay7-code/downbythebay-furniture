const fs = require('fs');
const path = require('path');
exports.handler = async (event) => {
  const sale = JSON.parse(event.body);
  const file = path.join(__dirname, '..', '..', 'sales-log.json');
  const log = JSON.parse(fs.readFileSync(file));
  log.push(sale);
  fs.writeFileSync(file, JSON.stringify(log, null, 2));
  return { statusCode: 200 };
};