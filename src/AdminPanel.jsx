import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  Images, 
  Megaphone, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Save,
  Palette,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Users,
  Database,
  ShieldCheck,
  FileText,
  Activity,
  Power,
  BarChart3,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Tag,
  Loader2
} from 'lucide-react';

// --- CONFIGURACIÓN DE BASE DE DATOS EN LA NUBE (GOOGLE APPS SCRIPT) ---
// IMPORTANTE: Esta debe ser la URL de tu Google Apps Script deployado
// La URL debe terminar en /exec
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwupJDhh2qP1QfEti1fS4asqSoJZD3mRb73YeGZumn87u4lq-DMdV-iQg39rKPuJ7NAqw/exec";

// Función helper para hacer fetch con manejo de redirects de Google y CORS
async function gsFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      redirect: 'follow', // Crucial para Google Apps Script
      headers: {
        ...options.headers,
        // Engañamos a CORS usando text/plain en lugar de application/json
        'Content-Type': 'text/plain;charset=utf-8', 
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error('Respuesta inválida:', text);
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}

// --- UTILS ---
// Utilidad para formatear automáticamente URLs de Google Drive a visor nativo
const formatImageUrl = (url) => {
  if (!url) return '';
  
  // Si es un enlace de Google Drive, utilizamos el método clásico de exportación directa.
  // Esto permite reproducir GIFs, PNG, JPG, etc., siempre y cuando el enlace sea PÚBLICO.
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  
  // Si es un enlace directo normal (Imgur, Postimages, web, etc.), se devuelve tal cual
  return url;
};

const StatusBadge = ({ status }) => {
  if (status === 'Activo') {
    return <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-green-200"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Activo</span>;
  }
  return <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-slate-200"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Inactivo</span>;
};

const getOccupancyBadge = (occupied, total) => {
  const occ = parseInt(occupied) || 0;
  const tot = parseInt(total) || 1;
  const ratio = occ / tot;

  if (ratio >= 1) return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-red-200">Sold Out</span>;
  if (ratio >= 0.8) return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-200">Pocas Entradas</span>;
  if (ratio >= 0.5) return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">Mitad de Entradas</span>;
  return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200">Disponible</span>;
};

// --- LOGO CORPORATIVO ---
const MKLogo = ({ className = "w-10 h-10", light = false }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
      <defs>
        <linearGradient id={light ? "mkGradLight" : "mkGradDark"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={light ? "#ffffff" : "#0284c7"} />
          <stop offset="100%" stopColor={light ? "#e2e8f0" : "#1e3a8a"} />
        </linearGradient>
      </defs>
      <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke={`url(#${light ? 'mkGradLight' : 'mkGradDark'})`} />
      <path d="M50 10 L50 90" stroke={`url(#${light ? 'mkGradLight' : 'mkGradDark'})`} />
      <path d="M10 50 L90 50" stroke={`url(#${light ? 'mkGradLight' : 'mkGradDark'})`} />
      <path d="M28 28 L50 50 L72 28" stroke={`url(#${light ? 'mkGradLight' : 'mkGradDark'})`} />
      <path d="M28 72 L50 50 L72 72" stroke={`url(#${light ? 'mkGradLight' : 'mkGradDark'})`} />
    </g>
  </svg>
);

// --- DATOS (INICIAN VACÍOS PARA USAR LA BASE DE DATOS REAL) ---
const INITIAL_EVENTS = [];
const INITIAL_COURSES = [];
const INITIAL_CARRUSEL = [];
const INITIAL_ADS = [];

// --- COMPONENTE PRINCIPAL ---
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <DashboardLayout onLogout={() => setIsAuthenticated(false)} />;
}

