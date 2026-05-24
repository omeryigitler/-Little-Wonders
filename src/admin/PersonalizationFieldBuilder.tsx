import React, { useState } from 'react';
import { Check, GripVertical, Palette, Plus, Settings, TextCursorInput, Trash, ListChecks } from 'lucide-react';

type FieldType = 'text' | 'color' | 'select' | 'date';

interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
}

const fieldTypeLabel = (type: FieldType) => {
  if (type === 'color') return 'Color Swatches';
  if (type === 'select') return 'Dropdown Options';
  if (type === 'date') return 'Date';
  return 'Short Text';
};

const fieldTypeIcon = (type: FieldType) => {
  if (type === 'color') return Palette;
  if (type === 'select') return ListChecks;
  return TextCursorInput;
};

const inputClass = 'w-full rounded-2xl border border-boutique-brown/10 bg-white px-3 py-2.5 text-sm text-boutique-brown outline-none placeholder:text-boutique-brown/35 focus:ring-2 focus:ring-boutique-wood/25';

export const PersonalizationFieldBuilder = () => {
  const [fields, setFields] = useState<Field[]>([
    { id: '1', type: 'text', label: "Baby's Name", placeholder: 'e.g. Liam', required: true },
    { id: '2', type: 'color', label: 'Thread Color', options: ['#D4AF37', '#FFC0CB', '#ADD8E6'], required: true },
  ]);

  const addField = (type: FieldType) => {
    setFields([...fields, {
      id: Math.random().toString(),
      type,
      label: type === 'color' ? 'Thread Color' : type === 'select' ? 'Choose an option' : 'Custom text',
      placeholder: type === 'text' ? 'Enter text' : undefined,
      required: false,
      options: type === 'color' ? ['#D4AF37', '#FFC0CB', '#ADD8E6'] : type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    }]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields((current) => current.map((field) => field.id === id ? { ...field, ...updates } : field));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={() => addField('text')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-boutique-brown/10 bg-white px-4 py-3 text-sm font-bold text-boutique-brown shadow-sm hover:bg-[#fff4df]"><Plus className="h-4 w-4" /> Text</button>
        <button onClick={() => addField('color')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-boutique-brown/10 bg-white px-4 py-3 text-sm font-bold text-boutique-brown shadow-sm hover:bg-[#fff4df]"><Plus className="h-4 w-4" /> Colors</button>
        <button onClick={() => addField('select')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-boutique-brown/10 bg-white px-4 py-3 text-sm font-bold text-boutique-brown shadow-sm hover:bg-[#fff4df]"><Plus className="h-4 w-4" /> Select</button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const Icon = fieldTypeIcon(field.type);
          return (
            <div key={field.id} className="relative overflow-hidden rounded-[1.5rem] border border-boutique-brown/10 bg-[#fffaf3] p-4 shadow-sm">
              <img src="/cloud-watercolor-blue-light.png" className="pointer-events-none absolute -right-10 -top-12 w-40 opacity-20 mix-blend-multiply" alt="" />
              <div className="relative z-10 flex gap-4">
                <button className="mt-12 cursor-grab text-boutique-brown/25 hover:text-boutique-brown" type="button"><GripVertical className="h-5 w-5" /></button>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-boutique-brown shadow-sm"><Icon className="h-4.5 w-4.5" /></div>
                      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-boutique-brown/55">Field {index + 1}</p><p className="text-sm font-bold text-boutique-brown">{fieldTypeLabel(field.type)}</p></div>
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-full border border-boutique-brown/10 bg-white px-3 py-2 text-xs font-bold text-boutique-brown shadow-sm">
                      <button type="button" onClick={() => updateField(field.id, { required: !field.required })} className={`flex h-5 w-5 items-center justify-center rounded-md border ${field.required ? 'border-boutique-brown bg-boutique-brown text-white' : 'border-boutique-brown/20 bg-white text-transparent'}`}><Check className="h-3.5 w-3.5" /></button>
                      Required
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div><label className="mb-2 block text-xs font-bold uppercase tracking-[0.13em] text-boutique-brown/55">Field label</label><input type="text" value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} className={inputClass} /></div>
                    <div><label className="mb-2 block text-xs font-bold uppercase tracking-[0.13em] text-boutique-brown/55">Field type</label><div className="rounded-2xl border border-boutique-brown/10 bg-white px-3 py-2.5 text-sm font-bold text-boutique-brown-light">{fieldTypeLabel(field.type)}</div></div>
                    {field.type === 'text' && <div className="md:col-span-2"><label className="mb-2 block text-xs font-bold uppercase tracking-[0.13em] text-boutique-brown/55">Placeholder</label><input type="text" value={field.placeholder || ''} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} className={inputClass} placeholder="Example shown to customer" /></div>}
                  </div>

                  {(field.type === 'color' || field.type === 'select') && (
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.13em] text-boutique-brown/55">Options</label>
                      <input type="text" value={field.options?.join(', ') || ''} onChange={(event) => updateField(field.id, { options: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} className={inputClass} placeholder="Comma separated options" />
                      {field.type === 'color' && <div className="mt-3 flex flex-wrap gap-2">{field.options?.map((color) => <span key={color} className="h-8 w-8 rounded-full border border-boutique-brown/10 shadow-sm" style={{ backgroundColor: color }} title={color} />)}</div>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" className="rounded-2xl border border-boutique-brown/10 bg-white p-2.5 text-boutique-brown shadow-sm hover:bg-[#fff4df]"><Settings className="h-4 w-4" /></button>
                  <button type="button" onClick={() => removeField(field.id)} className="rounded-2xl border border-red-100 bg-white p-2.5 text-red-500 shadow-sm hover:bg-red-50"><Trash className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {fields.length === 0 && <div className="rounded-[1.5rem] border-2 border-dashed border-boutique-brown/10 bg-[#fffaf3] py-10 text-center text-sm text-boutique-brown-light">No fields added yet. Add one above.</div>}
      </div>
    </div>
  );
};
