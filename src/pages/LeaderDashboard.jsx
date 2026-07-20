import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { supabase } from '../supabaseClient';
import { STATEMENTS } from '../data/problemStatements';

import svhLogo from '../assets/svh.jpeg';
import vitbLogo from '../assets/vitblogo.png';
import blockchainLogo from '../assets/Blockchain.png';

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
  const [activeTab, setActiveTab] = useState('teamDetails');

  // Submission form state
  const [submissionStatus, setSubmissionStatus] = useState('loading'); // 'loading', 'none', 'submitted'
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [problemCode, setProblemCode] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [category, setCategory] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [uniqueIdea, setUniqueIdea] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [useCase, setUseCase] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ytLink, setYtLink] = useState('');
  const [documentLink, setDocumentLink] = useState('');
  const [pptFile, setPptFile] = useState(null);
  const [pptUrl, setPptUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const targetDate = new Date('2026-07-22T00:00:00+05:30').getTime();//update time here

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return null; // Timer finished
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

          // Fetch submissions for this team (up to 2 allowed)
          const { data: subData, error: subErr } = await supabase
            .from('submissions')
            .select('*')
            .eq('team_id', session.teamId)
            .order('submitted_at', { ascending: true });

          if (!subErr && subData) {
            setUserSubmissions(subData);
            setSubmissionStatus(subData.length > 0 ? 'submitted' : 'none');
          } else {
            setUserSubmissions([]);
            setSubmissionStatus('none');
          }
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, [navigate]);

  const handleProblemCodeChange = (e) => {
    const code = e.target.value;
    setProblemCode(code);
    const stmt = STATEMENTS.find(s => s.id === code);
    if (stmt) {
      setProblemTitle(stmt.title);
      setTheme(stmt.theme);
      setCategory(stmt.category);
    } else {
      setProblemTitle('');
      setTheme('');
      setCategory('');
    }
  };

  const handleProblemTitleChange = (e) => {
    const title = e.target.value;
    setProblemTitle(title);
    const stmt = STATEMENTS.find(s => s.title === title);
    if (stmt) {
      setProblemCode(stmt.id);
      setTheme(stmt.theme);
      setCategory(stmt.category);
    } else {
      setProblemCode('');
      setTheme('');
      setCategory('');
    }
  };

  const handlePptFileSelect = async (e) => {
    setSubmitError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setSubmitError('Invalid file type! Upload .pdf file only. Convert your Canva made PPTs to .pdf');
      setPptFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setSubmitError('File size exceeds the 20MB limit. Please compress your PDF file.');
      setPptFile(null);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numPages = pdfDoc.getPageCount();
      if (numPages > 6) {
        setSubmitError(`Your PDF has ${numPages} pages. Your presentation must contain 6 pages or under.`);
        setPptFile(null);
        return;
      }
      setPptFile(file);
      setSubmitError('');
    } catch (err) {
      console.error('PDF parsing error:', err);
      setSubmitError('Failed to read PDF file. Please ensure it is a valid, unencrypted PDF.');
      setPptFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (userSubmissions.length >= 2) {
      setSubmitError('You have already reached the maximum limit of 2 submissions per team.');
      return;
    }
    if (!problemCode || !problemTitle || !theme || !category || !ideaTitle || !uniqueIdea || !ideaDesc || !useCase || !targetAudience) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      let finalPptUrl = pptUrl;

      // Upload PDF to Google Drive if selected
      if (pptFile) {
        const reader = new FileReader();
        const fileBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(pptFile);
        });

        const uploadRes = await fetch('/api/uploadPdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: fileBase64,
            fileName: `${teamInfo.teamId}_sub${userSubmissions.length + 1}_${(teamInfo.teamName || 'team').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            teamId: teamInfo.teamId,
          }),
        });

        const contentType = uploadRes.headers.get('content-type');
        let uploadData = {};
        if (contentType && contentType.includes('application/json')) {
          uploadData = await uploadRes.json();
        } else {
          const rawText = await uploadRes.text();
          throw new Error(rawText || `Upload endpoint returned HTTP ${uploadRes.status}`);
        }

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Failed to upload presentation to Google Drive.');
        }

        finalPptUrl = uploadData.pdfUrl;
      }

      const generatedIdeaId = `${teamInfo.teamId}-${userSubmissions.length + 1}`;

      const payload = {
        idea_id: generatedIdeaId,
        team_id: teamInfo.teamId,
        problem_code: problemCode,
        problem_statement: problemTitle,
        theme: theme,
        category: category,
        idea_title: ideaTitle,
        unique_idea: uniqueIdea,
        idea_description: ideaDesc,
        use_case: useCase,
        target_audience: targetAudience,
        yt_link: ytLink || null,
        document_link: documentLink || null,
        ppt_url: finalPptUrl || null
      };

      const { data: insertedData, error } = await supabase
        .from('submissions')
        .insert([payload])
        .select();

      if (error) throw error;

      const newSubmissionRecord = (insertedData && insertedData[0]) ? insertedData[0] : payload;
      const updatedList = [...userSubmissions, newSubmissionRecord];
      setUserSubmissions(updatedList);
      setSubmissionStatus('submitted');

      // Clear form inputs for potential 2nd submission
      setProblemCode('');
      setProblemTitle('');
      setTheme('');
      setCategory('');
      setIdeaTitle('');
      setUseCase('');
      setTargetAudience('');
      setUniqueIdea('');
      setIdeaDesc('');
      setYtLink('');
      setDocumentLink('');
      setPptFile(null);

      setActiveTab('review');
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message || 'Error submitting your idea.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row" style={{
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #07192c 0%, #0f2942 45%, #07192c 100%)'
    }}>
      <FloatingParticles count={22} />

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0 }}>
        <AshokaChakra size={640} opacity={0.035} spin />
      </div>

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-[320px] h-auto md:h-full overflow-y-auto flex-shrink-0" style={{
        background: 'rgba(7, 25, 44, 0.75)',
        borderRight: '1px solid rgba(255,153,51,0.18)',
        borderBottom: '1px solid rgba(255,153,51,0.18)',
        backdropFilter: 'blur(20px)',
        padding: '24px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        zIndex: 10
      }}>
        {/* Logos & Team Profile Header */}
        <div style={{ paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Official Logos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 18, background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <img src={svhLogo} alt="SVH Logo" style={{ height: 36, width: 'auto', borderRadius: 6 }} />
            <img src={blockchainLogo} alt="Blockchain Club" style={{ height: 32, width: 'auto' }} />
            <img src={vitbLogo} alt="VIT Bhopal" style={{ height: 30, width: 'auto' }} />
          </div>

          <div style={{ background: 'rgba(255, 153, 51, 0.08)', border: '1px solid rgba(255, 153, 51, 0.2)', borderRadius: 14, padding: '14px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Team Portal
            </div>
            <h2 style={{ color: '#fff', fontSize: 17, fontFamily: 'Montserrat,sans-serif', fontWeight: 800, margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {teamInfo ? teamInfo.teamName : 'Team Dashboard'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#FF9933', fontSize: 12, fontFamily: 'Courier New, monospace', fontWeight: 800 }}>
                {teamInfo ? teamInfo.teamId : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => setActiveTab('teamDetails')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'teamDetails' ? 'linear-gradient(135deg, rgba(255,153,51,0.2), rgba(255,153,51,0.08))' : 'transparent',
              color: activeTab === 'teamDetails' ? '#FF9933' : 'rgba(255,255,255,0.85)',
              border: activeTab === 'teamDetails' ? '1px solid rgba(255,153,51,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>👥</span> Team Details
            </span>
          </button>

          <button
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'submission' ? 'linear-gradient(135deg, rgba(255,153,51,0.2), rgba(255,153,51,0.08))' : 'transparent',
              color: activeTab === 'submission' ? '#FF9933' : 'rgba(255,255,255,0.85)',
              border: activeTab === 'submission' ? '1px solid rgba(255,153,51,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🚀</span> Submit Idea
            </span>
            <span style={{ background: userSubmissions.length >= 2 ? 'rgba(39,174,96,0.2)' : 'rgba(255,153,51,0.2)', color: userSubmissions.length >= 2 ? '#2ecc71' : '#FF9933', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
              {userSubmissions.length} / 2
            </span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '14px 18px',
              background: activeTab === 'review' ? 'linear-gradient(135deg, rgba(255,153,51,0.2), rgba(255,153,51,0.08))' : 'transparent',
              color: activeTab === 'review' ? '#FF9933' : 'rgba(255,255,255,0.85)',
              border: activeTab === 'review' ? '1px solid rgba(255,153,51,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'Poppins,sans-serif',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📋</span> Review Submissions
            </span>
            {userSubmissions.length > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                {userSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Footer Navigation & Logout controls */}
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              fontFamily: 'Poppins,sans-serif',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            Return to Home
          </button>
          <button
            onClick={() => { localStorage.removeItem('leader_session'); navigate('/'); }}
            style={{
              padding: '12px 16px',
              background: 'rgba(255,107,107,0.12)',
              color: '#ff6b6b',
              border: '1px solid rgba(255,107,107,0.25)',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              fontFamily: 'Poppins,sans-serif',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.12)'; }}
          >
            Logout Account
          </button>
        </div>
      </nav>

      {/* Main Content Area (Single Unified Scrollbar) */}
      <main className="flex-1 p-6 md:p-10 z-10 box-border overflow-y-auto h-full">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, margin: 0, letterSpacing: -0.5 }}>
                Submission
              </h1>
              <div style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933', border: '1px solid rgba(255,153,51,0.3)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontFamily: 'Montserrat,sans-serif', fontWeight: 700 }}>
                {userSubmissions.length} of 2 Submissions Completed
              </div>
            </div>

            {submissionStatus === 'loading' ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>Loading...</p>
            ) : userSubmissions.length >= 2 ? (
              <div style={{
                padding: '50px 24px',
                textAlign: 'center',
                background: 'rgba(39, 174, 96, 0.1)',
                borderRadius: 20,
                border: '2px dashed rgba(39, 174, 96, 0.3)',
                backdropFilter: 'blur(16px)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h3 style={{ margin: '0 0 12px', color: '#2ecc71', fontFamily: 'Montserrat,sans-serif', fontSize: 22, fontWeight: 800 }}>
                  Maximum Submissions Reached (2 / 2)
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Poppins,sans-serif', margin: '0 auto 24px', fontSize: 15, maxWidth: 520, lineHeight: 1.6 }}>
                  Your team has submitted the maximum allowed 2 problem statements. You can review both of your submitted ideas in the <strong>Review Submissions</strong> tab.
                </p>
                <button onClick={() => setActiveTab('review')} style={{
                  background: 'linear-gradient(135deg, #FF9933, #e07800)',
                  color: '#fff', padding: '12px 28px', borderRadius: 25,
                  border: 'none', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,153,51,0.3)'
                }}>
                  Review Your Submissions &rarr;
                </button>
              </div>
            ) : timeLeft ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 20,
                border: '2px dashed rgba(255,153,51,0.25)',
                backdropFilter: 'blur(16px)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
                <h3 style={{ margin: '0 0 12px', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 24, fontWeight: 700 }}>
                  Submissions Open Soon
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', margin: '0 auto 30px', fontSize: 16, maxWidth: 500 }}>
                  PPT submissions will begin on 22nd July 2026. Get your ideas ready!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} style={{ background: 'rgba(0,0,0,0.3)', padding: '15px 20px', borderRadius: 12, minWidth: 80, border: '1px solid rgba(255,153,51,0.2)' }}>
                      <div style={{ color: '#FF9933', fontSize: 32, fontWeight: 800, fontFamily: 'Montserrat,sans-serif' }}>
                        {value.toString().padStart(2, '0')}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontFamily: 'Poppins,sans-serif' }}>
                        {unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (

              <form onSubmit={handleSubmit} style={{
                display: 'flex', flexDirection: 'column', gap: 24,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 153, 51, 0.15)',
                borderRadius: 20,
                padding: '32px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)'
              }}>
                {/* Slot Indicator Header */}
                <div style={{
                  background: 'rgba(255, 153, 51, 0.12)',
                  border: '1px solid rgba(255, 153, 51, 0.3)',
                  borderRadius: 12,
                  padding: '14px 20px',
                  color: '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <strong style={{ color: '#FF9933', fontFamily: 'Montserrat, sans-serif', fontSize: 15 }}>
                      Submission Slot #{userSubmissions.length + 1} of 2
                    </strong>
                    {userSubmissions.length === 1 ? ' (You have 1 previous submission saved)' : ''}
                  </div>
                  <span style={{ background: '#FF9933', color: '#000', fontWeight: 800, padding: '4px 12px', borderRadius: 12, fontSize: 12, fontFamily: 'Montserrat, sans-serif' }}>
                    {userSubmissions.length === 0 ? '1st Submission' : '2nd Submission'}
                  </span>
                </div>

                {/* Evaluator Note Banner */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  color: '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  lineHeight: 1.6,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12
                }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <div>
                    <strong style={{ color: '#FF9933', display: 'block', marginBottom: 4, fontFamily: 'Montserrat, sans-serif' }}>Important Note from Evaluators</strong>
                    Evaluators want to know your authentic thoughts instead of copy-pasting from AI tools. Try to write something original from your own perspective.
                  </div>
                </div>

                {submitError && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: 12, borderRadius: 8, fontFamily: 'Poppins,sans-serif', fontSize: 14 }}>{submitError}</div>}

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>Problem Code <span style={{ color: '#FF9933' }}>*</span></label>
                    <select required value={problemCode} onChange={handleProblemCodeChange} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none' }}>
                      <option value="" style={{ color: '#000' }}>Select Code</option>
                      {STATEMENTS.map(s => <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.id}</option>)}
                    </select>
                  </div>

                  <div style={{ flex: '2 1 300px' }}>
                    <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>Problem Statement <span style={{ color: '#FF9933' }}>*</span></label>
                    <select required value={problemTitle} onChange={handleProblemTitleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none' }}>
                      <option value="" style={{ color: '#000' }}>Select Statement</option>
                      {STATEMENTS.map(s => <option key={s.id} value={s.title} style={{ color: '#000' }}>{s.title}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>Theme</label>
                    <input type="text" readOnly value={theme} placeholder="Auto-filled" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>Category</label>
                    <input type="text" readOnly value={category} placeholder="Auto-filled" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>Idea Title <span style={{ color: '#FF9933' }}>*</span></label>
                  <input required type="text" value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} placeholder="Give your idea a catchy title..." style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>Real-life Use Case of Your Idea <span style={{ color: '#FF9933' }}>*</span></label>
                    <span style={{ fontSize: 12, fontFamily: 'Poppins,sans-serif', color: useCase.length > 1000 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>{useCase.length} / 1000</span>
                  </div>
                  <textarea required maxLength={1000} value={useCase} onChange={e => setUseCase(e.target.value)} style={{ width: '100%', minHeight: 110, padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Provide a real-life usecase showing how your solution works in practice..." />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>Target Audience & Stakeholders <span style={{ color: '#FF9933' }}>*</span></label>
                    <span style={{ fontSize: 12, fontFamily: 'Poppins,sans-serif', color: targetAudience.length > 1000 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>{targetAudience.length} / 1000</span>
                  </div>
                  <textarea required maxLength={1000} value={targetAudience} onChange={e => setTargetAudience(e.target.value)} style={{ width: '100%', minHeight: 110, padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Who is your target audience / stakeholders for whom you are making this solution..." />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>How Your Idea is Unique <span style={{ color: '#FF9933' }}>*</span></label>
                    <span style={{ fontSize: 12, fontFamily: 'Poppins,sans-serif', color: uniqueIdea.length > 1000 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>{uniqueIdea.length} / 1000</span>
                  </div>
                  <textarea required maxLength={1000} value={uniqueIdea} onChange={e => setUniqueIdea(e.target.value)} style={{ width: '100%', minHeight: 120, padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Explain what makes your approach different..." />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>Idea Description <span style={{ color: '#FF9933' }}>*</span></label>
                    <span style={{ fontSize: 12, fontFamily: 'Poppins,sans-serif', color: ideaDesc.length > 2000 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>{ideaDesc.length} / 2000</span>
                  </div>
                  <textarea required maxLength={2000} value={ideaDesc} onChange={e => setIdeaDesc(e.target.value)} style={{ width: '100%', minHeight: 180, padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Provide a detailed description of your idea and implementation plan..." />
                </div>

                {/* PPT Upload Option (.pdf only, max 20MB, 6 pages limit) */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 6 }}>
                    Upload Presentation Deck (.pdf) <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: 12 }}>(Optional)</span>
                  </label>

                  {/* Note banner */}
                  <div style={{
                    background: 'rgba(255, 153, 51, 0.08)',
                    border: '1px solid rgba(255, 153, 51, 0.25)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 12,
                    color: '#FF9933',
                    fontSize: 13,
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1.4
                  }}>
                    ℹ️ <strong>Upload .pdf file only.</strong> Convert your Canva-made PPTs to .pdf before uploading. (Max 6 pages & max size 20 MB).
                  </div>

                  <div style={{
                    border: '2px dashed rgba(255, 153, 51, 0.3)',
                    borderRadius: 12,
                    padding: '24px',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePptFileSelect}
                      style={{ display: 'none' }}
                      id="ppt-file-upload"
                    />
                    <label htmlFor="ppt-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                      <div style={{ color: '#fff', fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 14 }}>
                        {pptFile ? `Selected: ${pptFile.name}` : 'Click to select .pdf presentation file'}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4, fontFamily: 'Poppins,sans-serif' }}>
                        Must be a PDF document &middot; Up to 20MB &middot; Max 6 pages
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>YouTube Video Link <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: 12 }}>(Optional)</span></label>
                    <input type="url" value={ytLink} onChange={e => setYtLink(e.target.value)} placeholder="https://youtube.com/..." style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>Document Drive Link <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: 12 }}>(Optional)</span></label>
                    <input type="url" value={documentLink} onChange={e => setDocumentLink(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <button disabled={submitting} type="submit" style={{ background: 'linear-gradient(135deg, #FF9933, #e07800)', color: '#fff', padding: '14px 32px', borderRadius: 30, border: 'none', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, alignSelf: 'flex-start', boxShadow: '0 8px 24px rgba(255,153,51,0.4)', transition: 'all 0.3s ease' }}>
                  {submitting ? 'Submitting...' : `Submit Idea (Submission #${userSubmissions.length + 1})`}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 32, margin: 0, letterSpacing: -0.5 }}>
                Review Submissions
              </h1>
              {userSubmissions.length > 0 && (
                <span style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933', border: '1px solid rgba(255,153,51,0.3)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontFamily: 'Montserrat,sans-serif', fontWeight: 700 }}>
                  {userSubmissions.length} of 2 Submissions Completed
                </span>
              )}
            </div>

            {submissionStatus === 'loading' ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>Loading...</p>
            ) : timeLeft ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 20,
                border: '2px dashed rgba(255,153,51,0.25)',
                backdropFilter: 'blur(16px)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
                <h3 style={{ margin: '0 0 12px', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 24, fontWeight: 700 }}>
                  Submissions Open Soon
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', margin: '0 auto 30px', fontSize: 16, maxWidth: 500 }}>
                  PPT submissions will begin on 22nd July 2026. Get your ideas ready!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} style={{ background: 'rgba(0,0,0,0.3)', padding: '15px 20px', borderRadius: 12, minWidth: 80, border: '1px solid rgba(255,153,51,0.2)' }}>
                      <div style={{ color: '#FF9933', fontSize: 32, fontWeight: 800, fontFamily: 'Montserrat,sans-serif' }}>
                        {value.toString().padStart(2, '0')}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontFamily: 'Poppins,sans-serif' }}>
                        {unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : userSubmissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {userSubmissions.map((sub, index) => (
                  <div key={sub.id || index} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 153, 51, 0.2)',
                    padding: 32,
                    borderRadius: 20,
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}>
                    {/* Header Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background: '#FF9933', color: '#000', fontWeight: 900, padding: '4px 12px', borderRadius: 12, fontSize: 12, fontFamily: 'Montserrat,sans-serif', textTransform: 'uppercase' }}>
                          Submission #{index + 1}
                        </span>
                        <div style={{ background: 'rgba(255,153,51,0.2)', color: '#FF9933', padding: '4px 10px', borderRadius: 6, fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 13, border: '1px solid rgba(255,153,51,0.3)' }}>
                          {sub.problem_code}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: 13, border: '1px solid rgba(255,255,255,0.15)' }}>
                          ID: {sub.idea_id || `${sub.team_id}-${index + 1}`}
                        </div>
                      </div>
                      {sub.submitted_at && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Poppins,sans-serif' }}>
                          Submitted on {new Date(sub.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 16px', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 700 }}>
                      {sub.problem_statement}
                    </h3>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontFamily: 'Poppins,sans-serif', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <strong>Theme:</strong> {sub.theme}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontFamily: 'Poppins,sans-serif', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <strong>Category:</strong> {sub.category}
                      </span>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ color: '#FF9933', fontFamily: 'Montserrat,sans-serif', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Idea Title</h4>
                      <p style={{ color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 22, fontWeight: 800, margin: 0 }}>
                        {sub.idea_title}
                      </p>
                    </div>

                    {sub.use_case && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ color: '#FF9933', fontFamily: 'Montserrat,sans-serif', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Real-life Use Case</h4>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Poppins,sans-serif', fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                          {sub.use_case}
                        </p>
                      </div>
                    )}

                    {sub.target_audience && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ color: '#FF9933', fontFamily: 'Montserrat,sans-serif', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Target Audience & Stakeholders</h4>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Poppins,sans-serif', fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                          {sub.target_audience}
                        </p>
                      </div>
                    )}

                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ color: '#FF9933', fontFamily: 'Montserrat,sans-serif', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Unique Idea</h4>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Poppins,sans-serif', fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {sub.unique_idea}
                      </p>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ color: '#FF9933', fontFamily: 'Montserrat,sans-serif', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Idea Description</h4>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Poppins,sans-serif', fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {sub.idea_description}
                      </p>
                    </div>

                    {/* Links Section */}
                    {(sub.yt_link || sub.document_link || sub.ppt_url) && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {sub.ppt_url && (
                          <a href={sub.ppt_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', background: 'rgba(46, 204, 113, 0.15)', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(46, 204, 113, 0.3)', fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.15)'}>
                            📁 Presentation PPT
                          </a>
                        )}
                        {sub.yt_link && (
                          <a href={sub.yt_link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', background: 'rgba(231, 76, 60, 0.15)', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(231, 76, 60, 0.3)', fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.15)'}>
                            📺 YouTube Video
                          </a>
                        )}
                        {sub.document_link && (
                          <a href={sub.document_link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', background: 'rgba(52, 152, 219, 0.15)', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(52, 152, 219, 0.3)', fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(52, 152, 219, 0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(52, 152, 219, 0.15)'}>
                            📄 Drive Document
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 20,
                border: '2px dashed rgba(255,153,51,0.25)',
                backdropFilter: 'blur(16px)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
                <h3 style={{ margin: '0 0 12px', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 20, fontWeight: 700 }}>
                  No Submissions Found
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', margin: 0, fontSize: 15, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                  You have not submitted any problem statement yet. Please go to the Submission tab to submit your ideas.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </section>
  );
}
