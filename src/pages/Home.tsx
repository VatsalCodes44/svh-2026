import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Metrics from '../components/Metrics';
import Organizers from '../components/Organizers';
import { Megaphone, FileImage, ShieldCheck, CheckSquare, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const introRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Scroll Animations
    const ctx = gsap.context(() => {
      // Intro Text Animation
      gsap.fromTo(".what-is-text",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 80%",
          }
        }
      );

      // Stat Cards Animation
      gsap.fromTo(".stat-card",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          delay: 0.2,
          scrollTrigger: {
            trigger: flowRef.current,
            start: "top 70%",
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const steps = [
    { 
      date: "1 – 20 July 2026", 
      title: "Registration", 
      desc: "Teams of 6 members must register. Minimum 1 female team member is mandatory. Registration fee is ₹75 per participant (₹450 per team). Notes: 20 days duration.", 
      icon: <Megaphone className="w-6 h-6 text-white" /> 
    },
    { 
      date: "20 July – 5 Aug 2026", 
      title: "Round 1: PPT Submission", 
      desc: "Teams select and work on one of the available problem statements (up to 2). Submit a presentation explaining problem understanding, proposed solution, technical architecture, impact, and implementation roadmap. Notes: 16 days duration.", 
      icon: <FileImage className="w-6 h-6 text-white" /> 
    },
    { 
      date: "5 – 10 Aug 2026", 
      title: "Round 1: PPT Evaluation", 
      desc: "Rigorous review of submitted PPTs by an internal evaluation panel. The panel shortlists the top 5 teams per problem statement for the Grand Finale.", 
      icon: <ShieldCheck className="w-6 h-6 text-white" /> 
    },
    { 
      date: "TBD (soon after 10 Aug)", 
      title: "Results Announcement", 
      desc: "The shortlist of top finalist teams advancing to the Grand Finale will be officially announced across internal boards.", 
      icon: <CheckSquare className="w-6 h-6 text-white" /> 
    },
    { 
      date: "24–25 Aug 2026 (tentative)", 
      title: "Round 2: Grand Finale (Prototype)", 
      desc: "Shortlisted finalist teams (up to 60 teams/6 members each) build and demonstrate a functional prototype based on their proposal. A 2-day compressed hackathon format with 12 hours of hands-on building time. Subject to institute approval for On-Duty (OD) permissions.", 
      icon: <Award className="w-6 h-6 text-white" /> 
    }
  ];

  return (
    <div className="w-full">
      {/* What is SVH Section */}
      <section ref={introRef} className="pt-20 pb-16 px-4 lg:px-8 max-w-[1400px] mx-auto overflow-hidden">
        <h1 className="what-is-text text-4xl md:text-5xl font-black font-inter text-[#0f2942] uppercase tracking-tight mb-8 border-l-8 border-sih-orange pl-4">
          What is SVH?
        </h1>
        <div className="what-is-text bg-[#fce4c0]/30 p-8 rounded-xl border border-[#fce4c0] shadow-sm flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <p className="text-gray-700 font-roboto text-lg leading-loose text-justify font-medium">
              The Blockchain Club, VIT Bhopal is organizing SVH 2026 (Smart VIT Hackathon), an internal hackathon inspired by the structure and methodology of the Smart India Hackathon (SIH). The event aims to provide students with a realistic SIH-like experience by exposing them to problem-statement-based innovation, proposal development, pitching, and rapid prototype creation.
            </p>
            <p className="text-gray-700 font-roboto text-lg leading-loose text-justify font-medium">
              SVH 2026 has been designed as a preparatory platform for students who aspire to participate in Smart India Hackathon and other national-level innovation competitions. Through multiple rounds of evaluation and mentorship, participants will gain hands-on experience in solving real-world challenges while developing technical, presentation, and teamwork skills.
            </p>
            <p className="text-gray-700 font-roboto text-lg leading-loose text-justify font-medium">
              The event will be conducted in two stages: a PPT Submission Round and a Prototype Development Round. Teams will work on selected problem statements and progress through a structured evaluation process similar to SIH.
            </p>
          </div>
          <div className="w-full md:w-80 shrink-0 bg-[#0f2942] text-white p-6 rounded-xl border border-[#ea580c]/30 shadow-md">
            <h3 className="text-xl font-bold font-inter text-sih-orange mb-4">Faculty Coordinator</h3>
            <p className="text-lg font-bold font-inter text-white">Dr Hemraj Lamkuche</p>
            <p className="text-sm text-gray-300 mt-2 text-justify">
              Guiding students through SIH-like evaluation standards and mentoring teams towards successful prototype building.
            </p>
          </div>
        </div>
      </section>

      {/* Main Split Flow & Stats Section */}
      <section id="process-flow" className="py-16 px-4 lg:px-8 max-w-[1400px] mx-auto bg-white border-t border-gray-100">

        <div className="flex flex-col xl:flex-row gap-12">

          {/* Left Column: Process Flow (Rebuilt from scratch to match detailed vertically aligned timeline block) */}
          <div className="flex-1" ref={flowRef}>
            <h2 className="text-3xl font-black font-inter text-sih-orange uppercase tracking-tight mb-10">
              SVH PROCESS FLOW AND TIMELINE
            </h2>

            <div className="relative border-l-4 border-[#0ea5e9] ml-8 space-y-12 pb-8">
              {steps.map((step, idx) => (
                <div key={idx} className="relative pl-10 pr-4">
                  {/* Circle Node */}
                  <div className="absolute -left-[18px] top-1 w-8 h-8 rounded-full bg-sih-navy border-4 border-white flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 bg-sih-orange rounded-full"></div>
                  </div>

                  {/* Content */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="inline-block px-3 py-1 bg-[#fce4c0] text-[#0f2942] text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                      {step.date}
                    </span>
                    <h3 className="text-xl font-bold font-inter text-[#0f2942] mb-3">{step.title}</h3>
                    <p className="text-gray-600 font-roboto text-sm leading-relaxed text-justify">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Internal Hackathons Stats */}
          <div className="w-full xl:w-[450px] flex flex-col pt-[5.5rem]">
            <div className="bg-[#0f2942] rounded-2xl p-8 shadow-xl sticky top-32 overflow-hidden border-2 border-[#0ea5e9]/20 relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-sih-orange blur-3xl opacity-20"></div>

              <h3 className="text-white text-3xl font-black font-inter tracking-tight mb-8">Internal Hackathons</h3>

              <div className="flex flex-col gap-6 mb-10">
                {/* Stat 1 */}
                <div className="stat-card flex items-center bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-sih-orange rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white text-3xl font-black">12</span>
                  </div>
                  <div className="ml-4">
                    <span className="text-white font-bold font-inter leading-tight block">PROBLEM <br /> STATEMENTS</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="stat-card flex items-center bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-[#16a34a] rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white text-3xl font-black">6</span>
                  </div>
                  <div className="ml-4 flex flex-col">
                    <span className="text-white font-bold font-inter uppercase tracking-wide">Members/Team</span>
                    <span className="text-sih-orange text-[10px] font-black tracking-widest mt-1">MAX FINALISTS: 60 TEAMS</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="stat-card flex items-center bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-[#0ea5e9] rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white text-3xl font-black">₹75</span>
                  </div>
                  <div className="ml-4 flex flex-col">
                    <span className="text-white font-bold font-inter uppercase tracking-wide">Per Participant</span>
                    <span className="text-gray-300 text-[10px] font-bold tracking-widest mt-1 uppercase">₹450 Per Team</span>
                  </div>
                </div>
              </div>

              <Link to="/" className="stat-card group relative w-full flex justify-center items-center px-8 py-5 font-black text-white bg-gradient-to-r from-sih-orange to-[#ea580c] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-1">
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative text-xl tracking-widest uppercase">REGISTER NOW</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Metrics />
      <Organizers />

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
