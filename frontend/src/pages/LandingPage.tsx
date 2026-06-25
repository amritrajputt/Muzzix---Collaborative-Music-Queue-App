import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';

function LandingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">

      {/* ══════════════════════════════════════════ */}
      {/* SECTION 1 – HERO                           */}
      {/* ══════════════════════════════════════════ */}
      <section
        id="home"
        className="scroll-section relative overflow-hidden bg-black flex flex-col"
      >
        {/* Full-bleed hero image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />

        {/* Centred content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-10 md:px-14 pt-20 pb-20">

          {/* Badge */}
          <span className="px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-[10px] font-bold tracking-[0.15em] uppercase mb-6 sm:mb-8 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            COLLABORATIVE MUSIC
          </span>

          {/* Heading – scales from 3xl on mobile up to 8xl on xl screens */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.05] mb-5 sm:mb-6 max-w-3xl md:max-w-4xl">
            Your room.<br />
            <em className="text-slate-400 font-light not-italic">Your crowd.</em><br />
            One queue.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed mb-8 sm:mb-10 font-light max-w-xs sm:max-w-sm md:max-w-lg">
            Create a private space, share the link, and let everyone vote on what plays next in real time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                  Create a room
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                Create a room
              </button>
            </SignedIn>
            <button className="w-full sm:w-auto px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/25 text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all backdrop-blur-sm cursor-pointer">
              Join a room
            </button>
          </div>
        </div>

        {/* Now Playing Card – hidden on mobile, visible md+ */}
        <div className="hidden md:block absolute right-10 lg:right-14 bottom-16 w-60 lg:w-64 rounded-2xl bg-black/60 border border-white/[0.12] backdrop-blur-2xl p-4 shadow-2xl shadow-black/60 z-20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Now Playing</span>
            <div className="flex items-end gap-[3px] h-4">
              <div className="w-[3px] bg-pink-400 rounded-sm now-playing-bar-1" style={{height:'10px'}} />
              <div className="w-[3px] bg-pink-400 rounded-sm now-playing-bar-2" style={{height:'6px'}} />
              <div className="w-[3px] bg-pink-400 rounded-sm now-playing-bar-3" style={{height:'14px'}} />
              <div className="w-[3px] bg-pink-400 rounded-sm now-playing-bar-4" style={{height:'8px'}} />
              <div className="w-[3px] bg-pink-400 rounded-sm now-playing-bar-5" style={{height:'12px'}} />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-base flex-shrink-0 shadow-lg shadow-pink-500/20">
              🎵
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Stay (feat. Justin Bieber)</p>
              <p className="text-[10px] text-slate-400 truncate">The Kid LAROI, Justin Bieber</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>0:48</span><span>1:45</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-5 mb-3">
            <button className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 hover:scale-110 transition-transform cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2-8.14 4.77 3.36-4.77 3.36V9.86zM18 6h-2v12h2z"/></svg>
            </button>
          </div>
          <div className="pt-3 border-t border-white/[0.07]">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1.5">Up Next</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-300 truncate">Drops of Jupiter</p>
                <p className="text-[10px] text-slate-500 truncate">Train</p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-pink-400">↑ 12</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollTo('about')}
          className="scroll-bounce absolute bottom-5 left-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer flex flex-col items-center gap-1 border-0 bg-transparent z-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>


      {/* ══════════════════════════════════════════ */}
      {/* SECTION 2 – ABOUT                          */}
      {/* ══════════════════════════════════════════ */}
      <section id="about" className="scroll-section relative overflow-hidden bg-[#030014]">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />

        <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-5 sm:px-10 md:px-16 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">

            <div>
              <span className="px-3.5 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-400 text-[10px] font-bold tracking-[0.15em] uppercase mb-6 sm:mb-8 inline-block">
                ABOUT
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8 leading-[1.1]">
                Music is better<br />
                when everyone<br />
                gets a say.
              </h2>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-light mb-4">
                Muzix lets anyone in a room search for songs, add them to a shared queue, and vote on what plays next.
              </p>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-light">
                The most loved song always plays first automatically, in real time, for everyone listening together.
              </p>
            </div>

            {/* Stats 2×2 */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {[
                { value: '30', label: 'Songs per queue', color: 'from-pink-500/20 to-pink-500/5', accent: 'text-pink-400' },
                { value: '∞',  label: 'Listeners',        color: 'from-purple-500/20 to-purple-500/5', accent: 'text-purple-400' },
                { value: '0',  label: 'Accounts to join', color: 'from-cyan-500/20 to-cyan-500/5', accent: 'text-cyan-400' },
                { value: '1',  label: 'Vote per song',    color: 'from-indigo-500/20 to-indigo-500/5', accent: 'text-indigo-400' },
              ].map(({ value, label, color, accent }) => (
                <div key={label} className={`p-5 sm:p-8 rounded-2xl bg-gradient-to-br ${color} border border-white/[0.05] hover:border-white/[0.1] transition-all`}>
                  <div className={`text-4xl sm:text-5xl md:text-6xl font-extrabold ${accent} mb-2 tracking-tight`}>{value}</div>
                  <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => scrollTo('how-it-works')} className="scroll-bounce absolute bottom-6 left-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer flex flex-col items-center gap-1 border-0 bg-transparent">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>


      {/* ══════════════════════════════════════════ */}
      {/* SECTION 3 – HOW IT WORKS                   */}
      {/* ══════════════════════════════════════════ */}
      <section id="how-it-works" className="scroll-section relative overflow-hidden bg-[#020010]">
        <div className="glow-orb glow-orb-3" style={{ top: '20%', left: '40%' }} />

        <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-5 sm:px-10 md:px-16 py-16 md:py-20">
          <span className="px-3.5 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-bold tracking-[0.15em] uppercase mb-6 sm:mb-8 inline-block">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-10 sm:mb-16 leading-tight max-w-3xl">
            Three steps to a<br />better listening room.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { num: '01', color: 'text-pink-400', border: 'hover:border-pink-500/20', title: 'Create a space',
                desc: 'Sign in and create a private room. You get a Room ID and a password to share with whoever you want inside.' },
              { num: '02', color: 'text-purple-400', border: 'hover:border-purple-500/20', title: 'Everyone joins',
                desc: "Your guests paste the Room ID and password — no account, no sign-up. They're in the room instantly." },
              { num: '03', color: 'text-cyan-400', border: 'hover:border-cyan-500/20', title: 'The crowd decides',
                desc: 'Anyone can add a YouTube link. Everyone upvotes their favorites. The most voted song always plays next.' },
            ].map(({ num, color, border, title, desc }) => (
              <div key={num} className={`p-6 sm:p-8 rounded-2xl bg-white/[0.015] border border-white/[0.05] ${border} hover:bg-white/[0.025] transition-all relative overflow-hidden group`}>
                <span className="absolute top-4 right-5 text-7xl sm:text-8xl font-black text-white/[0.025] select-none">{num}</span>
                <div className={`text-xs font-bold uppercase tracking-widest ${color} mb-4 sm:mb-5`}>{num}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => scrollTo('pricing')} className="scroll-bounce absolute bottom-6 left-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer flex flex-col items-center gap-1 border-0 bg-transparent">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>


      {/* ══════════════════════════════════════════ */}
      {/* SECTION 4 – PRICING                        */}
      {/* ══════════════════════════════════════════ */}
      <section id="pricing" className="scroll-section relative overflow-hidden bg-[#030014]">
        <div className="glow-orb glow-orb-1" style={{ top: '-50px', left: '50%', width: '500px', height: '500px' }} />

        <div className="relative z-10 flex flex-col justify-center items-center h-full max-w-7xl mx-auto px-5 sm:px-10 md:px-16 py-16 md:py-20 text-center">
          <span className="px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-bold tracking-[0.15em] uppercase mb-6 sm:mb-8 inline-block">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4 leading-tight">
            Plans that scale with your rhythm
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-light mb-10 sm:mb-14 max-w-md">
            Start for free with friends, or unlock premium room controls.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl text-left">
            {/* Free */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.015] border border-white/[0.06] flex flex-col hover:border-slate-700/60 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Free</h3>
              <p className="text-slate-500 text-sm mb-5 sm:mb-6">Perfect for small hangouts</p>
              <div className="flex items-baseline gap-1 text-white mb-6 sm:mb-8">
                <span className="text-4xl sm:text-5xl font-black">$0</span>
                <span className="text-slate-500 text-sm">/ month</span>
              </div>
              <hr className="border-white/[0.05] mb-5 sm:mb-7" />
              <ul className="flex-1 space-y-3 text-slate-300 text-sm mb-6 sm:mb-8">
                {['1 active room at a time','15 songs per queue','Limited concurrent listeners'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer text-sm sm:text-base">
                    Get Started Free
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button className="w-full py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer text-sm sm:text-base">
                  Get Started Free
                </button>
              </SignedIn>
            </div>

            {/* Pro */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-pink-950/30 to-purple-950/20 border-2 border-pink-500/25 flex flex-col relative shadow-2xl shadow-pink-500/5 hover:border-pink-500/40 transition-all">
              <span className="absolute -top-3.5 right-5 sm:right-6 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                POPULAR
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Pro</h3>
              <p className="text-slate-500 text-sm mb-5 sm:mb-6">For active communities</p>
              <div className="flex items-baseline gap-1 text-white mb-6 sm:mb-8">
                <span className="text-4xl sm:text-5xl font-black">$3</span>
                <span className="text-slate-400 text-sm">.99 / month</span>
              </div>
              <hr className="border-white/[0.05] mb-5 sm:mb-7" />
              <ul className="flex-1 space-y-3 text-slate-300 text-sm mb-6 sm:mb-8">
                {[
                  ['Unlimited active rooms', true],
                  ['Unlimited queue size', true],
                  ['Unlimited listeners', true]
                ].map(([f, bold]) => (
                  <li key={String(f)} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    <span className={bold ? 'font-medium text-white' : ''}>{String(f)}</span>
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-pink-500/20 text-sm sm:text-base">
                    Upgrade to Pro
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-pink-500/20 text-sm sm:text-base">
                  Upgrade to Pro
                </button>
              </SignedIn>
            </div>
          </div>
        </div>

        <button onClick={() => scrollTo('contact')} className="scroll-bounce absolute bottom-6 left-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer flex flex-col items-center gap-1 border-0 bg-transparent">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>


      {/* ══════════════════════════════════════════ */}
      {/* SECTION 5 – CONTACT                        */}
      {/* ══════════════════════════════════════════ */}
      <section id="contact" className="scroll-section relative overflow-hidden bg-[#020010]">
        <div className="glow-orb glow-orb-2" />

        <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-5 sm:px-10 md:px-16 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 items-center">

            <div>
              <span className="px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-bold tracking-[0.15em] uppercase mb-6 sm:mb-8 inline-block">
                CONTACT
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight">
                Let's tune in.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light mb-6 sm:mb-8">
                Have feedback, ideas, or support requests? Drop us a note and we'll sync back shortly.
              </p>
              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-3">📍 <span>Distributed Worldwide</span></div>
                <div className="flex items-center gap-3">✉️ <span>amrit.createch@gmail.com</span></div>
              </div>
            </div>

            <form className="p-6 sm:p-8 rounded-3xl bg-white/[0.015] border border-white/[0.06] backdrop-blur-md space-y-4 sm:space-y-5 w-full" onSubmit={e => e.preventDefault()}>
              {[
                { label: 'Name', type: 'text', placeholder: 'Your name' },
                { label: 'Email', type: 'email', placeholder: 'your@email.com' },
              ].map(({ label, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
                  <input type={type} placeholder={placeholder} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/40 rounded-xl text-white text-sm outline-none transition-colors placeholder:text-slate-600" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Message</label>
                <textarea rows={4} placeholder="Tell us what you're thinking..." className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] focus:border-pink-500/40 rounded-xl text-white text-sm outline-none transition-colors resize-none placeholder:text-slate-600" />
              </div>
              <button type="submit" className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* FOOTER                                      */}
      {/* ══════════════════════════════════════════ */}
      <footer className="relative bg-black border-t border-white/[0.06] overflow-hidden">
        {/* subtle glow top-center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-16 py-14 md:py-16">

          {/* Top row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <button
                onClick={() => scrollTo('home')}
                className="text-xl font-black tracking-[0.12em] uppercase text-white border-0 bg-transparent cursor-pointer hover:opacity-70 transition-opacity p-0 mb-4 block"
              >
                MUZZIX
              </button>
              <p className="text-slate-500 text-sm leading-relaxed font-light max-w-xs">
                The collaborative music queue — where everyone in the room gets a vote on what plays next.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-4 mt-6">
                {[
                  { 
                    label: 'Twitter / X', 
                    url: 'https://x.com/amrit_xrajput', 
                    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' 
                  },
                  { 
                    label: 'Instagram', 
                    url: 'https://www.instagram.com/amrit_shing__razput', 
                    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' 
                  },
                  { 
                    label: 'GitHub', 
                    url: 'https://github.com/amritrajputt', 
                    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' 
                  },
                ].map(({ label, url, path }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Product</h4>
              <ul className="space-y-3">
                {[['Home','home'],['About','about'],['How It Works','how-it-works'],['Pricing','pricing']].map(([label, id]) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollTo(id)}
                      className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer border-0 bg-transparent p-0 font-light"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400 font-light">
                {['Privacy Policy','Terms of Service','Cookie Policy','DMCA'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Stay in tune */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Stay in Tune</h4>
              <p className="text-sm text-slate-400 font-light mb-4 leading-relaxed">
                Get notified when new features drop.
              </p>
              <form onSubmit={e => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] focus:border-pink-500/30 rounded-lg text-white text-xs outline-none transition-colors placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
                >
                  →
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} Muzzix. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Made with
              <span className="text-pink-500">♥</span>
              for music lovers everywhere.
            </span>
          </div>
        </div>
      </footer>

    </div>

  );
}

export default LandingPage;
