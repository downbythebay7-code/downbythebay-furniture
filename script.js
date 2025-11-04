// Mobile menu
document.querySelector('.menu-toggle').onclick = () => document.querySelector('.nav').classList.toggle('active');

// Elements
const categorySelect = document.getElementById('category-select');
const searchInput = document.getElementById('search-input');
const loginBtn = document.getElementById('employee-login-btn');
const employeePanel = document.getElementById('employee-panel');
const closePanelBtn = document.getElementById('close-panel-btn');
const uploadEmployee = document.getElementById('json-upload-employee');
const downloadBtn = document.getElementById('download-inventory-btn');
const pickupRadio = document.getElementById('pickup-radio');
const deliveryRadio = document.getElementById('delivery-radio');
const addressForm = document.getElementById('address-form');
const addrStreet = document.getElementById('addr-street');
const addrCity = document.getElementById('addr-city');
const addrState = document.getElementById('addr-state');
const addrZip = document.getElementById('addr-zip');
const customerPhone = document.getElementById('customer-phone');
const checkoutBtn = document.getElementById('checkout-btn');

// Cart
let cart = [];
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');

// Floating Cart
const floatingCart = document.getElementById('floating-cart');
const cartCountBadge = document.getElementById('floating-cart-count');
const cartPanel = document.getElementById('cart-panel');
const panelCount = document.getElementById('panel-cart-count');
const panelTotal = document.getElementById('panel-cart-total');
const cartItemsList = document.getElementById('cart-items-list');
const closePanel = document.getElementById('close-cart-panel');
const goToCheckout = document.getElementById('go-to-checkout');

// Google Maps
let directionsService;
function initMap() {
  directionsService = new google.maps.DirectionsService();
}

// Update Cart
function updateCart() {
  const items = cart.length;
  const base = cart.reduce((s,i)=>s+i.price,0);
  let fee = 0;
  if (deliveryRadio.checked) {
    const feeEl = document.getElementById('delivery-fee');
    fee = parseFloat(feeEl.textContent.replace('$','').split(' ')[0]) || 0;
  }
  const total = base + fee;
  cartItemsEl.textContent = items;
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  checkoutBtn.disabled = items === 0;
  updateFloatingCart();
}

// Floating Cart UI
function updateFloatingCart() {
  const items = cart.length;
  const total = cart.reduce((s,i)=>s+i.price,0) + (deliveryRadio.checked ? parseFloat(document.getElementById('delivery-fee').textContent.replace('$','').split(' ')[0]) || 0 : 0);
  cartCountBadge.textContent = items;
  panelCount.textContent = items;
  panelTotal.textContent = `$${total.toFixed(2)}`;
  floatingCart.classList.toggle('show', items > 0);
  cartItemsList.innerHTML = '';
  cart.forEach(i => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<span>${i.name}</span><span>$${i.price.toFixed(2)}</span>`;
    cartItemsList.appendChild(div);
  });
}
floatingCart.onclick = () => cartPanel.classList.toggle('show');
closePanel.onclick = () => cartPanel.classList.remove('show');
goToCheckout.onclick = () => {
  cartPanel.classList.remove('show');
  document.querySelector('.cart-summary').scrollIntoView({behavior:'smooth'});
};

// Delivery Fee: 10 miles free, $2/mile after
deliveryRadio.addEventListener('change', () => {
  addressForm.style.display = 'block';
  calculateDistance();
});
[pickupRadio, deliveryRadio].forEach(r => r.addEventListener('change', updateCart));
[addrStreet, addrCity, addrState, addrZip].forEach(f => f.addEventListener('blur', calculateDistance));

function calculateDistance() {
  if (!deliveryRadio.checked || !directionsService) return;

  const origin = new google.maps.LatLng(29.5978, -95.0241);
  const dest = `${addrStreet.value}, ${addrCity.value}, ${addrState.value} ${addrZip.value}`;

  directionsService.route({
    origin,
    destination: dest,
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.IMPERIAL
  }, (res, status) => {
    if (status === 'OK') {
      const miles = res.routes[0].legs[0].distance.value / 1609.34;
      const freeMiles = 10;
      const surchargePerMile = 2;
      const extraMiles = Math.max(0, miles - freeMiles);
      const fee = extraMiles * surchargePerMile;

      document.getElementById('delivery-fee').textContent = `$${fee.toFixed(2)} (${miles.toFixed(1)} mi)`;
      updateCart();
    } else {
      document.getElementById('delivery-fee').textContent = 'Error';
    }
  });
}

// Employee Login
loginBtn.onclick = () => {
  const pwd = prompt('Employee Password:');
  if (pwd === 'TheBay832') employeePanel.style.display = 'block';
};
closePanelBtn.onclick = () => employeePanel.style.display = 'none';

// Scroll to show login
const footer = document.querySelector('footer');
window.addEventListener('scroll', () => {
  const rect = footer.getBoundingClientRect();
  const h = window.innerHeight;
  loginBtn.style.display = (rect.top <= h && rect.bottom >= 0) ? 'flex' : 'none';
});
window.dispatchEvent(new Event('scroll'));

// Load products
let allProducts = [];
fetch('products.json').then(r=>r.json()).then(data => {
  allProducts = data;
  renderProducts();
  populateCategories();
});

// Render
function renderProducts() {
  let filtered = allProducts;
  if (categorySelect.value !== 'all') filtered = filtered.filter(p => p.category === categorySelect.value);
  if (searchInput.value) {
    const q = searchInput.value.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
  }
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <a href="/product/${encodeURIComponent(p.title.replace(/\s+/g,'-'))}" style="text-decoration:none;color:inherit;">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Furniture'">
        <h3>${p.title}</h3>
      </a>
      <p class="price">$${p.price}</p>
      <button class="btn-secondary add-to-cart" data-name="${p.title}" data-price="${p.price}">Add to Cart</button>
    `;
    grid.appendChild(card);
  });
  document.querySelectorAll('.add-to-cart').forEach(b => {
    b.onclick = () => {
      cart.push({name: b.dataset.name, price: parseFloat(b.dataset.price)});
      updateCart();
    };
  });
}

function populateCategories() {
  const cats = [...new Set(allProducts.map(p=>p.category))].sort();
  categorySelect.innerHTML = '<option value="all">All</option>';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    categorySelect.appendChild(opt);
  });
}

categorySelect.onchange = renderProducts;
searchInput.oninput = renderProducts;

// Checkout with Stripe
checkoutBtn.onclick = async () => {
  if (!customerPhone.value) return alert('Enter phone for SMS receipt');
  if (deliveryRadio.checked) {
    const req = [addrStreet, addrCity, addrState, addrZip];
    for (let f of req) if (!f.value) return alert('Fill address');
  }

  const total = cart.reduce((s,i)=>s+i.price,0) + (deliveryRadio.checked ? parseFloat(document.getElementById('delivery-fee').textContent.replace('$','').split(' ')[0]) || 0 : 0);

  const response = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      items: cart,
      total,
      pickup: pickupRadio.checked,
      phone: customerPhone.value,
      success_url: window.location.origin + '/success.html',
      cancel_url: window.location.origin + '/cancel.html'
    })
  });
  const { id } = await response.json();
  const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
  stripe.redirectToCheckout({ sessionId: id });
};

// Year
document.getElementById('year').textContent = new Date().getFullYear();