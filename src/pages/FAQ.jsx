import { useEffect, useRef, useState, useMemo } from 'react';

/* ═══════════════════════════════════════════════
   SHARED UTILITIES
═══════════════════════════════════════════════ */
function FloatingParticles({ count = 10 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 41 + 7) % 95 + 2}%`,
      size: (i % 3) + 2,
      duration: 11 + (i % 6) * 2.5,
      delay: -((i * 3.3) % 10),
      color: i % 3 === 0 ? 'rgba(255,153,51,0.4)' : i % 3 === 1 ? 'rgba(19,136,8,0.3)' : 'rgba(255,255,255,0.18)',
    })), [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', bottom: '-8px', left: p.left,
          width: p.size, height: p.size, borderRadius: '50%', background: p.color,
          animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ═══════════════════════════════════════════════
   FAQ DATA by category
═══════════════════════════════════════════════ */
const faqCategories = [
  {
    id: 'about',
    label: 'About SVH',
    icon: '🎯',
    color: '#FF9933',
    faqs: [
      {
        q: 'What is SVH 2026?',
        a: 'SVH 2026 (Smart VIT Hackathon) is an internal collegiate hackathon organized by the Blockchain Club, VIT Bhopal. It is designed to emulate the structure, judging criteria, and standards of the prestigious national-level Smart India Hackathon (SIH), acting as a preparatory platform for students aspiring to compete in SIH.',
      },
      {
        q: 'Who organizes SVH 2026?',
        a: 'SVH 2026 is organized by the Blockchain Club, VIT Bhopal, with support from IIC VIT Bhopal, the SW Office, and VIT Bhopal University. The Faculty Coordinator is Dr. Hemraj Lamkuche.',
      },
      {
        q: 'Is SVH 2026 open to all students?',
        a: 'Yes! SVH 2026 is open to all currently enrolled students of VIT Bhopal University. There are no department or year restrictions.',
      },
    ],
  },
  {
    id: 'registration',
    label: 'Registration',
    icon: '📝',
    color: '#138808',
    faqs: [
      {
        q: 'What is the registration period?',
        a: 'Registration is open from 1 July to 20 July 2026 — a 20-day window. Make sure to register before the deadline as late registrations will not be accepted.',
      },
      {
        q: 'What is the registration fee?',
        a: 'The registration fee is ₹75 per participant, which translates to ₹450 per team of six members. The fee is non-refundable once submitted.',
      },
      {
        q: 'How do I register?',
        a: 'Teams must register through the official SVH 2026 portal. All 6 team members must be listed at the time of registration. Look out for the official registration link announcement on the Blockchain Club social media handles.',
      },
    ],
  },
  {
    id: 'team',
    label: 'Team Composition',
    icon: '👥',
    color: '#06038D',
    faqs: [
      {
        q: 'What is the required team size?',
        a: 'Each team must consist of exactly 6 members. Teams with fewer or more members will not be accepted.',
      },
      {
        q: 'Is there a gender diversity requirement?',
        a: 'Yes. Aligning strictly with Smart India Hackathon norms, a minimum of 1 female team member is mandatory for all teams. Teams without at least one female member will be disqualified.',
      },
      {
        q: 'Can I change team members after registration?',
        a: 'Team composition changes after registration are generally not permitted. Any exceptional circumstances will need to be communicated to the organizing team at blockchainclub@vitbhopal.ac.in before the PPT submission deadline.',
      },
    ],
  },
  {
    id: 'rounds',
    label: 'Event Rounds',
    icon: '🏁',
    color: '#FF9933',
    faqs: [
      {
        q: 'Can a team apply for more than one problem statement?',
        a: 'Yes. Teams are permitted to select and submit PPT proposals for up to 2 different problem statements. However, if qualified, a team will build a prototype for only one chosen problem statement in the Grand Finale.',
      },
      {
        q: 'What should the Round 1 PPT submission include?',
        a: 'Your PPT must cover: (1) Clear understanding of the problem statement, (2) Proposed solution approach and core value proposition, (3) Technical architecture, tech stack, and methodology, (4) Expected real-world impact, feasibility, and scale, and (5) Step-by-step implementation roadmap.',
      },
      {
        q: 'What is the structure of the Grand Finale?',
        a: 'The Grand Finale is a two-day offline prototype development sprint at VIT Bhopal. Unlike the standard 36-hour SIH format, SVH runs a compressed 12-hour format: 6 hours of development per day × 2 days. Teams build a functional prototype and present it to an expert panel.',
      },
      {
        q: 'How many teams qualify for the Grand Finale?',
        a: 'An expert panel evaluates all PPT submissions. The top 5 teams from each of the 12 problem statements qualify — a maximum of 60 finalist teams in total. The PPT evaluation period is 5–10 August 2026.',
      },
      {
        q: 'Are On-Duty (OD) permissions provided?',
        a: 'The prototype development Grand Finale is subject to institutional approval for official On-Duty (OD) permissions. Detailed announcements regarding OD policies will be made closer to the event. Coordinate with your faculty advisor in advance.',
      },
    ],
  },
  {
    id: 'evaluation',
    label: 'Evaluation & Results',
    icon: '⚖️',
    color: '#138808',
    faqs: [
      {
        q: 'What are the evaluation criteria for Round 1?',
        a: 'PPT submissions are judged on: Problem Understanding, Innovation & Creativity, Feasibility of Solution, Technical Approach, and Presentation Quality. Each criterion carries equal weight.',
      },
      {
        q: 'What are the evaluation criteria for the Grand Finale?',
        a: 'Prototypes are judged on: Technical Implementation, Functionality & Working Prototype, Innovation & Scalability, User Experience, and Final Demonstration & Presentation.',
      },
      {
        q: 'When will results be announced?',
        a: 'Round 1 results will be announced shortly after the PPT evaluation period (5–10 August 2026). Shortlisted teams will be notified through the official SVH portal and Blockchain Club social media channels.',
      },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates & Awards',
    icon: '🏆',
    color: '#06038D',
    faqs: [
      {
        q: 'What certificates will participants receive?',
        a: 'All eligible participants who complete the PPT submission receive a Participation Certificate. Teams shortlisted for the Grand Finale get a Shortlisting Certificate. The Grand Finale features Winner and Runner-Up recognition, plus a Special Innovation Award.',
      },
      {
        q: 'Will there be prizes for winners?',
        a: 'Yes. The Grand Finale will feature Winner, Runner-Up, and Special Innovation Recognition awards. Details about specific prizes will be announced closer to the Grand Finale.',
      },
    ],
  },
];

/* ═══════════════════════════════════════════════
   FAQ ITEM COMPONENT
═══════════════════════════════════════════════ */
function FAQItem({ question, answer, index, color, isOpen, onToggle }) {
  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${isOpen ? color + '50' : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 14, overflow: 'hidden',
      transition: 'all 0.25s ease',
      boxShadow: isOpen ? `0 8px 28px ${color}14` : '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', background: isOpen ? `${color}06` : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
        }}
      >
        {/* Number badge */}
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: isOpen ? color : `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 11,
          color: isOpen ? '#fff' : color, transition: 'all 0.22s',
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>

        <span style={{
          flex: 1, fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
          fontSize: 'clamp(13px,1.8vw,15px)', color: isOpen ? color : '#0f2942',
          lineHeight: 1.4, transition: 'color 0.2s', textAlign: 'left',
        }}>
          {question}
        </span>

        {/* Chevron */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          border: `1.5px solid ${color}35`,
          background: isOpen ? color : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.22s',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#fff' : color} strokeWidth="3"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      <div style={{
        maxHeight: isOpen ? '500px' : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '0 20px 18px 64px' }}>
          <p style={{
            fontFamily: 'Poppins,sans-serif', color: '#666', fontSize: 13.5,
            lineHeight: 1.8, margin: 0,
          }}>
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FAQ CATEGORY SECTION
═══════════════════════════════════════════════ */
function FAQCategory({ category, openId, setOpenId, index }) {
  const [ref, visible] = useInView(0.08);

  return (
    <div ref={ref} style={{
      marginBottom: 52,
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(28px)',
      transition: `all 0.65s ease ${index * 0.08}s`,
    }}>
      {/* Category header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22,
        paddingBottom: 16,
        borderBottom: `2px solid ${category.color}18`,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${category.color}12`, border: `1.5px solid ${category.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
        }}>
          {category.icon}
        </div>
        <div>
          <div style={{ color: category.color, fontSize: 10, fontFamily: 'Montserrat,sans-serif', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>
            Category
          </div>
          <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#0f2942', fontSize: 'clamp(18px,2.5vw,22px)', margin: 0 }}>
            {category.label}
          </h2>
        </div>
        <div style={{ marginLeft: 'auto', padding: '4px 14px', background: `${category.color}10`, border: `1px solid ${category.color}25`, borderRadius: 20, color: category.color, fontSize: 11, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, flexShrink: 0 }}>
          {category.faqs.length} {category.faqs.length === 1 ? 'Q' : 'Qs'}
        </div>
      </div>

      {/* FAQ items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {category.faqs.map((faq, i) => {
          const id = `${category.id}-${i}`;
          return (
            <FAQItem
              key={id}
              question={faq.q}
              answer={faq.a}
              index={i}
              color={category.color}
              isOpen={openId === id}
              onToggle={() => setOpenId(openId === id ? null : id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN FAQ PAGE
═══════════════════════════════════════════════ */
export default function FAQ() {
  const [mounted, setMounted] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const a = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  });

  const totalFAQs = faqCategories.reduce((sum, c) => sum + c.faqs.length, 0);

  const filteredCategories = activeCategory === 'all'
    ? faqCategories
    : faqCategories.filter(c => c.id === activeCategory);

  return (
    <div style={{ width: '100%', background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #07192c 0%, #0f2942 55%, #07192c 100%)',
        padding: '80px 20px 90px',
        overflow: 'hidden',
      }}>
        <FloatingParticles count={12} />
        <div style={{ position: 'absolute', top: '15%', left: '4%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(255,153,51,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '4%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(19,136,8,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33% 66.66%, #138808 66.66%)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...a(80), display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', background: 'rgba(255,153,51,0.12)', border: '1px solid rgba(255,153,51,0.3)', borderRadius: 40, marginBottom: 24 }}>
            <span style={{ fontSize: 14 }}>❓</span>
            <span style={{ color: '#FF9933', fontSize: 11, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>SVH 2026 FAQ</span>
          </div>

          <h1 style={{ ...a(200), margin: '0 0 16px', fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 'clamp(30px,5.5vw,60px)', color: '#fff', lineHeight: 1.05, letterSpacing: -1 }}>
            Frequently Asked{' '}
            <span style={{ background: 'linear-gradient(90deg, #FF9933 0%, #ffffff 50%, #138808 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Questions
            </span>
          </h1>

          <p style={{ ...a(360), color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(14px,2vw,17px)', fontFamily: 'Poppins,sans-serif', maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.75 }}>
            Got questions about SVH 2026? We've got answers. Browse by category or scroll through all {totalFAQs} questions below.
          </p>

          {/* Stats bar */}
          <div style={{ ...a(480), display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: totalFAQs, label: 'Questions' },
              { val: faqCategories.length, label: 'Categories' },
              { val: '1 min', label: 'Read time each' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, backdropFilter: 'blur(6px)' }}>
                <div style={{ color: '#FF9933', fontSize: 22, fontWeight: 900, fontFamily: 'Montserrat,sans-serif' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 20px', position: 'sticky', top: 63, zIndex: 100, overflowX: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 0, whiteSpace: 'nowrap' }}>
          {[{ id: 'all', label: 'All Questions', icon: '📋', color: '#0f2942' }, ...faqCategories].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '14px 18px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 12,
                  color: isActive ? (cat.color || '#FF9933') : '#888',
                  borderBottom: isActive ? `2.5px solid ${cat.color || '#FF9933'}` : '2.5px solid transparent',
                  transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FAQ CONTENT ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '52px 16px 80px' }}>
        {filteredCategories.map((category, i) => (
          <FAQCategory
            key={category.id}
            category={category}
            openId={openId}
            setOpenId={setOpenId}
            index={i}
          />
        ))}

        {/* Bottom CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2942, #07192c)',
          borderRadius: 20, padding: '40px 32px', textAlign: 'center',
          border: '1.5px solid rgba(255,153,51,0.2)',
          marginTop: 16,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
          <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: 'clamp(18px,3vw,24px)', margin: '0 0 12px' }}>
            Still have questions?
          </h3>
          <p style={{ fontFamily: 'Poppins,sans-serif', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Reach out to the Blockchain Club directly. We're happy to help with any queries about registration, problem statements, or the event process.
          </p>
          <a href="mailto:blockchainclub@vitbhopal.ac.in"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', background: 'linear-gradient(135deg, #FF9933, #e07800)',
              color: '#fff', borderRadius: 8, fontFamily: 'Montserrat,sans-serif',
              fontWeight: 800, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase',
              letterSpacing: 1, boxShadow: '0 6px 20px rgba(255,153,51,0.4)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(255,153,51,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,153,51,0.4)'; }}>
            📧 Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
