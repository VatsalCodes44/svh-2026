import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/* Shared Background Assets */
function AshokaChakra({ size = 200, opacity = 0.08, spin = true }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
      style={{ opacity, animation: spin ? 'spin-slow 40s linear infinite' : 'none', display: 'block', flexShrink: 0 }}>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#06038D" strokeWidth="4" />
      <circle cx="100" cy="100" r="12" fill="#06038D" />
      {spokes.map(i => {
        const a = (i * 15 * Math.PI) / 180;
        return <line key={i} x1={100 + 12 * Math.cos(a)} y1={100 + 12 * Math.sin(a)} x2={100 + 92 * Math.cos(a)} y2={100 + 92 * Math.sin(a)} stroke="#06038D" strokeWidth="1.5" />;
      })}
      <circle cx="100" cy="100" r="78" fill="none" stroke="#06038D" strokeWidth="1" />
    </svg>
  );
}

function FloatingParticles({ count = 18 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 11) % 95 + 2}%`,
      size: (i % 3) + 2,
      duration: 12 + (i % 7) * 2.5,
      delay: -((i * 3.7) % 12),
      color: i % 3 === 0
        ? 'rgba(255,153,51,0.45)'
        : i % 3 === 1
          ? 'rgba(19,136,8,0.35)'
          : 'rgba(255,255,255,0.2)',
    })), [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', bottom: '-8px', left: p.left,
          width: p.size, height: p.size, borderRadius: '50%', background: p.color,
          animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
          willChange: 'transform',
        }} />
      ))}
    </div>
  );
}

export default function LeaderDashboard() {
  const [teamInfo, setTeamInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teamDetails'); // 'teamDetails', 'submission', 'review'
  const navigate = useNavigate();

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

  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      background: 'linear-gradient(160deg, #07192c 0%, #0f2942 45%, #07192c 100%)',
      display: 'flex',
      overflow: 'hidden'
    }}>
      <FloatingParticles count={22} />

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0 }}>
        <AshokaChakra size={640} opacity={0.035} spin />
      </div>

      {/* Sidebar */}
      <nav style={{
        width: 320,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,153,51,0.15)',
        backdropFilter: 'blur(16px)',
        padding: '40px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        zIndex: 10,
        flexShrink: 0
      }}>
        {/* Team Profile Header in Sidebar */}
        <div style={{ paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontFamily: 'Montserrat,sans-serif', fontWeight: 800, margin: '0 0 4px' }}>
            {teamInfo ? teamInfo.teamName : 'Team Dashboard'}
          </h2>
          <div style={{ color: '#FF9933', fontSize: 13, fontFamily: 'Courier New, monospace', fontWeight: 700 }}>
            {teamInfo ? teamInfo.teamId : 'Loading...'}
          </div>
        </div>

        {/* Sidebar Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setActiveTab('teamDetails')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'teamDetails' ? 'rgba(255,153,51,0.12)' : 'transparent',
              color: activeTab === 'teamDetails' ? '#FF9933' : '#fff',
              border: activeTab === 'teamDetails' ? '1px solid rgba(255,153,51,0.25)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            Team Details
          </button>
          
          <button
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'submission' ? 'rgba(255,153,51,0.12)' : 'transparent',
              color: activeTab === 'submission' ? '#FF9933' : '#fff',
              border: activeTab === 'submission' ? '1px solid rgba(255,153,51,0.25)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            Submission
          </button>

          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'review' ? 'rgba(255,153,51,0.12)' : 'transparent',
              color: activeTab === 'review' ? '#FF9933' : '#fff',
              border: activeTab === 'review' ? '1px solid rgba(255,153,51,0.25)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            Review Submissions
          </button>
        </div>

        {/* Footer controls */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px',
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Return to Home
          </button>
          <button
            onClick={() => { localStorage.removeItem('leader_session'); navigate('/'); }}
            style={{
              padding: '12px',
              background: 'rgba(255,107,107,0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(255,107,107,0.2)',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '40px 48px',
        zIndex: 10,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'teamDetails' && (
          <div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, marginBottom: 28, letterSpacing: -0.5 }}>
              Team Details
            </h1>

            {loading ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>Loading team data...</p>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 153, 51, 0.15)',
                borderRadius: 20,
                padding: '24px 32px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Poppins,sans-serif' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Full Name</th>
                      <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Email ID</th>
                      <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Mobile Number</th>
                      <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '32px 16px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: 14 }}>
                          No team members found.
                        </td>
                      </tr>
                    ) : (
                      members.map((member, idx) => (
                        <tr key={member.id || idx} style={{ borderBottom: idx < members.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '16px', color: '#fff', fontWeight: 500, fontSize: 14 }}>{member.full_name || 'Unnamed'}</td>
                          <td style={{ padding: '16px' }}>
                            {member.is_team_leader ? (
                              <span style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933', fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat,sans-serif', padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: 1, border: '1px solid rgba(255,153,51,0.3)' }}>Leader</span>
                            ) : (
                              <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat,sans-serif', padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: 1, border: '1px solid rgba(255,255,255,0.1)' }}>Member</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                            {member.is_team_leader ? (member.email || '-') : (member.phone || '-')}
                          </td>
                          <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Courier New, monospace' }}>
                            {member.is_team_leader ? (member.phone || '-') : (member.email || '-')}
                          </td>
                          <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{member.gender || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submission' && (
          <div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, marginBottom: 28, letterSpacing: -0.5 }}>
              Submission
            </h1>
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: 20, 
              border: '2px dashed rgba(255,153,51,0.25)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ marginBottom: 20 }}></div>
              <h3 style={{ margin: '0 0 12px', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 20, fontWeight: 700 }}>
                Project Submission Coming Soon
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', margin: 0, fontSize: 15, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                You will be able to submit your final project files, presentation, and demo video here when submissions open.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, marginBottom: 28, letterSpacing: -0.5 }}>
              Review Submissions
            </h1>
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: 20, 
              border: '2px dashed rgba(255,153,51,0.25)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ marginBottom: 20 }}></div>
              <h3 style={{ margin: '0 0 12px', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 20, fontWeight: 700 }}>
                No Reviews Yet
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', margin: 0, fontSize: 15, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                Once evaluators review your submission, their feedback, scores, and status will appear here.
              </p>
            </div>
          </div>
        )}
      </main>
    </section>
  );
}

