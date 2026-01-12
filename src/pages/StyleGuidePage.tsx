import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Copy, Check, Palette, Type, Layout, 
  Box, Sparkles, Layers, Code, Eye
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';

const CodeBlock = ({ code, language = "tsx" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-slate-900 text-slate-100 p-4 overflow-x-auto text-sm font-mono">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
      <pre className="whitespace-pre-wrap break-words">{code}</pre>
    </div>
  );
};

const Section = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  id 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  id: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      className="mb-20"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-nobel-gold/10 text-nobel-gold">
          <Icon size={18} />
        </div>
        <h2 className="text-2xl font-serif text-ui-blue">{title}</h2>
      </div>
      <p className="text-slate-500 mb-8 max-w-2xl">{description}</p>
      {children}
    </motion.section>
  );
};

const StyleGuidePage = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const colors = [
    { name: 'UI Blue', variable: 'ui-blue', hex: '#003366', usage: 'Primary brand color, headings' },
    { name: 'UI Dark', variable: 'ui-dark', hex: '#002244', usage: 'Dark accents, footers' },
    { name: 'Nobel Gold', variable: 'nobel-gold', hex: '#C5A059', usage: 'Accent, highlights, CTAs' },
    { name: 'Nobel Cream', variable: 'nobel-cream', hex: '#F9F8F4', usage: 'Light backgrounds' },
    { name: 'Slate 50', variable: 'slate-50', hex: '#F8FAFC', usage: 'Page backgrounds' },
    { name: 'Slate 400', variable: 'slate-400', hex: '#94A3B8', usage: 'Muted text, labels' },
    { name: 'Slate 900', variable: 'slate-900', hex: '#0F172A', usage: 'Dark text, body copy' },
  ];

  const typographyExamples = [
    { name: 'Display Heading', class: 'text-7xl font-serif', sample: 'Union Legacy' },
    { name: 'Page Title', class: 'text-5xl font-serif', sample: 'Page Title' },
    { name: 'Section Header', class: 'text-2xl font-serif', sample: 'Section Header' },
    { name: 'Card Title', class: 'text-xl font-serif font-bold', sample: 'Card Title' },
    { name: 'Body Text', class: 'text-base text-slate-600', sample: 'Body text for paragraphs and descriptions.' },
    { name: 'Label', class: 'text-xs font-bold uppercase tracking-[0.2em] text-slate-400', sample: 'Label Text' },
    { name: 'Caption', class: 'text-[9px] font-bold uppercase tracking-[0.3em]', sample: 'Caption Text' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Style Guide"
        description="Design system and component library for the UISU Archive platform."
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-nobel-gold transition-colors"
            >
              <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
              </div>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <Code size={20} className="text-ui-blue" />
              <span className="font-serif text-lg font-bold text-ui-blue">Style Guide</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Star size={16} className="text-nobel-gold" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Design System</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-ui-blue leading-tight mb-6">
              Style <span className="italic text-slate-400">Guide</span>
            </h1>
            
            <p className="text-slate-500 max-w-2xl text-lg leading-relaxed">
              A comprehensive guide to the design tokens, components, and patterns used throughout the UISU Archive platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
        
        {/* Navigation */}
        <div className="mb-16 p-4 bg-white border border-slate-200 sticky top-20 z-40">
          <div className="flex flex-wrap gap-3">
            {['colors', 'typography', 'buttons', 'cards', 'badges', 'inputs', 'animations'].map(section => (
              <a
                key={section}
                href={`#${section}`}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-ui-blue hover:bg-slate-50 transition-colors"
              >
                {section}
              </a>
            ))}
          </div>
        </div>

        {/* Colors */}
        <Section
          id="colors"
          title="Colors"
          description="The color palette defines the visual identity of the platform. Use these consistently across all interfaces."
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map(color => (
              <div key={color.name} className="bg-white border border-slate-200 p-4">
                <div 
                  className="w-full h-20 mb-4 border border-slate-100"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="font-serif text-lg text-ui-blue mb-1">{color.name}</p>
                <p className="text-xs font-mono text-slate-500 mb-2">{color.hex}</p>
                <p className="text-xs text-slate-400">{color.usage}</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <code className="text-xs bg-slate-100 px-2 py-1 text-slate-600">
                    {color.variable.includes('-') ? `bg-${color.variable}` : `bg-${color.variable}`}
                  </code>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <CodeBlock code={`// Tailwind usage
<div className="bg-ui-blue text-white">Primary</div>
<div className="bg-nobel-gold text-ui-blue">Accent</div>
<div className="text-slate-400">Muted text</div>`} />
          </div>
        </Section>

        {/* Typography */}
        <Section
          id="typography"
          title="Typography"
          description="Typography uses Playfair Display for headings (serif) and Inter for body text (sans-serif)."
          icon={Type}
        >
          <div className="bg-white border border-slate-200 divide-y divide-slate-100">
            {typographyExamples.map(example => (
              <div key={example.name} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="md:w-40 flex-shrink-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{example.name}</p>
                  <code className="text-[10px] text-slate-500 mt-1 block">{example.class}</code>
                </div>
                <div className={`${example.class} text-ui-blue`}>
                  {example.sample}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <CodeBlock code={`// Font families
font-serif  → Playfair Display (headings)
font-sans   → Inter (body text)

// Example usage
<h1 className="text-5xl font-serif text-ui-blue">
  Page <span className="italic text-slate-400">Title</span>
</h1>
<p className="text-slate-500 text-lg leading-relaxed">
  Body paragraph text...
</p>`} />
          </div>
        </Section>

        {/* Buttons */}
        <Section
          id="buttons"
          title="Buttons"
          description="Button styles for various actions and contexts."
          icon={Box}
        >
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-2"><Eye size={14} /> Preview</TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2"><Code size={14} /> Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="bg-white border border-slate-200 p-8 space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button>Default Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button className="bg-nobel-gold text-ui-blue font-bold uppercase tracking-widest px-6 py-3 hover:bg-white hover:shadow-lg transition-all">
                    Gold CTA
                  </button>
                  <button className="bg-ui-blue text-white font-bold uppercase tracking-widest px-6 py-3 hover:bg-ui-dark transition-all">
                    Primary CTA
                  </button>
                  <button className="border-2 border-ui-blue text-ui-blue font-bold uppercase tracking-widest px-6 py-3 hover:bg-ui-blue hover:text-white transition-all">
                    Outline CTA
                  </button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock code={`// Using shadcn Button component
import { Button } from '@/components/ui/button';

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Custom styled buttons
<button className="bg-nobel-gold text-ui-blue font-bold uppercase tracking-widest px-6 py-3 hover:bg-white hover:shadow-lg transition-all">
  Gold CTA
</button>

<button className="bg-ui-blue text-white font-bold uppercase tracking-widest px-6 py-3 hover:bg-ui-dark transition-all">
  Primary CTA
</button>`} />
            </TabsContent>
          </Tabs>
        </Section>

        {/* Cards */}
        <Section
          id="cards"
          title="Cards"
          description="Card patterns for displaying content and information."
          icon={Layout}
        >
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-2"><Eye size={14} /> Preview</TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2"><Code size={14} /> Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Standard Card</CardTitle>
                    <CardDescription>Card description text here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm">Card content goes here with supporting information.</p>
                  </CardContent>
                </Card>

                {/* Colored Top Border Card */}
                <div className="bg-white border border-slate-200 border-t-4 border-t-nobel-gold p-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nobel-gold mb-2">Featured</p>
                  <h3 className="font-serif text-xl text-ui-blue mb-2">Accent Border Card</h3>
                  <p className="text-slate-500 text-sm">With gold top border accent.</p>
                </div>

                {/* Dark Card */}
                <div className="bg-ui-blue text-white p-6">
                  <Sparkles size={20} className="text-nobel-gold mb-4" />
                  <h3 className="font-serif text-xl mb-2">Dark Card</h3>
                  <p className="text-slate-300 text-sm">For emphasis and contrast.</p>
                </div>

                {/* Hover Card */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:border-slate-300 transition-all"
                >
                  <h3 className="font-serif text-xl text-ui-blue mb-2">Interactive Card</h3>
                  <p className="text-slate-500 text-sm">Hover for lift effect.</p>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock code={`// shadcn Card component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle className="font-serif">Card Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Custom styled card with accent
<div className="bg-white border border-slate-200 border-t-4 border-t-nobel-gold p-6">
  <h3 className="font-serif text-xl text-ui-blue">Title</h3>
</div>

// Interactive card with motion
<motion.div 
  whileHover={{ y: -4 }}
  className="bg-white border border-slate-200 p-6 cursor-pointer hover:shadow-xl transition-all"
>
  Content
</motion.div>`} />
            </TabsContent>
          </Tabs>
        </Section>

        {/* Badges */}
        <Section
          id="badges"
          title="Badges & Labels"
          description="Badges for categorization and status indication."
          icon={Layers}
        >
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-2"><Eye size={14} /> Preview</TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2"><Code size={14} /> Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="bg-white border border-slate-200 p-8 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-nobel-gold text-ui-blue text-[10px] font-bold uppercase tracking-widest">
                    Featured
                  </span>
                  <span className="px-3 py-1 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest">
                    New
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                    Archive
                  </span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock code={`// shadcn Badge
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>

// Custom styled badges
<span className="px-3 py-1 bg-nobel-gold text-ui-blue text-[10px] font-bold uppercase tracking-widest">
  Featured
</span>`} />
            </TabsContent>
          </Tabs>
        </Section>

        {/* Inputs */}
        <Section
          id="inputs"
          title="Form Inputs"
          description="Input styles for forms and user interaction."
          icon={Box}
        >
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-2"><Eye size={14} /> Preview</TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2"><Code size={14} /> Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="bg-white border border-slate-200 p-8 space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Standard Input</label>
                  <Input placeholder="Enter text..." />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Styled</label>
                  <input 
                    type="text"
                    placeholder="Custom input..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-nobel-gold focus:ring-2 focus:ring-nobel-gold/20 transition-all"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock code={`// shadcn Input
import { Input } from '@/components/ui/input';

<Input placeholder="Enter text..." />

// Custom styled input
<input 
  type="text"
  placeholder="Custom input..."
  className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-nobel-gold focus:ring-2 focus:ring-nobel-gold/20 transition-all"
/>`} />
            </TabsContent>
          </Tabs>
        </Section>

        {/* Animations */}
        <Section
          id="animations"
          title="Animations"
          description="Motion patterns using Framer Motion for smooth interactions."
          icon={Sparkles}
        >
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-2"><Eye size={14} /> Preview</TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2"><Code size={14} /> Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div className="bg-white border border-slate-200 p-8 space-y-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Hover Lift</p>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="w-32 h-32 bg-ui-blue flex items-center justify-center text-white cursor-pointer"
                  >
                    Hover me
                  </motion.div>
                </div>
                
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Scroll Reveal</p>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-6 bg-slate-100 border border-slate-200"
                  >
                    Scroll into view animation
                  </motion.div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <CodeBlock code={`import { motion, useInView } from 'framer-motion';

// Hover lift effect
<motion.div 
  whileHover={{ y: -8, scale: 1.02 }}
  className="..."
>
  Content
</motion.div>

// Scroll reveal with staggered delay
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-50px" });

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 40 }}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  transition={{ duration: 0.5, delay: index * 0.08 }}
>
  Content
</motion.div>`} />
            </TabsContent>
          </Tabs>
        </Section>

      </div>
    </div>
  );
};

export default StyleGuidePage;
