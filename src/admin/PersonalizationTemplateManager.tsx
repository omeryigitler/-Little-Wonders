import React, { useState } from 'react';
import { Layers3, Plus, Save, Sparkles, Wand2 } from 'lucide-react';
import { PersonalizationFieldBuilder } from './PersonalizationFieldBuilder';

const templates = [
  { id: 'embroidery', name: 'Standard Embroidery', used: 12, fields: ['Text', 'Color Swatches', 'Font Select'], description: 'Best for blankets, plush toys and soft personalized gifts.' },
  { id: 'engraved', name: 'Engraved Wood', used: 5, fields: ['Text', 'Date'], description: 'Best for wooden keepsakes and engraved gift items.' },
];

export const PersonalizationTemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [templateName, setTemplateName] = useState(templates[0].name);

  const selectTemplate = (template: typeof templates[number]) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-boutique-brown/10 bg-white/78 p-7 shadow-[0_20px_55px_rgba(58,37,26,0.08)] backdrop-blur-sm">
        <img src="/cloud-watercolor-pink.png" className="pointer-events-none absolute -right-12 -top-14 w-64 opacity-30 mix-blend-multiply" alt="" />
        <img src="/toy-wooden-star-solid.png" className="pointer-events-none absolute right-10 bottom-6 w-10 rotate-12 opacity-35 mix-blend-multiply" alt="" />
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-[#fffaf3] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-boutique-brown-light"><Sparkles className="h-4 w-4" /> Custom gift setup</div>
            <h1 className="font-serif text-5xl leading-none text-boutique-brown">Personalization Templates</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-boutique-brown-light">Build reusable personalization fields for embroidery, engraving, colors, names and gift details.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-boutique-brown px-5 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-boutique-wood"><Plus className="h-4 w-4" /> New Template</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-boutique-brown/10 bg-white/82 p-5 shadow-[0_20px_55px_rgba(58,37,26,0.08)] backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4df] text-boutique-brown shadow-sm"><Layers3 className="h-5 w-5" /></div><div><h2 className="font-bold text-boutique-brown">Template Library</h2><p className="text-xs text-boutique-brown-light">Reusable field groups</p></div></div>
            <div className="space-y-3">
              {templates.map((template) => {
                const isActive = selectedTemplate.id === template.id;
                return (
                  <button key={template.id} type="button" onClick={() => selectTemplate(template)} className={`relative w-full overflow-hidden rounded-[1.5rem] border p-4 text-left transition-all ${isActive ? 'border-boutique-brown bg-[#fff4df] shadow-sm ring-2 ring-boutique-brown/10' : 'border-boutique-brown/10 bg-white hover:bg-[#fffaf3]'}`}>
                    {isActive && <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -right-8 -top-10 w-32 opacity-25 mix-blend-multiply" alt="" />}
                    <div className="relative z-10 flex items-start justify-between gap-3"><div><h3 className="font-serif text-xl leading-tight text-boutique-brown">{template.name}</h3><p className="mt-1 text-xs text-boutique-brown-light">Used on {template.used} products</p></div>{isActive && <Wand2 className="h-5 w-5 text-boutique-brown" />}</div>
                    <p className="relative z-10 mt-3 text-xs leading-relaxed text-boutique-brown-light">{template.description}</p>
                    <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">{template.fields.map((field) => <span key={field} className="rounded-full border border-boutique-brown/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-boutique-brown-light shadow-sm">{field}</span>)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-boutique-brown/10 bg-white/82 p-6 shadow-[0_20px_55px_rgba(58,37,26,0.08)] backdrop-blur-sm">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-boutique-brown/10 pb-6">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-boutique-brown/55">Template name</label>
              <input type="text" value={templateName} onChange={(event) => setTemplateName(event.target.value)} className="w-full rounded-2xl border border-boutique-brown/10 bg-[#fffaf3] px-4 py-3 font-serif text-3xl text-boutique-brown outline-none focus:ring-2 focus:ring-boutique-wood/25" />
              <p className="mt-2 text-sm text-boutique-brown-light">Edit the custom fields customers complete before checkout.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-boutique-brown px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-boutique-wood"><Save className="h-4 w-4" /> Save Changes</button>
          </div>
          <PersonalizationFieldBuilder />
        </section>
      </div>
    </div>
  );
};
