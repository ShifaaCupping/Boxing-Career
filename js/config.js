/* ==========================================================================
   ONGESLAGEN: The Road to the Crown. Alleen boksen.
   Alle cijfers, zalen, tegenstanders en verhaal staan hier. Alles is verzonnen.
   ========================================================================== */
var CONFIG = {
  opslagSleutel: "ongeslagen.save.v4",
  recordSleutel: "ongeslagen.record.v3",
  metaSleutel: "ongeslagen.meta.v1",
  eigenSleutel: "ongeslagen.eigen.v1",
  apiUrl: "/api/scores",

  /* De acht riemen: bij welk gevecht, en wie je daarvoor moet verslaan. */
  titels: [
    { nr: 4, titel: "City Title", kampioen: { naam: "Barry Tolan", bijnaam: "The Landlord", land: "IRL", stijl: "Slugger" } },
    { nr: 8, titel: "Regional Title", kampioen: { naam: "Gary Dunmore", bijnaam: "The Docker", land: "ENG", stijl: "Slugger" } },
    { nr: 12, titel: "Challenger Belt", kampioen: { naam: "Marco Bellini", bijnaam: "Il Sarto", land: "ITA", stijl: "Speedster" } },
    { nr: 18, titel: "National Title", kampioen: { naam: "Ruben Castellan", bijnaam: "El Reloj", land: "ESP", stijl: "Counterpuncher" } },
    { nr: 23, titel: "Continental Silver", kampioen: { naam: "Jonas Falk", bijnaam: "The Fjord", land: "NOR", stijl: "Allrounder" } },
    { nr: 28, titel: "Continental Title", kampioen: { naam: "Viktor Sorokin", bijnaam: "The Glacier", land: "UKR", stijl: "Technicus" } },
    { nr: 33, titel: "World Silver", kampioen: { naam: "Kenji Arata", bijnaam: "The Blade", land: "JPN", stijl: "Speedster" } },
    { nr: 40, titel: "World Title", kampioen: { naam: "Marcus Bellamy", bijnaam: "The Sovereign", land: "USA", stijl: "Allrounder" } }
  ],

  /* Promotors: bij elk nieuw hoofdstuk teken je een contract. */
  contracten: [
    { id: "goud", naam: "Big Purse Promotions", uitleg: "50% hogere beurzen, maar je krijgt zwaardere tegenstanders.", beurs: 1.5, sterkte: 2, pts: 1 },
    { id: "veilig", naam: "Careful Hands Boxing", uitleg: "Lichtere tegenstanders, maar 20% minder beurs en 10% minder pts.", beurs: 0.8, sterkte: -2, pts: 0.9 },
    { id: "roem", naam: "Prime Time Network", uitleg: "Elk gevecht op tv: 20% meer pts, gewone beurzen.", beurs: 1, sterkte: 0.5, pts: 1.2 }
  ],

  /* Punten voor het leaderboard (pts), coins en beurs per gevecht. */
  verdienen: {
    pts: { winst: 100, perHoofdstuk: 40, ko: 50, zwaarFactor: 1.25, perReeks: 10, verlies: -50, titelBasis: 300, titelPerStuk: 100, perfect: 5000, hardcoreEind: 0 },
    coins: { winst: 10, perHoofdstuk: 5, ko: 3, titel: 50, perfect: 500 },
    beurs: [500, 1000, 2000, 3500], beursVerlies: 0.5
  },

  /* Team tijdens je carrière. Geld is voor één carrière, coins blijven. */
  team: [
    { id: "fysio", naam: "Fysiotherapeut", uitleg: "Slijtage −5", prijs: 2500, munt: "geld", effect: { slijtage: -5 } },
    { id: "kamp", naam: "Sparringkamp", uitleg: "Vorm +2 volgend gevecht", prijs: 4000, munt: "geld", effect: { vorm: 2 } },
    { id: "coach", naam: "Topcoach", uitleg: "Je zwakste eigenschap +2", prijs: 9000, munt: "geld", effect: { zwakste: 2 } },
    { id: "cornerman", naam: "Legendarische cornerman", uitleg: "Vorm +5 volgend gevecht", prijs: 120, munt: "coins", effect: { vorm: 5 } },
    { id: "kliniek", naam: "Topkliniek", uitleg: "Alle slijtage weg", prijs: 200, munt: "coins", effect: { slijtage: -99 } }
  ],

  /* Blijvende upgrades voor coins, in het Trainingscentrum. */
  upgrades: [
    { id: "reis", naam: "Vliegticket", uitleg: "Eén extra keer opnieuw draaien aan het rad.", prijs: 400, max: 2 },
    { id: "netwerk", naam: "Betere contacten", uitleg: "Betere coaches op het rad: +1 op elke keuze.", prijs: 600, max: 3 },
    { id: "kapitaal", naam: "Startkapitaal", uitleg: "Begin je carrière met $3.000 extra.", prijs: 300, max: 3 },
    { id: "basis", naam: "Sterk fundament", uitleg: "Elke eigenschap begint 1 punt hoger.", prijs: 1500, max: 1 },
    { id: "herstel", naam: "Vaste fysio", uitleg: "10% minder slijtage per gevecht.", prijs: 500, max: 3 }
  ],
  doel: 40, startLeeftijd: 18, gevechtenPerJaar: 3, herdraaien: 1,

  stats: {
    kracht: { naam: "Kracht", kort: "KRA", les: "de zware bokszak" },
    snelheid: { naam: "Handsnelheid", kort: "SNE", les: "de speedbag" },
    verdediging: { naam: "Verdediging", kort: "VER", les: "slippen en blokken" },
    kin: { naam: "Kin", kort: "KIN", les: "sparren zonder genade" },
    conditie: { naam: "Conditie", kort: "CON", les: "touwtjespringen om vijf uur 's ochtends" },
    hart: { naam: "Hart", kort: "HAR", les: "doorgaan als het pijn doet" },
    iq: { naam: "Fight-IQ", kort: "IQ", les: "oude gevechten bestuderen" }
  },

  /* Het rad: legendarische (verzonnen) boksscholen over de hele wereld. */
  zalen: [
    { naam: "Iron Bell Gym", stad: "Philadelphia", coach: "Coach Eddie Marlowe", sterk: ["kracht", "kin"], kwaliteit: 2 },
    { naam: "Calle Ocho Boxeo", stad: "Havana", coach: "Maestro Ortega", sterk: ["verdediging", "iq"], kwaliteit: 3 },
    { naam: "Tiger Lane Gym", stad: "Manila", coach: "Coach Reyes", sterk: ["snelheid", "conditie"], kwaliteit: 1 },
    { naam: "Bethel Street ABC", stad: "London", coach: "Mr. Whitlock", sterk: ["iq", "hart"], kwaliteit: 0 },
    { naam: "La Fragua", stad: "Guadalajara", coach: "Don Salazar", sterk: ["kin", "hart"], kwaliteit: 2 },
    { naam: "Akatsuki Dojo", stad: "Osaka", coach: "Sensei Tanabe", sterk: ["snelheid", "iq"], kwaliteit: 1 },
    { naam: "Harbour Street Boxing", stad: "Rotterdam", coach: "Coach Dirk Vos", sterk: ["verdediging", "conditie"], kwaliteit: -1 },
    { naam: "Bronx Basement", stad: "New York", coach: "Old Man Tully", sterk: ["kracht", "hart"], kwaliteit: -2 },
    { naam: "Sokol Boxing Hall", stad: "Kyiv", coach: "Coach Melnyk", sterk: ["snelheid", "verdediging"], kwaliteit: 3 },
    { naam: "Kumasi Ring Club", stad: "Accra", coach: "Coach Mensah", sterk: ["kracht", "conditie"], kwaliteit: 0 }
  ],
  draft: { min: 50, max: 86, sterkBonus: 6 },

  /* De vier hoofdstukken van je carrière, elk met een riem en een kampioen. */
  fases: [
    { naam: "Club Circuit", tot: 8, sterkte: 56, stap: 1.2, ronden: 4, titelRonden: 6, titel: "Regional Title", intro: "Zaaltjes, klapstoelen en de geur van liniment. Hier begint elke legende.",
      zalen: ["Old Docks Hall, London", "Sporthal Zuid, Rotterdam", "Union Club, Dublin", "Old Armoury, Glasgow"],
      kampioen: { naam: "Gary Dunmore", bijnaam: "The Docker", land: "ENG", stijl: "Slugger" } },
    { naam: "National Stage", tot: 18, sterkte: 66, stap: 0.9, ronden: 6, titelRonden: 8, titel: "National Title", intro: "Televisie, een echte promotor en mensen die je naam verkeerd uitspreken.",
      zalen: ["The Civic Arena", "Convention Hall", "Grand Ballroom", "The Coliseum"],
      kampioen: { naam: "Ruben Castellan", bijnaam: "El Reloj", land: "ESP", stijl: "Counterpuncher" } },
    { naam: "Continental", tot: 28, sterkte: 75, stap: 0.7, ronden: 8, titelRonden: 10, titel: "Continental Title", intro: "Grote zalen, vreemde steden, hongerige tegenstanders. Hier vallen de meeste records.",
      zalen: ["Palais Lumière, Paris", "Arena Berlin", "Foro Nord, Milan", "Stadthalle West, Vienna"],
      kampioen: { naam: "Viktor Sorokin", bijnaam: "The Glacier", land: "UKR", stijl: "Technicus" } },
    { naam: "World Stage", tot: 40, sterkte: 81, stap: 0.6, ronden: 10, titelRonden: 12, titel: "World Title", intro: "Las Vegas, Tokio, Riyad. De gouden riem. Alles waar je voor geleefd hebt.",
      zalen: ["Crown Palace, Las Vegas", "Sakura Arena, Tokyo", "The Pavilion, Riyadh", "Garden Square, New York"],
      kampioen: { naam: "Marcus Bellamy", bijnaam: "The Sovereign", land: "USA", stijl: "Allrounder" } }
  ],

  /* Tegenstanders per hoofdstuk. */
  roster: [
    [["Tommy Hale", "The Plumber", "ENG"], ["Luca Ferro", "Il Toro", "ITA"], ["Sean Brady", "Two-Pints", "IRL"], ["Daan Mulder", "De Dijk", "NED"], ["Karim Nasser", "The Tailor", "MAR"], ["Jack Ormond", "Choirboy", "SCO"], ["Piotr Zaba", "The Frog", "POL"], ["Milan Dragic", "Bulldozer", "SRB"], ["Andre Tavares", "O Rapaz", "POR"], ["Ibou Sarr", "Le Grand", "SEN"]],
    [["Cedric Lange", "The Banker", "GER"], ["Dante Moreno", "Relámpago", "MEX"], ["Yusuf Kaya", "The Anvil", "TUR"], ["Reggie Banks", "Payday", "USA"], ["Hugo Marchand", "Le Duc", "FRA"], ["Nikos Stavros", "The Spartan", "GRE"], ["Kwame Boateng", "The Hammer", "GHA"], ["Liam Prescott", "Silk", "ENG"], ["Tiago Lima", "Pantera", "BRA"], ["Ryo Sakai", "Thin Ice", "JPN"]],
    [["Dmitri Volkov", "The Wolf", "KAZ"], ["Rafael Cruz", "Dinamita", "PUR"], ["Omar Haddad", "The Falcon", "EGY"], ["Sebastian Roth", "Der Graf", "AUT"], ["Andrei Pop", "Vlad", "ROU"], ["Jamal Whitfield", "Sunday", "USA"], ["Emre Aydin", "The Sultan", "TUR"], ["Paolo Rinaldi", "Il Maestro", "ITA"], ["Nilo Dela Rosa", "El Gallito", "PHI"], ["Oleg Bondar", "The Wall", "UKR"]],
    [["Isaiah Crowe", "Black Sunday", "USA"], ["Takeshi Mori", "The Monster", "JPN"], ["Santiago Vega", "El Rey", "MEX"], ["Abel Tesfaye", "Marathon", "ETH"], ["Leon Grant", "The Lion", "JAM"], ["Arman Sarkis", "The Armenian", "ARM"], ["Danny O'Rourke", "The Mick", "IRL"], ["Bakhtiyar Ali", "Steppe Fire", "UZB"], ["Cole Maddox", "Mad Dog", "CAN"], ["Hector Duarte", "Sin Miedo", "ARG"]]
  ],

  /* Je aartsrivaal keert steeds terug, sterker. */
  rivaal: { naam: "Silas Kane", bijnaam: "The Reverend", land: "USA", stijl: "Counterpuncher", gevechten: [6, 16, 26, 38], plus: 7,
    teksten: ["Silas Kane zegt op de persconferentie dat hij voor je zal bidden. Dat klinkt niet als een compliment.", "Kane is terug. Hij heeft een bijbel meegenomen naar de weging, en jouw foto zit erin.", "Derde keer Kane. De hele sport praat erover. Jullie kunnen elkaar niet uitstaan.", "Het laatste hoofdstuk: Kane, jij, en Las Vegas. Hier wordt over gepraat als je allang gestopt bent."] },

  opties: {
    veilig: { naam: "Opbouwgevecht", sterkte: -5, training: 1, roem: 0 },
    uitdaging: { naam: "Uitdaging", sterkte: 5, training: 2, roem: 4 }
  },

  groei: { perPunt: 1, maxStat: 99, slijtagePerGevecht: 0.6, slijtageZwaar: 2.2, slijtageKO: 6, rustHerstel: 7, rustVorm: -2, scoutVanaf: 70, scoutVolledig: 85, verouderVanaf: 31, verouderPerJaar: 2.2 },
  sim: { iqPerRonde: 0.65, ruis: 24, hpBasis: 55, hpPerKin: 0.95, schadeFactor: 0.42, schadeBasis: 17, conditieFade: 0.2, hartLaat: 0.1, gelijkMarge: 1.5, standaardRonden: 5 },
  score: { winst: 2, ko: 1, titel: 10, verlies: -3, ongeslagenPerWinst: 0.5 },

  /* Bokswereld tussen de gevechten. Effecten: stat-namen, slijtage, roem, vorm. */
  gebeurtenissen: [
    { t: "Een promotor met een dikke sigaar biedt je een megacontract, maar dan bepaalt hij wie je tegenstanders zijn.", a: [
      { t: "Tekenen", e: { roem: 6, hart: -1 }, r: "Je staat op posters in drie landen. Je tegenstanders kies je nu niet meer helemaal zelf." },
      { t: "Onafhankelijk blijven", e: { hart: 2 }, r: "De sigaar gaat uit. Jij slaapt goed." }] },
    { t: "Je rechterhand doet pijn na de sparring. Je coach kijkt bezorgd.", a: [
      { t: "Een maand rust", e: { slijtage: -4, vorm: -2 }, r: "De hand is blij. Je timing iets minder." },
      { t: "Tape erom en door", e: { slijtage: 5, vorm: 3 }, r: "Je slaat harder dan ooit, en je koffie schenk je voortaan links in." }] },
    { t: "De persconferentie loopt uit de hand. Iedereen wacht op wat jij gaat zeggen.", a: [
      { t: "Geef ze een show", e: { roem: 5, vorm: -2 }, r: "Je quote staat overal. Je tegenstander heeft hem in zijn kleedkamer gehangen." },
      { t: "Rustig blijven", e: { iq: 1, vorm: 2 }, r: "Saai voor de kranten. Jij bent gefocust." }] },
    { t: "Een oud-wereldkampioen wil drie weken met je werken in zijn bergkamp.", a: [
      { t: "Verdediging leren", e: { verdediging: 3 }, r: "Hij slaat je drie weken met een handdoek. Het werkt." },
      { t: "Tactiek leren", e: { iq: 3 }, r: "Je kijkt nu oude gevechten terug, met aantekeningen." }] },
    { t: "Een gevecht op een groot gala in Macau, maar de reis is zwaar en de jetlag brutaal.", a: [
      { t: "Pakken", e: { roem: 4, slijtage: 2 }, r: "Je kent nu het plafond van drie hotels. Ze kennen jou nu ook daar." },
      { t: "Thuis blijven trainen", e: { conditie: 1 }, r: "Rondjes rennen om vijf uur 's ochtends. Niemand kijkt, en dat is het punt." }] },
    { t: "Je vaste sparringpartner wil overstappen naar een andere zaal.", a: [
      { t: "Overhalen om te blijven", e: { hart: 2 }, r: "Hij blijft. Het kostte je een etentje en je trots." },
      { t: "Een jonge hongerige zoeken", e: { snelheid: 2, slijtage: 2 }, r: "Hij is negentien en heeft geen rem." }] },
    { t: "De ringarts wil je scannen na je laatste gevechten.", a: [
      { t: "Netjes laten doen en rusten", e: { slijtage: -5 }, r: "Alles goed. De arts lacht zelfs." },
      { t: "Ik voel me prima, volgende", e: { vorm: 2, slijtage: 3 }, r: "Prima is een breed begrip." }] },
    { t: "Je kunt een week meedraaien in een legendarische krachtzaal in Philadelphia.", a: [
      { t: "Zware bokszak", e: { kracht: 3 }, r: "De bokszak hangt er scheef na een week. De eigenaar is trots." },
      { t: "Trappen rennen", e: { conditie: 2, kin: 1 }, r: "Honderd treden, tien keer. Beneden staat een kind je na te doen." }] }
  ]
};
