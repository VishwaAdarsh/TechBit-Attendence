const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- TESTING IT HEAD SIGNUP ENDPOINT ---');

  try {
    // Test A: Signup with wrong Access Code
    console.log('\n[TEST A] Attempting IT Head Registration with WRONG Access Code...');
    const resWrong = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unauthorised Head',
        member_id: 'TB7-HEAD-99',
        email: 'unauthorisedhead@techbit.com',
        password: 'Password123!',
        class_year: 'Senior (Year 4)',
        committee_role: 'Event Head',
        role: 'ADMIN',
        accessCode: 'INCORRECT_CODE'
      })
    });
    const dataWrong = await resWrong.json();
    console.log('Response Status:', resWrong.status);
    console.log('Response Error:', dataWrong.error);
    if (resWrong.status === 401 && dataWrong.error.includes('Invalid Head Access Code')) {
      console.log('PASS: Registration rejected successfully due to wrong Head Access Code.');
    } else {
      console.log('FAIL: Registration was not rejected with 401.');
    }

    // Test B: Signup with correct Access Code
    console.log('\n[TEST B] Attempting IT Head Registration with CORRECT Access Code...');
    const resCorrect = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'IT Head Gamma',
        member_id: 'TB7-HEAD-03',
        email: 'gamma@techbit.com',
        password: 'AdminPassword70',
        class_year: 'Senior (Year 4)',
        committee_role: 'Event Head',
        role: 'ADMIN',
        accessCode: 'TECHBIT_HEAD_70'
      })
    });
    const dataCorrect = await resCorrect.json();
    console.log('Response Status:', resCorrect.status);
    console.log('Response User:', dataCorrect.user);
    if (resCorrect.status === 201 && dataCorrect.user.role === 'ADMIN') {
      console.log('PASS: IT Head Gamma registered successfully as ADMIN.');
    } else {
      console.log('FAIL: Admin registration failed.');
    }

  } catch (err) {
    console.error('Test script error:', err);
  }
}

runTests();
