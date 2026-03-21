// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import mssnAbuadLogo from "../assets/MSSN-ABUAD-logo.webp";
import almanab from "../assets/almanab.png";
import { Twitter, Instagram, Linkedin, MessageCircle, BadgeCheck } from "lucide-react";


const REVIEWS = [
  {
    name: "Balqees. L",
    handle: "@Wura's_coat",
    platform: "Instagram",
    icon: Instagram,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Baliqees&top[]=hijab&mouth[]=smile&eyebrows[]=default", 
    text: "Quantora completely changed how I manage business sales. The profit and loss feature has been of tremendous help to me. Now, I can keep track of the profit or loss I make on each sale, and also per month. It lets me know which products are more profitable, helping me make smarter decisions.",
    location: "Online Boutique",
  },
  {
    name: "Pearlz",
    handle: "@+234 814 515 9661",
    platform: "Whatsapp",
    icon: MessageCircle,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Baliqees&top[]=hijab&mouth[]=smile&eyebrows[]=default", 
    text: "It's very nice and not difficult to navigate. It seems like it's really going to help my business. I especially like the receipt idea—it’s something I can definitely pay for",
    location: "Online Vendor",
  },
  {
    name: "MSSN ABUAD Store",
    handle: "@mssn.abuad",
    platform: "Instagram",
    icon: Instagram,
    avatar: mssnAbuadLogo, 
    text: "Quantora is an exceptionally beneficial tool for the MSSN store. The features for tracking sales, monitoring inventory, and calculating profit and loss are exactly what we need for proper record-keeping and accountability. While there is a slight learning curve, the system is robust and effectively supports our management needs. Truly a 10/10 platform!",
    location: "Institutional Store",
  },
  {
    name: "Al-Manab Apparels",
    handle: "@almanab.apparels",
    platform: "Instagram",
    icon: Instagram,
    avatar: almanab, 
    text: "It’s a nice system; it clearly addresses the stress of online orders and manual tracking",
  },
  {
    name: "Bisi Ade",
    handle: "bisi_ade",
    platform: "Linkedin",
    icon: Linkedin,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bisi",
    text: "The worker accounts changed everything. I can finally travel while my staff runs the shop, and I see every sale in real-time on my dashboard.",
    location: "Wholesale Distribution",
  },
];

export default function Reviews() {
  return (
    <section className="bg-zinc-950 py-28 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Trusted by Traders Everywhere</h2>
          <p className="text-zinc-400 text-lg">
            Join hundreds of business owners who have upgraded their terminal.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => {
            const PlatformIcon = review.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative"
              >
                {/* Verified Badge */}
                <div className="flex items-center gap-1 text-indigo-400 mb-6 text-sm font-medium">
                  <BadgeCheck size={16} />
                  <span>Verified User</span>
                </div>

                <p className="text-zinc-300 italic mb-8 leading-relaxed">
                  "{review.text}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700"
                    />
                    <div>
                      <h4 className="font-bold text-white">{review.name}</h4>
                      <p className="text-xs text-zinc-500">{review.location}</p>
                    </div>
                  </div>
                  
                  {/* Social Reference */}
                  <div className="text-right">
                    <PlatformIcon size={18} className="text-zinc-500 ml-auto mb-1" />
                    <span className="text-[10px] font-mono text-zinc-600 block">
                      {review.handle}
                    </span>
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
