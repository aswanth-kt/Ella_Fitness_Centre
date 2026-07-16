import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import { 
  ChevronRight, CheckCircle2, Zap, Users, Heart, Star, 
  MapPin, Phone, Mail, MessageSquare, Flame, Trophy, 
  Activity
} from 'lucide-react';
import banner from '../assets/banner/bannerImage.png'
import { address, email, google_map_location, gym_first_name, gym_full_name, phone_number, whatsapp_number } from '../constants/constants';
import { membershipPlans } from '../constants/membershipPlans';
import GallerySection from '../components/GallerySection';
import badhushaImg from '../assets/tainerImages/badhusha_trainer.webp';
import trainerPoseDesktop from '../assets/tainerImages/trainer-img.webp';
import trainerPoseMobile from '../assets/tainerImages/tainer-img-mobile-version.webp';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleJoinClick = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  const facilities = [
    { title: 'Cardio Zone', desc: 'Premium treadmills, ellipticals, and climbmills with high-tech displays.', icon: Heart },
    { title: 'Weight Training', desc: 'Premium dumbbells up to 70kg, multi-racks, and plate-loaded machines.', icon: Trophy },
    { title: 'Functional Training', desc: 'Sled tracks, kettlebells, battle ropes, and specialized crossfit cages.', icon: Zap },
    // { title: 'Locker Facility', desc: 'Keyless electronic lockers, luxury steam showers, and vanity counters.', icon: Shield },
    { title: 'Personal Training', desc: 'One-on-one sessions with certified elite transformation coaches.', icon: Users }
  ];

  const trainers = [
    { name: 'Badhusha', role: 'Elite Strength & Conditioning', exp: '7+ Years', image: badhushaImg },
    // { name: 'Ananya Sharma', role: 'Transformation & Nutrition Specialist', exp: '6+ Years', image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=400&auto=format&fit=crop' },
  ];

  // const transformations = [
  //   { name: 'Karan J.', lost: '-18 kg', duration: '4 Months', quote: 'Olympus completely revolutionized my perspective on weight training. The elite coaches push you beyond your limits.', before: '102 kg', after: '84 kg' },
  //   { name: 'Priya R.', lost: 'Lean Muscle Gain', duration: '6 Months', quote: 'The environment is highly energetic, hygienic, and premium. The standard plan nutrition guidelines changed everything.', before: '21% BF', after: '14% BF' }
  // ];

  const testimonials = [
    { name: 'Amit Verma', rating: 5, comment: 'Undoubtedly the best luxury gym in the city. The gold design, glass layout, and cardio gear are truly world-class.', date: 'May 2026' },
    { name: 'Neha Gupta', rating: 5, comment: 'Staff is super polite, and trainers are highly certified. I love the locker rooms and steam sauna after a heavy leg workout.', date: 'April 2026' }
  ];

  return (
    <div className="bg-deep-black min-h-screen mt-10">
      {/* 1. Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image with Black Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${banner})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-deep-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-deep-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left pt-12 md:pt-0">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 px-3 py-1 rounded-full text-gold text-xs font-semibold tracking-wider uppercase mb-6"
            >
              <Flame className="h-4 w-4" />
              <span>DISCIPLINE · DEDICATION · DOMINANCE</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight"
            >
              WHERE DISCIPLINE <br />
              <span className="text-gold-gradient">MEETS DOMINANCE</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-lg md:text-xl text-gray-300 font-light leading-relaxed"
            >
              Transform your body, strengthen your mind, and unlock your full potential at {gym_full_name}. Expert guidance, proven training methods, and a motivating environment to help you achieve lasting results.

            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button 
                onClick={handleJoinClick}
                className="bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-center py-4 px-8 rounded-full shadow-lg shadow-gold/35 hover:scale-105 transition-transform duration-300 flex items-center justify-center space-x-2"
              >
                <span>START YOUR TRANSFORMATION</span>
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <a 
                href="#plans"
                className="glass border border-gold/30 text-white font-semibold text-center py-4 px-8 rounded-full hover:bg-gold/10 hover-gold-shadow transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>EXPLORE MEMBERSHIPS</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-deep-black to-transparent"></div>
      </section>

      {/* 2. About Section */}
      <section id="about" className="py-24 bg-deep-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Block */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="relative border border-gold/20 rounded-2xl overflow-hidden shadow-2xl">
                {/* <img 
                  src={trainerPose} 
                  alt="Back pose of a fitness athlete" 
                  className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                /> */}

                  <picture>
                    <source media="(max-width: 640px)" srcSet={trainerPoseMobile} />
                    <img
                      src={trainerPoseDesktop}
                      alt="Back pose of a fitness athlete"
                      className="w-full h-[450px] object-cover"
                    />
                  </picture>

                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 glass p-6 rounded-xl border border-gold/20">
                  <div className="flex items-center space-x-4">
                    <Activity className="h-10 w-10 text-gold shrink-0" />
                    <div>
                      <h4 className="text-white font-bold">DEDICATED TRAINING</h4>
                      <p className="text-xs text-gray-300 mt-1">Stay consistent with personalized support and training.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text Block */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <span className="text-gold font-bold tracking-widest text-sm uppercase">WHO WE ARE</span>
              <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white">
                WE MOLD CHAMPIONS & <span className="text-gold-gradient">REDEFINE LIMITS</span>
              </h2>
              <p className="text-gray-300 leading-relaxed font-light">
                {gym_full_name} was built for people who want to feel stronger, healthier, and more confident in their everyday lives. We believe fitness is not just about lifting weights or changing your appearance—it's about building better habits, improving your well-being, and becoming the best version of yourself.
              </p>
              <p className="text-gray-400 leading-relaxed font-light">
                At {gym_first_name}, you'll find a motivating atmosphere, experienced trainers, and the support you need to stay consistent. Whether you're taking your first step into fitness or pushing toward new goals, we're here to help you enjoy the journey and achieve lasting results.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                  <span className="text-sm font-medium text-white">Luxury Steam Saunas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                  <span className="text-sm font-medium text-white">Elite Biomechanical Gear</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                  <span className="text-sm font-medium text-white">Custom Nutrition Desk</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                  <span className="text-sm font-medium text-white">VIP Cardiorespiratory Deck</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Facilities Section */}
      <section id="facilities" className="py-24 bg-dark-gray/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold font-bold tracking-widest text-sm uppercase">FACILITIES</span>
            <h2 className="font-serif text-4xl font-extrabold mt-2 text-white">
              ELITE <span className="text-gold-gradient">AMENITIES</span>
            </h2>
            <p className="text-gray-400 text-sm mt-4 font-light">
              Train with top-tier equipment in an environment engineered to optimize safety, motivation, and athletic recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((fac, idx) => (
              <GlassCard key={idx} className="relative group overflow-hidden" delay={idx * 0.1}>
                <div className="bg-gold/10 p-4 rounded-xl text-gold w-fit mb-6 group-hover:bg-gold group-hover:text-deep-black transition-colors duration-300">
                  <fac.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{fac.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">{fac.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Membership Plans */}
      <section id="plans" className="py-24 bg-deep-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold font-bold tracking-widest text-sm uppercase">PRICING</span>
            <h2 className="font-serif text-4xl font-extrabold mt-2 text-white">
              SELECT YOUR <span className="text-gold-gradient">MEMBERSHIP</span>
            </h2>
            <p className="text-gray-400 text-sm mt-4 font-light">
              Begin your transformation today. Choose from our curated subscription options customized to fit your training timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {membershipPlans.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-2xl flex flex-col justify-between overflow-hidden p-6 lg:p-7 ${
                  p.isPopular
                    ? 'border-2 border-gold bg-gradient-to-b from-dark-gray to-deep-black shadow-xl shadow-gold/10'
                    : 'border border-gold/10 bg-dark-gray/30 hover:border-gold/30 hover-gold-shadow'
                } transition-all duration-300`}
              >
                {p.isPopular ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-premium-yellow to-gold text-deep-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    POPULAR CHOICE
                  </div>
                ) : p.badge ? (
                  <div className="absolute top-0 right-0 border border-gold/60 text-gold bg-deep-black/90 font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    {p.badge}
                  </div>
                ) : null}

                <div>
                  <span className="text-gray-400 text-sm tracking-wider font-semibold uppercase">{p.name}</span>

                  <div className="flex items-baseline mt-4 mb-1 gap-2 flex-wrap">
                    <div className="flex items-baseline">
                      <span className="text-white text-3xl font-extrabold">₹</span>
                      <span className="text-white text-5xl font-extrabold tracking-tight">{p.price}</span>
                      {p.priceSuffix && (
                        <span className="text-gray-400 text-sm font-semibold ml-1">{p.priceSuffix}</span>
                      )}
                    </div>
                    {p.originalPrice && (
                      <span className="text-gray-500 text-lg line-through font-medium">₹{p.originalPrice}</span>
                    )}
                  </div>

                  <span className="text-gold text-sm font-semibold tracking-wide uppercase block mb-1">
                    {p.duration}
                  </span>

                  {p.admissionFee && (
                    <span className="text-gray-400 text-xs font-medium tracking-wide block">
                      {p.admissionFee}
                    </span>
                  )}
                  {p.note && (
                    <span className="text-gray-500 text-xs italic block mt-1">{p.note}</span>
                  )}

                  <div className="border-t border-gold/10 pt-6 mt-5">
                    <ul className="space-y-4">
                      {p.benefits.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-3 text-sm text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => {
                      if (user) {
                        navigate('/plans');
                      } else {
                        navigate('/register');
                      }
                    }}
                    className={`w-full py-4 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${
                      p.isPopular
                        ? 'bg-gradient-to-r from-premium-yellow to-gold text-deep-black shadow-lg shadow-gold/25 hover:scale-[1.03]'
                        : 'border border-gold text-gold hover:bg-gold hover:text-deep-black'
                    }`}
                  >
                    JOIN PLAN
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trainers Section */}
      <section id="trainers" className="py-24 bg-dark-gray/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold font-bold tracking-widest text-sm uppercase">COACHES</span>
            <h2 className="font-serif text-4xl font-extrabold mt-2 text-white">
              ELITE <span className="text-gold-gradient">TRAINERS</span>
            </h2>
            <p className="text-gray-400 text-sm mt-4 font-light">
              Learn correct biomechanics and dietary strategies from our highly accredited physical trainers.
            </p>
          </div>

          <div
            className={`grid gap-8 ${
              trainers.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : trainers.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {trainers.map((t, idx) => (
              <GlassCard
                key={idx}
                className="p-0 overflow-hidden relative group"
                delay={idx * 0.1}
              >
                <div className="h-[320px] overflow-hidden relative">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent" />
                </div>

                <div className="p-6">
                  <span className="text-gold font-bold text-xs tracking-wider uppercase block">
                    {t.role}
                  </span>

                  <h3 className="text-xl font-bold text-white mt-1">
                    {t.name}
                  </h3>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 text-sm">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-medium">{t.exp}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery section */}
      <GallerySection />

      {/* 6. Transformation Stories */}
      {false && (<section id="transformations" className="py-24 bg-deep-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold font-bold tracking-widest text-sm uppercase">SUCCESS</span>
            <h2 className="font-serif text-4xl font-extrabold mt-2 text-white">
              TRANSFORMATION <span className="text-gold-gradient">STORIES</span>
            </h2>
            <p className="text-gray-400 text-sm mt-4 font-light">
              Real results from real members. Dedication, structured routines, and proper support achieve tangible outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {transformations.map((t, idx) => (
              <GlassCard key={idx} className="flex flex-col md:flex-row gap-6 items-center" delay={idx * 0.1}>
                {/* Visual stats */}
                <div className="w-full md:w-[180px] bg-gold/5 border border-gold/10 rounded-xl p-6 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Achieved</span>
                  <div className="text-3xl font-extrabold text-gold my-2">{t.lost}</div>
                  <span className="text-xs text-white bg-gold/20 px-3 py-1 rounded-full">{t.duration}</span>
                  
                  <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-white/5 text-xs">
                    <div>
                      <div className="text-gray-400">Before</div>
                      <div className="text-white font-semibold">{t.before}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">After</div>
                      <div className="text-white font-semibold">{t.after}</div>
                    </div>
                  </div>
                </div>
                {/* Review */}
                <div className="flex-1 space-y-4">
                  <div className="flex space-x-1 text-gold">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm italic text-gray-300 leading-relaxed font-light">
                    "{t.quote}"
                  </p>
                  <div className="text-sm font-bold text-white">— {t.name}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>)}

      {/* 7. Testimonials */}
      <section className="py-24 bg-dark-gray/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold font-bold tracking-widest text-sm uppercase">REVIEWS</span>
            <h2 className="font-serif text-4xl font-extrabold mt-2 text-white">
              WHAT OUR <span className="text-gold-gradient">MEMBERS SAY</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <GlassCard key={idx} delay={idx * 0.1} hoverEffect={false}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-1 text-gold">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{test.date}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-light mb-4">
                  "{test.comment}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                    {test.name[0]}
                  </div>
                  <span className="text-sm font-semibold text-white">{test.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Call To Action */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-deep-black via-dark-gray to-deep-black border-y border-gold/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.15),rgba(255,255,255,0))]"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white">
            START YOUR FITNESS <span className="text-gold-gradient">JOURNEY TODAY</span>
          </h2>
          <p className="text-gray-300 text-base max-w-2xl mx-auto font-light">
            Do not postpone your physical fitness goal. Register, pick your subscription model, verify via Razorpay test mode, and unlock immediate locker, equipment, and coach privileges.
          </p>
          <div className="pt-4">
            <button
              onClick={handleJoinClick}
              className="bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-sm tracking-wider px-8 py-4 rounded-full shadow-lg shadow-gold/30 hover:scale-105 transition-transform duration-300 inline-flex items-center space-x-2"
            >
              <span>GET STARTED NOW</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Contact Section */}
      <section id="contact" className="py-24 bg-deep-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Info */}
            <div className="space-y-8">
              <div>
                <span className="text-gold font-bold tracking-widest text-sm uppercase">GET IN TOUCH</span>
                <h2 className="font-serif text-4xl font-extrabold text-white mt-2">
                  {gym_first_name} <span className="text-gold-gradient">HEADQUARTERS</span>
                </h2>
                <p className="text-gray-400 text-sm mt-4 font-light leading-relaxed">
                  Have questions about our trainers, facilities, or payment methods? Reach out via phone or email, or drop by our facility for a guided tour.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-lg text-gold shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Location Address</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-lg text-gold shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Call Support</h4>
                    <p className="text-xs text-gray-400 mt-1">+91&nbsp;{phone_number}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-lg text-gold shrink-0">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">WhatsApp Reminders & Chat</h4>
                    <p className="text-xs text-gray-400 mt-1">+91&nbsp;{whatsapp_number}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-lg text-gold shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Email Inbox</h4>
                    <p className="text-xs text-gray-400 mt-1">{email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Embed Representation */}
            <div className="space-y-4">
              <span className="text-gray-400 font-semibold text-xs tracking-wider uppercase block">FACILITY LOCATION</span>
              <div className="relative border border-gold/20 rounded-2xl overflow-hidden shadow-2xl h-[380px] bg-dark-gray/30 flex items-center justify-center">
                {/* Embed Map representation */}
                <div className="absolute inset-0 bg-cover bg-center filter opacity-60" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562771379-eafdca7a09f7?q=80&w=600&auto=format&fit=crop')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-deep-black/60 to-deep-black/90"></div>
                <div className="relative z-10 text-center p-8 space-y-4">
                  <div className="inline-flex bg-gold/20 p-3 rounded-full text-gold mb-2 animate-bounce">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-white font-bold text-xl">{gym_full_name}, Adoor</h3>
                  <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                    Centrally located in {address}
                  </p>
                  <a 
                    href={google_map_location} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-gold hover:bg-gold-hover text-deep-black font-bold text-xs px-6 py-3 rounded-full shadow-lg transition-all"
                  >
                    OPEN IN GOOGLE MAPS
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
