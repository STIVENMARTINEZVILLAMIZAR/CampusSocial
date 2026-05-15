import React, { useState } from 'react';
import {
  Sparkles, Calendar, FileText, Settings,
  Home, PenSquare, MessageSquare, Share2,
  Search, Bell, ChevronDown, X, Check,
  Linkedin, Instagram, Facebook, Twitter,
  Clock, Trash2, Edit, Send, Plus,
  Zap, Network, BarChart3, CheckCircle2,
  ArrowRight, Play, Eye, Save, Loader2,
  Filter, Copy, Download, Mail, LogOut,
  Upload, Image, Video, FileUp, CalendarClock,
  AlarmClock, Globe, ChevronRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================================
// DESIGN SYSTEM - COMPONENTES REUTILIZABLES
// ============================================================================

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    success: 'bg-[#10b981] text-white hover:bg-[#059669] hover:shadow-lg hover:shadow-emerald-500/30',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border-2 border-border bg-transparent hover:bg-accent'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
            {icon}
          </div>
        )}
        <input 
          className={`w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-destructive' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

// Textarea Component
interface TextareaProps extends React.TextAreaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <textarea 
        className={`w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed resize-none
          ${error ? 'border-destructive' : ''}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select 
        className={`w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer
          ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// Toggle Component
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div 
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2]' : 'bg-switch-background'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div 
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </label>
  );
};

// Checkbox Component
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled = false, icon }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        onClick={() => !disabled && onChange(!checked)}
        className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
          ${checked ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] border-transparent' : 'border-input bg-input-background'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-ring'}`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <div className="flex items-center gap-2">
        {icon && <span className="w-4 h-4 text-muted-foreground">{icon}</span>}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    </label>
  );
};

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-card border border-border rounded-xl p-6 transition-all duration-200 
      ${hover ? 'hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200' : 'shadow-sm'}
      ${className}`}>
      {children}
    </div>
  );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-accent/30">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Toast Notification (simple implementation)
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  show: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', show }) => {
  if (!show) return null;
  
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <X className="w-5 h-5 text-red-600" />,
    info: <Sparkles className="w-5 h-5 text-blue-600" />
  };
  
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

// Loading Skeleton
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  );
};

// ============================================================================
// PANTALLA 1: LANDING PAGE
// ============================================================================

const LandingPage: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              CampusSocial
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Ver demo</Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('login')}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="purple">🚀 Potenciado por IA</Badge>
            <h1 className="text-5xl font-bold leading-tight">
              Automatiza tus publicaciones en redes con{' '}
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Inteligencia Artificial
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              La plataforma todo-en-uno para equipos de marketing educativo. 
              Genera contenido, programa publicaciones y conecta con tu audiencia en LinkedIn, Instagram y más.
            </p>
            <div className="flex items-center gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                icon={<PenSquare />}
                onClick={() => onNavigate('new-post')}
              >
                Crear publicación
              </Button>
              <Button variant="outline" size="lg" icon={<Play />}>
                Ver demo
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Setup en 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Sin tarjeta de crédito</span>
              </div>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
            <Card className="relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Linkedin className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                      <Twitter className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-accent/50 p-4 rounded-xl space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas en una plataforma</h2>
          <p className="text-muted-foreground">Potencia tu estrategia de contenido con tecnología de última generación</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card hover>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Agente IA Gemini</h3>
              <p className="text-muted-foreground">
                Genera contenido atractivo y profesional en segundos. 
                Nuestro agente entiende tu marca y crea posts optimizados para cada red social.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copy persuasivo y relevante</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Imágenes generadas con IA</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Hashtags inteligentes</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card hover>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Network className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Automatización n8n</h3>
              <p className="text-muted-foreground">
                Conecta tu flujo de trabajo con cientos de herramientas. 
                Automatiza aprobaciones, notificaciones y más con n8n integrado.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Workflows personalizables</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Notificaciones Telegram</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Integraciones ilimitadas</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card hover>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Publicación Oficial LinkedIn</h3>
              <p className="text-muted-foreground">
                Publica directamente en LinkedIn con integración oficial vía Postiz. 
                Sin límites, sin riesgos, 100% compatible con las APIs de LinkedIn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>API oficial LinkedIn</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Programación avanzada</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Análisis de rendimiento</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Cómo funciona</h2>
          <p className="text-muted-foreground">De la idea a la publicación en 4 pasos simples</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { num: '1', icon: <PenSquare />, title: 'Escribe el tema', desc: 'Describe brevemente el tema de tu publicación' },
            { num: '2', icon: <Sparkles />, title: 'IA genera contenido', desc: 'El agente crea copy profesional e imagen' },
            { num: '3', icon: <Eye />, title: 'Revisa y edita', desc: 'Previsualiza en tiempo real y ajusta' },
            { num: '4', icon: <Calendar />, title: 'Programa publicación', desc: 'Selecciona fecha/hora y publica' }
          ].map((step, i) => (
            <div key={i} className="relative">
              <Card hover className="text-center">
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-xl opacity-30" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center">
                      {step.icon && React.cloneElement(step.icon as React.ReactElement, { className: 'w-7 h-7 text-white' })}
                    </div>
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-card border-2 border-purple-500 rounded-full flex items-center justify-center font-bold text-sm text-purple-600">
                    {step.num}
                  </div>
                  <h4 className="font-semibold">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </Card>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-purple-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">CampusSocial</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Campus Lands - Educación Tecnológica Colombia
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// PANTALLA 2: LOGIN + DASHBOARD SHELL (Sidebar + Topbar)
// ============================================================================

const DashboardShell: React.FC<{
  children: React.ReactNode;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onLogout?: () => void;
}> = ({ children, activeScreen, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: <Home />, label: 'Inicio' },
    { id: 'new-post', icon: <PenSquare />, label: 'Nueva publicación' },
    { id: 'manual-post', icon: <Upload />, label: 'Subir publicación' },
    { id: 'drafts', icon: <FileText />, label: 'Borradores' },
    { id: 'calendar', icon: <Calendar />, label: 'Calendario' },
    { id: 'agent', icon: <MessageSquare />, label: 'Agente IA' },
    { id: 'channels', icon: <Share2 />, label: 'Canales' },
    { id: 'settings', icon: <Settings />, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              CampusSocial
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${activeScreen === item.id 
                  ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/30' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
            >
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              CL
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Campus Lands</div>
              <div className="text-xs text-muted-foreground">Marketing</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex-1 max-w-md">
            <Input 
              placeholder="Buscar publicaciones, borradores..." 
              icon={<Search />}
              className="bg-accent/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-accent rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
              CL
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA 3: NUEVA PUBLICACIÓN (Core Screen)
// ============================================================================

const NewPostScreen: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('profesional');
  const [networks, setNetworks] = useState({
    linkedin: true,
    instagram: false,
    facebook: false,
    twitter: false
  });
  const [generateImage, setGenerateImage] = useState(true);
  const [sendTelegram, setSendTelegram] = useState(true);
  const [activeTab, setActiveTab] = useState('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasContent(true);
    }, 2000);
  };

  const handleSchedule = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const mockContent = {
    text: "🚀 ¿Quieres dominar el desarrollo web en 2024?\n\nEn Campus Lands, transformamos principiantes en desarrolladores profesionales en solo 6 meses.\n\n✅ Bootcamp intensivo Full Stack\n✅ Proyectos reales para portafolio\n✅ Mentoría personalizada\n✅ Conexión directa con empresas tech\n\nNuestra metodología práctica te prepara para el mercado laboral desde el día uno.\n\n📍 Bucaramanga, Colombia\n🔗 Cupos limitados para próxima cohorte\n\n#DesarrolloWeb #Bootcamp #TechEducation #CampusLands #ProgramaciónColombia",
    chars: 462
  };

  return (
    <div className="h-full bg-accent/20">
      <Toast message="¡Publicación programada exitosamente!" type="success" show={showToast} />
      
      <div className="max-w-[1400px] mx-auto p-6 h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Nueva publicación</h1>
          <p className="text-muted-foreground">Crea contenido atractivo con ayuda de IA</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100%-8rem)]">
          {/* Left Panel - Form */}
          <Card className="overflow-y-auto">
            <div className="space-y-6">
              <Textarea
                label="Tema del post"
                placeholder="Ej: Lanzamiento nuevo bootcamp de desarrollo web en Bucaramanga"
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <Select
                label="Tono de voz"
                options={[
                  { value: 'profesional', label: 'Profesional' },
                  { value: 'educativo', label: 'Educativo' },
                  { value: 'promocional', label: 'Promocional' }
                ]}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Redes sociales</label>
                <div className="space-y-3 bg-accent/50 p-4 rounded-xl">
                  <Checkbox
                    label="LinkedIn"
                    checked={networks.linkedin}
                    onChange={(checked) => setNetworks({...networks, linkedin: checked})}
                    icon={<Linkedin className="w-4 h-4 text-blue-600" />}
                  />
                  <Checkbox
                    label="Instagram"
                    checked={networks.instagram}
                    onChange={(checked) => setNetworks({...networks, instagram: checked})}
                    icon={<Instagram className="w-4 h-4 text-pink-600" />}
                  />
                  <Checkbox
                    label="Facebook"
                    checked={networks.facebook}
                    onChange={(checked) => setNetworks({...networks, facebook: checked})}
                    icon={<Facebook className="w-4 h-4 text-blue-500" />}
                  />
                  <Checkbox
                    label="X (Twitter)"
                    checked={networks.twitter}
                    onChange={(checked) => setNetworks({...networks, twitter: checked})}
                    icon={<Twitter className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="space-y-3 bg-accent/50 p-4 rounded-xl">
                <Toggle
                  label="Generar imagen con IA"
                  checked={generateImage}
                  onChange={setGenerateImage}
                />
                <Toggle
                  label="Enviar preview a Telegram"
                  checked={sendTelegram}
                  onChange={setSendTelegram}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="primary" 
                  className="flex-1"
                  icon={isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  onClick={handleGenerate}
                  disabled={!topic || isGenerating}
                >
                  {isGenerating ? 'Generando...' : 'Generar borrador'}
                </Button>
                <Button variant="ghost" onClick={() => {
                  setTopic('');
                  setHasContent(false);
                }}>
                  Limpiar
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Panel - Preview */}
          <Card>
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Vista previa</h3>
                <Badge variant="purple">LinkedIn</Badge>
              </div>

              {/* Network Tabs */}
              <div className="flex gap-2 border-b border-border pb-2">
                {Object.entries(networks).map(([network, enabled]) => {
                  if (!enabled) return null;
                  const icons = {
                    linkedin: <Linkedin className="w-4 h-4" />,
                    instagram: <Instagram className="w-4 h-4" />,
                    facebook: <Facebook className="w-4 h-4" />,
                    twitter: <Twitter className="w-4 h-4" />
                  };
                  return (
                    <button
                      key={network}
                      onClick={() => setActiveTab(network)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${activeTab === network 
                          ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white' 
                          : 'bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {icons[network as keyof typeof icons]}
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* LinkedIn Preview */}
              <div className="flex-1 overflow-y-auto">
                {!hasContent && !isGenerating && (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                        <Eye className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Escribe un tema y genera contenido para ver la vista previa
                      </p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                )}

                {hasContent && !isGenerating && (
                  <div className="space-y-4">
                    {/* LinkedIn Post Mock */}
                    <div className="bg-white border border-border rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                          CL
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Campus Lands</div>
                          <div className="text-xs text-muted-foreground">Educación Tecnológica • Hace 1m</div>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                        {mockContent.text}
                      </p>
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl h-64 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-sm font-medium text-purple-900">Imagen generada por IA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
                        <span>👍 245 reacciones</span>
                        <span>💬 18 comentarios</span>
                        <span>🔄 32 compartidos</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-accent rounded-xl">
                      <span className="text-sm text-muted-foreground">Caracteres</span>
                      <span className="text-sm font-medium">
                        {mockContent.chars} / 3000
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sticky Bottom Bar */}
        {hasContent && (
          <div className="fixed bottom-0 left-60 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-40"
                />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" icon={<Save />}>
                  Guardar borrador
                </Button>
                <Button 
                  variant="success" 
                  icon={<Calendar />}
                  onClick={handleSchedule}
                  disabled={!scheduledDate || !scheduledTime}
                >
                  Programar publicación
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA: SUBIR PUBLICACIÓN MANUAL
// ============================================================================

const ManualPostScreen: React.FC = () => {
  const [postText, setPostText] = useState('');
  const [networks, setNetworks] = useState({ linkedin: true, instagram: false, facebook: false, twitter: false });
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('schedule');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; preview?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activePreview, setActivePreview] = useState<'linkedin' | 'instagram' | 'facebook' | 'twitter'>('linkedin');
  const [repeatMode, setRepeatMode] = useState('none');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const charLimits: Record<string, number> = { linkedin: 3000, instagram: 2200, facebook: 63206, twitter: 280 };
  const networkColors: Record<string, string> = {
    linkedin: 'text-blue-600', instagram: 'text-pink-600', facebook: 'text-blue-500', twitter: 'text-foreground'
  };
  const networkIcons: Record<string, React.ReactNode> = {
    linkedin: <Linkedin className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />
  };

  const activeNetworks = Object.entries(networks).filter(([, v]) => v).map(([k]) => k);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const mapped = files.map(f => ({
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      preview: f.type.startsWith('image') ? URL.createObjectURL(f) : undefined
    }));
    setUploadedFiles(prev => [...prev, ...mapped]);
  };

  const removeFile = (idx: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== idx));

  const notify = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSchedule = () => {
    if (scheduleMode === 'schedule' && (!scheduledDate || !scheduledTime)) {
      notify('Selecciona fecha y hora para programar.');
      return;
    }
    if (activeNetworks.length === 0) {
      notify('Selecciona al menos una red social.');
      return;
    }
    if (!postText.trim()) {
      notify('El contenido no puede estar vacío.');
      return;
    }
    notify(scheduleMode === 'now' ? '¡Publicación enviada exitosamente!' : `¡Publicación programada para el ${scheduledDate} a las ${scheduledTime}!`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="h-full bg-accent/20 overflow-y-auto">
      <Toast message={toastMsg} type="success" show={showToast} />

      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Subir publicación</h1>
            <p className="text-muted-foreground text-sm">Crea y programa contenido manualmente sin IA</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Las publicaciones programadas se envían via <strong>n8n + Postiz</strong></span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-5">

            {/* Content editor */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Contenido del post</h3>
                  {activeNetworks.length > 0 && (
                    <span className={`text-xs font-medium ${postText.length > (charLimits[activePreview] ?? 3000) ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {postText.length} / {charLimits[activePreview] ?? '–'}
                    </span>
                  )}
                </div>
                <textarea
                  placeholder="Escribe aquí el contenido de tu publicación..."
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground leading-relaxed"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {['😊', '🚀', '✅', '💡', '🎯', '🔥', '📌', '💬'].map(e => (
                    <button key={e} onClick={() => setPostText(p => p + e)}
                      className="w-8 h-8 text-lg hover:bg-accent rounded-lg transition-colors">{e}</button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">Emojis rápidos</span>
                </div>
              </div>
            </Card>

            {/* Media Upload */}
            <Card>
              <div className="space-y-4">
                <h3 className="font-semibold">Medios adjuntos</h3>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-[#667eea] bg-purple-50' : 'border-border hover:border-[#667eea]/50 hover:bg-accent/50'}`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2]' : 'bg-accent'}`}>
                    <FileUp className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Arrastra archivos aquí o <span className="text-[#667eea]">haz clic para seleccionar</span></p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, MP4 — máx. 10 MB por archivo</p>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent px-3 py-1.5 rounded-lg">
                      <Image className="w-3.5 h-3.5" />Imagen
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent px-3 py-1.5 rounded-lg">
                      <Video className="w-3.5 h-3.5" />Video
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden"
                    onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />
                </div>

                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden bg-accent aspect-square">
                        {f.preview ? (
                          <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Video className="w-8 h-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate px-2 text-center">{f.name}</span>
                          </div>
                        )}
                        <button onClick={() => removeFile(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs p-1.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {f.name}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#667eea]/50 hover:bg-accent/50 transition-all cursor-pointer">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Añadir</span>
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Redes sociales */}
            <Card>
              <div className="space-y-4">
                <h3 className="font-semibold">Redes de destino</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(networks) as (keyof typeof networks)[]).map(net => (
                    <button key={net} onClick={() => setNetworks(prev => ({ ...prev, [net]: !prev[net] }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all font-medium text-sm
                        ${networks[net]
                          ? 'border-[#667eea] bg-purple-50 text-[#667eea]'
                          : 'border-border bg-transparent text-muted-foreground hover:border-border/80 hover:bg-accent/40'}`}>
                      <span className={networks[net] ? networkColors[net] : ''}>{networkIcons[net]}</span>
                      {net.charAt(0).toUpperCase() + net.slice(1)}
                      {networks[net] && <Check className="w-4 h-4 ml-auto text-[#667eea]" />}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN — Scheduling */}
          <div className="space-y-5">

            {/* Scheduling card */}
            <Card>
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[#667eea]" />
                  <h3 className="font-semibold">Programación</h3>
                </div>

                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-accent rounded-xl">
                  {([['now', 'Publicar ahora'], ['schedule', 'Programar']] as const).map(([mode, label]) => (
                    <button key={mode} onClick={() => setScheduleMode(mode)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all
                        ${scheduleMode === mode
                          ? 'bg-white shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {scheduleMode === 'now' && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Publicación inmediata</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Se enviará a las redes seleccionadas ahora mismo</p>
                    </div>
                  </div>
                )}

                {scheduleMode === 'schedule' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Fecha</label>
                      <input type="date" min={today} value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Hora</label>
                      <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-muted-foreground" />Zona horaria
                      </label>
                      <select value={timezone} onChange={e => setTimezone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="America/Bogota">Colombia (UTC-5)</option>
                        <option value="America/Mexico_City">México (UTC-6)</option>
                        <option value="America/Lima">Perú (UTC-5)</option>
                        <option value="America/Argentina/Buenos_Aires">Argentina (UTC-3)</option>
                        <option value="Europe/Madrid">España (UTC+1)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    {/* Repeat */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <AlarmClock className="w-4 h-4 text-muted-foreground" />Repetir
                      </label>
                      <select value={repeatMode} onChange={e => setRepeatMode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="none">Sin repetición</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="biweekly">Cada 2 semanas</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>

                    {scheduledDate && scheduledTime && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                        <p className="text-xs font-medium text-purple-800 flex items-center gap-1.5">
                          <CalendarClock className="w-4 h-4" />Programado para
                        </p>
                        <p className="text-sm font-semibold text-purple-900 mt-1">
                          {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('es-CO', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-purple-600 mt-0.5">{timezone.replace('_', ' ')}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Preview mini */}
            <Card>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Vista previa</h3>
                {activeNetworks.length > 0 ? (
                  <>
                    <div className="flex gap-1.5 flex-wrap">
                      {activeNetworks.map(net => (
                        <button key={net} onClick={() => setActivePreview(net as typeof activePreview)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${activePreview === net ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>
                          {networkIcons[net]}{net.charAt(0).toUpperCase() + net.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="bg-white border border-border rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">CL</div>
                        <div>
                          <div className="text-xs font-semibold">Campus Lands</div>
                          <div className="text-[11px] text-muted-foreground">Ahora</div>
                        </div>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed text-foreground">
                        {postText || <span className="text-muted-foreground italic">El texto aparecerá aquí...</span>}
                      </p>
                      {uploadedFiles.length > 0 && uploadedFiles[0].preview && (
                        <img src={uploadedFiles[0].preview} className="w-full rounded-lg object-cover max-h-32" alt="preview" />
                      )}
                      {uploadedFiles.length > 0 && !uploadedFiles[0].preview && (
                        <div className="bg-accent rounded-lg h-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Video className="w-4 h-4" />{uploadedFiles[0].name}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs text-right font-medium ${postText.length > charLimits[activePreview] ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {postText.length} / {charLimits[activePreview]} caracteres
                    </div>
                  </>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-2 text-center">
                    <Eye className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">Selecciona una red social para ver la vista previa</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button variant="primary" className="w-full" size="lg"
                icon={scheduleMode === 'now' ? <Send /> : <CalendarClock />}
                onClick={handleSchedule}
                disabled={!postText.trim() || activeNetworks.length === 0}>
                {scheduleMode === 'now' ? 'Publicar ahora' : 'Programar publicación'}
              </Button>
              <Button variant="outline" className="w-full" icon={<Save />}
                onClick={() => notify('Borrador guardado correctamente')}
                disabled={!postText.trim()}>
                Guardar como borrador
              </Button>
            </div>

            {/* Pipeline info */}
            <div className="p-4 bg-accent/60 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline de publicación</p>
              {[
                { icon: <Save className="w-3.5 h-3.5" />, label: 'CampusSocial', desc: 'Almacena y programa' },
                { icon: <ChevronRight className="w-3.5 h-3.5" />, label: 'n8n', desc: 'Automatiza el flujo' },
                { icon: <ChevronRight className="w-3.5 h-3.5" />, label: 'Postiz', desc: 'Publica en LinkedIn' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-[#667eea]">{s.icon}</span>
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">— {s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA 4: BORRADORES
// ============================================================================

const DraftsScreen: React.FC = () => {
  const [filter, setFilter] = useState('todos');
  
  const drafts = [
    { id: 1, title: 'Bootcamp Desarrollo Web Q1 2024', networks: ['linkedin', 'instagram'], status: 'pendiente', date: '2024-01-15' },
    { id: 2, title: 'Testimonios estudiantes egresados', networks: ['linkedin'], status: 'programado', date: '2024-01-18' },
    { id: 3, title: 'Workshop IA y Machine Learning', networks: ['linkedin', 'facebook', 'twitter'], status: 'aprobado', date: '2024-01-20' },
  ];

  const statusColors = {
    pendiente: 'warning',
    aprobado: 'success',
    programado: 'purple'
  } as const;

  const networkIcons = {
    linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
    instagram: <Instagram className="w-4 h-4 text-pink-600" />,
    facebook: <Facebook className="w-4 h-4 text-blue-500" />,
    twitter: <Twitter className="w-4 h-4" />
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Borradores</h1>
        <p className="text-muted-foreground">Gestiona tus publicaciones guardadas y programadas</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {['todos', 'pendientes', 'programados'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === f 
                ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg' 
                : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Título</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Redes</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Fecha</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map(draft => (
                <tr key={draft.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium">{draft.title}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {draft.networks.map(net => (
                        <div key={net} className="w-6 h-6">
                          {networkIcons[net as keyof typeof networkIcons]}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={statusColors[draft.status as keyof typeof statusColors]}>
                      {draft.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {new Date(draft.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State (conditional) */}
      {drafts.length === 0 && (
        <Card className="mt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay borradores</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera publicación para verla aquí</p>
            <Button variant="primary" icon={<Plus />}>
              Nueva publicación
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// PANTALLA 5: CALENDARIO
// ============================================================================

const CalendarScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(15);
  
  const scheduledPosts = {
    15: [
      { id: 1, title: 'Bootcamp Q1 2024', network: 'linkedin', time: '09:00' },
      { id: 2, title: 'Instagram Stories', network: 'instagram', time: '14:00' }
    ],
    18: [
      { id: 3, title: 'Testimonios estudiantes', network: 'linkedin', time: '10:00' }
    ],
    22: [
      { id: 4, title: 'Workshop IA', network: 'linkedin', time: '11:00' },
      { id: 5, title: 'Facebook post', network: 'facebook', time: '15:00' }
    ]
  };

  const daysInMonth = 31;
  const firstDayOffset = 2; // ejemplo: mes empieza en miércoles

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Calendario Editorial</h1>
          <p className="text-muted-foreground">Visualiza y organiza tus publicaciones programadas</p>
        </div>
        <Button variant="primary" icon={<Plus />}>
          Nueva publicación
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Enero 2024</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Anterior</Button>
              <Button variant="ghost" size="sm">Siguiente</Button>
            </div>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const posts = scheduledPosts[day as keyof typeof scheduledPosts] || [];
              const isSelected = selectedDay === day;
              const hasContent = posts.length > 0;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square p-2 rounded-xl border transition-all relative
                    ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-border hover:border-purple-300'}
                    ${hasContent ? 'bg-purple-50/50' : 'bg-card'}
                  `}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {hasContent && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                      {posts.slice(0, 3).map(post => (
                        <div key={post.id} className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Sidebar - Selected Day Posts */}
        <Card>
          <h3 className="font-semibold mb-4">
            {selectedDay ? `${selectedDay} de Enero` : 'Selecciona un día'}
          </h3>
          
          {selectedDay && scheduledPosts[selectedDay as keyof typeof scheduledPosts] ? (
            <div className="space-y-3">
              {scheduledPosts[selectedDay as keyof typeof scheduledPosts].map(post => (
                <div key={post.id} className="p-3 bg-accent/50 rounded-xl hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{post.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.time}
                      </div>
                    </div>
                    {post.network === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600" />}
                    {post.network === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                    {post.network === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="flex-1 px-2 py-1 bg-card rounded-lg text-xs hover:bg-accent transition-colors">
                      Editar
                    </button>
                    <button className="px-2 py-1 text-red-600 text-xs hover:bg-red-50 rounded-lg transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No hay publicaciones programadas</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA 6: AGENTE IA (Chat Gemini)
// ============================================================================

const AgentScreen: React.FC = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy el asistente IA de CampusSocial. ¿En qué puedo ayudarte hoy?' },
    { role: 'user', text: 'Necesito ideas para posts sobre nuestro bootcamp de desarrollo web' },
    { role: 'bot', text: 'Excelente! Aquí te comparto algunas ideas para promocionar tu bootcamp:\n\n1. **Historia de transformación**: Comparte el antes y después de un estudiante\n2. **Estadísticas de empleabilidad**: % de egresados empleados en < 3 meses\n3. **Sneak peek del currículo**: Muestra tecnologías que aprenderán\n4. **Día en la vida**: Un día típico en el bootcamp\n5. **Proyectos destacados**: Portafolio de estudiantes\n\n¿Quieres que desarrolle alguna de estas ideas?' }
  ]);
  const [input, setInput] = useState('');

  const quickActions = [
    'Post LinkedIn bootcamp',
    'Hashtags educación tech',
    'Resumir borrador',
    'Ideas contenido semanal'
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Entendido. Déjame generar contenido basado en tu solicitud...' 
      }]);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Agente IA</h1>
        <p className="text-muted-foreground">Chatea con Gemini para ideas, edición y optimización de contenido</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 h-[calc(100%-5rem)]">
        {/* Chat Area */}
        <Card className="flex flex-col">
          {/* Banner */}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-900">Conectado a Gemini · Backend activo</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white ml-auto' 
                    : 'bg-accent text-foreground'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 bg-accent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="primary" icon={<Send />} onClick={handleSend}>
              Enviar
            </Button>
          </div>
        </Card>

        {/* Quick Actions Sidebar */}
        <Card>
          <h3 className="font-semibold mb-4">Acciones rápidas</h3>
          <div className="space-y-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setInput(action)}
                className="w-full text-left px-4 py-3 bg-accent hover:bg-purple-50 hover:border-purple-200 border border-transparent rounded-xl text-sm transition-all"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Sugerencias</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Pide ideas de contenido específicas</p>
              <p>• Solicita optimización de copy</p>
              <p>• Genera hashtags relevantes</p>
              <p>• Analiza borradores guardados</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA 7: CANALES CONECTADOS
// ============================================================================

const ChannelsScreen: React.FC = () => {
  const channels = [
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: <Linkedin className="w-6 h-6 text-blue-600" />,
      account: 'Campus Lands',
      connected: true,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: <Instagram className="w-6 h-6 text-pink-600" />,
      account: null,
      connected: false,
      color: 'bg-pink-50 border-pink-200'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: <Facebook className="w-6 h-6 text-blue-500" />,
      account: null,
      connected: false,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'twitter', 
      name: 'X (Twitter)', 
      icon: <Twitter className="w-6 h-6" />,
      account: null,
      connected: false,
      color: 'bg-gray-50 border-gray-200'
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Canales conectados</h1>
        <p className="text-muted-foreground">Gestiona las integraciones con tus redes sociales</p>
      </div>

      {/* Alert */}
      <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="w-5 h-5 text-blue-600 mt-0.5">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-blue-900">
            <strong>LinkedIn publica vía integración oficial (Postiz).</strong> Conexión segura y compatible con las políticas de LinkedIn.
          </p>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {channels.map(channel => (
          <Card key={channel.id} className={channel.connected ? channel.color : ''}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {channel.icon}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {channel.name}
                    {channel.connected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  {channel.connected ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Conectado: <span className="font-medium">{channel.account}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No conectado</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
              {channel.connected ? (
                <>
                  <Button variant="ghost" size="sm" className="flex-1">
                    Configurar
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    Desconectar
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="sm" className="w-full">
                  Conectar cuenta
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            1/4
          </div>
          <p className="text-sm text-muted-foreground mt-1">Canales conectados</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-600">24</div>
          <p className="text-sm text-muted-foreground mt-1">Posts publicados</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">8</div>
          <p className="text-sm text-muted-foreground mt-1">Posts programados</p>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA 8: AJUSTES
// ============================================================================

const SettingsScreen: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState('••••••••••••••••••••');
  const [n8nWebhook, setN8nWebhook] = useState('https://n8n.campuslands.dev/webhook/...');
  const [n8nSecret, setN8nSecret] = useState('••••••••••••••••');
  const [telegramBot, setTelegramBot] = useState('••••••••••••••••••••');
  const [postizKey, setPostizKey] = useState('••••••••••••••••••••');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Ajustes</h1>
        <p className="text-muted-foreground">Configura integraciones y preferencias de la plataforma</p>
      </div>

      <div className="space-y-6">
        {/* API Gemini */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            API Gemini
          </h3>
          <div className="space-y-4">
            <Input
              label="API Key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              type="password"
              placeholder="Ingresa tu clave de API de Google Gemini"
            />
            <p className="text-xs text-muted-foreground">
              Obtén tu API key en{' '}
              <a href="https://makersuite.google.com" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </a>
            </p>
          </div>
        </Card>

        {/* n8n Webhook */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-600" />
            Automatización n8n
          </h3>
          <div className="space-y-4">
            <Input
              label="Webhook URL"
              value={n8nWebhook}
              onChange={(e) => setN8nWebhook(e.target.value)}
              placeholder="https://your-n8n.com/webhook/..."
            />
            <Input
              label="Webhook Secret"
              value={n8nSecret}
              onChange={(e) => setN8nSecret(e.target.value)}
              type="password"
              placeholder="Secret para validación"
            />
            <p className="text-xs text-muted-foreground">
              Configura tu workflow en n8n y pega la URL del webhook aquí
            </p>
          </div>
        </Card>

        {/* Telegram Bot */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Bot de Telegram
          </h3>
          <div className="space-y-4">
            <Input
              label="Bot Token"
              value={telegramBot}
              onChange={(e) => setTelegramBot(e.target.value)}
              type="password"
              placeholder="Ingresa el token de tu bot"
            />
            <p className="text-xs text-muted-foreground">
              Crea un bot con @BotFather en Telegram y obtén el token
            </p>
          </div>
        </Card>

        {/* Postiz API */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-600" />
            Postiz (LinkedIn oficial)
          </h3>
          <div className="space-y-4">
            <Input
              label="API Key"
              value={postizKey}
              onChange={(e) => setPostizKey(e.target.value)}
              type="password"
              placeholder="Ingresa tu API key de Postiz"
            />
            <p className="text-xs text-muted-foreground">
              Postiz gestiona la publicación oficial en LinkedIn
            </p>
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Preferencias
          </h3>
          <div className="space-y-4">
            <Toggle
              label="Notificaciones push"
              checked={notifications}
              onChange={setNotifications}
            />
            <Toggle
              label="Modo oscuro (próximamente)"
              checked={darkMode}
              onChange={setDarkMode}
              disabled
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost">
            Cancelar
          </Button>
          <Button variant="success" icon={<CheckCircle2 />}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP - SCREEN ROUTER
// ============================================================================

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [viewportWidth, setViewportWidth] = useState(1440);

  // Simulate responsive views
  const viewports = [
    { name: 'Desktop', width: 1440 },
    { name: 'Tablet', width: 768 }
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentScreen} />;
      
      case 'login':
      case 'dashboard':
        return (
          <DashboardShell activeScreen="dashboard" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Panel principal</h1>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Posts publicados</p>
                      <p className="text-2xl font-bold mt-1">24</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Programados</p>
                      <p className="text-2xl font-bold mt-1">8</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Borradores</p>
                      <p className="text-2xl font-bold mt-1">5</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </Card>
              </div>
              <Card>
                <h3 className="font-semibold mb-4">Actividad reciente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Post publicado en LinkedIn</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Post programado para mañana</p>
                      <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </DashboardShell>
        );
      
      case 'new-post':
        return (
          <DashboardShell activeScreen="new-post" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <NewPostScreen />
          </DashboardShell>
        );

      case 'manual-post':
        return (
          <DashboardShell activeScreen="manual-post" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <ManualPostScreen />
          </DashboardShell>
        );

      case 'drafts':
        return (
          <DashboardShell activeScreen="drafts" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <DraftsScreen />
          </DashboardShell>
        );
      
      case 'calendar':
        return (
          <DashboardShell activeScreen="calendar" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <CalendarScreen />
          </DashboardShell>
        );
      
      case 'agent':
        return (
          <DashboardShell activeScreen="agent" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <AgentScreen />
          </DashboardShell>
        );
      
      case 'channels':
        return (
          <DashboardShell activeScreen="channels" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <ChannelsScreen />
          </DashboardShell>
        );
      
      case 'settings':
        return (
          <DashboardShell activeScreen="settings" onNavigate={setCurrentScreen} onLogout={() => setCurrentScreen('landing')}>
            <SettingsScreen />
          </DashboardShell>
        );
      
      default:
        return <LandingPage onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="w-full h-screen bg-muted/30 overflow-auto">
      {/* Viewport Controls */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-sm">CampusSocial Design System</span>
            </div>
            <Badge variant="purple">8 pantallas</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Screen Selector */}
            <select
              value={currentScreen}
              onChange={(e) => setCurrentScreen(e.target.value)}
              className="px-3 py-1.5 bg-accent border border-border rounded-lg text-sm font-medium cursor-pointer"
            >
              <option value="landing">1. Landing</option>
              <option value="dashboard">2. Dashboard</option>
              <option value="new-post">3. Nueva publicación</option>
              <option value="manual-post">3b. Subir publicación manual</option>
              <option value="drafts">4. Borradores</option>
              <option value="calendar">5. Calendario</option>
              <option value="agent">6. Agente IA</option>
              <option value="channels">7. Canales</option>
              <option value="settings">8. Ajustes</option>
            </select>

            {/* Viewport Selector */}
            <div className="flex gap-2 px-2 py-1 bg-accent rounded-lg">
              {viewports.map(vp => (
                <button
                  key={vp.width}
                  onClick={() => setViewportWidth(vp.width)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewportWidth === vp.width
                      ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {vp.name} ({vp.width}px)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex items-start justify-center p-6 min-h-screen">
        <div 
          className="bg-background shadow-2xl rounded-2xl overflow-hidden border border-border transition-all duration-300"
          style={{ 
            width: `${viewportWidth}px`,
            height: '900px'
          }}
        >
          {renderScreen()}
        </div>
      </div>

      {/* Component Library Footer */}
      <div className="fixed bottom-6 right-6 bg-card border border-border rounded-xl shadow-lg p-4 max-w-xs">
        <h4 className="text-sm font-semibold mb-2">Componentes incluidos</h4>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['Button', 'Input', 'Textarea', 'Select', 'Toggle', 'Checkbox', 'Badge', 'Card', 'Modal', 'Toast', 'Skeleton'].map(comp => (
            <span key={comp} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md">
              {comp}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Estados: hover, focus, disabled, loading
        </p>
      </div>
    </div>
  );
}
