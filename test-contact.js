#!/usr/bin/env node

/**
 * Test script for contact form API
 * Sends a test email to hi@jordancolehunt.com
 */

const testData = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'This is a test message from the contact form API test script. If you receive this, the API is working correctly!'
};

console.log('🧪 Testing contact form API...\n');
console.log('📧 Sending test email to: hi@jordancolehunt.com');
console.log('📝 Test data:', JSON.stringify(testData, null, 2));
console.log('\n⏳ Making request...\n');

try {
  const response = await fetch('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
  });

  const data = await response.json();

  console.log('📬 Response Status:', response.status);
  console.log('📄 Response Body:', JSON.stringify(data, null, 2));

  if (response.ok && data.success) {
    console.log('\n✅ SUCCESS! Email sent successfully!');
    console.log('Check hi@jordancolehunt.com for the test message.');
  } else {
    console.log('\n❌ ERROR:', data.message || 'Unknown error');
    if (response.status === 403) {
      console.log('\n💡 Note: This might be due to Mailgun sandbox restrictions.');
      console.log('   Add test@example.com as an authorized recipient in Mailgun,');
      console.log('   or upgrade to a paid Mailgun account.');
    }
  }
} catch (error) {
  console.error('\n❌ Request failed:', error.message);
  console.log('\n💡 Make sure the server is running with: npm run dev');
}
