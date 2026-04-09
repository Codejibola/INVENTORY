// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import mssnAbuadLogo from "../assets/MSSN-ABUAD-logo.webp";
import almanab from "../assets/almanab.png";
import { Twitter, Instagram, Linkedin, MessageCircle, BadgeCheck, ShieldCheck, Activity } from "lucide-react";

const REVIEWS = [
  {
    name: "Balqees. L",
    handle: "@Wura's_coat",
    platform: "Instagram",
    icon: Instagram,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Baliqees&top[]=hijab&mouth[]=smile&eyebrows[]=default", 
    text: "Quantora completely changed how I manage business sales. The profit and loss feature has been of tremendous help to me. Now, I can keep track of the profit or loss I make on each sale, and also per month. It lets me know which products are more profitable, helping me make smarter decisions.",
    location: "Market Leader",
    featured: true, 
  },
  {
    name: "Pearlz",
    handle: "@+234 814 515 9661",
    platform: "Whatsapp",
    icon: MessageCircle,
    color: "text-green-500",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Baliqees&top[]=hijab&mouth[]=smile&eyebrows[]=default", 
    text: "It's very nice and not difficult to navigate. It's the infrastructure my business needed. I especially like the receipt idea—it’s a professional standard I can definitely pay for.",
    location: "Retail Specialist",
  },
  {
    name: "MSSN ABUAD Store",
    handle: "@mssn.abuad",
    platform: "Instagram",
    icon: Instagram,
    avatar: mssnAbuadLogo, 
    text: "Quantora is an exceptionally beneficial tool for the MSSN store. The features for tracking sales, monitoring inventory, and calculating profit and loss are exactly what we need for proper record-keeping and accountability. Truly a 10/10 platform!",
    location: "Institutional Management",
    featured: true, 
  },
  {
    name: "Al-Manab Apparels",
    handle: "@almanab.apparels",
    platform: "Instagram",
    icon: Instagram,
    avatar: almanab, 
    text: "It’s a high-performance system; it clearly addresses the stress of online orders and manual tracking that holds businesses back.",
    location: "Scale Enterprise",
  },
  {
    name: "Bisi Ade",
    handle: "bisi_ade",
    platform: "Linkedin",
    icon: Linkedin,
    color: "text-blue-500",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bisi",
    text: "The worker accounts changed everything. I can finally travel while my staff runs the shop, maintaining full oversight and seeing every sale in real-time on my dashboard.",
    location: "Wholesale Operations",
  },
];

export default function Reviews() {
  return (
    <section className="bg-[#030303] py-32 text-zinc-100 overflow-hidden relative">
      {/* Sleek Background Shimmer Animation */}
      <motion.div 
        initial={{ opacity: 0.1, x: '-50%' }}
        animate={{ opacity: 0.3, x: '50%' }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-20 pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Activity size={12} className="text-indigo-500" />
            Performance Feedback
          </div>
          <h2 className="text-6xl font-black mb-6 tracking-tighter leading-[0.9] lg:text-7xl">
            Customer <br /> 
            <span className="text-indigo-500">Reviews</span>
          </h2>
          <p className="text-zinc-500 text-xl max-w-2xl font-medium leading-relaxed">
            Quantora is the infrastructure of choice for high-precision traders who require absolute data clarity to scale.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {REVIEWS.map((review, i) => {
            const PlatformIcon = review.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5, boxShadow: "0px 10px 40px -10px rgba(99, 102, 241, 0.25)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                // Use a pseudo-element for the sleek border fade-in
                className={`group relative rounded-[2rem] bg-zinc-900/40 p-8 transition-colors duration-500 hover:bg-zinc-900/80 before:absolute before:inset-0 before:rounded-[2rem] before:border before:border-transparent before:transition-colors before:duration-500 hover:before:border-indigo-500/30 ${
                  review.featured ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-indigo-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Audit Pass</span>
                      </div>
                      <PlatformIcon size={16} className={`${review.color || "text-zinc-700"} group-hover:text-indigo-400 transition-colors`} />
                    </div>

                    <p className={`text-zinc-200 font-medium tracking-tight ${review.featured ? "text-2xl leading-snug" : "text-base leading-relaxed"}`}>
                      "{review.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-zinc-800/50 pt-8 mt-12">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="w-12 h-12 rounded-xl bg-zinc-800 grayscale group-hover:grayscale-0 transition-all duration-500 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                        {review.name}
                        <BadgeCheck size={14} className="text-indigo-500 fill-indigo-500/10" />
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{review.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}