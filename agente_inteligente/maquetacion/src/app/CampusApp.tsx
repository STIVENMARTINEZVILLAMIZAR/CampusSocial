/**
 * CampusSocial — App de producción conectada al backend Flask + Gemini
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Calendar, FileText, Settings, Home, PenSquare, MessageSquare, Share2,
  Search, Bell, Check, Linkedin, Instagram, Facebook, Twitter, Clock, Trash2, Edit,
  Plus, Zap, Network, BarChart3, CheckCircle2, ArrowRight, Play, Eye, Save, Loader2,
  Send, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { campusApi, loadSettings, saveSettings, type Draft, type AppSettings } from '../services/api';

// Re-export UI from design system App (inline minimal set for production)
import AppDesign from './App';

const IS_DEV_PREVIEW = import.meta.env.VITE_DESIGN_PREVIEW === 'true';

export default function CampusApp() {
  if (IS_DEV_PREVIEW) {
    return <AppDesign />;
  }
  return <CampusSocialProduction />;
}

// --- Production app (imported screens logic - simplified connected version) ---
function CampusSocialProduction() {
  const [screen, setScreen] = useState('landing');
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    campusApi.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
  }, []);

  if (screen === 'landing') {
    return <LandingConnected onEnter={() => setScreen('dashboard')} apiOnline={apiOnline} />;
  }

  return (
    <DashboardConnected
      screen={screen}
      onNavigate={setScreen}
      apiOnline={apiOnline}
    />
  );
}

function LandingConnected({ onEnter, apiOnline }: { onEnter: () => void; apiOnline: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f8fafc]">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            CampusSocial
          </span>
        </motion.div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full ${apiOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {apiOnline ? '● Backend conectado' : '○ Backend offline'}
          </span>
          <button
            onClick={onEnter}
            className="px-5 py-2.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Entrar al panel
          </button>
        </div>
      </header>
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold mb-6"
        >
          Automatiza publicaciones en redes con{' '}
          <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">IA</span>
        </motion.h1>
        <p className="text-lg text-slate-600 mb-8">Campus Lands · Gemini + n8n + LinkedIn</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnter}
          className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl text-lg font-semibold shadow-lg"
        >
          Crear publicación
        </motion.button>
      </section>
    </motion.div>
  );
}

function DashboardConnected({
  screen,
  onNavigate,
  apiOnline,
}: {
  screen: string;
  onNavigate: (s: string) => void;
  apiOnline: boolean;
}) {
  const menu = [
    { id: 'dashboard', icon: Home, label: 'Inicio' },
    { id: 'new-post', icon: PenSquare, label: 'Nueva publicación' },
    { id: 'drafts', icon: FileText, label: 'Borradores' },
    { id: 'agent', icon: MessageSquare, label: 'Agente IA' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen bg-[#fafafa]">
      <aside className="w-60 border-r bg-white flex flex-col">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 border-b">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="w-9 h-9 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">CampusSocial</span>
          </motion.div>
        </motion.div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${screen === item.id ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-slate-500">
          {apiOnline ? '● Gemini activo' : '○ Inicia backend :5000'}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {screen === 'dashboard' && <DashboardHome key="dash" onNavigate={onNavigate} />}
          {screen === 'new-post' && <NewPostConnected key="post" />}
          {screen === 'drafts' && <DraftsConnected key="drafts" />}
          {screen === 'agent' && <AgentConnected key="agent" />}
          {screen === 'settings' && <SettingsConnected key="settings" />}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

function DashboardHome({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [stats, setStats] = useState({ drafts: 0, scheduled: 0 });

  useEffect(() => {
    campusApi.listDrafts().then((r) => {
      const d = r.drafts || [];
      setStats({
        drafts: d.filter((x) => x.status === 'pendiente').length,
        scheduled: d.filter((x) => x.status === 'programado').length,
      });
    }).catch(() => {});
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Panel principal</h1>
      <motion.div layout className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Borradores pendientes', value: stats.drafts, color: 'amber' },
          { label: 'Programados', value: stats.scheduled, color: 'emerald' },
          { label: 'Acción rápida', value: '+', color: 'purple' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(102,126,234,0.15)' }}
            className="bg-white border rounded-xl p-6 cursor-pointer"
            onClick={() => onNavigate(i === 2 ? 'new-post' : 'drafts')}
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate('new-post')}
        className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-medium flex items-center gap-2"
      >
        <PenSquare className="w-5 h-5" /> Nueva publicación con IA
      </motion.button>
    </motion.div>
  );
}

function NewPostConnected() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('profesional');
  const [platforms, setPlatforms] = useState({ linkedin: true, instagram: false });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ title: string; body: string; hashtags: string[] } | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [toast, setToast] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setPreview(null);
    try {
      const nets = Object.entries(platforms).filter(([, v]) => v).map(([k]) => k);
      const res = await campusApi.generateDraft({ topic, tone, platforms: nets });
      setPreview(res.preview);
      setDraftId(res.draft.id);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Error al generar');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!draftId || !scheduleDate || !scheduleTime) return;
    const settings = loadSettings();
    try {
      await campusApi.scheduleDraft({
        draft_id: draftId,
        schedule_at: `${scheduleDate}T${scheduleTime}:00`,
        platforms: Object.entries(platforms).filter(([, v]) => v).map(([k]) => k),
        content: preview?.body,
        n8n_webhook_url: settings.n8nWebhookUrl || undefined,
        n8n_webhook_secret: settings.n8nWebhookSecret || undefined,
      });
      setToast('¡Publicación programada!');
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Error al programar');
    }
  };

  const bodyText = preview
    ? `${preview.body}\n\n${(preview.hashtags || []).map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`
    : '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-6xl">
      {toast && (
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
          {toast}
          <button className="float-right" onClick={() => setToast('')}><X className="w-4 h-4" /></button>
        </motion.div>
      )}
      <h1 className="text-2xl font-bold mb-6">Nueva publicación</h1>
      <motion.div layout className="grid lg:grid-cols-2 gap-6">
        <motion.div layout className="bg-white border rounded-xl p-6 space-y-4">
          <label className="text-sm font-medium">Tema del post</label>
          <textarea
            className="w-full border rounded-xl p-3 text-sm min-h-[100px]"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: Nuevo bootcamp Campus Lands"
          />
          <select className="w-full border rounded-xl p-3 text-sm" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="profesional">Profesional</option>
            <option value="educativo">Educativo</option>
            <option value="promocional">Promocional</option>
          </select>
          <motion.div layout className="space-y-2">
            {(['linkedin', 'instagram'] as const).map((net) => (
              <label key={net} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms[net]}
                  onChange={(e) => setPlatforms({ ...platforms, [net]: e.target.checked })}
                />
                {net === 'linkedin' ? <Linkedin className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                <span className="text-sm capitalize">{net}</span>
              </label>
            ))}
          </motion.div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!topic || loading}
            onClick={handleGenerate}
            className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Generando con Gemini...' : 'Generar borrador'}
          </motion.button>
        </motion.div>
        <motion.div layout className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Eye className="w-4 h-4" /> Vista previa LinkedIn</h3>
          {!preview && !loading && (
            <p className="text-sm text-slate-500 text-center py-12">Genera contenido para ver la preview</p>
          )}
          {loading && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }} className="space-y-3">
            <motion.div className="h-4 bg-slate-200 rounded w-3/4" />
            <motion.div className="h-4 bg-slate-200 rounded w-full" />
            <motion.div className="h-32 bg-slate-100 rounded-xl" />
          </motion.div>}
          {preview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-4 bg-slate-50">
              <div className="font-semibold text-sm mb-2">{preview.title}</div>
              <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
              <p className="text-xs text-slate-500 mt-2">{bodyText.length} / 3000 caracteres</p>
            </motion.div>
          )}
          {preview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-wrap gap-3 items-end">
              <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              <input type="time" className="border rounded-lg px-3 py-2 text-sm" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              <motion.button whileHover={{ scale: 1.02 }} onClick={handleSchedule} className="px-4 py-2 bg-[#10b981] text-white rounded-xl text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Programar
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function DraftsConnected() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    campusApi.listDrafts().then((r) => setDrafts(r.drafts || [])).catch(() => setDrafts([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Borradores</h1>
      {loading ? <Loader2 className="w-8 h-8 animate-spin text-purple-600" /> : (
        <motion.div layout className="space-y-3">
          {drafts.length === 0 && <p className="text-slate-500">No hay borradores. Crea uno en Nueva publicación.</p>}
          {drafts.map((d, i) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white border rounded-xl p-4 flex justify-between items-center"
            >
              <motion.div layout>
                <div className="font-medium">{d.title || d.topic}</div>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{d.status}</span>
              </motion.div>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => campusApi.deleteDraft(d.id).then(load)} className="text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function AgentConnected() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'bot', text: '¡Hola! Soy el agente de CampusSocial para Campus Lands. ¿En qué puedo ayudarte con tus publicaciones?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const res = await campusApi.chat(userMsg, conversationId);
      setConversationId(res.conversation_id);
      setMessages((m) => [...m, { role: 'bot', text: res.response }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'bot', text: `Error: ${e instanceof Error ? e.message : 'Sin conexión al backend'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quick = ['Post LinkedIn bootcamp', 'Hashtags educación tech', 'Ideas contenido semanal'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl h-[calc(100vh-2rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-2">Agente IA</h1>
      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 w-fit">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        Conectado a Gemini
      </div>
      <motion.div layout className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 bg-white border rounded-xl flex flex-col p-4 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white' : 'bg-slate-100'}`}>
                    {msg.text}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-xl px-4 py-3 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Escribe tu mensaje..."
            />
            <motion.button whileTap={{ scale: 0.95 }} onClick={send} disabled={loading} className="px-4 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl">
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <div className="w-56 space-y-2 hidden lg:block">
          <p className="text-sm font-semibold">Acciones rápidas</p>
          {quick.map((q) => (
            <motion.button key={q} whileHover={{ x: 4 }} onClick={() => setInput(q)} className="w-full text-left text-xs p-3 bg-white border rounded-xl hover:border-purple-300">
              {q}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsConnected() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Network className="w-5 h-5" /> Webhook n8n</h3>
        <input
          className="w-full border rounded-xl px-4 py-2 text-sm"
          placeholder="https://tu-n8n.app.n8n.cloud/webhook/..."
          value={settings.n8nWebhookUrl}
          onChange={(e) => setSettings({ ...settings, n8nWebhookUrl: e.target.value })}
        />
        <input
          className="w-full border rounded-xl px-4 py-2 text-sm"
          type="password"
          placeholder="X-Campus-Secret"
          value={settings.n8nWebhookSecret}
          onChange={(e) => setSettings({ ...settings, n8nWebhookSecret: e.target.value })}
        />
      </div>
      <motion.button whileHover={{ scale: 1.02 }} onClick={handleSave} className="px-6 py-3 bg-[#10b981] text-white rounded-xl font-medium">
        {saved ? 'Guardado ✓' : 'Guardar cambios'}
      </motion.button>
    </motion.div>
  );
}
