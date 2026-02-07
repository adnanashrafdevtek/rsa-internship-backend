require('dotenv').config();

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const MINT_KEY = process.env.AGENT_MINT_KEY;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  try {
    // Wait for server to be ready
    await delay(1000);

    console.log('\n=== AGENT TOKEN TEST ===');
    const agentRes = await fetch(`${BASE}/api/agent/token`, {
      method: 'POST',
      headers: { 'x-agent-mint-key': MINT_KEY }
    });
    const agentJson = await agentRes.json();
    console.log('✓ Agent token received');

    if (!agentJson.token) {
      console.error('✗ No token returned');
      process.exit(1);
    }

    console.log('✓ Token:', agentJson.token.substring(0, 20) + '...');

    const agentPing = await fetch(`${BASE}/api/agent/ping`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${agentJson.token}` }
    });
    const agentPingJson = await agentPing.json();
    console.log('✓ Agent ping:', agentPingJson.message);

    console.log('\n=== ADMIN TOKEN TEST ===');
    const adminRes = await fetch(`${BASE}/api/auth/admin`, { method: 'POST' });
    const adminJson = await adminRes.json();
    console.log('✓ Admin token received');

    const adminTest = await fetch(`${BASE}/api/admin/create-class`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminJson.token}` }
    });
    const adminTestJson = await adminTest.json();
    console.log('✓ Admin can create classes:', adminTestJson.message);

    console.log('\n=== TEACHER TOKEN TEST ===');
    const teacherRes = await fetch(`${BASE}/api/auth/teacher`, { method: 'POST' });
    const teacherJson = await teacherRes.json();
    console.log('✓ Teacher token received');

    const teacherTest = await fetch(`${BASE}/api/teacher/schedule`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${teacherJson.token}` }
    });
    const teacherTestJson = await teacherTest.json();
    console.log('✓ Teacher can view schedule:', teacherTestJson.message);

    console.log('\n=== STUDENT TOKEN TEST ===');
    const studentRes = await fetch(`${BASE}/api/auth/student`, { method: 'POST' });
    const studentJson = await studentRes.json();
    console.log('✓ Student token received');

    const studentTest = await fetch(`${BASE}/api/student/schedule`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentJson.token}` }
    });
    const studentTestJson = await studentTest.json();
    console.log('✓ Student can view schedule:', studentTestJson.message);

    console.log('\n✓ ALL TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Test error:', err.message);
    process.exit(1);
  }
}

run();
