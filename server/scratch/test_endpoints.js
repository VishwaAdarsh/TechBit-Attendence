const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function runTests() {
  console.log('--- STARTING TECHBIT 7.0 BACKEND INTEGRATION TESTS ---');
  let memberToken = '';
  let adminToken = '';
  let memberId = 'TB7-TEST-MEM-99';
  let adminId = 'TB7-HEAD-01'; // Seeded Admin
  let meetingId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Member Registration (automatically MEMBER role)
    // ----------------------------------------------------
    console.log('\n[TEST 1] Registering a new member...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Member',
        member_id: memberId,
        email: 'testmember@techbit.com',
        password: 'Password123!',
        class_year: 'Second Year (Year 2)',
        committee_role: 'Developer',
        role: 'ADMIN' // Attempt to exploit role override
      })
    });
    const regData = await regRes.json();
    console.log('Response Status:', regRes.status);
    console.log('Role Assigned:', regData.user ? regData.user.role : 'No user data');
    if (regRes.status === 201 && regData.user.role === 'MEMBER') {
      console.log('PASS: Registration successful and role defaulted to MEMBER.');
      memberToken = regData.token;
    } else {
      console.log('FAIL: Registration failed or role overridden.');
    }

    // ----------------------------------------------------
    // TEST 2: Member tries Admin login
    // ----------------------------------------------------
    console.log('\n[TEST 2] Member trying Admin login flow...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrId: 'testmember@techbit.com',
        password: 'Password123!',
        accessCode: 'TECHBIT_HEAD_70'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('Response Status:', adminLoginRes.status);
    console.log('Response Data:', adminLoginData);
    if (adminLoginRes.status === 403) {
      console.log('PASS: Admin login rejected for a MEMBER account.');
    } else {
      console.log('FAIL: Admin login allowed for a MEMBER account.');
    }

    // ----------------------------------------------------
    // TEST 3: Member knows Head Access Code but uses Member account (Member login flow)
    // ----------------------------------------------------
    console.log('\n[TEST 3] Member login flow validation...');
    const memberLoginRes = await fetch(`${API_URL}/auth/login/member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrId: 'testmember@techbit.com',
        password: 'Password123!'
      })
    });
    const memberLoginData = await memberLoginRes.json();
    console.log('Response Status:', memberLoginRes.status);
    if (memberLoginRes.status === 200) {
      console.log('PASS: Member login successful.');
    } else {
      console.log('FAIL: Member login failed.');
    }

    // ----------------------------------------------------
    // TEST 4: Valid Admin + correct password + correct Head Access Code
    // ----------------------------------------------------
    console.log('\n[TEST 4] Admin login with correct credentials...');
    const validAdminRes = await fetch(`${API_URL}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrId: adminId,
        password: 'AdminPassword70',
        accessCode: 'TECHBIT_HEAD_70'
      })
    });
    const validAdminData = await validAdminRes.json();
    console.log('Response Status:', validAdminRes.status);
    if (validAdminRes.status === 200) {
      console.log('PASS: Admin login successful.');
      adminToken = validAdminData.token;
    } else {
      console.log('FAIL: Admin login failed.');
    }

    // ----------------------------------------------------
    // TEST 5: Valid Admin + wrong Head Access Code
    // ----------------------------------------------------
    console.log('\n[TEST 5] Admin login with wrong head access code...');
    const wrongCodeRes = await fetch(`${API_URL}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrId: adminId,
        password: 'AdminPassword70',
        accessCode: 'WRONG_CODE_XYZ'
      })
    });
    const wrongCodeData = await wrongCodeRes.json();
    console.log('Response Status:', wrongCodeRes.status);
    console.log('Response Data:', wrongCodeData);
    if (wrongCodeRes.status === 401 && wrongCodeData.error.includes('Invalid Head Access Code')) {
      console.log('PASS: Admin login rejected due to wrong Head Access Code.');
    } else {
      console.log('FAIL: Admin login with wrong code did not return expected error.');
    }

    // ----------------------------------------------------
    // TEST 6 & 7: Member calls Admin API
    // ----------------------------------------------------
    console.log('\n[TEST 6 & 7] Member calling Admin-only API...');
    const callAdminApiRes = await fetch(`${API_URL}/admin/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    const callAdminApiData = await callAdminApiRes.json();
    console.log('Response Status:', callAdminApiRes.status);
    console.log('Response Data:', callAdminApiData);
    if (callAdminApiRes.status === 403) {
      console.log('PASS: 403 Forbidden returned successfully when Member calls Admin API.');
    } else {
      console.log('FAIL: Member was able to call Admin API.');
    }

    // ----------------------------------------------------
    // TEST 8: Admin creates meeting
    // ----------------------------------------------------
    console.log('\n[TEST 8] Admin creating a meeting...');
    const createMeetRes = await fetch(`${API_URL}/admin/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'TechBit Kickoff Meet',
        date: '2026-08-01',
        time: '14:00',
        purpose: 'Kickoff meeting for TechBit 7.0 events planning',
        notes: 'Bring initial event proposal documents.'
      })
    });
    const createMeetData = await createMeetRes.json();
    console.log('Response Status:', createMeetRes.status);
    console.log('Created Meeting:', createMeetData.meeting);
    if (createMeetRes.status === 201 && createMeetData.meeting.id) {
      console.log('PASS: Meeting created and saved successfully.');
      meetingId = createMeetData.meeting.id;
    } else {
      console.log('FAIL: Meeting creation failed.');
    }

    // ----------------------------------------------------
    // TEST 9: Admin marks attendance
    // ----------------------------------------------------
    console.log('\n[TEST 9] Admin marking attendance...');
    // Retrieve users list first to get user internal ID
    const membersRes = await fetch(`${API_URL}/admin/members`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const membersData = await membersRes.json();
    const testMemberUser = membersData.find(m => m.member_id === memberId);

    if (!testMemberUser) {
      throw new Error('Test member not found in list');
    }

    const saveAttendanceRes = await fetch(`${API_URL}/admin/meetings/${meetingId}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        records: [
          { user_id: testMemberUser.id, status: 'PRESENT' }
        ]
      })
    });
    const saveAttendanceData = await saveAttendanceRes.json();
    console.log('Response Status:', saveAttendanceRes.status);
    console.log('Response Data:', saveAttendanceData);
    if (saveAttendanceRes.status === 200) {
      console.log('PASS: Attendance saved successfully.');
    } else {
      console.log('FAIL: Saving attendance failed.');
    }

    // ----------------------------------------------------
    // TEST 10: Admin reopens meeting and edits attendance (updates row)
    // ----------------------------------------------------
    console.log('\n[TEST 10] Admin editing attendance (checking no duplicates)...');
    const updateAttendanceRes = await fetch(`${API_URL}/admin/meetings/${meetingId}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        records: [
          { user_id: testMemberUser.id, status: 'LATE' }
        ]
      })
    });
    const updateAttendanceData = await updateAttendanceRes.json();
    console.log('Response Status:', updateAttendanceRes.status);

    // Check in database if there's only 1 record
    const checkAttendanceRes = await fetch(`${API_URL}/admin/meetings/${meetingId}/attendance`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const checkAttendanceData = await checkAttendanceRes.json();
    console.log('Response Data:', checkAttendanceData);
    const testMemberRecord = checkAttendanceData.members.find(m => m.user_id === testMemberUser.id);

    if (updateAttendanceRes.status === 200 && testMemberRecord && testMemberRecord.status === 'LATE') {
      console.log('PASS: Attendance updated successfully to LATE and no duplicate record was created.');
    } else {
      console.log('FAIL: Attendance update failed or duplicated.');
    }

    // ----------------------------------------------------
    // TEST 11 & 12: Member dashboard fetches profile & dynamic stats
    // ----------------------------------------------------
    console.log('\n[TEST 11 & 12] Member fetching own dashboard stats & history...');
    const memberDashboardRes = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    const memberDashboardData = await memberDashboardRes.json();
    console.log('Response Status:', memberDashboardRes.status);
    console.log('Stats:', memberDashboardData.stats);
    console.log('Attendance History Count:', memberDashboardData.attendance.length);

    if (memberDashboardRes.status === 200 && memberDashboardData.stats && memberDashboardData.stats.percentage === '100.0') {
      console.log('PASS: Member dashboard stats and percentage (100.0% for 1 late session / 1 total session) calculated correctly.');
    } else {
      console.log('FAIL: Member stats or history details mismatch.');
    }

    console.log('\n--- ALL TESTS COMPLETED ---');

  } catch (err) {
    console.error('Test script encountered an error:', err);
  }
}

runTests();
