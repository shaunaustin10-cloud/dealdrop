const apiKey = '3496f57808c241d1992ca385c2d72080';
const address = '1634 E Ocean View Ave, Apt 2E';
const city = 'Norfolk';
const state = 'VA';

async function fetchProperty() {
  const url = `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}&city=${city}&state=${state}`;
  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

fetchProperty();
