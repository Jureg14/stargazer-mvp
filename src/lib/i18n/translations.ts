export type Language = 'en' | 'pt';

export interface Translations {
  header: {
    title: string;
    subtitle: string;
    bortleLabel: string;
  };
  location: {
    observingSite: string;
    customCoords: string;
    searchPlaceholder: string;
    myLocation: string;
    locating: string;
    currentLocationName: string;
    geoErrorNotSupported: string;
    geoErrorPrefix: string;
  };
  skyConditions: {
    title: string;
    twilightLabel: string;
    moonPhaseLabel: string;
    moonIllumination: string;
    seeingLabel: string;
    optimalWindow: string;
    nightScoreLabel: string;
    trueNight: string;
    astronomicalTwilight: string;
    nauticalTwilight: string;
    civilTwilight: string;
    daylight: string;
    excellentSeeing: string;
    goodSeeing: string;
    moderateSeeing: string;
    poorSeeing: string;
    noWindowFound: string;
  };
  altitudeChart: {
    title: string;
    subtitle: string;
    altitudeAxis: string;
    timeAxis: string;
    zenithZone: string;
    horizonLimit: string;
    extinctionZone: string;
    planets: string;
    deepSky: string;
    moon: string;
    satellites: string;
  };
  celestialSearch: {
    title: string;
    all: string;
    moon: string;
    planets: string;
    dso: string;
    searchPlaceholder: string;
    colName: string;
    colType: string;
    colAlt: string;
    colAz: string;
    colMag: string;
    colBestWindow: string;
    colStatus: string;
    statusOptimal: string;
    statusVisible: string;
    statusLow: string;
    statusBelowHorizon: string;
    noResults: string;
  };
  itinerary: {
    title: string;
    subtitle: string;
    primeWindow: string;
    goodWindow: string;
    marginalWindow: string;
    cloudCover: string;
    moonlight: string;
    seeing: string;
    highlights: string;
    noWindows: string;
  };
  hourlyBar: {
    title: string;
    subtitle: string;
    legendDay: string;
    legendCivil: string;
    legendNautical: string;
    legendAstro: string;
    legendNight: string;
  };
  celestialGrid: {
    title: string;
    subtitle: string;
    altitude: string;
    azimuth: string;
    constellation: string;
    magnitude: string;
    visibility: string;
    visibilityExcellent: string;
    visibilityGood: string;
    visibilityFair: string;
    visibilityPoor: string;
    bestTime: string;
  };
  satellites: {
    title: string;
    subtitle: string;
    maxAlt: string;
    trajectory: string;
    peakTime: string;
    brightness: string;
    duration: string;
  };
  meteors: {
    title: string;
    subtitle: string;
    radiant: string;
    peakDate: string;
    zhr: string;
    activeWindow: string;
    isPeak: string;
  };
  bortle: {
    class1: { name: string; desc: string };
    class2: { name: string; desc: string };
    class3: { name: string; desc: string };
    class4: { name: string; desc: string };
    class5: { name: string; desc: string };
    class6: { name: string; desc: string };
    class7: { name: string; desc: string };
    class8: { name: string; desc: string };
    class9: { name: string; desc: string };
  };
  moonPhases: {
    newMoon: string;
    waxingCrescent: string;
    firstQuarter: string;
    waxingGibbous: string;
    fullMoon: string;
    waningGibbous: string;
    thirdQuarter: string;
    waningCrescent: string;
  };
  pwa: {
    title: string;
    description: string;
    installBtn: string;
    dismissBtn: string;
  };
  reminders: {
    title: string;
    description: string;
    enableBtn: string;
    enabledBtn: string;
    notSupported: string;
  };
  page: {
    loadingTitle: string;
    loadingSub: string;
    retryBtn: string;
    footerText: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      title: 'Stargazer',
      subtitle: 'Intelligent Ephemeris, ISS & Meteor Planner',
      bortleLabel: 'Bortle',
    },
    location: {
      observingSite: 'Observing Site',
      customCoords: 'Custom Coordinates',
      searchPlaceholder: 'Search city (e.g. London, Tokyo)...',
      myLocation: 'My Location',
      locating: 'Locating...',
      currentLocationName: 'Current Location',
      geoErrorNotSupported: 'Geolocation is not supported by your browser',
      geoErrorPrefix: 'Geolocation error: ',
    },
    skyConditions: {
      title: 'Overall Sky Quality',
      twilightLabel: 'Astronomical Darkness',
      moonPhaseLabel: 'Moon Phase',
      moonIllumination: 'illumination',
      seeingLabel: 'Atmospheric Seeing',
      optimalWindow: 'Optimal Observing Window',
      nightScoreLabel: 'Night Score',
      trueNight: 'True Night (Sun < -18°)',
      astronomicalTwilight: 'Astronomical Twilight',
      nauticalTwilight: 'Nautical Twilight',
      civilTwilight: 'Civil Twilight',
      daylight: 'Daylight',
      excellentSeeing: 'Excellent Stability',
      goodSeeing: 'Good Stability',
      moderateSeeing: 'Moderate Turbulence',
      poorSeeing: 'Heavy Turbulence',
      noWindowFound: 'No optimal window tonight',
    },
    altitudeChart: {
      title: 'Celestial Altitude Progression',
      subtitle: 'Height above horizon (° altitude) throughout the night hours',
      altitudeAxis: 'Altitude (°)',
      timeAxis: 'Time',
      zenithZone: 'Zenith (60°+)',
      horizonLimit: 'Horizon Limit (15°)',
      extinctionZone: 'Atmospheric Extinction Zone (<15°)',
      planets: 'Planets',
      deepSky: 'Deep Sky',
      moon: 'Moon',
      satellites: 'Satellites',
    },
    celestialSearch: {
      title: 'Search Celestial Catalog',
      all: 'All Targets',
      moon: 'Moon',
      planets: 'Planets',
      dso: 'Deep Sky (DSO)',
      searchPlaceholder: 'Search target name or constellation...',
      colName: 'Name',
      colType: 'Type',
      colAlt: 'Altitude',
      colAz: 'Azimuth',
      colMag: 'Mag',
      colBestWindow: 'Best Window',
      colStatus: 'Status',
      statusOptimal: 'Optimal (>30°)',
      statusVisible: 'Visible (>15°)',
      statusLow: 'Low Altitude',
      statusBelowHorizon: 'Below Horizon',
      noResults: 'No celestial targets matching query.',
    },
    itinerary: {
      title: 'Observing Windows & Narrative',
      subtitle: 'Contiguous time slots grouped by atmospheric clarity, darkness, and target availability',
      primeWindow: 'Prime Window',
      goodWindow: 'Good Window',
      marginalWindow: 'Marginal Window',
      cloudCover: 'Cloud Cover',
      moonlight: 'Moonlight',
      seeing: 'Seeing',
      highlights: 'Highlights',
      noWindows: 'No clear observation windows projected for tonight due to cloud cover or atmospheric conditions.',
    },
    hourlyBar: {
      title: '24-Hour Sky Quality Spectrum',
      subtitle: 'Hourly observation score breakdown combining solar twilight, cloudiness, and lunar glare',
      legendDay: 'Daylight',
      legendCivil: 'Civil Twil.',
      legendNautical: 'Nautical Twil.',
      legendAstro: 'Astro Twil.',
      legendNight: 'True Night',
    },
    celestialGrid: {
      title: 'Visible Celestial Targets',
      subtitle: 'Real-time astronomical ephemeris positions and observation ratings',
      altitude: 'Altitude',
      azimuth: 'Azimuth',
      constellation: 'Constellation',
      magnitude: 'Magnitude',
      visibility: 'Visibility',
      visibilityExcellent: 'Excellent',
      visibilityGood: 'Good',
      visibilityFair: 'Fair',
      visibilityPoor: 'Poor',
      bestTime: 'Best Time',
    },
    satellites: {
      title: 'Visible Satellite Passes (ISS & Tiangong)',
      subtitle: 'Bright orbital passes predicted from NORAD TLE ephemeris',
      maxAlt: 'Max Alt',
      trajectory: 'Trajectory',
      peakTime: 'Peak Time',
      brightness: 'Magnitude',
      duration: 'Duration',
    },
    meteors: {
      title: 'Active Meteor Showers',
      subtitle: 'Annual meteor shower radiant visibility and zenithal hourly rates',
      radiant: 'Radiant',
      peakDate: 'Peak Date',
      zhr: 'Max ZHR',
      activeWindow: 'Active Window',
      isPeak: 'PEAK NIGHT',
    },
    bortle: {
      class1: { name: 'Class 1: Excellent Dark Sky Site', desc: 'Zodiacal light, airglow, and M33 visible to naked eye.' },
      class2: { name: 'Class 2: Truly Dark Site', desc: 'Milky Way highly detailed; zodiacal light casts faint shadows.' },
      class3: { name: 'Class 3: Rural Sky', desc: 'Some light pollution on horizon; complex Milky Way structures visible.' },
      class4: { name: 'Class 4: Rural/Suburban Transition', desc: 'Light domes visible over cities; Milky Way still clear overhead.' },
      class5: { name: 'Class 5: Suburban Sky', desc: 'Milky Way weak or invisible near horizon; faint objects washed out.' },
      class6: { name: 'Class 6: Bright Suburban Sky', desc: 'Milky Way visible only near zenith; sky glow noticeable everywhere.' },
      class7: { name: 'Class 7: Suburban/Urban Transition', desc: 'Entire sky background has pale gray tint; strong light domes.' },
      class8: { name: 'Class 8: City Sky', desc: 'Sky glows white/orange; only major constellations and bright planets visible.' },
      class9: { name: 'Class 9: Inner-City Sky', desc: 'Severe light pollution; only Moon, planets, and very bright stars visible.' },
    },
    moonPhases: {
      newMoon: 'New Moon',
      waxingCrescent: 'Waxing Crescent',
      firstQuarter: 'First Quarter',
      waxingGibbous: 'Waxing Gibbous',
      fullMoon: 'Full Moon',
      waningGibbous: 'Waning Gibbous',
      thirdQuarter: 'Third Quarter',
      waningCrescent: 'Waning Crescent',
    },
    pwa: {
      title: 'Install Stargazer App',
      description: 'Add Stargazer to your home screen for quick offline access & observation reminders.',
      installBtn: 'Install',
      dismissBtn: 'Not now',
    },
    reminders: {
      title: 'Enable Stargazing Push Notifications',
      description: 'Get notified 15 mins before prime observing windows start at',
      enableBtn: 'Enable Reminders',
      enabledBtn: 'Reminders Active',
      notSupported: 'Push notifications not supported on this browser',
    },
    page: {
      loadingTitle: 'Calculating Ephemeris & Atmospheric Seeing',
      loadingSub: 'Tracking ISS passes, atmospheric seeing indices, Geohash cached ephemeris, and planetary orbits...',
      retryBtn: 'Retry',
      footerText: 'Powered by Open-Meteo, Astronomy Engine & CelesTrak',
    },
  },
  pt: {
    header: {
      title: 'Stargazer',
      subtitle: 'Planejador Inteligente de Efemérides, ISS e Meteoros',
      bortleLabel: 'Bortle',
    },
    location: {
      observingSite: 'Local de Observação',
      customCoords: 'Coordenadas Personalizadas',
      searchPlaceholder: 'Buscar cidade (ex: São Paulo, Rio, Londres)...',
      myLocation: 'Minha Localização',
      locating: 'Localizando...',
      currentLocationName: 'Localização Atual',
      geoErrorNotSupported: 'Geolocalização não é suportada pelo seu navegador',
      geoErrorPrefix: 'Erro de geolocalização: ',
    },
    skyConditions: {
      title: 'Qualidade Geral do Céu',
      twilightLabel: 'Escuridão Astronômica',
      moonPhaseLabel: 'Fase da Lua',
      moonIllumination: 'iluminação',
      seeingLabel: 'Seeing Atmosférico',
      optimalWindow: 'Janela Ideal de Observação',
      nightScoreLabel: 'Pontuação Noturna',
      trueNight: 'Noite Verdadeira (Sol < -18°)',
      astronomicalTwilight: 'Crepúsculo Astronômico',
      nauticalTwilight: 'Crepúsculo Náutico',
      civilTwilight: 'Crepúsculo Civil',
      daylight: 'Dia',
      excellentSeeing: 'Excelente Estabilidade',
      goodSeeing: 'Boa Estabilidade',
      moderateSeeing: 'Turbulência Moderada',
      poorSeeing: 'Forte Turbulência',
      noWindowFound: 'Nenhuma janela ideal esta noite',
    },
    altitudeChart: {
      title: 'Evolução da Altitude Celestial',
      subtitle: 'Altura acima do horizonte (° de altitude) durante as horas da noite',
      altitudeAxis: 'Altitude (°)',
      timeAxis: 'Horário',
      zenithZone: 'Zênite (60°+)',
      horizonLimit: 'Limite do Horizonte (15°)',
      extinctionZone: 'Zona de Extinção Atmosférica (<15°)',
      planets: 'Planetas',
      deepSky: 'Céu Profundo',
      moon: 'Lua',
      satellites: 'Satélites',
    },
    celestialSearch: {
      title: 'Catálogo de Objetos Celestiais',
      all: 'Todos os Alvos',
      moon: 'Lua',
      planets: 'Planetas',
      dso: 'Céu Profundo (DSO)',
      searchPlaceholder: 'Buscar nome do astro ou constelação...',
      colName: 'Nome',
      colType: 'Tipo',
      colAlt: 'Altitude',
      colAz: 'Azimute',
      colMag: 'Mag',
      colBestWindow: 'Melhor Horário',
      colStatus: 'Status',
      statusOptimal: 'Ideal (>30°)',
      statusVisible: 'Visível (>15°)',
      statusLow: 'Baixa Altitude',
      statusBelowHorizon: 'Abaixo do Horizonte',
      noResults: 'Nenhum objeto celestial encontrado.',
    },
    itinerary: {
      title: 'Janelas de Observação & Narrativa',
      subtitle: 'Intervalos de tempo agrupados por clareza atmosférica, escuridão e visibilidade',
      primeWindow: 'Janela Principal',
      goodWindow: 'Boa Janela',
      marginalWindow: 'Janela Moderada',
      cloudCover: 'Cobertura de Nuvens',
      moonlight: 'Brilho Lunar',
      seeing: 'Seeing',
      highlights: 'Destaques',
      noWindows: 'Sem janelas de observação nítidas projetadas para hoje devido a nuvens ou condições atmosféricas.',
    },
    hourlyBar: {
      title: 'Espectro de Qualidade do Céu (24h)',
      subtitle: 'Detalhamento horário combinando crepúsculo solar, nebulosidade e brilho lunar',
      legendDay: 'Luz do Dia',
      legendCivil: 'Crep. Civil',
      legendNautical: 'Crep. Náutico',
      legendAstro: 'Crep. Astron.',
      legendNight: 'Noite Total',
    },
    celestialGrid: {
      title: 'Alvos Celestiais Visíveis',
      subtitle: 'Posições astronômicas em tempo real e avaliação de observação',
      altitude: 'Altitude',
      azimuth: 'Azimute',
      constellation: 'Constelação',
      magnitude: 'Magnitude',
      visibility: 'Visibilidade',
      visibilityExcellent: 'Excelente',
      visibilityGood: 'Boa',
      visibilityFair: 'Moderada',
      visibilityPoor: 'Ruim',
      bestTime: 'Melhor Horário',
    },
    satellites: {
      title: 'Passagens Visíveis de Satélites (ISS e Tiangong)',
      subtitle: 'Passagens orbitais brilhantes previstas a partir dos TLEs do CelesTrak / NORAD',
      maxAlt: 'Alt Máxima',
      trajectory: 'Trajetória',
      peakTime: 'Momento Pico',
      brightness: 'Magnitude',
      duration: 'Duração',
    },
    meteors: {
      title: 'Chuvas de Meteoros Ativas',
      subtitle: 'Visibilidade do radiante de chuvas anuais e taxa horária zenital (ZHR)',
      radiant: 'Radiante',
      peakDate: 'Data do Pico',
      zhr: 'ZHR Máximo',
      activeWindow: 'Janela Ativa',
      isPeak: 'NOITE DE PICO',
    },
    bortle: {
      class1: { name: 'Classe 1: Céu Escuro Excelente', desc: 'Luz zodiacal, airglow e M33 visíveis a olho nu.' },
      class2: { name: 'Classe 2: Céu Verdadeiramente Escuro', desc: 'Via Láctea altamente detalhada; luz zodiacal projeta sombras suaves.' },
      class3: { name: 'Classe 3: Céu Rural', desc: 'Pouca poluição luminosa no horizonte; estruturas da Via Láctea bem visíveis.' },
      class4: { name: 'Classe 4: Transição Rural/Suburbana', desc: 'Domos de luz visíveis sobre cidades; Via Láctea ainda nítida no zênite.' },
      class5: { name: 'Classe 5: Céu Suburbano', desc: 'Via Láctea fraca ou invisível perto do horizonte; objetos tênues ofuscados.' },
      class6: { name: 'Classe 6: Céu Suburbano Brilhante', desc: 'Via Láctea visível apenas no zênite; brilho do céu visível por toda parte.' },
      class7: { name: 'Classe 7: Transição Suburbana/Urbana', desc: 'Fundo do céu com tom cinza claro; domos luminosos intensos.' },
      class8: { name: 'Classe 8: Céu Urbano', desc: 'Céu brilha em branco/laranja; apenas constelações principais e planetas visíveis.' },
      class9: { name: 'Classe 9: Céu de Centro Urbano', desc: 'Poluição luminosa severa; apenas a Lua, planetas e estrelas muito brilhantes visíveis.' },
    },
    moonPhases: {
      newMoon: 'Lua Nova',
      waxingCrescent: 'Lua Crescente',
      firstQuarter: 'Quarto Crescente',
      waxingGibbous: 'Crescente Gibosa',
      fullMoon: 'Full Moon',
      waningGibbous: 'Minguante Gibosa',
      thirdQuarter: 'Quarto Minguante',
      waningCrescent: 'Lua Minguante',
    },
    pwa: {
      title: 'Instalar App Stargazer',
      description: 'Adicione o Stargazer à tela inicial para acesso offline e alertas de observação.',
      installBtn: 'Instalar',
      dismissBtn: 'Agora não',
    },
    reminders: {
      title: 'Ativar Notificações de Observação',
      description: 'Receba um alerta 15 min antes das melhores janelas de observação em',
      enableBtn: 'Ativar Lembretes',
      enabledBtn: 'Lembretes Ativos',
      notSupported: 'Notificações push não são suportadas neste navegador',
    },
    page: {
      loadingTitle: 'Calculando Efemérides e Seeing Atmosférico',
      loadingSub: 'Rastreando passagens da ISS, índices de seeing, efemérides em cache Geohash e órbitas planetárias...',
      retryBtn: 'Tentar Novamente',
      footerText: 'Desenvolvido com Open-Meteo, Astronomy Engine e CelesTrak',
    },
  },
};
