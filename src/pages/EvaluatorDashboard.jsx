import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { STATEMENTS } from '../data/problemStatements';

import svhLogo from '../assets/svh.jpeg';
import vitbLogo from '../assets/vitblogo.png';
import blockchainLogo from '../assets/Blockchain.png';

export default function EvaluatorDashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('evaluate'); // 'overview', 'evaluate', 'completed'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const navigate = useNavigate();

  const [assignedSubmissions, setAssignedSubmissions] = useState([]);
  const [completedEvaluations, setCompletedEvaluations] = useState([]);
  const [allSubmissionsMap, setAllSubmissionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Score state (5 criteria out of 10 = max 50 points)
  const [evalScores, setEvalScores] = useState({
    alignment: 10,
    innovation: 10,
    feasibility: 10,
    scalability: 10,
    compliance: 10,
    comments: ''
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem('evaluator_session');
    if (!sessionStr) {
      navigate('/login');
      return;
    }
    setSession(JSON.parse(sessionStr));
  }, [navigate]);

  const fetchEvaluatorData = async () => {
    if (!session?.email) return;
    setLoading(true);
    try {
      // 1. Fetch assignments for this evaluator
      const { data: assignData } = await supabase
        .from('evaluator_assignments')
        .select('*')
        .eq('evaluator_email', session.email);

      const assignedIdeaIds = (assignData || []).map(a => a.idea_id);

      // 2. Fetch submissions
      let subData = [];
      if (assignedIdeaIds.length > 0) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('*')
          .in('idea_id', assignedIdeaIds);
        subData = subs || [];
      } else {
        // Fallback: if no specific assignment, fetch all submissions so evaluator can evaluate
        const { data: subs } = await supabase
          .from('submissions')
          .select('*')
          .order('submitted_at', { ascending: false });
        subData = subs || [];
      }

      // Map submissions for quick lookup
      const subMap = {};
      subData.forEach(s => { subMap[s.idea_id] = s; });
      setAllSubmissionsMap(subMap);

      // 3. Fetch completed evaluations by this evaluator
      const { data: doneScores } = await supabase
        .from('evaluations')
        .select('*')
        .eq('evaluator_email', session.email)
        .order('created_at', { ascending: false });

      const completedIds = (doneScores || []).map(e => e.idea_id);
      setCompletedEvaluations(doneScores || []);

      // Filter uncompleted assigned submissions
      setAssignedSubmissions(subData.filter(s => !completedIds.includes(s.idea_id)));
    } catch (err) {
      console.error('Failed to fetch evaluator assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEvaluatorData();
    }
  }, [session]);

  const handleLogout = () => {
    localStorage.removeItem('evaluator_session');
    navigate('/login');
  };

  const startEvaluation = (submission, existingEval = null) => {
    setSelectedSubmission(submission);
    if (existingEval) {
      setEvalScores({
        alignment: existingEval.alignment_score ?? 10,
        innovation: existingEval.innovation_score ?? 10,
        feasibility: existingEval.feasibility_score ?? 10,
        scalability: existingEval.scalability_score ?? 10,
        compliance: existingEval.compliance_score ?? 10,
        comments: existingEval.comments || ''
      });
    } else {
      setEvalScores({
        alignment: 10,
        innovation: 10,
        feasibility: 10,
        scalability: 10,
        compliance: 10,
        comments: ''
      });
    }
  };

  const handleScoreChange = (field, val) => {
    if (field === 'comments') {
      setEvalScores(prev => ({ ...prev, comments: val }));
    } else {
      const numericVal = Math.min(10, Math.max(0, parseInt(val) || 0));
      setEvalScores(prev => ({ ...prev, [field]: numericVal }));
    }
  };

  const submitEvaluation = async () => {
    if (!selectedSubmission || !session) return;
    setSubmittingScore(true);

    const totalScore =
      evalScores.alignment +
      evalScores.innovation +
      evalScores.feasibility +
      evalScores.scalability +
      evalScores.compliance;

    try {
      const payload = {
        evaluator_email: session.email,
        evaluator_name: session.name || session.email,
        idea_id: selectedSubmission.idea_id,
        team_id: selectedSubmission.team_id,
        problem_code: selectedSubmission.problem_code,
        alignment_score: evalScores.alignment,
        innovation_score: evalScores.innovation,
        feasibility_score: evalScores.feasibility,
        scalability_score: evalScores.scalability,
        compliance_score: evalScores.compliance,
        total_score: totalScore,
        comments: evalScores.comments
      };

      const { error } = await supabase
        .from('evaluations')
        .upsert([payload], { onConflict: 'evaluator_email,idea_id' });

      if (error) throw error;

      setSelectedSubmission(null);
      await fetchEvaluatorData();
      alert('Evaluation submitted successfully!');
    } catch (err) {
      alert(`Error submitting evaluation: ${err.message}`);
    } finally {
      setSubmittingScore(false);
    }
  };

  // Overall Stats Calculations
  const stats = useMemo(() => {
    const totalAssigned = assignedSubmissions.length + completedEvaluations.length;
    const pendingCount = assignedSubmissions.length;
    const completedCount = completedEvaluations.length;

    let avgScore = 0;
    let highestScore = 0;

    if (completedCount > 0) {
      const sum = completedEvaluations.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
      avgScore = (sum / completedCount).toFixed(1);
      highestScore = Math.max(...completedEvaluations.map(e => e.total_score || 0));
    }

    return { totalAssigned, pendingCount, completedCount, avgScore, highestScore };
  }, [assignedSubmissions, completedEvaluations]);

  // PS-Wise Submission & Evaluation Stats for Evaluator
  const psStats = useMemo(() => {
    const statsMap = {};
    STATEMENTS.forEach(stmt => {
      statsMap[stmt.id] = {
        id: stmt.id,
        title: stmt.title,
        assignedCount: 0,
        evaluatedCount: 0,
        totalScoresSum: 0,
        highestScore: 0
      };
    });

    assignedSubmissions.forEach(sub => {
      if (!statsMap[sub.problem_code]) {
        statsMap[sub.problem_code] = {
          id: sub.problem_code,
          title: sub.problem_statement,
          assignedCount: 0,
          evaluatedCount: 0,
          totalScoresSum: 0,
          highestScore: 0
        };
      }
      statsMap[sub.problem_code].assignedCount += 1;
    });

    completedEvaluations.forEach(ev => {
      if (!statsMap[ev.problem_code]) {
        statsMap[ev.problem_code] = {
          id: ev.problem_code,
          title: ev.problem_statement || ev.problem_code,
          assignedCount: 0,
          evaluatedCount: 0,
          totalScoresSum: 0,
          highestScore: 0
        };
      }
      statsMap[ev.problem_code].assignedCount += 1; // total assigned = pending + completed
      statsMap[ev.problem_code].evaluatedCount += 1;
      statsMap[ev.problem_code].totalScoresSum += (ev.total_score || 0);
      if ((ev.total_score || 0) > statsMap[ev.problem_code].highestScore) {
        statsMap[ev.problem_code].highestScore = ev.total_score;
      }
    });

    return Object.values(statsMap).filter(item => item.assignedCount > 0 || item.evaluatedCount > 0);
  }, [assignedSubmissions, completedEvaluations]);

  // Filtered Pending Submissions
  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return assignedSubmissions;
    const q = searchQuery.toLowerCase();
    return assignedSubmissions.filter(s =>
      s.idea_id.toLowerCase().includes(q) ||
      s.team_id.toLowerCase().includes(q) ||
      s.problem_code.toLowerCase().includes(q) ||
      s.idea_title.toLowerCase().includes(q)
    );
  }, [assignedSubmissions, searchQuery]);

  // Filtered Completed Submissions
  const filteredCompleted = useMemo(() => {
    if (!searchQuery.trim()) return completedEvaluations;
    const q = searchQuery.toLowerCase();
    return completedEvaluations.filter(e =>
      e.idea_id.toLowerCase().includes(q) ||
      e.team_id.toLowerCase().includes(q) ||
      e.problem_code.toLowerCase().includes(q)
    );
  }, [completedEvaluations, searchQuery]);

  return (
    <section className="flex flex-col md:flex-row" style={{
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#071728',
      color: '#e2e8f0',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-[270px] h-auto md:h-full overflow-y-auto flex-shrink-0" style={{
        background: '#0a1d33',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 10
      }}>
        {/* Header Branding */}
        <div style={{ paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 14, background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: 8 }}>
            <img src={svhLogo} alt="SVH" style={{ height: 28, width: 'auto', borderRadius: 4 }} />
            <img src={blockchainLogo} alt="BC" style={{ height: 26, width: 'auto' }} />
            <img src={vitbLogo} alt="VITB" style={{ height: 24, width: 'auto' }} />
          </div>

          <div style={{ background: 'rgba(255, 153, 51, 0.08)', border: '1px solid rgba(255, 153, 51, 0.2)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: '#FF9933', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              Evaluator Portal
            </div>
            <h2 style={{ color: '#fff', fontSize: 14, fontFamily: 'Montserrat,sans-serif', fontWeight: 800, margin: '2px 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session ? session.name || session.email : 'Evaluator'}
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              {session ? session.email : ''}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'overview', label: 'Overview & PS Stats' },
            { id: 'evaluate', label: 'Evaluate Ideas', count: assignedSubmissions.length, highlight: assignedSubmissions.length > 0 },
            { id: 'completed', label: 'Completed Evaluations', count: completedEvaluations.length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 14px',
                  background: isActive ? 'rgba(255,153,51,0.15)' : 'transparent',
                  color: isActive ? '#FF9933' : 'rgba(255,255,255,0.8)',
                  border: isActive ? '1px solid rgba(255,153,51,0.3)' : '1px solid transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 12.5,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    background: tab.highlight ? 'rgba(255,153,51,0.25)' : isActive ? 'rgba(255,153,51,0.3)' : 'rgba(255,255,255,0.08)',
                    color: tab.highlight ? '#FF9933' : isActive ? '#FF9933' : 'rgba(255,255,255,0.7)',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 10
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
          >
            Return to Home
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '9px 12px', background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 z-10 box-border overflow-y-auto h-full">

        {/* TAB 1: OVERVIEW & PS STATS */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#fff', fontSize: 24, marginBottom: 20 }}>
              Evaluator Insights & PS Evaluation Breakdown
            </h1>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
              <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', borderRadius: 12 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Total Assigned Ideas</div>
                <div style={{ color: '#FF9933', fontSize: 28, fontWeight: 800, fontFamily: 'Montserrat,sans-serif', marginTop: 2 }}>{stats.totalAssigned}</div>
              </div>
              <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', borderRadius: 12 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Pending Evaluations</div>
                <div style={{ color: '#fbbf24', fontSize: 28, fontWeight: 800, fontFamily: 'Montserrat,sans-serif', marginTop: 2 }}>{stats.pendingCount}</div>
              </div>
              <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', borderRadius: 12 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Completed Evaluations</div>
                <div style={{ color: '#4ade80', fontSize: 28, fontWeight: 800, fontFamily: 'Montserrat,sans-serif', marginTop: 2 }}>{stats.completedCount}</div>
              </div>
              <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', borderRadius: 12 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Average Score Given</div>
                <div style={{ color: '#38bdf8', fontSize: 28, fontWeight: 800, fontFamily: 'Montserrat,sans-serif', marginTop: 2 }}>{stats.avgScore} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/ 50</span></div>
              </div>
              <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', borderRadius: 12 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Highest Score Given</div>
                <div style={{ color: '#f472b6', fontSize: 28, fontWeight: 800, fontFamily: 'Montserrat,sans-serif', marginTop: 2 }}>{stats.highestScore} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/ 50</span></div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.15) 0%, rgba(255,153,51,0.05) 100%)', border: '1px solid rgba(255,153,51,0.3)', borderRadius: 14, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 16, fontFamily: 'Montserrat,sans-serif', fontWeight: 800 }}>
                  Ready to evaluate assigned hackathon ideas?
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 12 }}>
                  You have <strong style={{ color: '#FF9933' }}>{stats.pendingCount} pending ideas</strong> waiting for your evaluation score & feedback notes.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('evaluate')}
                style={{ background: '#FF9933', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, fontFamily: 'Montserrat,sans-serif' }}
              >
                Go to Evaluate Ideas &rarr;
              </button>
            </div>

            {/* PS-Wise Submission & Evaluation Breakdown Table */}
            <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
              <h3 style={{ color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                Problem Statements Evaluation Progress Breakdown
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', color: '#FF9933' }}>PS Code</th>
                      <th style={{ padding: '10px 12px' }}>Statement Title</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Total Assigned</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Evaluated</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Pending</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Avg Score</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Top Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psStats.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '24px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                          No ideas assigned to your account yet.
                        </td>
                      </tr>
                    ) : (
                      psStats.map((ps, idx) => {
                        const pending = ps.assignedCount - ps.evaluatedCount;
                        const avg = ps.evaluatedCount > 0 ? (ps.totalScoresSum / ps.evaluatedCount).toFixed(1) : '-';
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 800, fontFamily: 'Courier New, monospace', color: '#FF9933' }}>{ps.id}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ps.title}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{ps.assignedCount}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>{ps.evaluatedCount}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: pending > 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{pending}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#38bdf8', fontWeight: 700 }}>{avg}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#f472b6', fontWeight: 700 }}>{ps.highestScore || '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVALUATE IDEAS */}
        {activeTab === 'evaluate' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#fff', fontSize: 24, margin: 0 }}>
                Pending Ideas to Evaluate ({filteredPending.length})
              </h1>
              <input
                type="text"
                placeholder="Search Idea ID, PS Code, Title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', width: 260, fontSize: 12 }}
              />
            </div>

            <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', color: '#FF9933' }}>Idea ID</th>
                    <th style={{ padding: '10px 12px' }}>Team ID</th>
                    <th style={{ padding: '10px 12px' }}>PS Code</th>
                    <th style={{ padding: '10px 12px' }}>Idea Title</th>
                    <th style={{ padding: '10px 12px' }}>Problem Statement</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px 16px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: 13 }}>
                        {loading ? 'Loading assigned submissions...' : 'No pending ideas assigned for evaluation.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPending.map(sub => (
                      <tr key={sub.id || sub.idea_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', fontWeight: 800, fontFamily: 'Courier New, monospace', color: '#FF9933' }}>{sub.idea_id}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{sub.team_id}</td>
                        <td style={{ padding: '12px', color: '#FF9933', fontWeight: 700 }}>{sub.problem_code}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{sub.idea_title}</td>
                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.problem_statement}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => startEvaluation(sub)}
                            style={{
                              background: '#FF9933',
                              color: '#000',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: 6,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: 11.5,
                              fontFamily: 'Montserrat,sans-serif'
                            }}
                          >
                            Evaluate Now &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLETED EVALUATIONS */}
        {activeTab === 'completed' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#fff', fontSize: 24, margin: 0 }}>
                Completed Evaluations ({filteredCompleted.length})
              </h1>
              <input
                type="text"
                placeholder="Search Idea ID, Team ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', width: 260, fontSize: 12 }}
              />
            </div>

            <div style={{ background: '#0a1d33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', color: '#FF9933' }}>Idea ID</th>
                    <th style={{ padding: '10px 12px' }}>Team ID</th>
                    <th style={{ padding: '10px 12px' }}>PS Code</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Criteria Breakdown</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Total Score</th>
                    <th style={{ padding: '10px 12px' }}>Feedback Notes</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompleted.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '32px 16px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: 13 }}>
                        No completed evaluations yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCompleted.map(ev => {
                      const sub = allSubmissionsMap[ev.idea_id] || { idea_id: ev.idea_id, team_id: ev.team_id, problem_code: ev.problem_code, idea_title: ev.idea_id, problem_statement: '' };
                      return (
                        <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px', fontWeight: 800, fontFamily: 'Courier New, monospace', color: '#FF9933' }}>{ev.idea_id}</td>
                          <td style={{ padding: '12px', fontWeight: 700 }}>{ev.team_id}</td>
                          <td style={{ padding: '12px', color: '#FF9933', fontWeight: 700 }}>{ev.problem_code}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                            Align:{ev.alignment_score || 0} | Innov:{ev.innovation_score || 0} | Feas:{ev.feasibility_score || 0} | Scal:{ev.scalability_score || 0} | Comp:{ev.compliance_score || 0}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
                              {ev.total_score} / 50 pts
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontSize: 11.5 }}>{ev.comments || 'No comments'}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button
                              onClick={() => startEvaluation(sub, ev)}
                              style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                            >
                              Edit Score
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* --- EVALUATION MODAL POPUP --- */}
      {selectedSubmission && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#0a1d33', border: '1px solid rgba(255,153,51,0.3)', padding: 24, borderRadius: 16, width: '100%', maxWidth: 740, maxHeight: '88vh', overflowY: 'auto', color: '#fff', fontSize: 12.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ background: '#FF9933', color: '#000', fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'Courier New, monospace' }}>
                  Idea ID: {selectedSubmission.idea_id}
                </span>
                <h3 style={{ margin: '4px 0 0', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800 }}>
                  {selectedSubmission.idea_title}
                </h3>
              </div>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Submission Details Card */}
            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 10 }}>
                <div><strong>Team ID:</strong> <span style={{ color: '#FF9933' }}>{selectedSubmission.team_id}</span></div>
                <div><strong>PS Code:</strong> <span style={{ color: '#FF9933' }}>{selectedSubmission.problem_code}</span></div>
              </div>
              <div style={{ marginBottom: 8 }}><strong>Problem Statement:</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedSubmission.problem_statement}</span></div>
              {selectedSubmission.use_case && <div style={{ marginBottom: 8 }}><strong>Real-world Use Case:</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedSubmission.use_case}</span></div>}
              {selectedSubmission.target_audience && <div style={{ marginBottom: 10 }}><strong>Target Audience:</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedSubmission.target_audience}</span></div>}

              {/* Resource Links */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {selectedSubmission.ppt_url && <a href={selectedSubmission.ppt_url} target="_blank" rel="noreferrer" style={{ color: '#4ade80', fontSize: 12, textDecoration: 'none', background: 'rgba(74,222,128,0.15)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(74,222,128,0.3)' }}>View PPT Deck (.pdf)</a>}
                {selectedSubmission.yt_link && <a href={selectedSubmission.yt_link} target="_blank" rel="noreferrer" style={{ color: '#ef4444', fontSize: 12, textDecoration: 'none', background: 'rgba(239,68,68,0.15)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)' }}>YouTube Video</a>}
                {selectedSubmission.document_link && <a href={selectedSubmission.document_link} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: 12, textDecoration: 'none', background: 'rgba(56,189,248,0.15)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(56,189,248,0.3)' }}>Drive Document</a>}
              </div>
            </div>

            {/* Evaluation Form */}
            <h4 style={{ margin: '0 0 12px', color: '#FF9933', fontSize: 14, fontFamily: 'Montserrat,sans-serif' }}>
              Evaluation Scoring (Max 50 Points)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { field: 'alignment', title: '1. Alignment with Problem (10 pts)' },
                { field: 'innovation', title: '2. Innovation & Originality (10 pts)' },
                { field: 'feasibility', title: '3. Technical Feasibility (10 pts)' },
                { field: 'scalability', title: '4. Scalability & Impact (10 pts)' },
                { field: 'compliance', title: '5. Compliance & Presentation (10 pts)' }
              ].map(item => (
                <div key={item.field} style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11.5, marginBottom: 6, fontWeight: 600 }}>{item.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={evalScores[item.field]}
                      onChange={e => handleScoreChange(item.field, e.target.value)}
                      style={{ flex: 1, accentColor: '#FF9933', cursor: 'pointer' }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={evalScores[item.field]}
                      onChange={e => handleScoreChange(item.field, e.target.value)}
                      style={{ width: 45, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 12, textAlign: 'center' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Score Summary Box */}
            <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>Calculated Total Score:</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'Montserrat,sans-serif' }}>
                {evalScores.alignment + evalScores.innovation + evalScores.feasibility + evalScores.scalability + evalScores.compliance} / 50 Points
              </span>
            </div>

            {/* Feedback Comments */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 4, color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>Evaluator Feedback Notes & Comments</label>
              <textarea
                rows="3"
                value={evalScores.comments}
                onChange={e => handleScoreChange('comments', e.target.value)}
                placeholder="Write constructively about strengths, technical flaws, or suggestions for the team..."
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedSubmission(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button disabled={submittingScore} onClick={submitEvaluation} style={{ background: '#FF9933', border: 'none', color: '#000', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12, fontFamily: 'Montserrat,sans-serif' }}>
                {submittingScore ? 'Saving Score...' : 'Submit Evaluation Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
