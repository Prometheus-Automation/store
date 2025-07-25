import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  Award, 
  Users, 
  Twitter, 
  Github, 
  Linkedin,
  Mail,
  Zap,
  Brain,
  Bot,
  Layers
} from 'lucide-react';

interface FooterProps {
  darkMode?: boolean;
}

export default function Footer({ darkMode = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Products",
      links: [
        { name: "AI Models", href: "/models", icon: Brain },
        { name: "AI Agents", href: "/agents", icon: Bot },
        { name: "Automations", href: "/automations", icon: Layers },
        { name: "Browse All", href: "/" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Learning Center", href: "/learn" },
        { name: "Community", href: "/community" },
        { name: "API Documentation", href: "/docs" },
        { name: "Success Stories", href: "/stories" },
      ]
    },
    {
      title: "Sellers",
      links: [
        { name: "Become a Seller", href: "/seller" },
        { name: "Seller Dashboard", href: "/seller/dashboard" },
        { name: "API Integration", href: "/seller/api" },
        { name: "Revenue Share", href: "/seller/revenue" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Support", href: "/support" },
        { name: "System Status", href: "/status" },
        { name: "Feature Requests", href: "/feedback" },
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/prometheus_ai", icon: Twitter },
    { name: "GitHub", href: "https://github.com/prometheus-ai", icon: Github },
    { name: "LinkedIn", href: "https://linkedin.com/company/prometheus-ai", icon: Linkedin },
    { name: "Email", href: "mailto:hello@prometheus-automation.com", icon: Mail },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Trust badges section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Shield className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mx-auto mb-2" style={{filter: 'url(#gradient-shield)'}} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient-shield" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="font-semibold text-sm mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Stripe Secured</h3>
              <p className="text-xs text-gray-600">Bank-level encryption for all transactions</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{stroke: 'url(#gradient-check)'}} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient-check" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="font-semibold text-sm mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Verified Sellers</h3>
              <p className="text-xs text-gray-600">All AI providers are thoroughly vetted</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <Award className="w-8 h-8 mx-auto mb-2" style={{stroke: 'url(#gradient-award)'}} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient-award" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="font-semibold text-sm mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">30-Day Guarantee</h3>
              <p className="text-xs text-gray-600">Money back, no questions asked</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2" style={{stroke: 'url(#gradient-users)'}} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient-users" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="font-semibold text-sm mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">50K+ Community</h3>
              <p className="text-xs text-gray-600">Join thousands of AI enthusiasts</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-bold gradient-text">Prometheus</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Making AI accessible for everyone. From models to automations, 
                  we connect you with the best AI solutions.
                </p>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        className="w-8 h-8 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                      >
                        <IconComponent size={16} />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Links sections */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-gray-600 hover:text-blue-600 text-sm transition-colors flex items-center space-x-2 group"
                        >
                          {IconComponent && (
                            <IconComponent 
                              size={14} 
                              className="text-gray-400 group-hover:text-blue-500 transition-colors" 
                            />
                          )}
                          <span>{link.name}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-gray-600"
            >
              © {currentYear} Prometheus Automation. All rights reserved.
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm"
            >
              <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors">
                Cookie Policy
              </a>
              <a href="/security" className="text-gray-600 hover:text-blue-600 transition-colors">
                Security
              </a>
            </motion.div>
          </div>
          
          {/* Additional compliance info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center"
          >
            <p>
              Prometheus Automation is committed to responsible AI. All listed products are independently 
              developed and maintained by their respective providers. Prices subject to change. 
              <span className="font-medium">Prices as of July 2025; check provider for updates.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}