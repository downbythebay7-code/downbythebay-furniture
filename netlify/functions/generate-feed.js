const fs = require('fs');
const path = require('path');
exports.handler = async () => {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','products.json'),'utf8'));
  let xml = `<?xml version="1.0"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel><title>Down By the Bay</title><link>https://voluble-pie-48dbed.netlify.app</link><description>Furniture</description>`;
  products.forEach(p => {
    const id = p.title.replace(/\s+/g,'-').toLowerCase();
    xml += `<item><g:id>${id}</g:id><g:title>${p.title}</g:title><g:price>${p.price} USD</g:price><g:link>https://voluble-pie-48dbed.netlify.app/product/${encodeURIComponent(p.title.replace(/\s+/g,'-'))}</g:link><g:image_link>https://voluble-pie-48dbed.netlify.app/${p.image}</g:image_link><g:availability>in stock</g:availability><g:condition>used</g:condition></item>`;
  });
  xml += `</channel></rss>`;
  return { statusCode: 200, headers: {'Content-Type':'application/rss+xml'}, body: xml };
};