export interface LanguageTranslation {
  appName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  dashboard: string;
  cropPathology: string;
  yieldPredictions: string;
  soilHealth: string;
  liveWeather: string;
  qaForum: string;
  activeLedger: string;
  modifyLedger: string;
  mainCropInterest: string;
  scannerCardTitle: string;
  scannerCardDesc: string;
  scannerCardAction: string;
  yieldCardTitle: string;
  yieldCardDesc: string;
  yieldCardAction: string;
  soilCardTitle: string;
  soilCardDesc: string;
  soilCardAction: string;
  forumCardTitle: string;
  forumCardDesc: string;
  forumCardAction: string;
  changeLang: string;
  selectLanguage: string;
  selectLanguageHint: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  locale: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: "English",
    name: "English",
    flag: "🇺🇸",
    locale: "en-US"
  },
  {
    code: "Hindi",
    name: "हिन्दी (Hindi)",
    flag: "🇮🇳",
    locale: "hi-IN"
  },
  {
    code: "Spanish",
    name: "Español (Spanish)",
    flag: "🇪🇸",
    locale: "es-ES"
  },
  {
    code: "French",
    name: "Français (French)",
    flag: "🇫🇷",
    locale: "fr-FR"
  },
  {
    code: "Punjabi",
    name: "ਪੰਜਾਬੀ (Punjabi)",
    flag: "🇮🇳",
    locale: "pa-IN"
  },
  {
    code: "Telugu",
    name: "తెలుగు (Telugu)",
    flag: "🇮🇳",
    locale: "te-IN"
  },
  {
    code: "Swahili",
    name: "Kiswahili (Swahili)",
    flag: "🇰🇪",
    locale: "sw-KE"
  },
  {
    code: "Portuguese",
    name: "Português (Portuguese)",
    flag: "🇵🇹",
    locale: "pt-PT"
  }
];

