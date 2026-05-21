import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles, Calendar, FileText, Settings,
  Home, PenSquare, MessageSquare, Share2,
  Search, Bell, ChevronDown, X, Check,
  Linkedin, Instagram, Facebook, Twitter,
  Clock, Trash2, Edit, Send, Plus,
  Zap, Network, BarChart3, CheckCircle2,
  ArrowRight, Play, Eye, Save, Loader2,
  Filter, Copy, Download, Mail, LogOut, Contrast,
  User, ChevronLeft,
  Upload, Image, Video, FileUp, CalendarClock,
  AlarmClock, Globe, ChevronRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ejecutarFlujoPublicacion } from '../services/n8n';
import {
  chatWithAgent,
  generateContent as generateContentFn,
  schedulePost as schedulePostFn,
  publishPostNow as publishPostNowFn,
} from '../services/cloudFunctions';
import {
  crearPublicacion,
  crearBorrador,
  eliminarBorrador,
  eliminarPublicacion,
  registrarActividad,
  guardarCanal,
} from '../lib/db';
import { guardarConfiguracion } from '../lib/db/configuracion';
import type { RedSocial, Borrador } from '../lib/db/types';
import { CampusSocialLogo } from './components/CampusSocialLogo';
import {
  useBorradores,
  useActividad,
  useCanales,
  useConfiguracion,
  useDashboardStats,
  usePublicacionesProgramadas,
  useInvalidateCampus,
  useChatMensajes,
  useCampusSearch,
} from '../hooks/useCampusData';
import { useTheme } from '../context/ThemeContext';
import { subirArchivoPublicacion } from '../lib/storage';
import { mensajeCallable } from '../lib/callableError';
import { healthCheck } from '../services/cloudFunctions';
import { toDate, formatRelative, formatDateTime } from '../lib/format';

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
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
            <CampusSocialLogo size="lg" className="!gap-2" />
          </div>
          <div className="flex items-center gap-3">
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
              Automatiza LinkedIn y tus redes con{' '}
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Inteligencia Artificial
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              CampusSocial automatiza publicaciones para Campus Lands, con foco en{' '}
              <strong>LinkedIn</strong>: genera copy con IA, programa posts y publica de forma oficial vía Postiz.
              Instagram y otras redes son complementarias.
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
              <Button variant="outline" size="lg" icon={<ArrowRight />} onClick={() => onNavigate('login')}>
                Iniciar sesión
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
            { num: '1', icon: <PenSquare className="w-7 h-7 text-white" />, title: 'Escribe el tema', desc: 'Describe brevemente el tema de tu publicación' },
            { num: '2', icon: <Sparkles className="w-7 h-7 text-white" />, title: 'IA genera contenido', desc: 'El agente crea copy profesional e imagen' },
            { num: '3', icon: <Eye className="w-7 h-7 text-white" />, title: 'Revisa y edita', desc: 'Previsualiza en tiempo real y ajusta' },
            { num: '4', icon: <Calendar className="w-7 h-7 text-white" />, title: 'Programa publicación', desc: 'Selecciona fecha/hora y publica' }
          ].map((step, i) => (
            <div key={i} className="relative">
              <Card hover className="text-center">
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-xl opacity-30" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center">
                      {step.icon}
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
              <CampusSocialLogo size="sm" textClassName="!text-foreground font-semibold !bg-none" />
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
  const { profile, user } = useAuth();
  const { mode, toggleContrast } = useTheme();
  const { data: actividad = [] } = useActividad();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchResults = useCampusSearch(searchTerm);
  const initials = (profile?.nombre || user?.email || 'U').slice(0, 2).toUpperCase();
  const unreadCount = actividad.length;

  const menuItems = [
    { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { id: 'new-post', icon: <PenSquare className="w-5 h-5" />, label: 'Nueva publicación' },
    { id: 'manual-post', icon: <Upload className="w-5 h-5" />, label: 'Subir publicación' },
    { id: 'drafts', icon: <FileText className="w-5 h-5" />, label: 'Borradores' },
    { id: 'calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendario' },
    { id: 'agent', icon: <MessageSquare className="w-5 h-5" />, label: 'Asistente IA' },
    { id: 'channels', icon: <Share2 className="w-5 h-5" />, label: 'Canales' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <CampusSocialLogo size="md" />
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
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile?.nombre || 'Usuario'}</div>
              <div className="text-xs text-muted-foreground truncate">{profile?.email || user?.email}</div>
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
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 gap-3">
          <div className="flex-1 max-w-md relative">
            <Input
              placeholder="Buscar publicaciones, borradores..."
              icon={<Search />}
              className="bg-accent/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border rounded-xl shadow-lg max-h-64 overflow-y-auto p-2">
                {searchResults.publicaciones.length === 0 && searchResults.borradores.length === 0 && (
                  <p className="text-xs text-muted-foreground p-2">Sin resultados</p>
                )}
                {searchResults.publicaciones.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left p-2 rounded-lg hover:bg-accent text-sm"
                    onClick={() => { onNavigate('calendar'); setSearchTerm(''); }}
                  >
                    <span className="font-medium">{p.titulo}</span>
                    <span className="text-xs text-muted-foreground block">{p.estado}</span>
                  </button>
                ))}
                {searchResults.borradores.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="w-full text-left p-2 rounded-lg hover:bg-accent text-sm"
                    onClick={() => { onNavigate('drafts'); setSearchTerm(''); }}
                  >
                    <span className="font-medium">{b.titulo || 'Borrador'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title={mode === 'high-contrast' ? 'Contraste normal' : 'Alto contraste'}
              onClick={toggleContrast}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <Contrast className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="relative">
              <button
                type="button"
                className="relative p-2 hover:bg-accent rounded-xl transition-colors"
                onClick={() => setShowNotif((v) => !v)}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[8px] h-2 px-0.5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-full mt-1 w-80 z-50 bg-card border rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  <p className="px-3 py-2 text-xs font-semibold border-b">Actividad reciente</p>
                  {actividad.length === 0 && (
                    <p className="p-3 text-xs text-muted-foreground">Sin notificaciones</p>
                  )}
                  {actividad.slice(0, 8).map((a) => (
                    <div key={a.id} className="px-3 py-2 border-b last:border-0 text-sm">
                      <p className="font-medium">{a.mensaje}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(toDate(a.creadoEn))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowProfile((v) => !v)}
              className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            >
              {initials}
            </button>
          </div>
        </header>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20" onClick={() => setShowProfile(false)}>
            <div className="bg-card border rounded-2xl shadow-xl p-6 w-72" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold">{profile?.nombre || 'Usuario'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setShowProfile(false); onNavigate('settings'); }}>
                  Ajustes
                </Button>
              </div>
            </div>
          </div>
        )}

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

const REDES: RedSocial[] = ['linkedin', 'instagram', 'facebook', 'twitter'];

const NewPostScreen: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: config } = useConfiguracion();
  const invalidate = useInvalidateCampus();
  const initials = (profile?.nombre || user?.email || 'U').slice(0, 2).toUpperCase();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('profesional');
  const [networks, setNetworks] = useState({
    linkedin: true,
    instagram: false,
    facebook: false,
    twitter: false
  });
  const [generateImage, setGenerateImage] = useState(true);
  const [activeTab, setActiveTab] = useState('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [repeatMode, setRepeatMode] = useState('none');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('schedule');
  const [generatedText, setGeneratedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const platformsSelected = (): RedSocial[] =>
    (Object.entries(networks)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .filter((k): k is RedSocial => REDES.includes(k as RedSocial)));

  const handleGenerate = async () => {
    if (!topic.trim() || !user) return;
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const platforms: RedSocial[] = platformsSelected().length
        ? platformsSelected()
        : ['linkedin'];

      const gen = await generateContentFn(topic.trim(), platforms[0], tone, generateImage);
      const tags = gen.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
      setGeneratedText([gen.contenido, tags].filter(Boolean).join('\n\n'));
      setHasContent(true);
      setToastMsg(gen.provider ? `Generado con ${gen.provider}` : 'Contenido generado');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      const webhook = config?.n8nWebhookUrl?.trim();
      if (webhook) {
        try {
          await ejecutarFlujoPublicacion(
            {
              topic: topic.trim(),
              tone,
              include_image: generateImage,
              telegram_notify: false,
              schedule_now: false,
              platforms,
            },
            webhook
          );
        } catch {
          // n8n opcional; la IA ya generó el texto
        }
      }
    } catch (e) {
      setErrorMsg(mensajeCallable(e));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBorrador = async () => {
    if (!user || !generatedText.trim()) return;
    try {
      await crearBorrador(user.uid, {
        promptOriginal: topic.trim() || 'Sin tema',
        tono: tone,
        redesDestino: platformsSelected().length ? platformsSelected() : (['linkedin'] as RedSocial[]),
        contenidoGenerado: generatedText,
        titulo: topic.slice(0, 80) || 'Borrador',
      });
      await registrarActividad(user.uid, {
        tipo: 'borrador',
        mensaje: `Borrador guardado: ${topic.slice(0, 40) || 'sin título'}`,
        red: 'linkedin',
      });
      invalidate();
      setToastMsg('Borrador guardado en Firestore');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al guardar');
    }
  };

  const handleSchedule = async () => {
    if (!user) return;
    if (scheduleMode === 'schedule' && (!scheduledDate || !scheduledTime)) return;
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const platforms: RedSocial[] = platformsSelected().length
        ? platformsSelected()
        : ['linkedin'];
      const postId = await crearPublicacion(user.uid, {
        titulo: topic.slice(0, 80) || 'Publicación',
        contenido: generatedText || topic,
        redesDestino: platforms,
        estado: scheduleMode === 'now' ? 'pendiente' : 'borrador',
      });
      if (scheduleMode === 'now') {
        await publishPostNowFn(postId);
        await registrarActividad(user.uid, {
          tipo: 'publicado',
          mensaje: `Publicación IA enviada a ${platforms.join(', ')}`,
          red: platforms[0],
        });
        setToastMsg('Publicación enviada');
      } else {
        const iso = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        const webhook = config?.n8nWebhookUrl?.trim();
        if (webhook) {
          try {
            await ejecutarFlujoPublicacion(
              {
                topic: topic.trim(),
                tone,
                include_image: generateImage,
                telegram_notify: false,
                schedule_now: true,
                platforms,
              },
              webhook
            );
            setToastMsg('Enviado a n8n para programar');
          } catch {
            await schedulePostFn(postId, iso, platforms);
            setToastMsg('Publicación programada');
          }
        } else {
          await schedulePostFn(postId, iso, platforms);
          setToastMsg('Publicación programada');
        }
        const repeticiones = repeatMode === 'none' ? 1 : repeatMode === 'daily' ? 7 : 4;
        for (let i = 1; i < repeticiones; i++) {
          const next = new Date(iso);
          if (repeatMode === 'daily') next.setDate(next.getDate() + i);
          if (repeatMode === 'weekly') next.setDate(next.getDate() + i * 7);
          const repId = await crearPublicacion(user.uid, {
            titulo: `${topic.slice(0, 60) || 'Publicación'} (${i + 1})`,
            contenido: generatedText || topic,
            redesDestino: platforms,
            estado: 'borrador',
          });
          await schedulePostFn(repId, next.toISOString(), platforms);
        }
        await registrarActividad(user.uid, {
          tipo: 'programado',
          mensaje: `Programado para ${formatDateTime(new Date(iso))}${repeatMode !== 'none' ? ` · repetición ${repeatMode}` : ''}`,
          red: platforms[0],
        });
      }
      invalidate();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      setErrorMsg(mensajeCallable(e));
    } finally {
      setIsGenerating(false);
    }
  };

  const displayName = profile?.nombre || 'Campus Lands';

  return (
    <div className="h-full bg-accent/20">
      <Toast message="¡Publicación programada exitosamente!" type="success" show={showToast} />
      
      <div className="max-w-[1400px] mx-auto p-6 h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Nueva publicación</h1>
          <p className="text-muted-foreground">Crea contenido atractivo con ayuda de IA</p>
          {errorMsg && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {errorMsg}
            </p>
          )}
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
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{profile?.nombre || 'Cuenta'}</div>
                          <div className="text-xs text-muted-foreground">Educación Tecnológica • Hace 1m</div>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                        {generatedText}
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
                        {generatedText.length} / 3000
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
            <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={scheduleMode}
                  onChange={(e) => setScheduleMode(e.target.value as 'now' | 'schedule')}
                  className="px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="now">Publicar ahora</option>
                  <option value="schedule">Programar</option>
                </select>
                {scheduleMode === 'schedule' && (
                  <>
                    <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-40" />
                    <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-32" />
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
                      <option value="America/Bogota">Colombia</option>
                      <option value="America/Mexico_City">México</option>
                      <option value="UTC">UTC</option>
                    </select>
                    <select value={repeatMode} onChange={(e) => setRepeatMode(e.target.value)} className="px-3 py-2 border rounded-xl text-sm" title="Repetir la misma publicación">
                      <option value="none">Sin repetir</option>
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" icon={<Save />} onClick={handleSaveBorrador}>
                  Guardar borrador
                </Button>
                <Button
                  variant="success"
                  icon={scheduleMode === 'now' ? <Send /> : <Calendar />}
                  onClick={handleSchedule}
                  disabled={scheduleMode === 'schedule' && (!scheduledDate || !scheduledTime)}
                >
                  {scheduleMode === 'now' ? 'Publicar ahora' : 'Programar'}
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
  const { user, profile } = useAuth();
  const invalidate = useInvalidateCampus();
  const [postText, setPostText] = useState('');
  const [saving, setSaving] = useState(false);
  const [networks, setNetworks] = useState({ linkedin: true, instagram: false, facebook: false, twitter: false });
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('schedule');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; preview?: string; file: File }[]>([]);
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
      preview: f.type.startsWith('image') ? URL.createObjectURL(f) : undefined,
      file: f,
    }));
    setUploadedFiles(prev => [...prev, ...mapped]);
  };

  const removeFile = (idx: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== idx));

  const notify = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSchedule = async () => {
    if (!user) return;
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
    setSaving(true);
    try {
      const redes = activeNetworks as RedSocial[];
      let imagenUrl: string | null = null;
      if (uploadedFiles[0]?.file) {
        imagenUrl = await subirArchivoPublicacion(user.uid, uploadedFiles[0].file);
      }
      const postId = await crearPublicacion(user.uid, {
        titulo: postText.slice(0, 80),
        contenido: postText,
        redesDestino: redes,
        estado: scheduleMode === 'now' ? 'pendiente' : 'borrador',
        imagenUrl,
      });
      if (scheduleMode === 'now') {
        await publishPostNowFn(postId);
        await registrarActividad(user.uid, {
          tipo: 'publicado',
          mensaje: `Publicación manual enviada a ${redes.join(', ')}`,
          red: redes[0],
        });
        notify('Publicación enviada');
      } else {
        const iso = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        await schedulePostFn(postId, iso, redes);
        await registrarActividad(user.uid, {
          tipo: 'programado',
          mensaje: `Manual programado: ${formatDateTime(new Date(iso))}`,
          red: redes[0],
        });
        notify(`Programado para ${scheduledDate} ${scheduledTime}`);
      }
      invalidate();
      setPostText('');
      setUploadedFiles([]);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Error al publicar');
    } finally {
      setSaving(false);
    }
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
                icon={saving ? <Loader2 className="animate-spin" /> : scheduleMode === 'now' ? <Send /> : <CalendarClock />}
                onClick={handleSchedule}
                disabled={saving || !postText.trim() || activeNetworks.length === 0}>
                {saving ? 'Guardando…' : scheduleMode === 'now' ? 'Publicar ahora' : 'Programar publicación'}
              </Button>
              <Button variant="outline" className="w-full" icon={<Save />}
                onClick={async () => {
                  if (!user || !postText.trim()) return;
                  await crearBorrador(user.uid, {
                    promptOriginal: 'Publicación manual',
                    tono: 'profesional',
                    redesDestino: activeNetworks as RedSocial[],
                    contenidoGenerado: postText,
                    titulo: postText.slice(0, 80),
                  });
                  invalidate();
                  notify('Borrador guardado');
                }}
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
  const { user } = useAuth();
  const invalidate = useInvalidateCampus();
  const { data: drafts = [], isLoading, refetch } = useBorradores();
  const [filter, setFilter] = useState('todos');

  const filtered = drafts.filter((d) => {
    if (filter === 'pendientes') return d.estado === 'pendiente';
    if (filter === 'programados') return d.estado === 'programado' || d.estado === 'aprobado';
    return true;
  });

  const statusColors: Record<string, 'warning' | 'success' | 'purple' | 'default'> = {
    pendiente: 'warning',
    aprobado: 'success',
    programado: 'purple',
    rechazado: 'default',
  };

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
              {isLoading && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Cargando…</td></tr>
              )}
              {!isLoading && filtered.map((draft) => (
                <tr key={draft.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium">{draft.titulo || draft.promptOriginal.slice(0, 50)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {draft.redesDestino.map((net) => (
                        <div key={net} className="w-6 h-6">
                          {networkIcons[net as keyof typeof networkIcons]}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={statusColors[draft.estado] ?? 'default'}>
                      {draft.estado}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {formatRelative(toDate(draft.creadoEn))}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        onClick={async () => {
                          if (!user || !confirm('¿Eliminar borrador?')) return;
                          await eliminarBorrador(draft.id);
                          invalidate();
                          refetch();
                        }}
                      >
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
      {!isLoading && filtered.length === 0 && (
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
  const { user } = useAuth();
  const invalidate = useInvalidateCampus();
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const mes = viewDate.getMonth();
  const anio = viewDate.getFullYear();
  const { porDia, isLoading } = usePublicacionesProgramadas(mes, anio);

  const monthLabel = viewDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(anio, mes + 1, 0).getDate();
  const firstDayOffset = (new Date(anio, mes, 1).getDay() + 6) % 7;

  const selectedPosts = selectedDay ? porDia[selectedDay] ?? [] : [];

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
            <h3 className="text-lg font-semibold capitalize">{monthLabel}</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setViewDate(new Date(anio, mes - 1, 1))}>Anterior</Button>
              <Button variant="ghost" size="sm" onClick={() => setViewDate(new Date(anio, mes + 1, 1))}>Siguiente</Button>
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
              const posts = porDia[day] || [];
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
            {selectedDay ? `${selectedDay} de ${monthLabel}` : 'Selecciona un día'}
          </h3>
          
          {isLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}

          {!isLoading && selectedDay && selectedPosts.length > 0 ? (
            <div className="space-y-3">
              {selectedPosts.map((post) => {
                const fp = toDate(post.fechaProgramada);
                const red = post.redesDestino[0];
                return (
                <div key={post.id} className="p-3 bg-accent/50 rounded-xl hover:bg-accent transition-colors">
                  {post.imagenUrl && (
                    <img src={post.imagenUrl} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.contenido}</p>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{post.titulo}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {fp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {red === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600" />}
                    {red === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                    {red === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      className="px-2 py-1 text-red-600 text-xs hover:bg-red-50 rounded-lg transition-colors"
                      onClick={async () => {
                        if (!user || !confirm('¿Eliminar publicación?')) return;
                        await eliminarPublicacion(post.id);
                        invalidate();
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );})}
            </div>
          ) : !isLoading && selectedDay ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No hay publicaciones programadas</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA 6: AGENTE IA (Chat Gemini)
// ============================================================================

const AgentScreen: React.FC = () => {
  const { user } = useAuth();
  const invalidate = useInvalidateCampus();
  const { data: stored = [], isLoading } = useChatMensajes();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [aiHint, setAiHint] = useState('');

  useEffect(() => {
    healthCheck()
      .then((h) => {
        setBackendOk(h.ok);
        setAiHint(h.ai ? `IA: ${h.provider}` : h.aiError || h.hint || '');
        if (!h.ai) setError(h.aiError || 'API de IA no configurada en el backend');
      })
      .catch((e) => {
        setBackendOk(false);
        setAiHint(mensajeCallable(e));
        setError(mensajeCallable(e));
      });
  }, []);

  useEffect(() => {
    if (stored.length) {
      setMessages(
        stored.map((m) => ({
          role: m.role === 'user' ? 'user' : 'bot',
          text: m.content,
        }))
      );
    } else if (!isLoading) {
      setMessages([
        {
          role: 'bot',
          text: '¡Hola! Soy el asistente de CampusSocial. Puedo ayudarte con copy para LinkedIn y tus publicaciones.',
        },
      ]);
    }
  }, [stored, isLoading]);

  const quickActions = [
    'Post LinkedIn bootcamp',
    'Hashtags educación tech',
    'Resumir borrador',
    'Ideas contenido semanal'
  ];

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setError('');
    const userMsg = { role: 'user' as const, text };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const historial = messages.slice(-10).map((m) => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.text,
      }));
      const res = await chatWithAgent(text, historial);
      setMessages((prev) => [...prev, { role: 'bot', text: res.respuesta }]);
      setError('');
      setBackendOk(true);
      invalidate();
    } catch (e) {
      const msg = mensajeCallable(e);
      setError(msg);
      setBackendOk(false);
      setMessages((prev) => [...prev, { role: 'bot', text: msg }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Asistente IA</h1>
        <p className="text-muted-foreground">Apartado del agente CampusSocial: ideas, edición y copy para LinkedIn (Gemini)</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 h-[calc(100%-5rem)]">
        {/* Chat Area */}
        <Card className="flex flex-col">
          {/* Banner */}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-900">
              {backendOk === false || error
                ? `Sin conexión IA${aiHint ? ` · ${aiHint}` : ''}`
                : `Asistente de marketing · ${aiHint || 'IA activa'}`}
            </span>
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
  const { user } = useAuth();
  const invalidate = useInvalidateCampus();
  const { data: canales, isLoading } = useCanales();
  const { stats } = useDashboardStats();

  const defs = [
    { id: 'linkedin' as RedSocial, name: 'LinkedIn', icon: <Linkedin className="w-6 h-6 text-blue-600" />, color: 'bg-blue-50 border-blue-200' },
    { id: 'instagram' as RedSocial, name: 'Instagram', icon: <Instagram className="w-6 h-6 text-pink-600" />, color: 'bg-pink-50 border-pink-200' },
    { id: 'facebook' as RedSocial, name: 'Facebook', icon: <Facebook className="w-6 h-6 text-blue-500" />, color: 'bg-blue-50 border-blue-200' },
    { id: 'twitter' as RedSocial, name: 'X (Twitter)', icon: <Twitter className="w-6 h-6" />, color: 'bg-gray-50 border-gray-200' },
  ];

  const channels = defs.map((d) => {
    const c = canales?.[d.id];
    return {
      ...d,
      connected: Boolean(c?.conectado),
      account: c?.cuentaNombre ?? null,
    };
  });

  const connectedCount = channels.filter((c) => c.connected).length;

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
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      if (!user) return;
                      await guardarCanal(user.uid, channel.id, { conectado: false, cuentaNombre: null });
                      invalidate();
                    }}
                  >
                    Desconectar
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    if (!user) return;
                    const name = prompt(
                      `Cuenta de ${channel.name}:\n\n` +
                        (channel.id === 'linkedin'
                          ? 'LinkedIn se publica vía Postiz/n8n. Indica el nombre del perfil conectado en tu workflow.'
                          : 'Indica el usuario o página conectada en n8n.')
                    );
                    if (!name) return;
                    await guardarCanal(user.uid, channel.id, {
                      conectado: true,
                      cuentaNombre: name,
                      proveedor: channel.id === 'linkedin' ? 'postiz' : 'n8n',
                    });
                    await registrarActividad(user.uid, {
                      tipo: 'publicado',
                      mensaje: `Canal ${channel.name} vinculado: ${name}`,
                      red: channel.id as RedSocial,
                    });
                    invalidate();
                  }}
                >
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
            {connectedCount}/4
          </div>
          <p className="text-sm text-muted-foreground mt-1">Canales conectados</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-600">{stats.publicados}</div>
          <p className="text-sm text-muted-foreground mt-1">Posts publicados</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.programados}</div>
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
  const { user } = useAuth();
  const invalidate = useInvalidateCampus();
  const { data: config, isLoading } = useConfiguracion();
  const [n8nWebhook, setN8nWebhook] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [timezone, setTimezone] = useState('America/Bogota');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (config) {
      setN8nWebhook(config.n8nWebhookUrl ?? '');
      setNotifications(config.notifications ?? true);
      setTimezone(config.timezone ?? 'America/Bogota');
    }
  }, [config]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Ajustes</h1>
        <p className="text-muted-foreground">Configura integraciones y preferencias de la plataforma</p>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Secretos del servidor
          </h3>
          <p className="text-sm text-muted-foreground">
            Gemini, Telegram y Postiz se configuran con Firebase Secrets en el Backend, no aquí.
          </p>
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
            <p className="text-xs text-muted-foreground">
              El secret del webhook se define en Cloud Functions (N8N_WEBHOOK_SECRET).
            </p>
            <p className="text-xs text-muted-foreground">
              Configura tu workflow en n8n y pega la URL del webhook aquí
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Preferencias
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Zona horaria</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              >
                <option value="America/Bogota">Colombia (Bogotá)</option>
                <option value="America/Mexico_City">México</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <Toggle label="Notificaciones" checked={notifications} onChange={setNotifications} />
          </div>
        </Card>

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        <div className="flex justify-end gap-3">
          <Button
            variant="success"
            icon={saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            disabled={saving || !user || isLoading}
            onClick={async () => {
              if (!user) return;
              setSaving(true);
              setSaveError('');
              try {
                if (notifications && typeof Notification !== 'undefined') {
                  if (Notification.permission === 'default') {
                    await Notification.requestPermission();
                  }
                }
                await guardarConfiguracion(user.uid, {
                  n8nWebhookUrl: n8nWebhook.trim(),
                  notifications,
                  timezone,
                });
                invalidate();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              } catch (e) {
                setSaveError(e instanceof Error ? e.message : 'No se pudo guardar. ¿Emulador activo?');
              } finally {
                setSaving(false);
              }
            }}
          >
            {saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const DashboardHome: React.FC = () => {
  const { stats, isLoading } = useDashboardStats();
  const { data: actividad = [], isLoading: loadingAct } = useActividad();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel principal</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Posts publicados</p>
              <p className="text-2xl font-bold mt-1">{isLoading ? '…' : stats.publicados}</p>
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
              <p className="text-2xl font-bold mt-1">{isLoading ? '…' : stats.programados}</p>
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
              <p className="text-2xl font-bold mt-1">{isLoading ? '…' : stats.borradores}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold mb-4">Actividad reciente</h3>
        {loadingAct && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {!loadingAct && actividad.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin actividad aún. Crea una publicación.</p>
        )}
        <div className="space-y-3">
          {actividad.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
              {a.tipo === 'publicado' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {a.tipo === 'programado' && <Calendar className="w-5 h-5 text-purple-600" />}
              {a.tipo === 'borrador' && <FileText className="w-5 h-5 text-amber-600" />}
              {a.tipo === 'sistema' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              {a.tipo === 'error' && <X className="w-5 h-5 text-red-600" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{a.mensaje}</p>
                <p className="text-xs text-muted-foreground">{formatRelative(toDate(a.creadoEn))}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN APP - SCREEN ROUTER
// ============================================================================

/** Landing pública antes del login */
export function PublicLanding({ onLogin }: { onLogin: () => void }) {
  return (
    <LandingPage
      onNavigate={(screen) => {
        onLogin();
      }}
    />
  );
}

export default function App({ productionMode = false }: { productionMode?: boolean }) {
  const { logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>(productionMode ? 'dashboard' : 'landing');
  const [viewportWidth, setViewportWidth] = useState(1440);

  // Simulate responsive views
  const viewports = [
    { name: 'Desktop', width: 1440 },
    { name: 'Tablet', width: 768 }
  ];

  const renderScreen = () => {
    const onLogout = () => setCurrentScreen(productionMode ? 'login' : 'landing');

    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentScreen} />;
      
      case 'login':
      case 'dashboard':
        return (
          <DashboardShell activeScreen="dashboard" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <DashboardHome />
          </DashboardShell>
        );
      
      case 'new-post':
        return (
          <DashboardShell activeScreen="new-post" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <NewPostScreen />
          </DashboardShell>
        );

      case 'manual-post':
        return (
          <DashboardShell activeScreen="manual-post" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <ManualPostScreen />
          </DashboardShell>
        );

      case 'drafts':
        return (
          <DashboardShell activeScreen="drafts" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <DraftsScreen />
          </DashboardShell>
        );
      
      case 'calendar':
        return (
          <DashboardShell activeScreen="calendar" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <CalendarScreen />
          </DashboardShell>
        );
      
      case 'agent':
        return (
          <DashboardShell activeScreen="agent" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <AgentScreen />
          </DashboardShell>
        );
      
      case 'channels':
        return (
          <DashboardShell activeScreen="channels" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <ChannelsScreen />
          </DashboardShell>
        );
      
      case 'settings':
        return (
          <DashboardShell activeScreen="settings" onNavigate={setCurrentScreen} onLogout={() => logout()}>
            <SettingsScreen />
          </DashboardShell>
        );
      
      default:
        return <LandingPage onNavigate={setCurrentScreen} />;
    }
  };

  if (productionMode) {
    return <div className="w-full min-h-screen bg-background overflow-auto">{renderScreen()}</div>;
  }

  return (
    <div className="w-full h-screen bg-muted/30 overflow-auto">
      {/* Viewport Controls */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CampusSocialLogo size="sm" textClassName="!text-foreground font-bold text-sm !bg-none" />
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
              <option value="agent">6. Asistente IA</option>
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
