import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log('Creating MyPA subscription products...');
  
  const existingProducts = await stripe.products.search({ query: "name:'MyPA'" });
  if (existingProducts.data.length > 0) {
    console.log('MyPA products already exist. Skipping...');
    return;
  }
  
  const product = await stripe.products.create({
    name: 'MyPA Premium',
    description: 'Full access to MyPA - Your Personal Assistant with unlimited alarms, medicines, and meetings',
    metadata: {
      app: 'mypa',
      features: 'unlimited_alarms,unlimited_medicines,unlimited_meetings,voice_reminders,sms_notifications'
    }
  });
  console.log('Created product:', product.id);
  
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 4500,
    currency: 'inr',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'monthly',
      display_name: '₹45/month'
    }
  });
  console.log('Created monthly price:', monthlyPrice.id, '- ₹45/month');
  
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 36900,
    currency: 'inr',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'yearly',
      display_name: '₹369/year',
      savings: '31%'
    }
  });
  console.log('Created yearly price:', yearlyPrice.id, '- ₹369/year (31% savings)');
  
  console.log('\n✅ Products created successfully!');
  console.log('Monthly Price ID:', monthlyPrice.id);
  console.log('Yearly Price ID:', yearlyPrice.id);
}

seedProducts().catch(console.error);