// --- PANTALLA DE LOGIN CORPORATIVO ---
function LoginScreen({ onLogin }) {
  const [credentials, setCredentials] = useState({ user: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.user === 'admin' && credentials.password === 'admin123') {
      onLogin();
    } else {
      alert("Credenciales incorrectas (Usa: admin / admin123)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md p-10">
        <div className="flex flex-col items-center mb-8">
          <MKLogo className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MK Enterprise</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Admin Portal Seguro</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">ID de Usuario</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-sm"
              value={credentials.user}
              onChange={(e) => setCredentials({...credentials, user: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-sm"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg text-sm transition-colors mt-4 shadow-lg">
            Autenticar
          </button>
        </form>
      </div>
    </div>
  );
}

// --- LAYOUT DEL DASHBOARD ---
function DashboardLayout({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const MENU_ITEMS = [
    { id: 'dashboard', label: 'Resumen General', icon: LayoutDashboard },
    { id: 'eventos', label: 'Base de Datos Eventos', icon: CalendarDays },
    { id: 'cursos', label: 'Módulo Cursos', icon: BookOpen },
    { id: 'carrusel', label: 'Carrusel Principal', icon: Images },
    { id: 'publicidad', label: 'Gestión Publicidad', icon: Megaphone },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'eventos': return <EventManagement />;
      case 'cursos': return <CourseManagement />;
      case 'carrusel': return <CarouselManagement />;
      case 'publicidad': return <AdManagement />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100">
      {/* SIDEBAR CORPORATIVO */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <MKLogo className="w-8 h-8" light={true} />
          <div>
            <h2 className="font-bold text-white text-base tracking-tight leading-tight">MK Enterprise</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">G-Sheets Sync</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Gestión Principal</p>
          <nav className="space-y-1">
            {MENU_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-400"/> Nivel de Acceso</h4>
            <p className="text-[11px] text-slate-400 leading-tight">Administrador Global. Cambios en vivo.</p>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
            <LogOut size={16} /> Finalizar Sesión
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="font-bold text-lg flex items-center gap-2 tracking-tight">
           <MKLogo className="w-6 h-6" light={true}/>
           MK Admin
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-20 flex flex-col text-slate-300">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {MENU_ITEMS.map(item => (
              <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} className="m-6 flex justify-center items-center gap-2 p-4 text-red-400 border border-red-400/30 rounded-lg font-bold">
            <LogOut size={20} /> Salir del Sistema
          </button>
        </div>
      )}

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <header className="hidden md:flex bg-white h-16 items-center justify-between px-8 border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-bold text-slate-800 capitalize tracking-tight">{MENU_ITEMS.find(i => i.id === activeTab)?.label}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-full">
              <Database size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Apps Script Activo</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// --- VISTA 1: RESUMEN GENERAL ---
function DashboardOverview() {
  const [realStats, setRealStats] = useState({ events: 0, courses: 0, tickets: 0, ads: 0 });

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const [resEvt, resCur, resAds] = await Promise.all([
          gsFetch(`${SCRIPT_URL}?type=eventos`),
          gsFetch(`${SCRIPT_URL}?type=cursos`),
          gsFetch(`${SCRIPT_URL}?type=publicidad`)
        ]);
        
        if (!isMounted) return;

        let evts = Array.isArray(resEvt) ? resEvt : []; 
        let curs = Array.isArray(resCur) ? resCur : []; 
        let ads = Array.isArray(resAds) ? resAds : [];

        setRealStats({
          events: evts.filter(e => e.status === 'Activo').length,
          courses: curs.filter(c => c.status === 'Activo').length,
          tickets: evts.reduce((sum, e) => sum + (parseInt(e.occupiedSeats) || 0), 0),
          ads: ads.filter(a => a.status === 'Activo').length
        });
      } catch (error) { console.error("Error fetching real stats", error); }
    };
    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  const statsCards = [
    { title: "Eventos Activos", value: realStats.events, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Cursos Disponibles", value: realStats.courses, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Entradas Vendidas", value: realStats.tickets, icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Publicidad Activa", value: realStats.ads, icon: Megaphone, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2"><Settings size={20} className="text-blue-400"/> Integración con Google Drive & Sheets</h3>
          <p className="text-slate-400 text-sm mt-1">El panel utiliza URLs de Drive directamente para mostrar imágenes y guarda los datos en <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 break-all">{SCRIPT_URL}</code>.</p>
        </div>
      </div>
    </div>
  );
}

// --- VISTA 2: GESTIÓN DE EVENTOS ---
function EventManagement() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsEvent, setStatsEvent] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // Estado para vista en vivo

  const fetchEventos = async () => {
    try {
      const data = await gsFetch(`${SCRIPT_URL}?type=eventos`);
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar eventos:", e);
    }
  };

  useEffect(() => { fetchEventos(); }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt) => {
    setEditingItem(evt);
    setImageUrl(evt.image || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.target);
    const submittedImage = formData.get('image') || ''; 

    const newEvent = {
      title: formData.get('title'),
      dateFull: formData.get('dateFull'),
      category: formData.get('category'),
      price: formData.get('price'),
      totalSeats: parseInt(formData.get('totalSeats')) || 100,
      occupiedSeats: parseInt(formData.get('occupiedSeats')) || 0,
      status: formData.get('status') || 'Activo',
      image: submittedImage, 
      description: formData.get('description') || '',
      mapUrl: formData.get('mapUrl') || ''
    };

    try {
      const url = editingItem ? `${SCRIPT_URL}?type=eventos&id=${editingItem.id}` : `${SCRIPT_URL}?type=eventos`;
      const response = await gsFetch(url, { method: 'POST', body: JSON.stringify(newEvent) });
      if (response.success) fetchEventos();
    } catch (err) {
      alert("Error de conexión. Revisa tu URL de Apps Script.");
    }
    
    setIsSaving(false);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar este evento permanentemente?")) return;
    try { await gsFetch(`${SCRIPT_URL}?type=eventos&action=delete&id=${id}`, { method: 'POST' }); fetchEventos(); } catch (e) { alert("No se pudo eliminar."); }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Activo' ? 'Inactivo' : 'Activo';
    try { await gsFetch(`${SCRIPT_URL}?type=eventos&action=status&id=${item.id}`, { method: 'POST', body: JSON.stringify({ status: newStatus }) }); fetchEventos(); } catch (e) { alert("No se pudo actualizar el estado."); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Eventos</h2>
          <p className="text-sm text-slate-500 mt-1">Gestión de congresos con URLs de Google Drive o Imgur.</p>
        </div>
        <button onClick={openNewModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Evento / Categoría</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Estado Aforo</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt) => (
                <tr key={evt.id} className={`hover:bg-slate-50/50 transition-colors group ${evt.status === 'Inactivo' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {evt.image && (
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img 
                            src={formatImageUrl(evt.image)} 
                            className="w-full h-full object-cover"
                            alt="Evento"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=X'; }}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{evt.title}</p>
                        <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">{evt.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{evt.dateFull || `${evt.day} ${evt.month}`}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="text-xs font-semibold text-slate-800">{evt.occupiedSeats || 0} / {evt.totalSeats || 100} vendidos</span>
                      {getOccupancyBadge(evt.occupiedSeats, evt.totalSeats)}
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={evt.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => {setStatsEvent(evt); setIsStatsModalOpen(true);}} className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg"><BarChart3 size={16}/></button>
                      <button onClick={() => handleToggleStatus(evt)} className="text-slate-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-lg"><Power size={16}/></button>
                      <button onClick={() => openEditModal(evt)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(evt.id)} className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario Eventos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{editingItem ? 'Editar Evento' : 'Nuevo Evento'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 bg-slate-50/50">
              <input type="hidden" name="status" defaultValue={editingItem?.status || 'Activo'} />
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Información Principal</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Título *</label>
                  <input name="title" defaultValue={editingItem?.title} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fecha Completa *</label>
                    <input name="dateFull" defaultValue={editingItem?.dateFull} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Categoría *</label>
                    <select name="category" defaultValue={editingItem?.category || 'Congreso'} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm">
                      <option>Congreso</option><option>Taller</option><option>Diplomado</option><option>Online</option>
                    </select>
                  </div>
                </div>
                
                {/* AFOROS MANUALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Precio *</label>
                    <input name="price" defaultValue={editingItem?.price} required className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg outline-none text-sm bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Aforo Total</label>
                    <input name="totalSeats" type="number" defaultValue={editingItem?.totalSeats || 100} className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg outline-none text-sm bg-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1"><Users size={12}/> Entradas Vendidas</label>
                    <input name="occupiedSeats" type="number" defaultValue={editingItem?.occupiedSeats || 0} className="w-full px-4 py-2.5 border border-indigo-500 rounded-lg outline-none text-sm bg-white font-bold text-indigo-900 ring-2 ring-indigo-200"/>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Multimedia y Ubicación</h4>
                
                <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between">
                    <span>URL de la Imagen (Drive, Imgur, etc) *</span>
                  </label>
                  <input 
                    name="image" 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Ej. https://drive.google.com/uc?export=view&id=..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"
                  />
                  <p className="text-[10px] text-amber-600 font-medium mt-2">⚠️ Si usas Google Drive, asegúrate de que el enlace sea Público. Si la imagen marca error en la previsualización, usa <b>imgur.com</b> o <b>postimages.org</b>.</p>
                  
                  {imageUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-10 w-16 bg-slate-100 border border-slate-200 rounded overflow-hidden">
                        <img 
                          src={formatImageUrl(imageUrl)} 
                          className="w-full h-full object-cover"
                          alt="Preview"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Error'; }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Previsualización de la imagen</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sede Física *</label>
                    <input name="location" type="text" defaultValue={editingItem?.location} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mapa Embed (Opcional)</label>
                    <input name="mapUrl" type="url" defaultValue={editingItem?.mapUrl} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"/>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md">
                  {isSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Evento</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Estadísticas */}
      {isStatsModalOpen && statsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2"><BarChart3 size={20} className="text-cyan-400"/> Analíticas Reales</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">{statsEvent.title}</p>
              </div>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-8 bg-slate-50 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ingresos Brutos</p>
                  <h4 className="text-2xl font-black text-slate-900">${((parseInt(statsEvent.price.replace(/[^0-9.-]+/g,"")) || 0) * (statsEvent.occupiedSeats || 0)).toLocaleString()}</h4>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tickets Vendidos</p>
                  <h4 className="text-2xl font-black text-slate-900">{statsEvent.occupiedSeats || 0}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-2">De {statsEvent.totalSeats || 100} disponibles</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vistas (Estimadas)</p>
                  <h4 className="text-2xl font-black text-slate-900">{((statsEvent.occupiedSeats || 1) * 14).toLocaleString()}</h4>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tasa Conversión</p>
                  <h4 className="text-2xl font-black text-slate-900">{(((statsEvent.occupiedSeats || 0) / ((statsEvent.occupiedSeats || 1) * 14)) * 100).toFixed(1)}%</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Estado y Llenado de Sala</h4>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>Capacidad Ocupada</span><span>{Math.round(((statsEvent.occupiedSeats || 0) / (statsEvent.totalSeats || 100)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                  <div className={`h-full rounded-full transition-all duration-1000 ${(((statsEvent.occupiedSeats || 0) / (statsEvent.totalSeats || 100)) * 100) > 90 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${((statsEvent.occupiedSeats || 0) / (statsEvent.totalSeats || 100)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- VISTA 3: GESTIÓN DE CURSOS ---
function CourseManagement() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // Estado para vista en vivo

  const fetchCursos = async () => {
    try {
      const data = await gsFetch(`${SCRIPT_URL}?type=cursos`);
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) { }
  };
  useEffect(() => { fetchCursos(); }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingItem(course);
    setImageUrl(course.image || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.target);
    const submittedImage = formData.get('image') || ''; 

    const newCourse = {
      title: formData.get('title'), duration: formData.get('duration'), modality: formData.get('modality'),
      price: formData.get('price'), certification: formData.get('certification'), status: formData.get('status') || 'Activo',
      image: submittedImage
    };

    try {
      const url = editingItem ? `${SCRIPT_URL}?type=cursos&id=${editingItem.id}` : `${SCRIPT_URL}?type=cursos`;
      const response = await gsFetch(url, { method: 'POST', body: JSON.stringify(newCourse) });
      
      if (response.success) fetchCursos();
      else alert("Error al guardar.");
    } catch (err) {
      alert("Error de conexión con la BD.");
    }
    setIsSaving(false); setIsModalOpen(false); setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar curso?")) return;
    try {
      await gsFetch(`${SCRIPT_URL}?type=cursos&action=delete&id=${id}`, { method: 'POST' });
      fetchCursos();
    } catch (e) { alert("No se pudo eliminar."); }
  };
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Activo' ? 'Inactivo' : 'Activo';
    try { 
      await gsFetch(`${SCRIPT_URL}?type=cursos&action=status&id=${item.id}`, { method: 'POST', body: JSON.stringify({ status: newStatus }) }); 
      fetchCursos(); 
    } catch (e) { alert("No se pudo actualizar."); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Cursos</h2><p className="text-sm text-slate-500 mt-1">Oferta académica continua y empresarial.</p></div>
        <button onClick={openNewModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Nuevo Curso</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Curso</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Duración / Modalidad</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className={`hover:bg-slate-50/50 transition-colors group ${course.status === 'Inactivo' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 flex items-center gap-3">
                    {course.image && (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img 
                          src={formatImageUrl(course.image)} 
                          className="w-full h-full object-cover"
                          alt="Curso"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=X'; }}
                        />
                      </div>
                    )}
                    <span className="font-bold text-slate-900">{course.title}</span>
                  </td>
                  <td className="px-6 py-4"><p className="font-medium text-slate-900">{course.duration}</p><p className="text-xs text-slate-500">{course.modality}</p></td>
                  <td className="px-6 py-4 font-bold text-slate-900">{course.price}</td>
                  <td className="px-6 py-4"><StatusBadge status={course.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleToggleStatus(course)} className="text-slate-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-lg"><Power size={16} /></button>
                      <button onClick={() => openEditModal(course)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(course.id)} className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-900">{editingItem ? 'Editar Curso' : 'Nuevo Curso'}</h3><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
              <input type="hidden" name="status" defaultValue={editingItem?.status || 'Activo'} />
              <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre *</label><input name="title" defaultValue={editingItem?.title} required className="w-full p-2.5 border rounded-lg"/></div>
              
              <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex justify-between">
                  <span>URL de Imagen Portada *</span>
                </label>
                <input 
                  name="image" 
                  type="url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ej. https://i.imgur.com/tu-imagen.jpg"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"
                />
                <p className="text-[10px] text-amber-600 font-medium mt-2">⚠️ Si usas Google Drive, asegúrate de que el enlace sea Público. Si la imagen no carga, te recomendamos usar <b>imgur.com</b> o <b>postimages.org</b>.</p>
                {imageUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-16 bg-slate-100 border border-slate-200 rounded overflow-hidden">
                      <img 
                        src={formatImageUrl(imageUrl)} 
                        className="w-full h-full object-cover"
                        alt="Preview"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Error'; }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Previsualización de la imagen</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Duración</label><input name="duration" defaultValue={editingItem?.duration} required className="w-full p-2.5 border rounded-lg"/></div>
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Modalidad</label><input name="modality" defaultValue={editingItem?.modality} required className="w-full p-2.5 border rounded-lg"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Precio</label><input name="price" defaultValue={editingItem?.price} required className="w-full p-2.5 border rounded-lg"/></div>
                <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Aval</label><input name="certification" defaultValue={editingItem?.certification} className="w-full p-2.5 border rounded-lg"/></div>
              </div>
              <div className="flex justify-end pt-4"><button type="submit" disabled={isSaving} className="bg-indigo-600 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-lg font-bold flex gap-2 items-center">{isSaving && <Loader2 size={16} className="animate-spin"/>} Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- VISTA 4: GESTIÓN DE CARRUSEL PRINCIPAL ---
function CarouselManagement() {
  const [slides, setSlides] = useState(INITIAL_CARRUSEL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // Estado para vista en vivo

  const fetchSlides = async () => {
    try {
      const data = await gsFetch(`${SCRIPT_URL}?type=carrusel`);
      setSlides(Array.isArray(data) ? data : []);
    } catch (e) {}
  };
  useEffect(() => { fetchSlides(); }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (slide) => {
    setEditingItem(slide);
    setImageUrl(slide.image || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const submittedImage = formData.get('image') || ''; 

    const newSlide = {
      title: formData.get('title'), subtitle: formData.get('subtitle'), buttonText: formData.get('buttonText'),
      status: formData.get('status') || 'Activo', image: submittedImage
    };

    try {
      const url = editingItem ? `${SCRIPT_URL}?type=carrusel&id=${editingItem.id}` : `${SCRIPT_URL}?type=carrusel`;
      await gsFetch(url, { method: 'POST', body: JSON.stringify(newSlide) });
      fetchSlides();
    } catch (err) {
      alert("Error guardando el slide.");
    }
    setIsSaving(false); setIsModalOpen(false); setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar Slide?")) return;
    try { await gsFetch(`${SCRIPT_URL}?type=carrusel&action=delete&id=${id}`, { method: 'POST' }); fetchSlides(); } catch (e) { alert("Error al borrar"); }
  };
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Activo' ? 'Inactivo' : 'Activo';
    try { await gsFetch(`${SCRIPT_URL}?type=carrusel&action=status&id=${item.id}`, { method: 'POST', body: JSON.stringify({ status: newStatus }) }); fetchSlides(); } catch (e) { alert("Error al actualizar."); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hero Carrusel</h2><p className="text-sm text-slate-500">Imágenes principales de la página de inicio.</p></div>
        <button onClick={openNewModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Agregar Slide</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr><th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Slide</th><th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Texto Botón</th><th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slides.map((s) => (
              <tr key={s.id} className={s.status === 'Inactivo' ? 'opacity-50' : ''}>
                <td className="px-6 py-4 flex items-center gap-4">
                  {s.image && (
                    <div className="w-24 h-14 bg-slate-100 border border-slate-200 rounded shadow-sm overflow-hidden shrink-0">
                      <img 
                        src={formatImageUrl(s.image)} 
                        className="w-full h-full object-cover" 
                        alt=""
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Error'; }}
                      />
                    </div>
                  )}
                  <div><p className="font-bold text-slate-900">{s.title}</p><p className="text-xs text-slate-500">{s.subtitle}</p></div>
                </td>
                <td className="px-6 py-4 font-medium">{s.buttonText}</td>
                <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleToggleStatus(s)} className="p-2 text-slate-400 hover:text-amber-600"><Power size={16}/></button>
                  <button onClick={() => openEditModal(s)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-xl"><div className="p-6 border-b flex justify-between"><h3 className="font-bold">Configuración de Slide</h3><button onClick={()=>setIsModalOpen(false)}><X/></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input type="hidden" name="status" defaultValue={editingItem?.status || 'Activo'} />
            
            <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex justify-between">
                  <span>URL de la Imagen *</span>
                </label>
                <input 
                  name="image" 
                  type="url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ej. https://i.imgur.com/tu-imagen.jpg"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"
                />
                <p className="text-[10px] text-amber-600 font-medium mt-2">⚠️ Para imágenes grandes o GIFs, recomendamos usar <b>imgur.com</b> o <b>postimages.org</b> en lugar de Drive.</p>
                
                {imageUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-16 bg-slate-100 border border-slate-200 rounded overflow-hidden">
                      <img 
                        src={formatImageUrl(imageUrl)} 
                        className="w-full h-full object-cover"
                        alt="Preview"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Error'; }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Previsualización de la imagen</p>
                  </div>
                )}
            </div>

            <div><label className="text-xs font-bold uppercase mb-1 block">Título</label><input name="title" defaultValue={editingItem?.title} required className="w-full border p-2 rounded"/></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Subtítulo</label><input name="subtitle" defaultValue={editingItem?.subtitle} required className="w-full border p-2 rounded"/></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Texto del Botón</label><input name="buttonText" defaultValue={editingItem?.buttonText} required className="w-full border p-2 rounded"/></div>
            
            <button type="submit" disabled={isSaving} className="w-full flex justify-center items-center gap-2 bg-slate-900 disabled:bg-slate-700 text-white font-bold py-3 rounded mt-4">
              {isSaving && <Loader2 size={16} className="animate-spin"/>} Guardar Panel
            </button>
          </form></div>
        </div>
      )}
    </div>
  );
}

// --- VISTA 5: EDITOR DE PUBLICIDAD Y ADS (CARRUSEL PUBLICIDAD) ---
function AdManagement() {
  const [ads, setAds] = useState(INITIAL_ADS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // Estado para controlar si hay imagen

  const fetchAds = async () => {
    try {
      const data = await gsFetch(`${SCRIPT_URL}?type=publicidad`);
      setAds(Array.isArray(data) ? data : []);
    } catch (e) {}
  };
  useEffect(() => { fetchAds(); }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditingItem(ad);
    setImageUrl(ad.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAd = Object.fromEntries(formData.entries());
    newAd.status = newAd.status || "Activo";

    try {
      const url = editingItem ? `${SCRIPT_URL}?type=publicidad&id=${editingItem.id}` : `${SCRIPT_URL}?type=publicidad`;
      await gsFetch(url, { method: 'POST', body: JSON.stringify(newAd) });
      fetchAds();
    } catch (err) {
      alert("Error al guardar publicidad.");
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar Anuncio?")) return;
    try { await gsFetch(`${SCRIPT_URL}?type=publicidad&action=delete&id=${id}`, { method: 'POST' }); fetchAds(); } catch (e) { alert("Error al borrar."); }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Activo' ? 'Inactivo' : 'Activo';
    try { await gsFetch(`${SCRIPT_URL}?type=publicidad&action=status&id=${item.id}`, { method: 'POST', body: JSON.stringify({ status: newStatus }) }); fetchAds(); } catch (e) { alert("Error actualizando."); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestor de Banners</h2><p className="text-sm text-slate-500 mt-1">Administra la lista de anuncios promocionales.</p></div>
        <button onClick={openNewModal} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16}/> Crear Anuncio B2B</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr><th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Anuncio (Diseño)</th><th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Posición</th><th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ads.map((ad) => (
              <tr key={ad.id} className={ad.status === 'Inactivo' ? 'opacity-50' : ''}>
                <td className="px-6 py-4">
                  {ad.imageUrl ? (
                    <div className="w-48 h-14 rounded relative overflow-hidden shadow-sm border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <img 
                        src={formatImageUrl(ad.imageUrl)} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        alt={ad.title || 'Banner'} 
                        onError={(e) => {
                          e.currentTarget.onerror = null; 
                          e.currentTarget.src = 'https://placehold.co/800x400/e2e8f0/64748b?text=Error';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-2 rounded w-fit shadow-sm relative overflow-hidden" style={{backgroundColor: ad.bgColor || '#0f172a'}}>
                      <span className="font-bold text-xs relative z-10" style={{color: ad.textColor || '#ffffff'}}>{ad.title}</span>
                      {ad.btnText && <span className="px-2 py-1 text-[10px] rounded relative z-10" style={{backgroundColor: ad.btnColor || '#06b6d4', color: '#fff'}}>{ad.btnText}</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{ad.position}</td>
                <td className="px-6 py-4"><StatusBadge status={ad.status} /></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleToggleStatus(ad)} className="p-2 text-slate-400 hover:text-amber-600"><Power size={16}/></button>
                  <button onClick={() => openEditModal(ad)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(ad.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-xl"><div className="p-6 border-b flex justify-between"><h3 className="font-bold">Diseñador de Banner</h3><button onClick={()=>setIsModalOpen(false)}><X/></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input type="hidden" name="status" defaultValue={editingItem?.status || 'Activo'} />
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">Posición del Anuncio</label>
              <select name="position" defaultValue={editingItem?.position || 'Cintillo Superior'} className="w-full border p-2 rounded">
                <option>Cintillo Superior</option><option>Banner Mitad de Página</option><option>Pop-up</option>
              </select>
            </div>
            
            <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex justify-between">
                  <span>URL de Imagen (Diseño propio)</span>
                </label>
                <input 
                  name="imageUrl" 
                  type="url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ej. https://i.imgur.com/tu-gif.gif"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg outline-none text-sm"
                />
                <p className="text-[10px] text-amber-600 font-medium mt-2">⚠️ Para Banners animados, usar <b>imgur.com</b> o <b>postimages.org</b> garantiza que el GIF se reproduzca siempre.</p>
                
                {imageUrl && (
                  <div className="mt-3 flex items-center justify-center bg-slate-100 border border-slate-200 rounded overflow-hidden h-24 relative">
                    <img 
                      src={formatImageUrl(imageUrl)} 
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Preview"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/800x400/e2e8f0/64748b?text=Error'; }}
                    />
                  </div>
                )}
            </div>

            <div><label className="text-xs font-bold uppercase mb-1 block">Título</label><input name="title" defaultValue={editingItem?.title} required className="w-full border p-2 rounded"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold uppercase mb-1 block">Texto Botón</label><input name="btnText" defaultValue={editingItem?.btnText} required className="w-full border p-2 rounded"/></div>
              <div><label className="text-xs font-bold uppercase mb-1 block">URL Destino</label><input name="link" defaultValue={editingItem?.link || '#'} type="text" className="w-full border p-2 rounded"/></div>
            </div>
            
            <div className={`grid grid-cols-3 gap-4 border p-4 rounded-lg transition-opacity ${imageUrl ? 'bg-slate-100 opacity-50 border-slate-200' : 'border-slate-100 bg-slate-50'}`}>
              <div className="col-span-3">
                <p className="text-[10px] font-bold text-red-500 uppercase mb-1">
                  {imageUrl ? 'Colores deshabilitados (Se mostrará tu imagen)' : 'Estilos de fondo y texto (Si no usas imagen)'}
                </p>
              </div>
              <div><label className="text-[10px] font-bold uppercase mb-1 block text-slate-500">Color Fondo</label><input name="bgColor" type="color" defaultValue={editingItem?.bgColor || '#0f172a'} disabled={!!imageUrl} className="w-full h-8 cursor-pointer disabled:cursor-not-allowed"/></div>
              <div><label className="text-[10px] font-bold uppercase mb-1 block text-slate-500">Color Texto</label><input name="textColor" type="color" defaultValue={editingItem?.textColor || '#ffffff'} disabled={!!imageUrl} className="w-full h-8 cursor-pointer disabled:cursor-not-allowed"/></div>
              <div><label className="text-[10px] font-bold uppercase mb-1 block text-slate-500">Color Botón</label><input name="btnColor" type="color" defaultValue={editingItem?.btnColor || '#06b6d4'} disabled={!!imageUrl} className="w-full h-8 cursor-pointer disabled:cursor-not-allowed"/></div>
            </div>
            <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded mt-4">Guardar y Publicar</button>
          </form></div>
        </div>
      )}
    </div>
  );
}