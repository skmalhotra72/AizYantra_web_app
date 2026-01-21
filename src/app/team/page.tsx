'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Linkedin, Award, Users, Target, Sparkles } from 'lucide-react'

export default function TeamPage() {
  const teamMembers = [
    {
      name: 'Sanjeev Malhotra',
      role: 'CEO & Founder',
      bio: '30+ years cross-continental operations experience. Co-founder of NirAmaya Pathlabs. Chief architect of MediBridge24x7.',
      expertise: ['Healthcare AI', 'Operations', 'Infrastructure'],
      linkedin: 'https://linkedin.com/in/sanjeevmalhotra',
      image: '/team/sanjeev.jpg',
      highlight: 'Award-winning AI healthcare platform'
    },
    {
      name: 'Kunal Bellur',
      role: 'Chief Product Officer',
      bio: 'Product leadership at Infosys & Altisource. Expert in L&D and enterprise product strategy.',
      expertise: ['Product Strategy', 'Enterprise Solutions', 'Learning & Development'],
      linkedin: 'https://linkedin.com/in/kunalbellur',
      image: '/team/kunal.jpg',
      highlight: 'Fortune 500 product experience'
    },
    {
      name: 'Aayush Arora',
      role: 'Chief Marketing Officer',
      bio: 'Marketing leader at Estée Lauder managing ₹35Cr+ budgets. Brand building expert.',
      expertise: ['Brand Strategy', 'Digital Marketing', 'Budget Management'],
      linkedin: 'https://linkedin.com/in/aayusharora',
      image: '/team/aayush.jpg',
      highlight: '₹35Cr+ marketing budgets managed'
    },
    {
      name: 'Abdul Aziz S.K.',
      role: 'Principal Product Advisor',
      bio: 'Product leader at Walmart. Achieved $70M fraud cost reduction through innovative solutions.',
      expertise: ['Product Management', 'Fraud Prevention', 'Enterprise Scale'],
      linkedin: 'https://linkedin.com/in/abdulazizsk',
      image: '/team/abdul.jpg',
      highlight: '$70M cost reduction at Walmart'
    },
    {
      name: 'Rohan Balu',
      role: 'Technical Lead',
      bio: 'Full-stack engineer with expertise in AI integration and scalable systems architecture.',
      expertise: ['Full-Stack Development', 'AI Integration', 'System Architecture'],
      linkedin: 'https://linkedin.com/in/rohanbalu',
      image: '/team/rohan.jpg',
      highlight: 'Technical architecture expert'
    },
    {
      name: 'Kumar Pushpam',
      role: 'Analytics Lead',
      bio: 'IIT BHU graduate. Data science and analytics expert with deep AI/ML knowledge.',
      expertise: ['Data Science', 'Analytics', 'Machine Learning'],
      linkedin: 'https://linkedin.com/in/kumarpushpam',
      image: '/team/kumar.jpg',
      highlight: 'IIT BHU AI/ML specialist'
    },
    {
      name: 'D. Ramdas',
      role: 'Senior Business Advisor',
      bio: 'Strategic business advisor with extensive experience in business development and operations.',
      expertise: ['Business Strategy', 'Operations', 'Advisory'],
      linkedin: 'https://linkedin.com/in/dramdas',
      image: '/team/ramdas.jpg',
      highlight: 'Strategic business growth expert'
    },
    {
      name: 'Ashwini Beloshe',
      role: 'Customer Success Lead',
      bio: 'Customer success specialist ensuring client satisfaction and long-term partnerships.',
      expertise: ['Customer Success', 'Client Relations', 'Support Operations'],
      linkedin: 'https://linkedin.com/in/ashwinibeloshe',
      image: '/team/ashwini.jpg',
      highlight: 'Client satisfaction champion'
    }
  ]

  const stats = [
    { label: 'Combined Experience', value: '100+', suffix: 'Years' },
    { label: 'Fortune 500 Alumni', value: '5', suffix: 'Members' },
    { label: 'Global Recognition', value: '3rd', suffix: 'Place' },
    { label: 'Success Rate', value: '100', suffix: '%' }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-blue-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white mb-6">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-mono font-medium text-gray-600">
                OUR TEAM
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Meet the{' '}
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Award-Winning Team
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Eight founders united by the Outskill AI Generalist Fellowship. 
              Combined experience from Fortune 500 companies, proven track record 
              of building AI systems that win global competitions.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                  <span className="text-orange-500">{stat.suffix}</span>
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 lg:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Origin Story</h2>
                  <p className="text-gray-600">How we came together to build AIzYantra</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  We met during the <strong>Outskill AI Generalist Fellowship</strong>—an intensive program 
                  that brought together AI enthusiasts from diverse backgrounds. What started as a 
                  fellowship project became something remarkable.
                </p>
                <p>
                  Together, we built <strong>MediBridge24x7</strong>, an AI-powered healthcare platform that:
                </p>
                <ul className="space-y-2 pl-5 my-4">
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Secured <strong>3rd place globally</strong> among 200+ competing teams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Won a <strong>$25,000 Google Cloud Award</strong> for technical excellence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Achieved <strong>90%+ accuracy</strong> on handwritten prescription OCR</span>
                  </li>
                </ul>
                <p>
                  That success proved something important: <strong>when you combine diverse expertise 
                  with focused execution, AI delivers real results.</strong>
                </p>
                <p>
                  In January 2026, we launched AIzYantra to help other businesses achieve similar 
                  breakthroughs. We&apos;re not consultants who just talk about AI—we&apos;re engineers who build it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 mb-4">
              <span className="text-xs font-mono font-medium text-orange-500 uppercase">
                The Founding Team
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Experience That Counts
            </h2>
            <p className="text-gray-600">
              From Fortune 500 giants to award-winning AI platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                {/* Profile Image */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-orange-400 to-blue-600">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-orange-500 font-medium mb-3">{member.role}</p>
                
                <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Expertise:</div>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-500">{member.highlight}</div>
                  <a 
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 lg:p-12 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 mb-6">
              <Users className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-mono font-medium text-orange-500 uppercase">
                Work With Us
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to Work With an Award-Winning Team?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Book a discovery call and experience our AI voice agent firsthand. 
              We&apos;ll capture your requirements and send a detailed proposal within 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors">
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors">
                <Target className="w-4 h-4" />
                View Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}