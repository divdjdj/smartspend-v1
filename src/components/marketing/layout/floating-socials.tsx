'use client';

import { useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ClipboardList } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InquiryForm } from '@/components/marketing/home/main/inquiry-form';

const WhatsAppIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
  </svg>
);

const SupportEmailIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CommunityIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export function FloatingSocials() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return null;
  }

  const socials = [
    {
      name: 'WhatsApp Support',
      url: 'https://wa.me/918770066995?text=Hi%2C%20I%27m%20looking%20for%20a%20subscription%20from%20your%20website.%20Could%20you%20please%20help%20me%3F',
      icon: <WhatsAppIcon className="w-5 h-5 fill-current" />,
      color: 'hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    },
    {
      name: 'Call Support',
      url: 'tel:918770066995',
      icon: <Phone className="w-5 h-5" />,
      color: 'hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-400 border-blue-500/20 bg-blue-500/5',
    },
    {
      name: 'WhatsApp Community',
      url: 'https://chat.whatsapp.com/JV2dxX7Xyje4K8Wqn1TZKk',
      icon: <CommunityIcon className="w-5 h-5" />,
      color: 'hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 text-teal-400 border-teal-500/20 bg-teal-500/5',
    },
    {
      name: 'Email Support',
      url: 'mailto:support@spendsmartsubscriptions.in',
      icon: <SupportEmailIcon className="w-5 h-5" />,
      color: 'hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 text-sky-400 border-sky-500/20 bg-sky-500/5',
    },
    {
      name: 'Send Enquiry',
      isDialog: true,
      url: '#',
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-purple-400 border-purple-500/20 bg-purple-500/5',
    },
  ];

  return (
    <div className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
      <AnimatePresence>
        {socials.map((social, index) => {
          if ('isDialog' in social && social.isDialog) {
            return (
              <Dialog key={social.name}>
                <DialogTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.12, x: -3 }}
                    className={`p-3 rounded-2xl bg-card/65 backdrop-blur-xl border border-border/10 shadow-soft transition-all duration-200 flex items-center justify-center ${social.color}`}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-purple-400" />
                      Enquiry Form
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-2">
                    <InquiryForm />
                  </div>
                </DialogContent>
              </Dialog>
            );
          }

          return (
            <motion.a
              key={social.name}
              href={social.url}
              target={social.url.startsWith('tel:') ? undefined : "_blank"}
              rel={social.url.startsWith('tel:') ? undefined : "noopener noreferrer"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ scale: 1.12, x: -3 }}
              className={`p-3 rounded-2xl bg-card/65 backdrop-blur-xl border border-border/10 shadow-soft transition-all duration-200 flex items-center justify-center ${social.color}`}
              title={social.name}
            >
              {social.icon}
            </motion.a>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
