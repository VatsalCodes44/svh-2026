import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LeaderDashboard() {
  const [m, setM] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { const t = setTimeout(() => setM(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const sessionStr = localStorage.getItem('leader_session');
        if (!sessionStr) {
          navigate('/login');
          return;
        }
        const session = JSON.parse(sessionStr);
        setTeamInfo(session);

        if (session.teamId) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('team_id', session.teamId);
          
          if (error) throw error;
          setMembers(data || []);
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, [navigate]);

  const a = (delay, extra = {}) => ({
    opacity: m ? 1 : 0,
    transform: m ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
    ...extra,
  });

  return (
    <section style={{
      position: 'relative', minHeight: 'calc(100vh - 60px)',
      background: '#f8f9fa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      overflow: 'hidden', padding: 0,
    }}>
      {/* Blue Header Section */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #07192c 0%, #06038D 100%)',
        padding: '80px 20px 60px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 10px 30px rgba(6,3,141,0.15)'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', ...a(100) }}>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#ffffff', fontSize: 36, margin: '0 0 12px', letterSpacing: -1 }}>
            Team Leader Dashboard
          </h1>
          {teamInfo && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, fontFamily: 'Poppins,sans-serif', margin: 0 }}>
              Team: <strong style={{ color: '#FF9933' }}>{teamInfo.teamName}</strong> | {teamInfo.collegeName}
            </p>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1000, padding: '40px 20px' }}>
        <div style={{
          ...a(200),
          background: '#ffffff',
          border: '1px solid rgba(6, 3, 141, 0.1)',
          borderRadius: 20, padding: '40px 32px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 16px 40px rgba(6,3,141,0.05)',
        }}>
          <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#0f2942', fontSize: 24, margin: '0 0 24px', letterSpacing: 0.5, borderBottom: '1px solid rgba(6,3,141,0.1)', paddingBottom: 16 }}>
            Team Members
          </h2>

          {loading ? (
            <p style={{ color: '#0f2942', textAlign: 'center', fontFamily: 'Poppins,sans-serif' }}>Loading team data...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {members.length > 0 ? members.map((member, idx) => (
                <div key={member.id || idx} style={{
                  background: '#ffffff',
                  border: '1px solid rgba(6,3,141,0.1)',
                  borderRadius: 16,
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(6,3,141,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(6,3,141,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(6,3,141,0.1)';
                }}
                >
                  {member.is_team_leader && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: 'linear-gradient(135deg, #FF9933, #e07800)',
                      color: '#fff', fontSize: 10, fontWeight: 800, fontFamily: 'Montserrat,sans-serif',
                      padding: '4px 12px', borderBottomLeftRadius: 12, textTransform: 'uppercase', letterSpacing: 1
                    }}>
                      Leader
                    </div>
                  )}
                  <h3 style={{ margin: '0 0 12px', color: '#06038D', fontSize: 20, fontFamily: 'Montserrat,sans-serif', fontWeight: 700 }}>
                    {member.full_name || 'Unnamed Member'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#333', fontSize: 14, fontFamily: 'Poppins,sans-serif' }}>
                    {member.gender && <div><strong style={{ color: '#0f2942' }}>Gender:</strong> {member.gender}</div>}
                  </div>
                </div>
              )) : (
                <p style={{ color: '#666', fontFamily: 'Poppins,sans-serif', gridColumn: '1 / -1', textAlign: 'center' }}>
                  No team members found.
                </p>
              )}
            </div>
          )}
        </div>

        <div style={{ ...a(300), display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <button onClick={() => { localStorage.removeItem('leader_session'); navigate('/'); }} style={{
            padding: '12px 24px', background: 'transparent', color: '#ff6b6b', borderRadius: 8,
            fontSize: 13, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 1, border: '1.5px solid rgba(255,107,107,0.3)', cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.borderColor = '#ff6b6b'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,107,107,0.3)'; }}
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
