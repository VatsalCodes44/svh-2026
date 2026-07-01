import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Users, UserPlus, Building, Hash } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  
  // New Member Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', gender: 'Female' });
  const [addingMember, setAddingMember] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setUserProfile(profileData);

      if (profileData.team_id) {
        // Fetch team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', profileData.team_id)
          .single();
        if (teamError) throw teamError;
        setTeam(teamData);

        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('team_id', profileData.team_id)
          .order('is_team_leader', { ascending: false }); // Leader first
        
        if (membersError) throw membersError;
        setMembers(membersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddingMember(true);
    
    try {
      const generatedPassword = `${team.id}@${team.team_name}@SVH`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newMember.email,
        password: generatedPassword,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: newMember.email,
            full_name: newMember.name,
            phone: newMember.phone,
            gender: newMember.gender,
            is_team_leader: false,
            team_id: team.id,
            password: generatedPassword
          }]);
          
        if (profileError) throw profileError;
        
        alert(`Member added successfully! Their password is: ${generatedPassword}`);
        setNewMember({ name: '', email: '', phone: '', gender: 'Female' });
        setShowAddForm(false);
        fetchDashboardData();
      }
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#07192c', color: 'white' }}>
        Loading Dashboard...
      </div>
    );
  }

  // Find leader from members
  const leader = members.find(m => m.is_team_leader) || userProfile;

  return (
    <section style={{ minHeight: 'calc(100vh - 60px)', background: '#f5f7fa', padding: '40px 20px', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ color: '#0f2942', fontFamily: 'Montserrat, sans-serif', fontSize: 32, fontWeight: 800, margin: 0 }}>Dashboard</h1>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Logout
          </button>
        </div>

        {team ? (
          <>
            <h2 style={{ color: '#138808', marginBottom: 20 }}>Team Detail</h2>
            
            {/* Team Detail Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
              <div style={{ background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', borderRadius: 12, padding: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: 18 }}>Team Name</h3>
                <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>{team.team_name}</p>
                <Users style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} size={100} />
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: 12, padding: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: 18 }}>Team Leader Name</h3>
                <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>{leader?.full_name}</p>
                <UserPlus style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} size={100} />
              </div>

              <div style={{ background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', borderRadius: 12, padding: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: 18 }}>Team ID</h3>
                <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>{team.id}</p>
                <Hash style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} size={100} />
              </div>

              <div style={{ background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', borderRadius: 12, padding: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: 18 }}>College Name</h3>
                <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>{team.college_name}</p>
                <Building style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} size={100} />
              </div>
            </div>

            {/* Team Members */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#4A00E0', margin: 0 }}>Team Members</h2>
              {userProfile.is_team_leader && (
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ padding: '10px 20px', background: '#FF9933', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}>
                  {showAddForm ? 'Cancel' : '+ Add Member'}
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 30, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#0f2942' }}>Add New Member</h3>
                {addError && <p style={{ color: 'red', marginBottom: 15 }}>{addError}</p>}
                <form onSubmit={handleAddMember} style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                  <input type="text" placeholder="Full Name" required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} style={{ flex: '1 1 200px', padding: 12, borderRadius: 6, border: '1px solid #cbd5e0', outline: 'none' }} />
                  <input type="email" placeholder="Email Address" required value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} style={{ flex: '1 1 200px', padding: 12, borderRadius: 6, border: '1px solid #cbd5e0', outline: 'none' }} />
                  <input type="tel" placeholder="Phone Number" required value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} style={{ flex: '1 1 200px', padding: 12, borderRadius: 6, border: '1px solid #cbd5e0', outline: 'none' }} />
                  <select value={newMember.gender} onChange={e => setNewMember({...newMember, gender: e.target.value})} style={{ flex: '1 1 150px', padding: 12, borderRadius: 6, border: '1px solid #cbd5e0', outline: 'none', background: 'white' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <button type="submit" disabled={addingMember} style={{ padding: '12px 24px', background: '#138808', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, opacity: addingMember ? 0.7 : 1 }}>
                    {addingMember ? 'Saving...' : 'Save Member'}
                  </button>
                </form>
              </div>
            )}

            {/* Table */}
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead style={{ background: '#2d3748', color: 'white', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Member Role</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Member Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Member Email</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Member Phone</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Member Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, index) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #edf2f7', background: index % 2 === 0 ? 'white' : '#f7fafc', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#edf2f7'} onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f7fafc'}>
                      <td style={{ padding: '16px 24px', color: '#4a5568', fontWeight: m.is_team_leader ? 700 : 400 }}>{m.is_team_leader ? 'LEADER' : 'TEAM_MEMBER'}</td>
                      <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: 500 }}>{m.full_name}</td>
                      <td style={{ padding: '16px 24px', color: '#4a5568' }}>{m.email}</td>
                      <td style={{ padding: '16px 24px', color: '#4a5568' }}>{m.phone || '-'}</td>
                      <td style={{ padding: '16px 24px', color: '#4a5568' }}>{m.gender || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ background: 'white', padding: 40, borderRadius: 12, textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0f2942', marginTop: 0 }}>You are not assigned to any team yet.</h2>
            <p style={{ color: '#4a5568', margin: 0 }}>Please contact an administrator.</p>
          </div>
        )}
      </div>
    </section>
  );
}
