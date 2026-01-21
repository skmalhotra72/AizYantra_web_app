'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react'

// Mock blog data (will be replaced with Supabase data later)
const blogPosts = [
  {
    id: 1,
    slug: 'ai-transformation-healthcare-2026',
    title: 'AI Transformation in Healthcare: What to Expect in 2026',
    excerpt: 'Discover how artificial intelligence is revolutionizing patient care, diagnostics, and hospital operations. From predictive analytics to automated documentation.',
    category: 'Healthcare AI',
    author: 'Sanjeev Malhotra',
    date: '2026-01-18',
    readTime: '8 min read',
    featured: true,
    image: '/blog/healthcare-ai.jpg'
  },
  {
    id: 2,
    slug: 'voice-agents-customer-service',
    title: 'Voice Agents: The Future of Customer Service',
    excerpt: 'Learn how AI voice agents are handling customer inquiries with human-like conversations, reducing wait times and improving satisfaction scores.',
    category: 'Voice AI',
    author: 'Kunal Bellur',
    date: '2026-01-15',
    readTime: '6 min read',
    featured: false,
    image: '/blog/voice-agents.jpg'
  },
  {
    id: 3,
    slug: 'workflow-automation-roi',
    title: 'Calculating ROI on Workflow Automation Projects',
    excerpt: 'A practical guide to measuring the return on investment for your automation initiatives. Includes real-world examples and calculation frameworks.',
    category: 'Automation',
    author: 'Abdul Aziz S.K.',
    date: '2026-01-12',
    readTime: '10 min read',
    featured: false,
    image: '/blog/automation-roi.jpg'
  },
  {
    id: 4,
    slug: 'chatbot-implementation-guide',
    title: 'Complete Guide to Enterprise Chatbot Implementation',
    excerpt: 'Step-by-step guide to implementing AI chatbots in your organization. From planning to deployment and optimization.',
    category: 'Chatbots',
    author: 'Rohan Balu',
    date: '2026-01-10',
    readTime: '12 min read',
    featured: false,
    image: '/blog/chatbots.jpg'
  },
  {
    id: 5,
    slug: 'ai-readiness-assessment',
    title: 'Is Your Organization Ready for AI? A Self-Assessment Guide',
    excerpt: 'Before investing in AI, assess your organizational readiness. This guide covers data infrastructure, team capabilities, and strategic alignment.',
    category: 'Strategy',
    author: 'Sanjeev Malhotra',
    date: '2026-01-08',
    readTime: '7 min read',
    featured: false,
    image: '/blog/ai-readiness.jpg'
  },
  {
    id: 6,
    slug: 'n8n-automation-workflows',
    title: 'Building Powerful Automations with n8n: Real Examples',
    excerpt: 'Explore practical n8n workflow examples that save hours of manual work. From lead nurturing to invoice processing.',
    category: 'Automation',
    author: 'Kumar Pushpam',
    date: '2026-01-05',
    readTime: '9 min read',
    featured: false,
    image: '/blog/n8n-workflows.jpg'
  }
]

const categories = [
  { name: 'All', count: 6 },
  { name: 'Healthcare AI', count: 1 },
  { name: 'Voice AI', count: 1 },
  { name: 'Automation', count: 2 },
  { name: 'Chatbots', count: 1 },
  { name: 'Strategy', count: 1 }
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const featuredPost = blogPosts.find(post => post.featured)
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && !post.featured
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-full mb-6">
              <Tag className="w-3 h-3 text-[hsl(var(--primary))]" />
              <span className="text-xs font-mono text-[hsl(var(--foreground-muted))]">Insights & Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              AI Insights for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">Business Leaders</span>
            </h1>
            <p className="text-lg text-[hsl(var(--foreground-muted))] leading-relaxed">
              Practical guides, case studies, and thought leadership on AI implementation. No hype, just actionable insights.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.name
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                  }`}
                >
                  {category.name}
                  <span className="ml-1 opacity-60">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'All' && !searchQuery && (
        <section className="pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden hover:border-[hsl(var(--primary))] transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Placeholder */}
                  <div className="h-64 md:h-auto bg-gradient-to-br from-[hsl(var(--primary))]/20 to-[hsl(var(--accent))]/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-[hsl(var(--primary))]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Tag className="w-8 h-8 text-[hsl(var(--primary))]" />
                      </div>
                      <span className="text-sm text-[hsl(var(--foreground-muted))] font-mono">Featured Article</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-semibold rounded-full">
                        {featuredPost.category}
                      </span>
                      <span className="text-xs text-[hsl(var(--foreground-muted))] font-mono">FEATURED</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-4 group-hover:text-[hsl(var(--primary))] transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[hsl(var(--foreground-muted))] mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[hsl(var(--foreground-muted))]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.readTime}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[hsl(var(--primary))] font-medium group-hover:gap-2 transition-all">
                        Read Article
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Post Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="h-full bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden hover:border-[hsl(var(--primary))] hover:shadow-lg transition-all">
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 flex items-center justify-center">
                      <div className="w-12 h-12 bg-[hsl(var(--surface-raised))] rounded-xl flex items-center justify-center">
                        <Tag className="w-6 h-6 text-[hsl(var(--primary))]" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-medium rounded">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))] mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[hsl(var(--foreground-muted))]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[hsl(var(--surface-raised))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No articles found</h3>
              <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated on AI Trends</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get weekly insights on AI implementation, automation strategies, and industry trends delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
              <button type="submit" className="px-6 py-3 bg-white text-[hsl(var(--primary))] font-semibold rounded-xl hover:bg-white/90 transition-colors">
                Subscribe
              </button>
            </form>
            <p className="text-white/60 text-sm mt-4">No spam, unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </main>
  )
}