import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Translation interface
interface TranslationKey {
  [key: string]: string | TranslationKey;
}

interface Translations {
  [language: string]: TranslationKey;
}

// Available languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

// Translation data structure
const translations: Translations = {
  en: {
    nav: {
      home: "Home",
      projects: "Projects",
      professionals: "Professionals",
      companies: "Companies",
      profile: "Profile",
      messages: "Messages",
      career_insights: "Career Insights",
      logout: "Logout",
      login: "Login",
      signup: "Sign Up"
    },
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      submit: "Submit",
      back: "Back",
      next: "Next",
      previous: "Previous",
      view_all: "View All",
      show_more: "Show More",
      show_less: "Show Less",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information"
    },
    auth: {
      email: "Email",
      password: "Password",
      remember_me: "Remember me",
      forgot_password: "Forgot password?",
      dont_have_account: "Don't have an account?",
      already_have_account: "Already have an account?",
      login_success: "Login successful",
      logout_success: "Logout successful",
      signup_success: "Account created successfully"
    },
    profile: {
      title: "Profile",
      personal_info: "Personal Information",
      professional_info: "Professional Information",
      company_info: "Company Information",
      settings: "Settings",
      notifications: "Notifications",
      language: "Language",
      first_name: "First Name",
      last_name: "Last Name",
      email: "Email Address",
      bio: "Bio",
      skills: "Skills",
      experience: "Experience",
      hourly_rate: "Hourly Rate",
      availability: "Availability",
      location: "Location",
      website: "Website",
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio"
    },
    feedback: {
      title: "Feedback",
      no_feedback: "No feedback yet",
      no_feedback_desc: "This professional hasn't received any feedback from clients yet.",
      leave_feedback: "Leave Feedback",
      rating: "Rating",
      comment: "Comment",
      submit_feedback: "Submit Feedback",
      rating_required: "Rating Required",
      rating_required_desc: "Please select a rating before submitting.",
      feedback_submitted: "Feedback Submitted",
      feedback_success: "Your feedback has been submitted successfully!",
      client_feedback: "Client Feedback",
      average_rating: "Average Rating",
      reviews: "reviews",
      review: "review",
      excellent: "Excellent - Outstanding work",
      very_good: "Very Good - Exceeds expectations", 
      good: "Good - Meets expectations",
      fair: "Fair - Below expectations",
      poor: "Poor - Unsatisfactory work"
    },
    projects: {
      title: "Projects",
      create_project: "Create Project",
      project_title: "Project Title",
      description: "Description",
      budget: "Budget",
      deadline: "Deadline",
      status: "Status",
      skills_required: "Skills Required",
      applications: "Applications",
      apply: "Apply",
      edit_project: "Edit Project",
      delete_project: "Delete Project"
    },
    professionals: {
      title: "Professionals",
      find_talent: "Find Talent",
      search_professionals: "Search professionals...",
      experience_level: "Experience Level",
      availability: "Availability",
      hourly_rate: "Hourly Rate",
      location: "Location",
      skills: "Skills",
      view_profile: "View Profile",
      send_message: "Send Message",
      connect: "Connect",
      available: "Available",
      partially_available: "Partially Available",
      unavailable: "Unavailable",
      junior: "Junior",
      mid: "Mid-Level",
      senior: "Senior",
      lead: "Lead",
      principal: "Principal"
    },
    messages: {
      title: "Messages",
      new_message: "New Message",
      search_messages: "Search messages...",
      type_message: "Type a message...",
      send: "Send",
      online: "Online",
      offline: "Offline",
      last_seen: "Last seen"
    },
    companies: {
      title: "Companies",
      company_name: "Company Name",
      industry: "Industry",
      company_size: "Company Size",
      founded: "Founded",
      headquarters: "Headquarters",
      view_company: "View Company"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      projects: "Proyectos",
      professionals: "Profesionales", 
      companies: "Empresas",
      profile: "Perfil",
      messages: "Mensajes",
      career_insights: "Perspectivas Profesionales",
      logout: "Cerrar Sesión",
      login: "Iniciar Sesión",
      signup: "Registrarse"
    },
    common: {
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      edit: "Editar",
      delete: "Eliminar",
      confirm: "Confirmar",
      search: "Buscar",
      filter: "Filtrar",
      clear: "Limpiar",
      submit: "Enviar",
      back: "Atrás",
      next: "Siguiente",
      previous: "Anterior",
      view_all: "Ver Todo",
      show_more: "Mostrar Más",
      show_less: "Mostrar Menos",
      error: "Error",
      success: "Éxito",
      warning: "Advertencia",
      info: "Información"
    },
    auth: {
      email: "Correo Electrónico",
      password: "Contraseña",
      remember_me: "Recordarme",
      forgot_password: "¿Olvidaste tu contraseña?",
      dont_have_account: "¿No tienes una cuenta?",
      already_have_account: "¿Ya tienes una cuenta?",
      login_success: "Inicio de sesión exitoso",
      logout_success: "Cierre de sesión exitoso",
      signup_success: "Cuenta creada exitosamente"
    },
    profile: {
      title: "Perfil",
      personal_info: "Información Personal",
      professional_info: "Información Profesional",
      company_info: "Información de la Empresa",
      settings: "Configuración",
      notifications: "Notificaciones",
      language: "Idioma",
      first_name: "Nombre",
      last_name: "Apellido",
      email: "Dirección de Correo",
      bio: "Biografía",
      skills: "Habilidades",
      experience: "Experiencia",
      hourly_rate: "Tarifa por Hora",
      availability: "Disponibilidad",
      location: "Ubicación",
      website: "Sitio Web",
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portafolio"
    },
    feedback: {
      title: "Comentarios",
      no_feedback: "Sin comentarios aún",
      no_feedback_desc: "Este profesional aún no ha recibido comentarios de clientes.",
      leave_feedback: "Dejar Comentario",
      rating: "Calificación",
      comment: "Comentario",
      submit_feedback: "Enviar Comentario",
      rating_required: "Calificación Requerida",
      rating_required_desc: "Por favor selecciona una calificación antes de enviar.",
      feedback_submitted: "Comentario Enviado",
      feedback_success: "¡Tu comentario ha sido enviado exitosamente!",
      client_feedback: "Comentarios de Clientes",
      average_rating: "Calificación Promedio",
      reviews: "reseñas",
      review: "reseña",
      excellent: "Excelente - Trabajo sobresaliente",
      very_good: "Muy Bueno - Supera las expectativas",
      good: "Bueno - Cumple las expectativas",
      fair: "Regular - Por debajo de las expectativas",
      poor: "Malo - Trabajo insatisfactorio"
    },
    projects: {
      title: "Proyectos",
      create_project: "Crear Proyecto",
      project_title: "Título del Proyecto",
      description: "Descripción",
      budget: "Presupuesto",
      deadline: "Fecha Límite",
      status: "Estado",
      skills_required: "Habilidades Requeridas",
      applications: "Aplicaciones",
      apply: "Aplicar",
      edit_project: "Editar Proyecto",
      delete_project: "Eliminar Proyecto"
    },
    professionals: {
      title: "Profesionales",
      find_talent: "Encontrar Talento",
      search_professionals: "Buscar profesionales...",
      experience_level: "Nivel de Experiencia",
      availability: "Disponibilidad",
      hourly_rate: "Tarifa por Hora",
      location: "Ubicación",
      skills: "Habilidades",
      view_profile: "Ver Perfil",
      send_message: "Enviar Mensaje",
      connect: "Conectar",
      available: "Disponible",
      partially_available: "Parcialmente Disponible",
      unavailable: "No Disponible",
      junior: "Junior",
      mid: "Nivel Medio",
      senior: "Senior",
      lead: "Líder",
      principal: "Principal"
    },
    messages: {
      title: "Mensajes",
      new_message: "Nuevo Mensaje",
      search_messages: "Buscar mensajes...",
      type_message: "Escribe un mensaje...",
      send: "Enviar",
      online: "En línea",
      offline: "Desconectado",
      last_seen: "Última vez visto"
    },
    companies: {
      title: "Empresas",
      company_name: "Nombre de la Empresa",
      industry: "Industria",
      company_size: "Tamaño de la Empresa",
      founded: "Fundada",
      headquarters: "Sede",
      view_company: "Ver Empresa"
    }
  },
  fr: {
    nav: {
      home: "Accueil",
      projects: "Projets",
      professionals: "Professionnels",
      companies: "Entreprises",
      profile: "Profil",
      messages: "Messages",
      career_insights: "Perspectives de Carrière",
      logout: "Déconnexion",
      login: "Connexion",
      signup: "S'inscrire"
    },
    common: {
      loading: "Chargement...",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      confirm: "Confirmer",
      search: "Rechercher",
      filter: "Filtrer",
      clear: "Effacer",
      submit: "Soumettre",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      view_all: "Voir Tout",
      show_more: "Afficher Plus",
      show_less: "Afficher Moins",
      error: "Erreur",
      success: "Succès",
      warning: "Avertissement",
      info: "Information"
    },
    auth: {
      email: "E-mail",
      password: "Mot de passe",
      remember_me: "Se souvenir de moi",
      forgot_password: "Mot de passe oublié?",
      dont_have_account: "Vous n'avez pas de compte?",
      already_have_account: "Vous avez déjà un compte?",
      login_success: "Connexion réussie",
      logout_success: "Déconnexion réussie",
      signup_success: "Compte créé avec succès"
    },
    profile: {
      title: "Profil",
      personal_info: "Informations Personnelles",
      professional_info: "Informations Professionnelles",
      company_info: "Informations de l'Entreprise",
      settings: "Paramètres",
      notifications: "Notifications",
      language: "Langue",
      first_name: "Prénom",
      last_name: "Nom",
      email: "Adresse E-mail",
      bio: "Biographie",
      skills: "Compétences",
      experience: "Expérience",
      hourly_rate: "Tarif Horaire",
      availability: "Disponibilité",
      location: "Localisation",
      website: "Site Web",
      linkedin: "LinkedIn",
      github: "GitHub",
      portfolio: "Portfolio"
    },
    feedback: {
      title: "Commentaires",
      no_feedback: "Aucun commentaire encore",
      no_feedback_desc: "Ce professionnel n'a pas encore reçu de commentaires de clients.",
      leave_feedback: "Laisser un Commentaire",
      rating: "Évaluation",
      comment: "Commentaire",
      submit_feedback: "Soumettre le Commentaire",
      rating_required: "Évaluation Requise",
      rating_required_desc: "Veuillez sélectionner une évaluation avant de soumettre.",
      feedback_submitted: "Commentaire Soumis",
      feedback_success: "Votre commentaire a été soumis avec succès!",
      client_feedback: "Commentaires Clients",
      average_rating: "Évaluation Moyenne",
      reviews: "avis",
      review: "avis",
      excellent: "Excellent - Travail exceptionnel",
      very_good: "Très Bon - Dépasse les attentes",
      good: "Bon - Répond aux attentes",
      fair: "Correct - En dessous des attentes",
      poor: "Médiocre - Travail insatisfaisant"
    },
    projects: {
      title: "Projets",
      create_project: "Créer un Projet",
      project_title: "Titre du Projet",
      description: "Description",
      budget: "Budget",
      deadline: "Date Limite",
      status: "Statut",
      skills_required: "Compétences Requises",
      applications: "Candidatures",
      apply: "Postuler",
      edit_project: "Modifier le Projet",
      delete_project: "Supprimer le Projet"
    },
    professionals: {
      title: "Professionnels",
      find_talent: "Trouver des Talents",
      search_professionals: "Rechercher des professionnels...",
      experience_level: "Niveau d'Expérience",
      availability: "Disponibilité",
      hourly_rate: "Tarif Horaire",
      location: "Localisation",
      skills: "Compétences",
      view_profile: "Voir le Profil",
      send_message: "Envoyer un Message",
      connect: "Se Connecter",
      available: "Disponible",
      partially_available: "Partiellement Disponible",
      unavailable: "Indisponible",
      junior: "Junior",
      mid: "Niveau Intermédiaire",
      senior: "Senior",
      lead: "Chef",
      principal: "Principal"
    },
    messages: {
      title: "Messages",
      new_message: "Nouveau Message",
      search_messages: "Rechercher des messages...",
      type_message: "Tapez un message...",
      send: "Envoyer",
      online: "En ligne",
      offline: "Hors ligne",
      last_seen: "Vu pour la dernière fois"
    },
    companies: {
      title: "Entreprises",
      company_name: "Nom de l'Entreprise",
      industry: "Industrie",
      company_size: "Taille de l'Entreprise",
      founded: "Fondée",
      headquarters: "Siège Social",
      view_company: "Voir l'Entreprise"
    }
  }
};

// Get nested translation value
function getNestedTranslation(obj: TranslationKey, key: string): string {
  const keys = key.split('.');
  let current: any = obj;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return key; // Return key if not found
    }
  }
  
  return typeof current === 'string' ? current : key;
}

// Translation context
interface TranslationContextType {
  language: string;
  t: (key: string, fallback?: string) => string;
  setLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation provider
interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(user?.language || 'en');

  // Update language when user changes
  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguageState(user.language);
    }
  }, [user?.language, language]);

  const t = (key: string, fallback?: string): string => {
    const currentTranslations = translations[language] || translations['en'];
    const translation = getNestedTranslation(currentTranslations, key);
    return translation !== key ? translation : (fallback || key);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  return (
    <TranslationContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Translation hook
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Quick translation hook for components
export function useT() {
  const { t } = useTranslation();
  return t;
}