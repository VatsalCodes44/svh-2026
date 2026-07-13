import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function EvaluatorDashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'ideas'
  const navigate = useNavigate();

  // Score states for each team's idea
  const [scores, setScores] = useState({
    'T-4032': { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
    'T-8219': { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
    'T-1102': { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 }
  });

  const [submittedStatus, setSubmittedStatus] = useState({
    'T-4032': false,
    'T-8219': false,
    'T-1102': false
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem('evaluator_session');
    if (!sessionStr) {
      navigate('/login');
      return;
    }
    setSession(JSON.parse(sessionStr));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('evaluator_session');
    navigate('/login');
  };

  const handleScoreChange = (teamId, field, val) => {
    const numericVal = Math.min(5, Math.max(0, parseFloat(val) || 0));
    setScores(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: numericVal
      }
    }));
  };

  const handleSubmitScore = (teamId) => {
    setSubmittedStatus(prev => ({
      ...prev,
      [teamId]: true
    }));
    alert(`Scores for Team ${teamId} submitted successfully!`);
  };

  const assignedTeams = [
    { id: 'T-4032', name: 'Team Alpha', leader: 'Amit Patel', college: 'VIT Bhopal', membersCount: 6 },
    { id: 'T-8219', name: 'Team ByteCraft', leader: 'Sneha Reddy', college: 'IIT Bombay', membersCount: 5 },
    { id: 'T-1102', name: 'Team CyberNaut', leader: 'Rohan Sen', college: 'NIT Trichy', membersCount: 6 }
  ];

  const submittedIdeas = [
    {
      teamId: 'T-4032',
      teamName: 'Team Alpha',
      title: 'Decentralized Crop Insurance Platform',
      problemStatement: 'Smart agriculture and crop insurance verification using satellite data and smart contracts.',
      pptUrl: '#'
    },
    {
      teamId: 'T-8219',
      teamName: 'Team ByteCraft',
      title: 'AI-Powered Traffic Congestion Management',
      problemStatement: 'Real-time traffic density analysis using legacy CCTV footage and deep learning.',
      pptUrl: '#'
    },
    {
      teamId: 'T-1102',
      teamName: 'Team CyberNaut',
      title: 'Secure Medical Record Sharing Protocol',
      problemStatement: 'Consent-driven patient health record sharing using zero-knowledge proofs.',
      pptUrl: '#'
    }
  ];

  const criteria = [
    { key: 'q1', label: 'Problem-Solution Alignment', desc: 'Direct capability of the proposed idea to resolve every edge case of the official ministry problem statement.' },
    { key: 'q2', label: 'Innovation & Uniqueness', desc: 'Novelty of your Unique Value Proposition (UVP) compared to current market solutions, avoiding basic clone concepts.' },
    { key: 'q3', label: 'Technical Feasibility', desc: 'Logical correctness of the technical architecture diagram and the maturity of your listed technology stack.' },
    { key: 'q4', label: 'Scalability & Practicality', desc: 'Practical viability to deploy, sustain, and scale the solution effectively at a pan-India level.' },
    { key: 'q5', label: 'Template & Format Compliance', desc: 'Strict adherence to the 6-slide ceiling, PDF file format, and untouched official header titles.' }
  ];

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
        {/* Evaluator Details */}
        {session && (
          <div style={{
            background: 'rgba(255, 153, 51, 0.05)',
            border: '1px solid rgba(255, 153, 51, 0.2)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👨‍🏫</div>
            <h3 style={{ color: '#fff', margin: '0 0 4px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 16 }}>
              {session.name}
            </h3>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255, 153, 51, 0.15)',
              color: '#FF9933',
              padding: '2px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontFamily: 'Montserrat,sans-serif',
              marginBottom: 10
            }}>{session.role}</span>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0, fontFamily: 'Poppins,sans-serif' }}>
              {session.email}
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setActiveTab('assigned')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'assigned' ? 'rgba(255,153,51,0.15)' : 'transparent',
              color: activeTab === 'assigned' ? '#FF9933' : '#fff',
              border: activeTab === 'assigned' ? '1px solid rgba(255,153,51,0.3)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s'
            }}
          >
            <span>📋</span> Assigned Teams
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'ideas' ? 'rgba(19,136,8,0.15)' : 'transparent',
              color: activeTab === 'ideas' ? '#138808' : '#fff',
              border: activeTab === 'ideas' ? '1px solid rgba(19,136,8,0.3)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s'
            }}
          >
            <span>💡</span> Submitted Ideas
          </button>
        </div>

        {/* Action Buttons */}
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
            onClick={handleLogout}
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
        {activeTab === 'assigned' ? (
          <div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, marginBottom: 28, letterSpacing: -0.5 }}>
              Assigned Teams ({assignedTeams.length})
            </h1>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 153, 51, 0.15)',
              borderRadius: 20,
              padding: '32px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.3)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Poppins,sans-serif' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14 }}>Team ID</th>
                    <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14 }}>Team Name</th>
                    <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14 }}>Team Leader</th>
                    <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14 }}>College</th>
                    <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14 }}>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTeams.map((team, idx) => (
                    <tr key={team.id} style={{ borderBottom: idx < assignedTeams.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <td style={{ padding: '16px', color: '#FF9933', fontWeight: 600, fontSize: 14 }}>{team.id}</td>
                      <td style={{ padding: '16px', color: '#fff', fontSize: 14, fontWeight: 500 }}>{team.name}</td>
                      <td style={{ padding: '16px', color: '#fff', fontSize: 14 }}>{team.leader}</td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{team.college}</td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{team.membersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, marginBottom: 28, letterSpacing: -0.5 }}>
              Submitted Ideas & Evaluation
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {submittedIdeas.map((idea) => {
                const teamScores = scores[idea.teamId] || { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 };
                const totalScore = teamScores.q1 + teamScores.q2 + teamScores.q3 + teamScores.q4 + teamScores.q5;

                return (
                  <div key={idea.teamId} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 153, 51, 0.15)',
                    borderRadius: 20,
                    padding: '32px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24
                  }}>
                    {/* Header Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <span style={{ color: '#FF9933', fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat,sans-serif' }}>
                          {idea.teamName} ({idea.teamId})
                        </span>
                        <h2 style={{ color: '#fff', margin: '6px 0 10px', fontSize: 22, fontFamily: 'Montserrat,sans-serif', fontWeight: 800 }}>
                          {idea.title}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, fontFamily: 'Poppins,sans-serif', lineHeight: 1.5 }}>
                          <strong>Problem:</strong> {idea.problemStatement}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 12,
                          padding: '12px 20px',
                          textAlign: 'center'
                        }}>
                          <span style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Total Score</span>
                          <span style={{ color: '#FF9933', fontSize: 24, fontWeight: 900 }}>{totalScore} <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>/ 25</span></span>
                        </div>
                        <a href={idea.pptUrl} style={{
                          color: '#138808',
                          textDecoration: 'none',
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: 'Poppins,sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          📂 View Submitted PPT
                        </a>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: 0 }} />

                    {/* Marking System */}
                    <div>
                      <h3 style={{ color: '#fff', fontSize: 16, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, marginBottom: 20 }}>
                        Evaluation Scorecard
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {criteria.map((crit, idx) => (
                          <div key={crit.key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 24,
                            background: 'rgba(255,255,255,0.01)',
                            padding: '16px 20px',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.03)'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{
                                  background: 'rgba(255, 153, 51, 0.15)',
                                  color: '#FF9933',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  fontFamily: 'Montserrat,sans-serif'
                                }}>0{idx + 1}</span>
                                <h4 style={{ color: '#fff', margin: 0, fontSize: 15, fontFamily: 'Poppins,sans-serif', fontWeight: 600 }}>
                                  {crit.label}
                                </h4>
                              </div>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '6px 0 0', fontFamily: 'Poppins,sans-serif', lineHeight: 1.4 }}>
                                {crit.desc}
                              </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.5"
                                value={teamScores[crit.key]}
                                disabled={submittedStatus[idea.teamId]}
                                onChange={(e) => handleScoreChange(idea.teamId, crit.key, e.target.value)}
                                style={{
                                  width: 120,
                                  accentColor: '#FF9933',
                                  cursor: 'pointer'
                                }}
                              />
                              <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.5"
                                value={teamScores[crit.key]}
                                disabled={submittedStatus[idea.teamId]}
                                onChange={(e) => handleScoreChange(idea.teamId, crit.key, e.target.value)}
                                style={{
                                  width: 60,
                                  padding: '8px',
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: 8,
                                  color: '#fff',
                                  textAlign: 'center',
                                  fontSize: 14,
                                  fontFamily: 'Poppins,sans-serif',
                                  outline: 'none'
                                }}
                              />
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>/ 5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button
                        onClick={() => handleSubmitScore(idea.teamId)}
                        disabled={submittedStatus[idea.teamId]}
                        style={{
                          padding: '12px 28px',
                          background: submittedStatus[idea.teamId] ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #138808, #0e6605)',
                          color: submittedStatus[idea.teamId] ? 'rgba(255,255,255,0.4)' : '#fff',
                          border: 'none',
                          borderRadius: 10,
                          fontWeight: 700,
                          fontFamily: 'Montserrat,sans-serif',
                          cursor: submittedStatus[idea.teamId] ? 'not-allowed' : 'pointer',
                          boxShadow: submittedStatus[idea.teamId] ? 'none' : '0 8px 24px rgba(19,136,8,0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {submittedStatus[idea.teamId] ? 'Evaluation Submitted ✓' : 'Submit Evaluation'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </section>
  );
}
