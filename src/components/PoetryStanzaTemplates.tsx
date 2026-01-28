import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PoetryStanza, TextAlignment } from './PoetryEditor';

export interface StanzaTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  stanzas: Omit<PoetryStanza, 'id'>[];
}

// Generate unique ID
const generateId = () => `stanza-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Pre-configured stanza templates
export const stanzaTemplates: StanzaTemplate[] = [
  {
    id: 'haiku',
    name: 'Haiku',
    description: '3 lines: 5-7-5 syllables',
    icon: '🌸',
    stanzas: [
      {
        text: 'Line one (5 syllables)\nLine two (7 syllables here)\nLine three (5 again)',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'loose'
      }
    ]
  },
  {
    id: 'sonnet',
    name: 'Sonnet',
    description: '14 lines in 3 quatrains + couplet',
    icon: '📜',
    stanzas: [
      {
        text: 'First quatrain: four lines here,\nWith alternating rhyme scheme A-B-A-B,\nEstablishing the theme so clear,\nThe opening thought for all to see.',
        alignment: 'left',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: 'Second quatrain develops more,\nWith C-D-C-D rhyme it flows,\nExploring what came before,\nAs understanding slowly grows.',
        alignment: 'left',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: 'The third quatrain brings the turn,\nE-F-E-F the pattern stays,\nNew perspective we shall learn,\nA shift in thought or phrase.',
        alignment: 'left',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: 'Final couplet seals the theme,\nG-G rhyme completes the dream.',
        alignment: 'center',
        emphasis: 'italic',
        spacing: 'loose'
      }
    ]
  },
  {
    id: 'free-verse',
    name: 'Free Verse',
    description: 'No fixed meter or rhyme',
    icon: '🦅',
    stanzas: [
      {
        text: 'Write freely here\nwithout constraints\nof rhyme or meter',
        alignment: 'left',
        emphasis: 'normal',
        spacing: 'loose'
      },
      {
        text: 'Let your thoughts flow\nas they naturally come\nbreaking lines where meaning pauses',
        alignment: 'left',
        emphasis: 'normal',
        spacing: 'loose'
      },
      {
        text: 'The poem finds its own shape.',
        alignment: 'center',
        emphasis: 'italic',
        spacing: 'normal'
      }
    ]
  },
  {
    id: 'limerick',
    name: 'Limerick',
    description: '5 lines: AABBA rhyme scheme',
    icon: '🎭',
    stanzas: [
      {
        text: "There once was a poet so bright (A)\nWho wrote through the day and the night (A)\nWith meter and rhyme (B)\nThey crafted each line (B)\nAnd filled every reader with delight (A)",
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      }
    ]
  },
  {
    id: 'villanelle',
    name: 'Villanelle',
    description: '19 lines with refrains',
    icon: '🔄',
    stanzas: [
      {
        text: 'The first refrain that will repeat (A1)\nThe second line of this tercet (B)\nThe second refrain, bittersweet (A2)',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: 'Continue with the pattern neat\nAnother middle line is set\nThe first refrain that will repeat (A1)',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: 'The structure keeps the rhythm sweet\nAs tercets form without regret\nThe second refrain, bittersweet (A2)',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: 'The final quatrain makes complete:\nThe first refrain that will repeat (A1)\nThe second refrain, bittersweet (A2)',
        alignment: 'center',
        emphasis: 'italic',
        spacing: 'loose'
      }
    ]
  },
  {
    id: 'blank-stanzas',
    name: 'Blank Canvas',
    description: 'Empty stanzas to fill',
    icon: '✨',
    stanzas: [
      {
        text: '',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: '',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      },
      {
        text: '',
        alignment: 'center',
        emphasis: 'normal',
        spacing: 'normal'
      }
    ]
  }
];

interface PoetryStanzaTemplatesProps {
  onApplyTemplate: (stanzas: PoetryStanza[]) => void;
  className?: string;
}

export const PoetryStanzaTemplates: React.FC<PoetryStanzaTemplatesProps> = ({
  onApplyTemplate,
  className
}) => {
  const handleSelectTemplate = (template: StanzaTemplate) => {
    const stanzasWithIds = template.stanzas.map(s => ({
      ...s,
      id: generateId()
    }));
    onApplyTemplate(stanzasWithIds);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles size={14} />
        <span>Quick Templates</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {stanzaTemplates.map((template) => (
          <motion.button
            key={template.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTemplate(template)}
            className="flex flex-col items-start p-3 bg-muted/50 hover:bg-muted border border-border rounded-lg text-left transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{template.icon}</span>
              <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {template.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {template.description}
            </span>
          </motion.button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Selecting a template will replace current stanzas
      </p>
    </div>
  );
};

export default PoetryStanzaTemplates;