export const TRANSLATIONS: Record<string, LanguageTranslation> = {
  English: {
    appName: "Smart Agriculture Portal",
    tagline: "AI Precision Portal",
    heroHeading: "Empowering Growers with Artificial Intelligence",
    heroSubheading: "Scan leaf lesions with computer vision, predict harvest yields, calculate soil biochemical schedules, and interact with global agronomy advisors instantly.",
    dashboard: "Dashboard",
    cropPathology: "Crop Pathology",
    yieldPredictions: "Yield Predictions",
    soilHealth: "Soil Health",
    liveWeather: "Live Weather",
    qaForum: "Q&A Forum",
    activeLedger: "Active Ledger Connection",
    modifyLedger: "Modify Ledger Details",
    mainCropInterest: "Main Crop Interest",
    scannerCardTitle: "AI Crop leaf Pathologist",
    scannerCardDesc: "Diagnose disease lesions on plant leaves instantly.",
    scannerCardAction: "Open Scanner",
    yieldCardTitle: "Yield Estimations",
    yieldCardDesc: "Project harvest weight and plan crop rotation timelines.",
    yieldCardAction: "Calculate Projections",
    soilCardTitle: "Soil Biochemical Assessor",
    soilCardDesc: "Input Nitrogen, pH, and moisture parameters for advice.",
    soilCardAction: "Assess Chemistry",
    forumCardTitle: "Farmers' Q&A Forum",
    forumCardDesc: "Post concerns and get answers from peer farmers & KisanAI.",
    forumCardAction: "Access Community",
    changeLang: "Change Language",
    selectLanguage: "Select Language",
    selectLanguageHint: "Choose your preferred language for the portal:"
  },
  Hindi: {
    appName: "स्मार्ट कृषि पोर्टल",
    tagline: "एआई परिशुद्धता पोर्टल",
    heroHeading: "कृत्रिम बुद्धिमत्ता के साथ किसानों को सशक्त बनाना",
    heroSubheading: "कंप्यूटर विज़न के साथ पत्तियों के रोग के धब्बों की पहचान करें, फसल उपज का अनुमान लगाएं, मिट्टी के जैव रासायनिक कार्यक्रम की गणना करें, और वैश्विक कृषि सलाहकारों से तुरंत बातचीत करें।",
    dashboard: "डैशबोर्ड",
    cropPathology: "फसल रोगविज्ञान",
    yieldPredictions: "उपज पूर्वानुमान",
    soilHealth: "मिट्टी का स्वास्थ्य",
    liveWeather: "लाइव मौसम",
    qaForum: "प्रश्नोत्तर मंच",
    activeLedger: "सक्रिय खाता कनेक्शन",
    modifyLedger: "खाता विवरण संशोधित करें",
    mainCropInterest: "मुख्य फसल रुचि",
    scannerCardTitle: "एआई फसल पत्ती रोगविज्ञानी",
    scannerCardDesc: "पौधे की पत्तियों पर रोग के धब्बों का तुरंत निदान करें।",
    scannerCardAction: "स्कैनर खोलें",
    yieldCardTitle: "उपज अनुमान",
    yieldCardDesc: "कटाई के वजन का अनुमान लगाएं और फसल चक्र समयसीमा की योजना बनाएं।",
    yieldCardAction: "अनुमान की गणना करें",
    soilCardTitle: "मिट्टी जैव रासायनिक निर्धारक",
    soilCardDesc: "सलाह के लिए नाइट्रोजन, पीएच और नमी के पैरामीटर दर्ज करें।",
    soilCardAction: "रसायन शास्त्र का आकलन करें",
    forumCardTitle: "किसान प्रश्नोत्तर मंच",
    forumCardDesc: "अपनी चिंताएं पोस्ट करें और साथी किसानों और किसानएआई से उत्तर प्राप्त करें।",
    forumCardAction: "सामुदायिक मंच खोलें",
    changeLang: "भाषा बदलें",
    selectLanguage: "भाषा का चयन करें",
    selectLanguageHint: "पोर्टल के लिए अपनी पसंदीदा भाषा चुनें:"
  },
  Spanish: {
    appName: "Portal de Agricultura Inteligente",
    tagline: "Portal de Precisión de IA",
    heroHeading: "Empoderando a los Cultivadores con Inteligencia Artificial",
    heroSubheading: "Escanee lesiones foliares con visión artificial, prediga el rendimiento de las cosechas, calcule cronogramas bioquímicos del suelo e interactúe con asesores agronómicos globales al instante.",
    dashboard: "Tablero",
    cropPathology: "Patología de Cultivos",
    yieldPredictions: "Predicciones de Rendimiento",
    soilHealth: "Salud del Suelo",
    liveWeather: "Clima en Vivo",
    qaForum: "Foro de Preguntas",
    activeLedger: "Conexión de Registro Activa",
    modifyLedger: "Modificar Detalles del Registro",
    mainCropInterest: "Interés Principal de Cultivo",
    scannerCardTitle: "Patólogo de Hojas de IA",
    scannerCardDesc: "Diagnostique lesiones de enfermedades en hojas de plantas al instante.",
    scannerCardAction: "Abrir Escáner",
    yieldCardTitle: "Estimaciones de Rendimiento",
    yieldCardDesc: "Proyecte el peso de la cosecha y planifique los plazos de rotación.",
    yieldCardAction: "Calcular Proyecciones",
    soilCardTitle: "Asesor Bioquímico del Suelo",
    soilCardDesc: "Ingrese parámetros de nitrógeno, pH y humedad para recibir asesoramiento.",
    soilCardAction: "Evaluar Química",
    forumCardTitle: "Foro de Preguntas de Agricultores",
    forumCardDesc: "Publique inquietudes y obtenga respuestas de otros agricultores y KisanAI.",
    forumCardAction: "Acceder a la Comunidad",
    changeLang: "Cambiar Idioma",
    selectLanguage: "Seleccionar Idioma",
    selectLanguageHint: "Elija su idioma preferido para el portal:"
  },
  French: {
    appName: "Portail d'Agriculture Intelligente",
    tagline: "Portail de Précision IA",
    heroHeading: "Autonomiser les Producteurs grâce à l'Intelligence Artificielle",
    heroSubheading: "Scannez les lésions foliaires par vision par ordinateur, prédisez les rendements des récoltes, calculez les bilans biochimiques du sol et échangez instantanément avec des conseillers agronomes du monde entier.",
    dashboard: "Tableau de bord",
    cropPathology: "Pathologie des Cultures",
    yieldPredictions: "Prédictions de Rendement",
    soilHealth: "Santé du Sol",
    liveWeather: "Météo en Direct",
    qaForum: "Forum de Q&R",
    activeLedger: "Connexion au Registre Active",
    modifyLedger: "Modifier les Détails du Registre",
    mainCropInterest: "Culture d'Intérêt Principale",
    scannerCardTitle: "Pathologiste de Feuilles IA",
    scannerCardDesc: "Diagnostiquez instantanément les maladies sur les feuilles des plantes.",
    scannerCardAction: "Ouvrir le Scanner",
    yieldCardTitle: "Estimations de Rendement",
    yieldCardDesc: "Projeter le poids de la récolte et planifier les cycles de rotation.",
    yieldCardAction: "Calculer les Projections",
    soilCardTitle: "Évaluateur Biochimique du Sol",
    soilCardDesc: "Saisissez les paramètres d'azote, de pH et d'humidité pour obtenir des conseils.",
    soilCardAction: "Évaluer la Chimie",
    forumCardTitle: "Forum de Q&R des Agriculteurs",
    forumCardDesc: "Posez vos questions et obtenez des réponses de vos pairs et de KisanAI.",
    forumCardAction: "Accéder à la Communauté",
    changeLang: "Changer de Langue",
    selectLanguage: "Sélectionner la Langue",
    selectLanguageHint: "Choisissez votre langue préférée pour le portail :"
  },
  Punjabi: {
    appName: "ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਪੋਰਟਲ",
    tagline: "ਏਆਈ ਸ਼ੁੱਧਤਾ ਪੋਰਟਲ",
    heroHeading: "ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ ਨਾਲ ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ",
    heroSubheading: "ਕੰਪਿਊਟਰ ਵਿਜ਼ਨ ਨਾਲ ਪੱਤਿਆਂ ਦੇ ਰੋਗਾਂ ਦੀ ਪਛਾण ਕਰੋ, ਫਸਲ ਦੇ ਝਾੜ ਦਾ ਅਨੁਮਾਨ ਲਗਾਓ, ਮਿੱਟੀ ਦੇ ਬਾਇਓਕੈਮੀਕਲ ਨਿਯਮਾਂ ਦੀ ਗਣਨਾ ਕਰੋ, ਅਤੇ ਗਲੋਬਲ ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰਾਂ ਨਾਲ ਤੁਰੰਤ ਗੱਲਬਾਤ ਕਰੋ।",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    cropPathology: "ਫ਼ਸਲ ਰੋਗ ਵਿਗਿਆਨ",
    yieldPredictions: "ਝਾੜ ਦੇ ਅਨੁਮਾਨ",
    soilHealth: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ",
    liveWeather: "ਲਾਈਵ ਮੌਸਮ",
    qaForum: "ਸਵਾਲ-ਜਵਾਬ ਫੋਰਮ",
    activeLedger: "ਸਰਗਰਮ ਖਾਤਾ ਕਨੈਕਸ਼ਨ",
    modifyLedger: "ਖਾਤਾ ਵੇਰਵੇ ਸੋਧੋ",
    mainCropInterest: "ਮੁੱਖ ਫਸਲ ਦੀ ਦਿਲਚਸਪੀ",
    scannerCardTitle: "ਏਆਈ ਫਸਲ ਪੱਤਾ ਰੋਗ ਵਿਗਿਆਨੀ",
    scannerCardDesc: "ਪੌਦਿਆਂ ਦੇ ਪੱਤਿਆਂ 'ਤੇ ਬਿਮਾਰੀ ਦੇ ਨਿਸ਼ਾਨਾਂ ਦਾ ਤੁਰੰਤ ਪਤਾ ਲਗਾਓ।",
    scannerCardAction: "ਸਕੈਨਰ ਖੋਲ੍ਹੋ",
    yieldCardTitle: "ਝਾੜ ਦੇ ਅਨੁਮਾਨ",
    yieldCardDesc: "ਵਾਢੀ ਦੇ ਭਾਰ ਦਾ ਅਨੁਮਾਨ ਲਗਾਓ ਅਤੇ ਫਸਲੀ ਚੱਕਰ ਦੀ ਯੋਜਨਾ ਬਣਾਓ।",
    yieldCardAction: "ਅਨੁਮਾਨਾਂ ਦੀ ਗਣਨਾ ਕਰੋ",
    soilCardTitle: "ਮਿੱਟੀ ਬਾਇਓਕੈਮੀਕਲ ਮੁਲਾਂਕਣਕਰਤਾ",
    soilCardDesc: "ਸਲਾਹ ਲਈ ਨਾਈਟ੍ਰੋजਨ, ਪੀਐਚ ਅਤੇ ਨਮੀ ਦੇ ਮਾਪਦੰਡ ਦਰਜ ਕਰੋ।",
    soilCardAction: "ਰਸਾਇਣ ਵਿਗਿਆਨ ਦਾ ਮੁਲਾਂਕਣ ਕਰੋ",
    forumCardTitle: "ਕਿਸਾਨ ਸਵਾਲ-ਜਵਾਬ ਫੋਰਮ",
    forumCardDesc: "ਆਪਣੀਆਂ ਚਿੰਤਾਵਾਂ ਪੋਸਟ ਕਰੋ ਅਤੇ ਸਾਥੀ ਕਿਸਾਨਾਂ ਅਤੇ ਕਿਸਾਨਏਆਈ ਤੋਂ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ।",
    forumCardAction: "ਭਾਈਚਾਰੇ ਤੱਕ ਪਹੁੰਚ ਕਰੋ",
    changeLang: "ਭਾਸ਼ਾ ਬਦਲੋ",
    selectLanguage: "ਭਾਸ਼า ਚੁਣో",
    selectLanguageHint: "ਪੋਰਟਲ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ:"
  },
  Telugu: {
    appName: "స్మార్ట్ వ్యవసాయ పోర్టల్",
    tagline: "AI ప్రెసిషన్ పోర్టల్",
    heroHeading: "కృత్రిమ మేధస్సుతో రైతులను సచేతనం చేయడం",
    heroSubheading: "కంప్యూటర్ విజన్‌తో ఆకు తెగుళ్లను గుర్తించండి, పంట దిగుబడిని అంచనా వేయండి, నేల బయోకెమికల్ షెడ్యూల్‌లను లెక్కించండి మరియు గ్లోబల్ వ్యవసాయ సలహాదారులతో తక్షణమే మాట్లాడండి.",
    dashboard: "డాష్‌బోర్డ్",
    cropPathology: "పంట రోగనిర్ధారణ",
    yieldPredictions: "దిగుబడి అంచనాలు",
    soilHealth: "నేల ఆరోగ్యం",
    liveWeather: "లైవ్ వాతావరణం",
    qaForum: "ప్రశ్నోత్తరాల ఫోరమ్",
    activeLedger: "క్రియాశీల ఖాతా కనెక్షన్",
    modifyLedger: "ఖాతా వివరాలను సవరించండి",
    mainCropInterest: "ప్రధాన పంట ఆసక్తి",
    scannerCardTitle: "AI పంట ఆకు రోగనిర్ధారక నిపుణుడు",
    scannerCardDesc: "మొక్క ఆకులపై తెగుళ్లను తక్షణమే నిర్ధారించండి.",
    scannerCardAction: "స్కానర్ తెరవండి",
    yieldCardTitle: "దిగుబడి అంచనాలు",
    yieldCardDesc: "పంట కోత బరువును అంచనా వేయండి మరియు పంట మార్పిడి ప్రణాళికను సిద్ధం చేయండి.",
    yieldCardAction: "అంచనాలను లెక్కించండి",
    soilCardTitle: "నేల బయోకెమికల్ విశ్లేషకుడు",
    soilCardDesc: "సలహా కోసం నత్రజని, pH మరియు తేమ పారామితులను నమోదు చేయండి.",
    soilCardAction: "రసాయన శాస్త్రాన్ని అంచనా వేయండి",
    forumCardTitle: "రైతుల ప్రశ్నోత్తరాల ఫోరమ్",
    forumCardDesc: "మీ సమస్యలను పోస్ట్ చేయండి మరియు ఇతర రైతులు & కిసాన్AI నుండి సమాధానాలు పొందండి.",
    forumCardAction: "కమ్యూనిటీని సందర్శించండి",
    changeLang: "భాషను మార్చండి",
    selectLanguage: "భాషను ఎంచుకోండి",
    selectLanguageHint: "పోర్టల్ కోసం మీకు నచ్చిన భాషను ఎంచుకోండి:"
  },
  Swahili: {
    appName: "Tovuti ya Kilimo Bora",
    tagline: "Tovuti ya Usahihi ya AI",
    heroHeading: "Kuwezesha Wakulima kwa Akili Mnemba",
    heroSubheading: "Changanua magonjwa ya majani kwa kompyuta, kadiria mavuno, piga hesabu ya mbolea ya udongo, na wasiliana na washauri wa kilimo duniani papo hapo.",
    dashboard: "Dashboard",
    cropPathology: "Magonjwa ya Mimea",
    yieldPredictions: "Utabiri wa Mavuno",
    soilHealth: "Afya ya Udongo",
    liveWeather: "Hali ya Hewa",
    qaForum: "Jukwaa la Q&A",
    activeLedger: "Muunganisho Amilifu wa Daftari",
    modifyLedger: "Badilisha Maelezo ya Daftari",
    mainCropInterest: "Zao Kuu la Nia",
    scannerCardTitle: "Daktari wa Majani wa AI",
    scannerCardDesc: "Gundua magonjwa kwenye majani ya mimea papo hapo.",
    scannerCardAction: "Fungua Kichanganuzi",
    yieldCardTitle: "Kadirio la Mavuno",
    yieldCardDesc: "Kadiria uzito wa mavuno na upange ratiba za kubadilisha mazao.",
    yieldCardAction: "Piga Hesabu za Mavuno",
    soilCardTitle: "Kichanganuzi cha Kemikali za Udongo",
    soilCardDesc: "Weka viwango vya Nitrojeni, pH, na unyevu ili kupata ushauri.",
    soilCardAction: "Changanua Kemikali",
    forumCardTitle: "Jukwaa la Q&A la Wakulima",
    forumCardDesc: "Tuma maswali na upate majibu kutoka kwa wakulima wenzako na KisanAI.",
    forumCardAction: "Ingia kwenye Jukwaa",
    changeLang: "Badilisha Lugha",
    selectLanguage: "Chagua Lugha",
    selectLanguageHint: "Chagua lugha unayopendelea kwa tovuti hii:"
  },
  Portuguese: {
    appName: "Portal de Agricultura Inteligente",
    tagline: "Portal de Precisão com IA",
    heroHeading: "Empoderando Agricultores com Inteligência Artificial",
    heroSubheading: "Escaneie lesões em folhas com visão computacional, preveja a produtividade da colheita, calcule planos bioquímicos do solo e interaja instantaneamente com agrônomos globais.",
    dashboard: "Painel",
    cropPathology: "Patologia de Culturas",
    yieldPredictions: "Previsões de Produtividade",
    soilHealth: "Saúde do Solo",
    liveWeather: "Clima ao Vivo",
    qaForum: "Fórum de Dúvidas",
    activeLedger: "Conexão de Registro Activa",
    modifyLedger: "Modificar Detalhes do Registro",
    mainCropInterest: "Cultura Principal de Interesse",
    scannerCardTitle: "Patologista de Folhas com IA",
    scannerCardDesc: "Diagnostique lesões de doenças em folhas de plantas instantaneamente.",
    scannerCardAction: "Abrir Scanner",
    yieldCardTitle: "Estimativas de Produtividade",
    yieldCardDesc: "Projete o peso da colheita e planeje cronogramas de rotação de culturas.",
    yieldCardAction: "Calcular Projeções",
    soilCardTitle: "Avaliador Bioquímico de Solo",
    soilCardDesc: "Insira parâmetros de Nitrogênio, pH e umidade para obter orientações.",
    soilCardAction: "Avaliar Química",
    forumCardTitle: "Fórum de Perguntas de Agricultores",
    forumCardDesc: "Publique suas dúvidas e obtenha respostas de outros agricultores e do KisanAI.",
    forumCardAction: "Acessar Comunidade",
    changeLang: "Mudar Idioma",
    selectLanguage: "Selecionar Idioma",
    selectLanguageHint: "Escolha o seu idioma de preferência para o portal:"
  }
};
