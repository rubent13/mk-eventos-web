import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  PlayCircle, 
  BookOpen, 
  Users, 
  Activity,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Search,
  Filter,
  Ticket,
  CreditCard,
  Smartphone,
  Landmark,
  HelpCircle,
  ChevronDown,
  Menu,
  Youtube,
  Settings
} from 'lucide-react';

// --- IMPORTANTE PARA TU ENTORNO LOCAL ---
// Importa tu AdminPanel real
import AdminPanel from './AdminPanel';

// --- UTILS ---
// Utilidad para formatear automáticamente URLs de Google Drive a visor nativo
// Soporta: GIF, PNG, JPG, JPEG, WEBP
const formatImageUrl = (url) => {
  if (!url) return '';
  
  // Si es una URL de Google Drive, convertir al formato correcto preservando la extensión
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // Extraer la extensión del URL si existe
      const extMatch = url.match(/\.(gif|png|jpg|jpeg|webp)(\?|$)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : '';
      
      if (ext) {
        // Si tiene extensión, usarla en la URL de Googleusercontent
        return `https://lh3.googleusercontent.com/d/${match[1]}?format=${ext}`;
      }
      // Si no tiene extensión, usar el endpoint estándar (funciona para la mayoría)
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  
  // Para URLs directas con extensiones de imagen, retornarla tal cual
  // Esto incluye Imgur, AWS S3, servidores propios, etc.
  const directExt = url.match(/\.(gif|png|jpg|jpeg|webp)(\?|$)/i);
  if (directExt) {
    return url;
  }
  
  // Si no se reconoce el formato, intentar con Google Drive por defecto
  return url;
};

// --- COMPONENTE MOCK ADMIN PANEL PARA PREVISUALIZAR SIN ERROR ---
// Solo es de respaldo para que la previsualización no falle en este entorno. 
function AdminPanelMock() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center">
       <Settings size={48} className="text-cyan-500 mb-4 animate-spin-slow" />
       <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
       <p className="text-slate-400 max-w-md mx-auto mb-4">Esta es la ruta de administración segura. En tu entorno local, al descomentar el import, verás tu panel real aquí.</p>
       <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-cyan-500 rounded text-slate-900 font-bold">Volver al Inicio</button>
    </div>
  );
}

// --- CONFIGURACIÓN DE LA BASE DE DATOS EN LA NUBE (GOOGLE APPS SCRIPT) ---
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwupJDhh2qP1QfEti1fS4asqSoJZD3mRb73YeGZumn87u4lq-DMdV-iQg39rKPuJ7NAqw/exec'; 

// --- EPISODIOS DEL PODCAST (YOUTUBE) ---
const PODCAST_EPISODES = [
  { 
    id: "ep1", 
    title: "Tribuna médica 💙⚕️ (Ep1) Adicción a pantallas⚕️", 
    duration: "15:17", 
    url: "https://www.youtube.com/embed/6mxvjDqwsT0?si=WTE7WqJTgMn_n03M", 
    thumbnail: "https://img.youtube.com/vi/6mxvjDqwsT0/hqdefault.jpg" 
  },
  { 
    id: "ep2", 
    title: "Tribuna médica 💙⚕️ (Ep1) Adicción a pantallas⚕️", 
    duration: "15:17", 
    url: "https://www.youtube.com/embed/6mxvjDqwsT0?si=WTE7WqJTgMn_n03M", 
    thumbnail: "https://img.youtube.com/vi/6mxvjDqwsT0/hqdefault.jpg" 
  },
  { 
    id: "ep3", 
    title: "Tribuna médica 💙⚕️ (Ep2) Primeros auxilios ⛑️", 
    duration: "6:57", 
    url: "https://www.youtube.com/embed/s_uaV8ZaPhA?si=DxGRFV-wWTrpbmFg", 
    thumbnail: "https://img.youtube.com/vi/s_uaV8ZaPhA/hqdefault.jpg" 
  },
  { 
    id: "ep4", 
    title: "Tribuna médica 💙⚕️ (Ep3) inhibidores de la fosfodiesterasa tipo 5 (PDE5)", 
    duration: "12:35", 
    url: "https://www.youtube.com/embed/VD3q0JBC3QU?si=ZeHSyn_RUFXDTkc4", 
    thumbnail: "https://img.youtube.com/vi/VD3q0JBC3QU/hqdefault.jpg" 
  }
];

