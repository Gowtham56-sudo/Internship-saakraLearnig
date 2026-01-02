// Test the actual API endpoint
const fetch = require('node-fetch');

async function testEndpoint() {
  const courseId = 'NP5gbYhYXTdhwk28DFGH'; // JAVA TEST course
  
  try {
    console.log(`\nTesting: http://localhost:5000/api/courses/public/${courseId}\n`);
    
    const response = await fetch(`http://localhost:5000/api/courses/public/${courseId}`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('\nResponse data:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n\nModules check:');
    console.log('Has modules:', !!data.modules);
    console.log('Is array:', Array.isArray(data.modules));
    console.log('Count:', data.modules?.length || 0);
    
    if (data.modules && data.modules.length > 0) {
      console.log('\n✅ Modules are being returned correctly!');
    } else {
      console.log('\n❌ No modules in response!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoint();
