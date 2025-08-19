import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.professionals": "Professionals",
      "nav.projects": "Projects",
      "nav.companies": "Companies",
      "nav.messages": "Messages",
      "nav.profile": "Profile",
      "nav.preventives": "Preventives",
      "nav.myProjects": "My Projects",
      "nav.careerInsights": "Career Insights",
      "nav.subscriptions": "Subscriptions",
      
      // Authentication
      "auth.login": "Log in",
      "auth.signup": "Sign up",
      "auth.logout": "Logout",
      "auth.loginToApply": "Login to Apply",
      
      // Common
      "common.loading": "Loading...",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.submit": "Submit",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.apply": "Apply",
      "common.view": "View",
      "common.close": "Close",
      "common.back": "Back",
      "common.next": "Next",
      "common.previous": "Previous",
      "common.yes": "Yes",
      "common.no": "No",
      "common.confirm": "Confirm",
      "common.select": "Select",
      "common.upload": "Upload",
      "common.download": "Download",
      "common.share": "Share",
      "common.copy": "Copy",
      "common.send": "Send",
      "common.reply": "Reply",
      "common.like": "Like",
      "common.comment": "Comment",
      "common.follow": "Follow",
      "common.unfollow": "Unfollow",
      "common.connect": "Connect",
      "common.disconnect": "Disconnect",
      "common.accept": "Accept",
      "common.decline": "Decline",
      "common.pending": "Pending",
      "common.approved": "Approved",
      "common.rejected": "Rejected",
      "common.active": "Active",
      "common.inactive": "Inactive",
      "common.online": "Online",
      "common.offline": "Offline",
      "common.toggleMenu": "Toggle menu",
      "common.success": "Success",
      "common.error": "Error",
      "common.unauthorized": "Unauthorized",
      "common.reloginMessage": "You are logged out. Logging in again...",
      
      // Home Page
      "home.welcome": "Welcome to VibeSync",
      "home.subtitle": "Connect with top IT professionals and discover amazing projects",
      "home.heroTitle": "Where IT talent meets opportunity",
      "home.heroSubtitle": "Connect with top IT professionals and innovative companies. Real-time collaboration, video calls, and smart project matching - all in one platform.",
      "home.professionalButton": "I'm a Professional",
      "home.companyButton": "I'm a Company",
      "home.professionalsCount": "IT Professionals",
      "home.companiesCount": "Companies", 
      "home.projectsCount": "Projects Completed",
      "home.onlineStatus": "professionals online",
      "home.meetTopProfessionals": "Meet Top IT Professionals",
      "home.connectWithExperts": "Connect with skilled developers, designers, and tech experts ready to bring your projects to life",
      "home.recentProjects": "Recent Projects",
      "home.topProfessionals": "Top Professionals",
      "home.noProjects": "No recent projects found",
      "home.noProfessionals": "No professionals found",
      
      // Projects
      "projects.title": "Projects",
      "projects.createNew": "Create New Project",
      "projects.myProjects": "My Projects",
      "projects.allProjects": "All Projects",
      "projects.status.open": "Open",
      "projects.status.inProgress": "In Progress", 
      "projects.status.completed": "Completed",
      "projects.status.cancelled": "Cancelled",
      "projects.status.assigned": "Assigned",
      "projects.budget": "Budget",
      "projects.deadline": "Deadline",
      "projects.skills": "Required Skills",
      "projects.description": "Description",
      "projects.company": "Company",
      "projects.applicants": "Applicants",
      "projects.applications": "Applications",
      "projects.viewApplications": "View Applications",
      "projects.noProjects": "No projects found",
      "projects.projectFull": "Project Full",
      "projects.applyNow": "Apply Now",
      "projects.applied": "Applied",
      "projects.postProject": "Post Project",
      "projects.searchProjects": "Search projects...",
      "projects.filterProjects": "Filter Projects",
      "projects.clearAll": "Clear All",
      "projects.allStatuses": "All statuses",
      "projects.foundResults_one": "Found {{count}} project",
      "projects.foundResults_other": "Found {{count}} projects",
      "projects.postSuccess": "Project posted successfully!",
      "projects.createError": "Failed to create project. Please try again.",
      
      // Professionals
      "professionals.title": "Professionals",
      "professionals.allProfessionals": "All Professionals",
      "professionals.skills": "Skills",
      "professionals.experience": "Experience",
      "professionals.hourlyRate": "Hourly Rate",
      "professionals.availability": "Availability",
      "professionals.available": "Available",
      "professionals.partiallyAvailable": "Partially Available", 
      "professionals.unavailable": "Unavailable",
      "professionals.location": "Location",
      "professionals.rating": "Rating",
      "professionals.noProfessionals": "No professionals found",
      "professionals.viewProfile": "View Profile",
      "professionals.sendMessage": "Send Message",
      "professionals.connectRequest": "Connect Request",
      "professionals.connected": "Connected",
      "professionals.requestPending": "Request Pending",
      
      // Profile
      "profile.title": "Profile",
      "profile.editProfile": "Edit Profile",
      "profile.personalInfo": "Personal Information",
      "profile.professionalInfo": "Professional Information",
      "profile.companyInfo": "Company Information",
      "profile.firstName": "First Name",
      "profile.lastName": "Last Name", 
      "profile.email": "Email",
      "profile.phone": "Phone",
      "profile.location": "Location",
      "profile.bio": "Bio",
      "profile.jobTitle": "Job Title",
      "profile.companyName": "Company Name",
      "profile.website": "Website",
      "profile.industry": "Industry",
      "profile.employeeCount": "Employee Count",
      "profile.founded": "Founded",
      "profile.profilePicture": "Profile Picture",
      "profile.updateSuccess": "Profile updated successfully",
      "profile.updateError": "Failed to update profile",
      "profile.language": "Preferred Language",
      
      // Messages
      "messages.title": "Messages",
      "messages.conversations": "Conversations",
      "messages.newMessage": "New Message",
      "messages.typeMessage": "Type a message...",
      "messages.noMessages": "No messages yet",
      "messages.noConversations": "No conversations found",
      "messages.selectConversation": "Select a conversation to start messaging",
      "messages.onlyConnected": "You can only message connected professionals",
      "messages.sendConnectionRequest": "Send a connection request first",
      
      // Subscriptions
      "subscriptions.title": "My Subscriptions",
      "subscriptions.subtitle": "Stay updated with projects you're following",
      "subscriptions.noSubscriptions": "No Subscriptions Yet",
      "subscriptions.noSubscriptionsDesc": "You haven't subscribed to any projects yet. Browse open projects and click the bell icon to follow them.",
      "subscriptions.browseProjects": "Browse Projects",
      "subscriptions.onlyForProfessionals": "This feature is available for professional users only. Switch to a professional account to subscribe to projects.",
      "subscriptions.subscribe": "Subscribe",
      "subscriptions.unsubscribe": "Unsubscribe",
      "subscriptions.subscribed": "Subscribed",
      "subscriptions.subscribing": "Subscribing...",
      "subscriptions.unsubscribing": "Unsubscribing...",
      
      // Language
      "language.select": "Select Language",
      "language.english": "English",
      "language.spanish": "Spanish",
      "language.french": "French",
      "language.german": "German",
      "language.italian": "Italian",
      "language.portuguese": "Portuguese",
      "language.russian": "Russian",
      "language.chinese": "Chinese",
      "language.japanese": "Japanese",
      "language.korean": "Korean",
      "language.arabic": "Arabic",
      "language.hindi": "Hindi"
    }
  },
  es: {
    translation: {
      // Navigation
      "nav.professionals": "Profesionales",
      "nav.projects": "Proyectos",
      "nav.companies": "Empresas",
      "nav.messages": "Mensajes",
      "nav.profile": "Perfil",
      "nav.preventives": "Preventivos",
      "nav.myProjects": "Mis Proyectos",
      "nav.careerInsights": "Insights de Carrera",
      "nav.subscriptions": "Suscripciones",
      
      // Authentication
      "auth.login": "Iniciar sesión",
      "auth.signup": "Registrarse",
      "auth.logout": "Cerrar sesión",
      "auth.loginToApply": "Iniciar sesión para postular",
      
      // Home Page
      "home.welcome": "Bienvenido a VibeSync",
      "home.subtitle": "Conecta con los mejores profesionales de TI y descubre proyectos increíbles",
      "home.recentProjects": "Proyectos Recientes",
      "home.topProfessionals": "Mejores Profesionales",
      "home.noProjects": "No se encontraron proyectos recientes",
      "home.noProfessionals": "No se encontraron profesionales",
      
      // Projects
      "projects.title": "Proyectos",
      "projects.postProject": "Publicar Proyecto",
      "projects.searchProjects": "Buscar proyectos...",
      "projects.filterProjects": "Filtrar Proyectos",
      "projects.clearAll": "Limpiar Todo",
      "projects.allStatuses": "Todos los estados",
      "projects.foundResults_one": "Se encontró {{count}} proyecto",
      "projects.foundResults_other": "Se encontraron {{count}} proyectos",
      
      // Subscriptions  
      "subscriptions.title": "Mis Suscripciones",
      "subscriptions.subtitle": "Mantente actualizado con los proyectos que sigues",
      "subscriptions.noSubscriptions": "Sin Suscripciones Aún",
      "subscriptions.noSubscriptionsDesc": "No te has suscrito a ningún proyecto aún. Navega proyectos abiertos y haz clic en el ícono de campana para seguirlos.",
      "subscriptions.browseProjects": "Explorar Proyectos",
      "subscriptions.onlyForProfessionals": "Esta función está disponible solo para usuarios profesionales. Cambia a una cuenta profesional para suscribirte a proyectos.",
      "subscriptions.subscribe": "Suscribirse",
      "subscriptions.unsubscribe": "Desuscribirse",
      "subscriptions.subscribed": "Suscrito",
      "subscriptions.subscribing": "Suscribiéndose...",
      "subscriptions.unsubscribing": "Desuscribiéndose...",
      
      // Language
      "language.select": "Seleccionar Idioma",
      "language.english": "Inglés",
      "language.spanish": "Español",
      "language.french": "Francés",
      "language.german": "Alemán",
      "language.italian": "Italiano",
      "language.portuguese": "Portugués",
      "language.russian": "Ruso",
      "language.chinese": "Chino",
      "language.japanese": "Japonés",
      "language.korean": "Coreano",
      "language.arabic": "Árabe",
      "language.hindi": "Hindi"
    }
  },
  fr: {
    translation: {
      // Navigation
      "nav.professionals": "Professionnels",
      "nav.projects": "Projets",
      "nav.companies": "Entreprises",
      "nav.messages": "Messages",
      "nav.profile": "Profil",
      "nav.preventives": "Préventifs",
      "nav.myProjects": "Mes Projets",
      "nav.careerInsights": "Insights de Carrière",
      "nav.subscriptions": "Abonnements",
      
      // Authentication
      "auth.login": "Se connecter",
      "auth.signup": "S'inscrire",
      "auth.logout": "Se déconnecter",
      "auth.loginToApply": "Se connecter pour postuler",
      
      // Home Page
      "home.welcome": "Bienvenue sur VibeSync",
      "home.subtitle": "Connectez-vous avec les meilleurs professionnels IT et découvrez des projets incroyables",
      "home.recentProjects": "Projets Récents",
      "home.topProfessionals": "Meilleurs Professionnels",
      "home.noProjects": "Aucun projet récent trouvé",
      "home.noProfessionals": "Aucun professionnel trouvé",
      
      // Projects
      "projects.title": "Projets",
      "projects.postProject": "Publier un Projet",
      "projects.searchProjects": "Rechercher des projets...",
      "projects.filterProjects": "Filtrer les Projets",
      "projects.clearAll": "Tout Effacer",
      "projects.allStatuses": "Tous les statuts",
      "projects.foundResults_one": "{{count}} projet trouvé",
      "projects.foundResults_other": "{{count}} projets trouvés",
      
      // Subscriptions  
      "subscriptions.title": "Mes Abonnements",
      "subscriptions.subtitle": "Restez informé des projets que vous suivez",
      "subscriptions.noSubscriptions": "Aucun Abonnement",
      "subscriptions.noSubscriptionsDesc": "Vous n'êtes abonné à aucun projet. Parcourez les projets ouverts et cliquez sur l'icône cloche pour les suivre.",
      "subscriptions.browseProjects": "Parcourir les Projets",
      "subscriptions.onlyForProfessionals": "Cette fonctionnalité est disponible uniquement pour les utilisateurs professionnels. Basculez vers un compte professionnel pour vous abonner aux projets.",
      "subscriptions.subscribe": "S'abonner",
      "subscriptions.unsubscribe": "Se désabonner",
      "subscriptions.subscribed": "Abonné",
      "subscriptions.subscribing": "Abonnement...",
      "subscriptions.unsubscribing": "Désabonnement...",
      
      // Language
      "language.select": "Sélectionner la Langue",
      "language.english": "Anglais",
      "language.spanish": "Espagnol",
      "language.french": "Français",
      "language.german": "Allemand",
      "language.italian": "Italien",
      "language.portuguese": "Portugais",
      "language.russian": "Russe",
      "language.chinese": "Chinois",
      "language.japanese": "Japonais",
      "language.korean": "Coréen",
      "language.arabic": "Arabe",
      "language.hindi": "Hindi"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;