// --- LISTAS PARA FILTROS DE BÚSQUEDA ---
const VENEZUELAN_CITIES = [
  "Acarigua", "Anaco", "Barcelona", "Barinas", "Barquisimeto",
  "Cabimas", "Caracas", "Carúpano", "Ciudad Bolívar", "Ciudad Guayana",
  "Ciudad Ojeda", "Coro", "Cumaná", "El Tigre", "Guarenas",
  "Guatire", "La Victoria", "Los Teques", "Maracaibo", "Maracay",
  "Maturín", "Mérida", "Ocumare del Tuy", "Punto Fijo",
  "San Cristóbal", "San Fernando de Apure", "San Juan de los Morros",
  "Valencia", "Valera", "Valle de la Pascua"
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// --- COMPONENTES ADICIONALES ---
const FAQSection = () => {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "¿Cómo me inscribo a un evento o curso?", a: "Selecciona el evento en nuestra cartelera, haz clic en 'Comprar Entradas' o 'Ver Detalles', llena el formulario y serás redirigido a WhatsApp para concretar tu pago." },
    { q: "¿Cuáles son los métodos de pago aceptados?", a: "Aceptamos pagos a través de Zelle, Binance Pay, Pago Móvil y Transferencias Bancarias nacionales." },
    { q: "¿Los certificados tienen aval universitario?", a: "Sí, la mayoría de nuestros congresos y diplomados cuentan con aval universitario y/o institucional reconocidos." },
    { q: "¿Cómo valido la autenticidad de mi certificado?", a: "Puedes validar tu certificado enviando el código de registro al correo validaciones@medicalknowledge.com, y nuestro equipo médico lo verificará." },
    { q: "¿Qué pasa si no puedo asistir a un evento presencial?", a: "Debes notificar con al menos 48 horas de anticipación. Podrás optar por una nota de crédito para futuros eventos." },
    { q: "¿Ofrecen reembolsos?", a: "No ofrecemos reembolsos de dinero en efectivo, pero sí permitimos transferir tu entrada a otra persona o usar el saldo a favor para otro curso." },
    { q: "¿Cómo accedo a los cursos online?", a: "Una vez confirmado tu pago, recibirás en tu correo electrónico el enlace de acceso y tus credenciales para nuestra plataforma virtual." },
    { q: "¿Qué es el aval INPSASEL para empresas?", a: "Nuestros diplomados empresariales cumplen con la normativa de seguridad laboral de Venezuela y son dictados por profesionales registrados en INPSASEL." },
    { q: "¿Puedo pagar los diplomados en cuotas?", a: "Sí, para los programas de larga duración (como diplomados) ofrecemos planes de financiamiento en cómodas cuotas." },
    { q: "¿Dónde están ubicadas sus oficinas principales?", a: "Nuestra sede principal para atención y organización logística se encuentra en Maracay, Aragua." }
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 min-h-[60vh]">
      <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase text-slate-900 tracking-tight">
        <HelpCircle className="inline-block mr-3 text-cyan-500 mb-1" size={36}/> 
        Preguntas Frecuentes
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <button 
              className="w-full text-left p-5 font-bold text-slate-800 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors" 
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-lg">{faq.q}</span>
              <ChevronDown className={`transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="p-5 text-slate-600 bg-white border-t border-slate-100 text-base leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- LOGO VECTORIAL MK ---
const MKLogo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="mkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="url(#mkGrad)" />
      <path d="M50 5 L50 95" stroke="url(#mkGrad)" />
      <path d="M5 50 L95 50" stroke="url(#mkGrad)" />
      <path d="M27.5 27.5 L50 50 L72.5 27.5" stroke="url(#mkGrad)" />
      <path d="M27.5 72.5 L50 50 L72.5 72.5" stroke="url(#mkGrad)" />
      <path d="M5 50 L50 72.5 L95 50" stroke="url(#mkGrad)" />
      <path d="M5 50 L50 27.5 L95 50" stroke="url(#mkGrad)" />
    </g>
  </svg>
);

// --- APLICACIÓN PRINCIPAL ---
export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const isAdminRoute = currentPath === '/admin' || currentHash === '#/admin';

  if (isAdminRoute) {
    // Renderiza el AdminPanel real cuando se accede a /admin
    return <AdminPanel />;
  }

  return <HomePage />;
}

// --- HOME PAGE COMPONENT ---
function HomePage() {
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [activePodcast, setActivePodcast] = useState(PODCAST_EPISODES[0]);

  // --- ESTADOS DE LA BASE DE DATOS (Vacíos por defecto) ---
  const [eventosBD, setEventosBD] = useState([]);
  const [cursosBD, setCursosBD] = useState([]);
  const [slidesBD, setSlidesBD] = useState([]);
  const [adsBD, setAdsBD] = useState([]);

  // --- CONEXIÓN A GOOGLE APPS SCRIPT (NUEVO BACKEND EN LA NUBE) ---
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      if (!GOOGLE_APPS_SCRIPT_URL) return; 

      try {
        const [resEvt, resCur, resCar, resAds] = await Promise.all([
          fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=eventos`).catch(() => ({ok: false})),
          fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=cursos`).catch(() => ({ok: false})),
          fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=carrusel`).catch(() => ({ok: false})),
          fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=publicidad`).catch(() => ({ok: false}))
        ]);

        if (!isMounted) return;

        if (resEvt.ok) {
          const evts = await resEvt.json();
          setEventosBD(Array.isArray(evts) ? evts.filter(e => e.status !== 'Inactivo') : []);
        }
        if (resCur.ok) {
          const curs = await resCur.json();
          setCursosBD(Array.isArray(curs) ? curs.filter(c => c.status !== 'Inactivo') : []);
        }
        if (resCar.ok) {
          const car = await resCar.json();
          setSlidesBD(Array.isArray(car) ? car.filter(c => c.status !== 'Inactivo') : []);
        }
        if (resAds.ok) {
          const ads = await resAds.json();
          setAdsBD(Array.isArray(ads) ? ads.filter(a => a.status !== 'Inactivo') : []);
        }

      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    fetchAllData(); 
    const interval = setInterval(fetchAllData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  // -----------------------------------------------------------

  // --- CONTROLADORES DE LOS CARRUSELES AUTOMÁTICOS ---
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeAdSlide, setActiveAdSlide] = useState(0);

  const topAds = adsBD.filter(ad => ad.position === 'Cintillo Superior');
  const midAds = adsBD.filter(ad => ad.position === 'Banner Mitad de Página');

  // --- NUEVA LÓGICA PARA EL POP-UP ---
  const popupAds = adsBD.filter(ad => ad.position === 'Pop-up');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Si hay algún pop-up activo en la base de datos, lo mostramos 2 segundos después de entrar
    if (popupAds.length > 0) {
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [popupAds.length]);

  useEffect(() => {
    if (slidesBD.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === slidesBD.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesBD.length]);

  useEffect(() => {
    if (midAds.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAdSlide((prev) => (prev === midAds.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [midAds.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev === slidesBD.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setActiveSlide((prev) => (prev === 0 ? slidesBD.length - 1 : prev - 1));

  const [currentView, setCurrentView] = useState('home');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // RESTAURADO: Estado formData que faltaba
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', telefono: '', correo: '', profesion: ''
  });
  
  // --- NUEVOS ESTADOS PARA BÚSQUEDA AVANZADA ---
  const [searchForm, setSearchForm] = useState({ query: '', month: '', city: '' });
  const [activeSearch, setActiveSearch] = useState({ query: '', month: '', city: '' });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const phone = "584221590023";
    const text = `Hola, quiero adquirir entradas para *${selectedEvent.title}*.\n\nMis datos:\n*Nombre:* ${formData.nombre} ${formData.apellido}\n*Teléfono:* ${formData.telefono}\n*Correo:* ${formData.correo}\n*Profesión:* ${formData.profesion}`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    setSelectedEvent(null);
    setFormData({ nombre: '', apellido: '', telefono: '', correo: '', profesion: '' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryFilter = (category) => {
    setCurrentView('home');
    setCategoryFilter(category);
    setTimeout(() => {
      document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSearchSubmit = () => {
    setCurrentView('home');
    setActiveSearch(searchForm); // Aplicamos los filtros activos solo al darle "Buscar"
    setTimeout(() => {
      document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- LÓGICA DE FILTRADO EN TIEMPO REAL (Categoría + Búsqueda) ---
  let filteredEvents = eventosBD;

  // 1. Filtro por botones de categoría superior
  if (categoryFilter !== 'Todos') {
    filteredEvents = filteredEvents.filter(e => e.category === categoryFilter);
  }

  // 2. Filtro por barra de texto (título, descripción o categoría)
  if (activeSearch.query) {
    const q = activeSearch.query.toLowerCase();
    filteredEvents = filteredEvents.filter(e =>
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q))
    );
  }

   // 3. Filtro por selector de mes
  if (activeSearch.month) {
    const selectedMonth = activeSearch.month.toLowerCase();
    
    // Diccionario avanzado para reconocer CUALQUIER formato de fecha que escribas en el admin
    const monthAliases = {
      "enero": ["enero", "ene", "/01", "-01", ".01"],
      "febrero": ["febrero", "feb", "/02", "-02", ".02"],
      "marzo": ["marzo", " mar ", " mar,", "mar.", "/03", "-03", ".03"], // Espacios previenen cruces con 'martes'
      "abril": ["abril", "abr", "/04", "-04", ".04"],
      "mayo": ["mayo", " may ", " may,", "may.", "/05", "-05", ".05"],
      "junio": ["junio", "jun", "/06", "-06", ".06"],
      "julio": ["julio", "jul", "/07", "-07", ".07"],
      "agosto": ["agosto", "ago", "/08", "-08", ".08"],
      "septiembre": ["septiembre", "sep", "sept", "/09", "-09", ".09"],
      "octubre": ["octubre", "oct", "/10", "-10", ".10"],
      "noviembre": ["noviembre", "nov", "/11", "-11", ".11"],
      "diciembre": ["diciembre", "dic", "/12", "-12", ".12"]
    };

    const aliases = monthAliases[selectedMonth] || [selectedMonth];

    filteredEvents = filteredEvents.filter(e => {
      // Agregamos espacios al inicio y final de la fecha para que la coincidencia sea exacta
      const dateStr = ` ${(e.dateFull || '').toLowerCase()} `; 
      const autoMonth = (e.month || '').toLowerCase();
      
      // Verifica si alguno de los formatos/alias del mes está escrito dentro de la fecha del evento
      return aliases.some(alias => dateStr.includes(alias)) || autoMonth === selectedMonth.substring(0, 3);
    });
  }

  // 4. Filtro por selector de ciudad
  if (activeSearch.city) {
    const c = activeSearch.city.toLowerCase();
    filteredEvents = filteredEvents.filter(e => {
      if (!e.location) return false;
      return e.location.toLowerCase().includes(c);
    });
  }

  const displaySlides = slidesBD.length > 0 ? slidesBD : [{
    id: 'default',
    title: 'Bienvenido a Medical Knowledge',
    subtitle: 'Tu plataforma de excelencia en formación médica y eventos en tiempo real.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070',
    buttonText: 'Esperando eventos...'
  }];

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans text-slate-800">
      
      {/* PUBLICIDAD SUPERIOR (Dinámica) */}
      {showAdBanner && topAds.length > 0 && (
        <div className="text-xs md:text-sm py-2 px-4 flex justify-between items-center z-50 relative border-b border-black/10" style={{backgroundColor: topAds[0].bgColor || '#0a1128'}}>
          <div className="flex-1 text-center font-semibold tracking-wide">
            <a href={topAds[0].link || '#'} target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-80" style={{color: topAds[0].textColor || '#ffffff'}}>{topAds[0].title}</a>
          </div>
          <button onClick={() => setShowAdBanner(false)} className="hover:opacity-70 transition p-1" style={{color: topAds[0].textColor || '#ffffff'}}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* NAVBAR ESTILO TICKETMASTER */}
      <nav className="bg-[#0f172a] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => {setCurrentView('home'); window.scrollTo(0,0); setIsMobileMenuOpen(false);}}>
              <img src="/Logo Sin fondo En blanco.png" alt="Logo" className="w-10 h-10 md:w-16 md:h-16" />
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tighter leading-none text-white">
                  MEDICAL <span className="text-cyan-500">KNOWLEDGE</span>
                </span>
              </div>
            </div>

            {/* Menú Hamburguesa Móvil */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-white hover:text-cyan-400 transition-colors p-2"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Enlaces y Buscador Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex gap-6">
                <button onClick={() => {setCurrentView('home'); window.scrollTo(0,0);}} className="text-sm font-bold uppercase tracking-wide hover:text-cyan-400 transition-colors">Eventos</button>
                <button onClick={() => {setCurrentView('home'); document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });}} className="text-sm font-bold uppercase tracking-wide hover:text-cyan-400 transition-colors">Cursos</button>
                <button onClick={() => {setCurrentView('home'); document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });}} className="text-sm font-bold uppercase tracking-wide text-slate-300 hover:text-cyan-400 transition-colors">Nosotros</button>
              </div>
              
              <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#0f172a] border-t border-slate-800 shadow-2xl z-40">
            <div className="flex flex-col px-6 pt-4 pb-8 space-y-4">
              <button onClick={() => {setCurrentView('home'); setIsMobileMenuOpen(false); window.scrollTo(0,0);}} className="text-left text-sm font-bold uppercase tracking-wide hover:text-cyan-400 transition-colors py-3 border-b border-slate-800">Inicio / Eventos</button>
              <button onClick={() => {setCurrentView('home'); setIsMobileMenuOpen(false); document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });}} className="text-left text-sm font-bold uppercase tracking-wide hover:text-cyan-400 transition-colors py-3 border-b border-slate-800">Cursos Académicos</button>
              <button onClick={() => {setCurrentView('home'); setIsMobileMenuOpen(false); document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });}} className="text-left text-sm font-bold uppercase tracking-wide hover:text-cyan-400 transition-colors py-3 border-b border-slate-800">Sobre Nosotros</button>
              <button onClick={() => {setCurrentView('faq'); setIsMobileMenuOpen(false); window.scrollTo(0,0);}} className="text-left text-sm font-bold uppercase tracking-wide hover:text-cyan-400 transition-colors py-3 border-b border-slate-800">Preguntas Frecuentes</button>
              
              <button className="bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white px-5 py-3 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 mt-6">
                <Ticket size={16} />
                Ingresar a Mi Cuenta
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* VISTA PREGUNTAS FRECUENTES */}
      {currentView === 'faq' && <FAQSection />}

      {/* CONTENEDOR PRINCIPAL */}
      <div className={currentView === 'home' ? 'block' : 'hidden'}>

        {/* --- CARRUSEL MODERNO (Dinámico) --- */}
        <section className="relative bg-[#f4f5f7] pt-4 md:pt-6 pb-6 md:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="relative w-full h-[400px] sm:h-[450px] md:h-[600px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 group">
              {displaySlides.map((slide, index) => (
                <div 
                  key={slide.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img 
                    src={formatImageUrl(slide.image)} 
                    alt={slide.title} 
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-linear ${index === activeSlide ? 'scale-110' : 'scale-100'}`} 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 md:from-[#0f172a]/80 via-[#0f172a]/50 md:via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full md:w-3/4 lg:w-2/3 flex flex-col justify-center h-full">
                    <div className="transform transition-all duration-700 translate-y-0 opacity-100">
                      <span className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 backdrop-blur-md border border-cyan-500/30 text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 md:mb-6">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        Destacado
                      </span>
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 leading-[1.15] tracking-tight">
                        {slide.title}
                      </h2>
                      <p className="text-sm md:text-xl text-slate-300 mb-6 md:mb-8 font-medium max-w-xl line-clamp-2 md:line-clamp-none">
                        {slide.subtitle}
                      </p>
                      {slidesBD.length > 0 && (
                        <button 
                          onClick={() => setSelectedEvent(slide)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-xl text-sm md:text-base font-black uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 w-full sm:w-auto"
                        >
                          {slide.buttonText || "Explorar"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {slidesBD.length > 1 && (
                <>
                  <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20">
                    <ChevronLeft size={28} />
                  </button>
                  <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20">
                    <ChevronRight size={28} />
                  </button>

                  <div className="absolute bottom-6 md:bottom-8 right-6 md:right-16 flex gap-2 md:gap-3 z-20">
                    {displaySlides.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${activeSlide === idx ? 'w-8 md:w-10 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'w-3 md:w-4 bg-white/40 hover:bg-white/70'}`}
                        aria-label={`Ir a diapositiva ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* --- BARRA DE BÚSQUEDA Y FILTROS FLOTANTE --- */}
            <div className="relative md:absolute mt-6 md:mt-0 md:-bottom-8 left-0 right-0 z-30 px-0 md:px-12 lg:px-20">
              <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl md:shadow-2xl p-3 flex flex-col md:flex-row gap-3 border border-slate-200/60 md:backdrop-blur-xl">
                <div className="flex-1 relative flex items-center bg-slate-50 md:bg-transparent rounded-xl md:rounded-none">
                  <Search className="absolute left-4 text-cyan-600" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar eventos, cursos..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-slate-700 outline-none focus:bg-slate-100 md:focus:bg-slate-50 transition-all font-semibold placeholder:font-medium placeholder:text-slate-400" 
                    value={searchForm.query}
                    onChange={(e) => setSearchForm({...searchForm, query: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  />
                </div>
                <div className="hidden md:block w-px bg-slate-200 my-2"></div>
                <div className="w-full md:w-1/4 relative flex items-center bg-slate-50 md:bg-transparent rounded-xl md:rounded-none">
                  <Calendar className="absolute left-4 text-cyan-600" size={20} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-slate-700 outline-none focus:bg-slate-100 md:focus:bg-slate-50 cursor-pointer font-semibold appearance-none"
                    value={searchForm.month}
                    onChange={(e) => setSearchForm({...searchForm, month: e.target.value})}
                  >
                    <option value="">Todos los meses</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="hidden md:block w-px bg-slate-200 my-2"></div>
                <div className="w-full md:w-1/4 relative flex items-center bg-slate-50 md:bg-transparent rounded-xl md:rounded-none">
                  <MapPin className="absolute left-4 text-cyan-600" size={20} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-slate-700 outline-none focus:bg-slate-100 md:focus:bg-slate-50 cursor-pointer font-semibold appearance-none"
                    value={searchForm.city}
                    onChange={(e) => setSearchForm({...searchForm, city: e.target.value})}
                  >
                    <option value="">Toda Venezuela</option>
                    {VENEZUELAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleSearchSubmit}
                  className="bg-[#0f172a] hover:bg-cyan-600 text-white px-8 py-3.5 rounded-xl font-bold transition-colors w-full md:w-auto uppercase tracking-wide text-sm mt-2 md:mt-0 shadow-md md:shadow-none"
                >
                  Buscar
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* --- SECCIÓN EVENTOS (Dinámica) --- */}
        <section id="eventos" className="pt-12 md:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Eventos Destacados</h2>
              <div className="w-20 h-1 bg-cyan-500 mt-2"></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {['Todos', 'Congreso', 'Taller', 'Online'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs md:text-sm font-bold uppercase px-3 py-1 rounded-full border transition-colors ${categoryFilter === cat ? 'bg-blue-900 text-white border-blue-900' : 'bg-transparent text-slate-500 border-slate-300 hover:border-blue-900 hover:text-blue-900'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center">
                 <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                 <h3 className="text-lg font-bold text-slate-600">No se encontraron eventos</h3>
                 <p className="text-slate-400 text-sm">
                   {(activeSearch.query || activeSearch.month || activeSearch.city || categoryFilter !== 'Todos') 
                     ? "Prueba eliminando algunos filtros de búsqueda para ver más resultados." 
                     : "Mantente atento a las actualizaciones de nuestra cartelera médica."}
                 </p>
                 {(activeSearch.query || activeSearch.month || activeSearch.city || categoryFilter !== 'Todos') && (
                   <button 
                     onClick={() => {
                       setCategoryFilter('Todos');
                       setSearchForm({ query: '', month: '', city: '' });
                       setActiveSearch({ query: '', month: '', city: '' });
                     }}
                     className="mt-5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm"
                   >
                     Limpiar Filtros
                   </button>
                 )}
              </div>
            )}

            {filteredEvents.map((event, idx) => (
              <div key={event.id || idx} className="bg-white rounded overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col h-full border border-slate-200 relative">
                
                <div className="relative h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img 
                    src={formatImageUrl(event.image) || 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&q=80&w=800'} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Enlace+Invalido'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {event.month && event.day && (
                    <div className="absolute top-3 left-3 bg-white text-center rounded shadow-lg overflow-hidden flex flex-col w-14">
                      <div className="bg-red-600 text-white text-[10px] font-bold uppercase py-1">{event.month}</div>
                      <div className="text-xl font-black text-slate-900 py-1">{event.day}</div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-1 rounded">
                    {event.category || 'General'}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="text-slate-500 text-sm mb-4 space-y-1 mt-auto">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-cyan-600" />
                      <span>{event.dateFull}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-cyan-600" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Desde</span>
                      <span className="text-lg font-black text-blue-900">{event.price}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="bg-blue-900 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors flex items-center justify-center"
                    >
                      Entradas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- PUBLICIDAD MEDIA CARRUSEL (Dinámico) --- */}
        {midAds.length > 0 && (
          <section className="py-10 bg-[#0f172a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-32 md:h-48 overflow-hidden rounded shadow-2xl border border-slate-700 bg-slate-900 group flex items-center justify-center">
              <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[10px] font-black uppercase px-3 py-1 z-20">
                Anuncio Patrocinado
              </div>
              
              {midAds.map((ad, idx) => (
                <a key={ad.id || idx} href={ad.link || '#'} target="_blank" rel="noreferrer"
                   className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${idx === activeAdSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                   style={{backgroundColor: ad.bgColor || '#0f172a'}}>
                   
                   {/* Imagen de fondo (sin capa oscura) centrada */}
                   {ad.imageUrl && (
                      <img 
                        src={formatImageUrl(ad.imageUrl)} 
                        alt="Ad" 
                        className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-105 opacity-100"
                      />
                   )}
                   
                   {/* Capa de texto opcional sobre el fondo/imagen */}
                   {(ad.title || ad.btnText) && (
                     <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
                       <div className="flex flex-col items-center text-center transform transition-transform group-hover:translate-x-2 duration-500 pt-20">
                         {ad.title && (
                           <h3 className="text-2xl md:text-3xl font-black max-w-lg tracking-tight uppercase" style={{color: ad.textColor || '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                             {ad.title}
                           </h3>
                         )}
                         {ad.btnText && (
                           <span className="px-5 py-2.5 text-sm font-bold rounded shadow-lg transition-transform hover:scale-105 uppercase tracking-wide mt-15 flex items-center justify-center" style={{backgroundColor: ad.btnColor || '#06b6d4', color: '#ffffff'}}>
                             {ad.btnText}
                           </span>
                         )}
                       </div>
                     </div>
                   )}
                </a>
              ))}

              {/* Controles de Publicidad (Si hay más de 1 anuncio) */}
              {midAds.length > 1 && (
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                   {midAds.map((_, idx) => (
                     <button key={idx} onClick={() => setActiveAdSlide(idx)}
                       className={`h-1.5 rounded-full transition-all duration-500 ${activeAdSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} 
                     />
                   ))}
                 </div>
              )}
            </div>
          </section>
        )}

        {/* --- SECCIÓN CURSOS Y DIPLOMADOS (Dinámica) --- */}
        <section id="cursos" className="py-16 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Cursos Académicos</h2>
              <div className="w-20 h-1 bg-cyan-500 mt-2 mb-4"></div>
              <p className="text-slate-500 text-sm md:text-base">Formación profesional con aval universitario e institucional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cursosBD.length === 0 && (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-bold text-slate-600">Próximamente Nuevos Cursos</h3>
                  <p className="text-slate-400 text-sm">Nuestro equipo académico está preparando nuevos diplomados.</p>
                </div>
              )}

              {cursosBD.map((course, idx) => (
                <div key={course.id || idx} className="bg-slate-50 rounded border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div className="h-40 overflow-hidden relative flex items-center justify-center">
                    <img src={formatImageUrl(course.image) || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded">
                      {course.modality}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 text-center md:text-left">{course.title}</h3>
                    <ul className="space-y-2 mb-6 flex-grow text-sm text-slate-600">
                      <li className="flex items-center justify-center md:justify-start gap-2">
                        <Clock size={16} className="text-cyan-600" /> {course.duration}
                      </li>
                      <li className="flex items-center justify-center md:justify-start gap-2">
                        <Award size={16} className="text-cyan-600" /> {course.certification}
                      </li>
                    </ul>
                    <button 
                      onClick={() => setSelectedEvent(course)}
                      className="w-full py-2.5 border-2 border-blue-900 text-blue-900 font-bold rounded hover:bg-blue-900 hover:text-white transition-colors uppercase text-sm flex items-center justify-center"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- SECCIÓN PODCAST YOUTUBE --- */}
            <div className="mt-20 mb-8 border-t border-slate-200 pt-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                    <Youtube className="text-red-600" size={36} />
                    Nuestro Podcast
                  </h2>
                  <div className="w-20 h-1 bg-red-600 mt-2 mb-4"></div>
                  <p className="text-slate-500 text-sm md:text-base">Aprende y actualízate con nuestros expertos en formato de video.</p>
                </div>
                <a href="https://www.youtube.com/@medicalknowledgevzla19" target="_blank" rel="noreferrer" className="hidden md:flex bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] items-center justify-center gap-2">
                  <Youtube size={18} /> Suscribirse al Canal
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#0f172a] rounded-2xl p-4 md:p-6 shadow-2xl">
                {/* Main Video */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center">
                  <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black shadow-cyan-900/20" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={activePodcast.url}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mt-4 tracking-tight leading-snug text-center">{activePodcast.title}</h3>
                </div>

                {/* Sidebar Thumbnails */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                  <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 border-b border-slate-800 pb-3 text-center md:text-left">Episodios Recientes</h4>
                  {PODCAST_EPISODES.filter(p => p.id !== activePodcast.id).map((podcast) => (
                    <button
                      key={podcast.id}
                      onClick={() => setActivePodcast(podcast)}
                      className="flex gap-4 items-center p-2 rounded-xl hover:bg-slate-800 transition-all text-left group border border-transparent hover:border-slate-700"
                    >
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden shrink-0 shadow-md flex items-center justify-center">
                        <img src={podcast.thumbnail} alt={podcast.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                           <PlayCircle className="text-white/80 group-hover:text-white transition-all group-hover:scale-110" size={24} />
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 rounded font-bold backdrop-blur-sm">{podcast.duration}</span>
                      </div>
                      <div className="flex flex-col py-0.5 justify-center">
                        <span className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-tight">{podcast.title}</span>
                        <span className="text-xs text-slate-500 mt-1.5 flex items-center gap-1"><Youtube size={12}/> Medical Knowledge</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <a href="https://www.youtube.com/@medicalknowledgevzla19" target="_blank" rel="noreferrer" className="md:hidden mt-6 bg-red-600 hover:bg-red-700 text-white w-full py-3.5 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2">
                <Youtube size={20} /> Suscribirse al Canal
              </a>
            </div>

            {/* Banner INPSASEL (Servicios Corporativos) */}
            <div className="mt-12 bg-blue-900 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-lg rounded border-l-8 border-cyan-500 text-center md:text-left">
              <div className="max-w-2xl flex flex-col items-center md:items-start">
                <h3 className="text-2xl font-black text-white mb-2 uppercase">Servicios Corporativos</h3>
                <p className="text-blue-100 text-sm md:text-base">
                  Organización y logística para empresas. Cursos con aval por <span className="font-bold text-cyan-300">INPSASEL</span>, foros y capacitaciones in-company a medida.
                </p>
              </div>
              <button className="mt-6 md:mt-0 bg-white hover:bg-cyan-50 text-blue-900 px-8 py-3 rounded font-black uppercase text-sm transition-colors shadow-md whitespace-nowrap flex items-center justify-center">
                Contactar Ventas
              </button>
            </div>
          </div>
        </section>

       {/* --- SECCIÓN NOSOTROS --- */}
        <section id="nosotros" className="py-20 bg-slate-100 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <img src="/Logo sin fondo.png" alt="Logo" className="w-28 h-28" />
                  <span className="text-slate-900 font-black tracking-tighter text-xl">MK EVENTOS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 uppercase tracking-tight">
                  Transformando la Educación en Salud
                </h2>
                <div className="w-16 h-1 bg-blue-900 mb-6"></div>
                <p className="text-slate-600 mb-4 font-medium">
                  En Medical Knowledge (MK) somos el puente entre la excelencia académica y los profesionales de la salud. Ofrecemos una plataforma segura para la gestión e inscripción de eventos médicos, conferencias y diplomados de alto nivel.
                </p>
                <p className="text-slate-600 mb-8">
                  Cuidamos cada detalle con un equipo 100% capacitado en logística de eventos, asegurando el éxito, la innovación y la mejor experiencia para nuestros participantes y aliados comerciales.
                </p>
                <div className="flex gap-4 justify-center md:justify-start w-full">
                  <div className="bg-white p-4 rounded shadow-sm border border-slate-200 flex-1 flex flex-col items-center justify-center">
                    <Activity className="w-8 h-8 text-cyan-500 mb-2" />
                    <div className="font-black text-slate-900 text-xl">+50</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Eventos Exitosos</div>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm border border-slate-200 flex-1 flex flex-col items-center justify-center">
                    <Users className="w-8 h-8 text-cyan-500 mb-2" />
                    <div className="font-black text-slate-900 text-xl">+2K</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Participantes</div>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <img src="/Logo sin fondo.png" 
                  alt="Conferencia Médica" 
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>

      </div> {/* FIN CONTENEDOR PRINCIPAL */}

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a1128] text-slate-300 pt-16 pb-8 border-t-[6px] border-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-center md:text-left">
            
            <div className="md:col-span-1 flex flex-col items-center md:items-start">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <img src="/Logo Sin fondo En blanco.png" alt="Logo" className="w-20 h-20 opacity-90" />
                <span className="text-xl font-black text-white tracking-tighter">
                  MEDICAL KNOWLEDGE
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Tu portal de confianza para entradas a eventos, congresos y cursos en el sector salud.
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
<a href="https://www.instagram.com/mediiknowledge?igsh=d2hjdmJ1dXRhcXY4" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white hover:bg-cyan-500 transition-colors">
                  <Instagram size={16} />
                </a>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Categorías</h4>
              <ul className="space-y-2 text-sm text-center md:text-left">
                <li><button onClick={() => handleCategoryFilter('Congreso')} className="hover:text-cyan-400 transition-colors">Congresos Médicos</button></li>
                <li><button onClick={() => handleCategoryFilter('Taller')} className="hover:text-cyan-400 transition-colors">Talleres Prácticos</button></li>
                <li><button onClick={() => handleCategoryFilter('Diplomado')} className="hover:text-cyan-400 transition-colors">Diplomados INPSASEL</button></li>
                <li><button onClick={() => handleCategoryFilter('Online')} className="hover:text-cyan-400 transition-colors">Eventos Online</button></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Soporte</h4>
              <ul className="space-y-2 text-sm text-center md:text-left">
                <li><a href="https://wa.me/584221590023?text=Hola,%20necesito%20atenci%C3%B3n%20al%20cliente" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Atención al Cliente</a></li>
                <li><button onClick={() => setShowPaymentModal(true)} className="hover:text-cyan-400 transition-colors">Métodos de Pago</button></li>
                <li><button onClick={() => {setCurrentView('faq'); window.scrollTo(0,0);}} className="hover:text-cyan-400 transition-colors">Preguntas Frecuentes</button></li>
                <li><a href="mailto:medicalknowledgevzla@gmail.com?subject=Validaci%C3%B3n%20de%20Certificados" className="hover:text-cyan-400 transition-colors">Validar Certificados</a></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contacto</h4>
              <ul className="space-y-3 text-sm flex flex-col items-center md:items-start">
                <li className="flex items-start gap-2 w-full justify-center md:justify-start">
                  <MapPin size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                  <div className="w-full max-w-[200px] h-24 md:h-32 rounded overflow-hidden bg-slate-800 border border-slate-700 relative z-0 flex items-center justify-center">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15693.3005825228!2d-67.61466045!3d10.2515082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e803c9b7b9f8f2d%3A0x33b1e3b6a2b8e3e!2sMaracay%2C%20Aragua!5e0!3m2!1ses!2sve!4v1710000000000!5m2!1ses!2sve" 
                      width="100%" 
                      height="100%" 
                      style={{border:0}} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación Oficina"
                    ></iframe>
                  </div>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Phone size={16} className="text-cyan-500 shrink-0" />
                  <span>+58 422 1590023</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} className="text-cyan-500 shrink-0" />
                  <span>medicalknowledgevzla@gmail.com</span>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} MEDICAL KNOWLEDGE MK, C.A. - RIF: J-507646025. Todos los derechos reservados.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button className="hover:text-white transition">Términos de Compra</button>
              <button className="hover:text-white transition">Privacidad</button>
            </div>
          </div>
        </div>
      </footer>

     {/* --- MODAL MEJORADO (MOBILE FRIENDLY) --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
          {/* Fondo oscuro */}
          <div className="absolute inset-0 bg-slate-900/90 md:bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)}></div>
          
          {/* Caja Principal del Modal */}
          <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl relative z-10 flex flex-col overflow-hidden animate-in fade-in duration-200">
            
            {/* Botón Cerrar Flotante */}
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute bottom-3 right-4 md:bottom-4 md:right-4 z-50 bg-white/90 md:bg-slate-100/90 text-slate-900 hover:bg-slate-200 p-2 rounded-full backdrop-blur-md shadow-sm transition-colors border border-slate-200"
            >
              <X size={20} />
            </button>

            {/* Contenedor scrolleable unificado en celular, dividido en PC */}
            <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden relative">
              
              {/* --- Columna Izquierda: Información --- */}
              <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 shrink-0 md:overflow-y-auto flex flex-col items-center md:items-start text-center md:text-left">
                
                <span className="bg-blue-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block shadow-sm">
                  {selectedEvent.category || 'Evento'}
                </span>
                
                <img 
                  src={formatImageUrl(selectedEvent.image)} 
                  alt={selectedEvent.title} 
                  className="w-full h-40 md:h-64 object-cover rounded-xl mb-5 shadow-sm border border-slate-200" 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/800x400/e2e8f0/64748b?text=Imagen+No+Disponible'; }}
                />
                
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
                  {selectedEvent.title}
                </h3>
                
                <div className="space-y-2 text-sm text-slate-600 font-medium mb-6 w-full flex flex-col items-center md:items-start">
                  <p className="flex items-center justify-center md:justify-start gap-2 w-full"><Calendar size={16} className="text-cyan-600 shrink-0"/> {selectedEvent.dateFull}</p>
                  <p className="flex items-center justify-center md:justify-start gap-2 w-full"><MapPin size={16} className="text-cyan-600 shrink-0"/> {selectedEvent.location}</p>
                </div>

                {selectedEvent.description && (
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm w-full">
                    {selectedEvent.description}
                  </p>
                )}

                {(selectedEvent.totalSeats && selectedEvent.occupiedSeats) && (
                  <div className="mt-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full">
                    <div className="flex justify-between text-xs font-bold uppercase mb-2">
                      <span className="text-slate-500">Disponibilidad</span>
                      <span className={(selectedEvent.totalSeats - selectedEvent.occupiedSeats) < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}>
                        {selectedEvent.totalSeats - selectedEvent.occupiedSeats} lugares
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${((selectedEvent.occupiedSeats / selectedEvent.totalSeats) * 100) > 80 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                        style={{ width: `${(selectedEvent.occupiedSeats / selectedEvent.totalSeats) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {selectedEvent.mapUrl && (
                  <div className="mt-6 w-full flex flex-col items-center md:items-start">
                    <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wide flex items-center justify-center md:justify-start">
                      <MapPin size={14} className="inline mr-1 text-cyan-600"/> Ubicación Exacta
                    </h4>
                    <div className="rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-200 relative z-0 w-full flex items-center justify-center shadow-sm">
                      <iframe src={selectedEvent.mapUrl} width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                  </div>
                )}
              </div>

              {/* --- Columna Derecha: Formulario --- */}
              <div className="w-full md:w-1/2 p-6 md:p-8 bg-white md:overflow-y-auto flex flex-col items-center md:items-stretch text-center md:text-left relative">
                
                <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center md:items-end gap-4 w-full">
                  <div className="flex flex-col items-center md:items-start">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inscripción</h2>
                    <p className="text-slate-500 text-sm mt-1">Completa los datos del titular de la entrada.</p>
                  </div>
                  <div className="text-center md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg w-full md:w-auto">
                    <span className="block text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wider">Total a pagar</span>
                    <span className="text-3xl font-black text-blue-900">{selectedEvent.price}</span>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4 w-full flex-1 flex flex-col items-center md:items-start">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-start w-full">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Nombre</label>
                      <input type="text" name="nombre" required value={formData.nombre} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium" />
                    </div>
                    <div className="flex flex-col items-start w-full">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Apellido</label>
                      <input type="text" name="apellido" required value={formData.apellido} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col items-start w-full">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Profesión / Ocupación</label>
                    <input type="text" name="profesion" required value={formData.profesion} onChange={handleInputChange} placeholder="Ej. Médico General, Estudiante..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium placeholder:text-slate-400 placeholder:font-normal" />
                  </div>

                  <div className="flex flex-col items-start w-full">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Correo Electrónico</label>
                    <input type="email" name="correo" required value={formData.correo} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium" />
                  </div>

                  <div className="flex flex-col items-start w-full mb-4">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wider">Teléfono (WhatsApp)</label>
                    <input type="tel" name="telefono" required value={formData.telefono} onChange={handleInputChange} placeholder="+58 412 0000000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium placeholder:text-slate-400 placeholder:font-normal" />
                  </div>

                  <div className="pt-2 w-full mt-auto flex flex-col items-center md:items-start">
                    <button type="submit" className="w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-xl font-black uppercase tracking-wide text-sm shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      Pagar por WhatsApp
                    </button>
                    <p className="text-center md:text-left text-[11px] text-slate-500 mt-4 font-medium w-full max-w-sm mx-auto md:mx-0">
                      Al continuar, aceptas nuestros términos de compra. Serás redirigido a atención al cliente.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL MÉTODOS DE PAGO --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl w-full max-w-sm relative z-10 p-6 md:p-8 flex flex-col items-center text-center md:items-start md:text-left">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Métodos de Pago</h3>
            <p className="text-slate-500 text-sm mb-6">Selecciona una opción para ver las instrucciones (vía WhatsApp).</p>
            
            <div className="grid grid-cols-1 gap-3 w-full">
              <a href="https://wa.me/584221590023?text=Hola,%20deseo%20pagar%20con%20Zelle" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-4 p-4 rounded border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition-all hover:scale-105">
                <Smartphone size={24} /> Zelle
              </a>
              <a href="https://wa.me/584221590023?text=Hola,%20deseo%20pagar%20con%20Binance%20Pay" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-4 p-4 rounded border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 font-bold transition-all hover:scale-105">
                <CreditCard size={24} /> Binance Pay
              </a>
              <a href="https://wa.me/584221590023?text=Hola,%20deseo%20pagar%20con%20Pago%20Móvil" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-4 p-4 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold transition-all hover:scale-105">
                <Smartphone size={24} /> Pago Móvil
              </a>
              <a href="https://wa.me/584221590023?text=Hola,%20deseo%20pagar%20con%20Transferencia%20Bancaria" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-4 p-4 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold transition-all hover:scale-105">
                <Landmark size={24} /> Transferencia Bancaria
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP PUBLICITARIO --- */}
      {showPopup && popupAds.length > 0 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-8">
          {/* Fondo oscuro desenfocado */}
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" onClick={() => setShowPopup(false)}></div>
          
          {/* Caja del Pop-up - Ahora se adapta al contenido dinámicamente y añade scroll si es necesario */}
          <div className="relative z-10 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center">

            {/* Botón Cerrar Flotante (Por fuera para que no tape el diseño) */}
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute -top-4 -right-2 md:-top-5 md:-right-5 z-20 bg-slate-800 hover:bg-slate-700 text-white p-2 md:p-3 rounded-full shadow-xl border-2 border-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-full flex flex-col items-center">
              {popupAds[0].imageUrl ? (
                // Si subiste una imagen/diseño propio
                <div className="relative group w-full flex flex-col items-center">
                  <a href={popupAds[0].link || '#'} target="_blank" rel="noreferrer" className="block w-full">
                    <img 
                      src={formatImageUrl(popupAds[0].imageUrl)} 
                      alt="Anuncio Especial" 
                      // object-contain evita que se corte. max-h limita la altura en vistas pequeñas para no desbordar.
                      className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] md:max-h-[85vh] object-contain mx-auto rounded-xl shadow-2xl"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Imagen+No+Disponible'; }}
                    />
                  </a>
                  
                  {/* Si llenaste el título o botón extra en el admin, se muestran abajo de la imagen sin estorbar */}
                  {(popupAds[0].title || popupAds[0].btnText) && (
                    <div className="w-full max-w-2xl p-4 mt-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl flex flex-col items-center border border-slate-200">
                      {popupAds[0].title && <h3 className="text-lg md:text-xl font-black text-slate-900 text-center mb-3 uppercase tracking-tight">{popupAds[0].title}</h3>}
                      {popupAds[0].btnText && (
                        <a href={popupAds[0].link || '#'} target="_blank" rel="noreferrer" className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all uppercase tracking-wide" style={{ backgroundColor: popupAds[0].btnColor || '#06b6d4', color: '#fff' }}>
                          {popupAds[0].btnText}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Si solo usaste los colores y texto del sistema (sin imagen)
                <div className="w-full p-6 sm:p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] max-h-[80vh] overflow-auto rounded-2xl shadow-2xl" style={{ backgroundColor: popupAds[0].bgColor || '#0f172a' }}>
                  <h3 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 uppercase tracking-tight leading-tight" style={{ color: popupAds[0].textColor || '#ffffff' }}>
                    {popupAds[0].title}
                  </h3>
                  {popupAds[0].btnText && (
                    <a href={popupAds[0].link || '#'} target="_blank" rel="noreferrer" className="px-8 py-3.5 md:px-10 md:py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform uppercase tracking-wide text-sm md:text-base" style={{ backgroundColor: popupAds[0].btnColor || '#06b6d4', color: '#fff' }}>
                      {popupAds[0].btnText}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}