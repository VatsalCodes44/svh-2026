import { useState } from 'react';

const TestEmail = () => {
  const [formData, setFormData] = useState({
    leaderEmail: 'test@example.com',
    teamName: 'Test Team',
    password: 'password123',
    teamId: 'TEAM_123',
    leaderName: 'Test Leader',
    leaderReg: '21BCE0000',
    extraMembersData: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      let parsedExtra = [];
      if (formData.extraMembersData) {
        parsedExtra = JSON.parse(formData.extraMembersData);
      }

      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          extraMembersData: parsedExtra
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(`Success: ${data.message} (Message ID: ${data.messageId})`);
      } else {
        setStatus(`Error: ${data.message} - ${data.error || ''}`);
      }
    } catch (err) {
      setStatus(`Fetch Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', background: '#fff', color: '#000', borderRadius: '8px', marginTop: '20px' }}>
      <h2>Test /api/sendEmail Route</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Leader Email: </label>
          <input type="email" name="leaderEmail" value={formData.leaderEmail} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>Team Name: </label>
          <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>Password: </label>
          <input type="text" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>Team ID: </label>
          <input type="text" name="teamId" value={formData.teamId} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>Leader Name: </label>
          <input type="text" name="leaderName" value={formData.leaderName} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>Leader Reg: </label>
          <input type="text" name="leaderReg" value={formData.leaderReg} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label>Extra Members (JSON array): </label>
          <textarea 
            name="extraMembersData" 
            value={formData.extraMembersData} 
            onChange={handleChange} 
            placeholder='[{"name": "Member 2", "regNo": "21BCE0001", "email": "m2@test.com"}]'
            style={{ width: '100%', padding: '8px', height: '100px' }} 
          />
        </div>
        <button type="submit" style={{ padding: '10px', background: '#FF9933', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send Test Email
        </button>
      </form>
      {status && <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>{status}</div>}
    </div>
  );
};

export default TestEmail;
