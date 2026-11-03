/* ==========================================================================
   ONGESLAGEN: ringcommentaar. "Je" ben jij, {b} is de naam van je tegenstander.
   plus = goed voor jou, min = slecht voor jou. Voeg gerust regels toe.
   ========================================================================== */
var COMMENTAAR = {
  plus: {
    kracht: ["Je rechtse komt vol binnen. De knieën van {b} geven even mee.", "Je slaat een linkse hoek naar het lichaam en {b} klapt dubbel.", "Je uppercut splijt zijn dekking. Het hele eerste rij voelt hem.", "Eén overhand van jou, en {b} is plots heel geïnteresseerd in de touwen.", "Je zet je voeten neer en slaat. Dat is een klap die ze in Philadelphia ook horen."],
    snelheid: ["Je jab prikt drie keer voordat {b} zijn handen omhoog heeft.", "Je handen zijn een waas: één-twee-drie-vier, en je staat alweer weg.", "{b} ziet je rechtse niet eens vertrekken.", "Je dubbelt de jab en schiet er een hoek achteraan. {b} slaat alleen nog lucht.", "Je legt een combinatie van zes neer. De jury telt er acht."],
    verdediging: ["{b} haalt uit, jij slipt onder de hoek door. Hij slaat de lucht.", "Je rolt met zijn stoot mee en tikt hem daarna rustig op de neus.", "Je dekking staat als een kluisdeur. {b} slaat zijn handen stuk.", "Je stapt precies op tijd opzij, en {b} valt half door zijn eigen stoot."],
    kin: ["{b} raakt je vol. Je schudt één keer met je hoofd en loopt door.", "Dat was zijn beste stoot, en jij glimlacht erom. {b} kijkt onzeker naar zijn hoek.", "Je vangt een harde rechte en antwoordt meteen. Wat een kin heb jij."],
    conditie: ["{b} hijgt, jij staat nog op je tenen. Nu begint jouw gevecht pas.", "Je tempo zakt geen millimeter. {b} hangt in de clinch om bij te komen.", "Al die rondjes om vijf uur 's ochtends betalen zich nu uit."],
    hart: ["Je kijkt {b} recht aan en stapt naar voren. Hij deinst als eerste terug.", "De zaal fluit je uit, en jij wordt er alleen maar rustiger van.", "Dit is het moeilijke stuk, en jij wil het juist. {b} ziet dat."],
    iq: ["Je hebt zijn patroon door: na elke jab zakt zijn rechterhand. Meteen raak.", "Je lokt {b} met een schijnbeweging en raakt hem op het moment dat hij reageert.", "Je past je plan aan en gaat naar het lichaam. Het werkt direct.", "Je ziet zijn rechte al aankomen voor zijn schouder draait en counter eroverheen.", "Je zet {b} in de hoek waar jij hem wilt hebben. Schaken met handschoenen."]
  },
  min: {
    kracht: ["{b} raakt je met een zware rechte. Je ziet even twee ringen.", "Een harde hoek naar je lever. Je adem is even weg.", "Zijn uppercut vindt het gaatje. Je hoofd klapt achterover.", "{b} zet zich neer en slaat. Dat voel je morgen nog."],
    snelheid: ["{b} is te snel: zijn jab raakt je drie keer voordat jij reageert.", "Een combinatie van vijf, en je ziet er maar drie aankomen.", "Je slaat, {b} is al weg en prikt je op de terugweg.", "Zijn handen gaan sneller dan jouw ogen. Je jury-score lijdt eronder."],
    verdediging: ["Je dekking zakt even en {b} ziet het meteen. Dat kost je een harde stoot.", "Je staat te open. {b} tikt je drie keer aan.", "Je slipt de verkeerde kant op en loopt recht in zijn rechte."],
    kin: ["{b} treft je op de kaak en de zaal draait rond. Je benen voelen als pudding.", "Je knieën zakken door. De scheidsrechter kijkt je extra goed aan.", "Die komt hard aan. Je hoort je coach, maar van heel ver weg."],
    conditie: ["Je longen branden en je handen zakken. {b} ziet dat je moe wordt.", "Je tempo stort in. Je handschoenen voelen alsof ze vol zand zitten.", "Je hijgt zwaar en zoekt de clinch. {b} voert het tempo juist op."],
    hart: ["{b} lacht na een misser van jou, en je laat je gek maken. Je gaat wild slaan.", "De druk komt binnen. Je twijfelt en slaat te laat.", "Je raakt gefrustreerd en vergeet je plan. {b} maakt daar handig gebruik van."],
    iq: ["{b} heeft je door: hij weet wat je gaat doen voordat jij het weet.", "Je trapt twee keer in dezelfde schijnbeweging. Je coach slaat op de ringvloer.", "Je blijft hetzelfde proberen, en {b} heeft er telkens een antwoord op.", "{b} lokt je naar voren en countert je precies op het juiste moment."]
  },
  neutraal: ["Jullie tasten elkaar af. Veel jabs, weinig raak.", "Clinch. De scheidsrechter haalt jullie uit elkaar.", "Een rustig stuk. Jij en {b} draaien om elkaar heen.", "Een snelle uitwisseling, maar geen van jullie raakt schoon.", "Koppen tegen elkaar. De scheidsrechter waarschuwt jullie allebei."],
  opening: {
    r1: ["De bel gaat. Je loopt naar het midden van de ring, {b} komt van de andere kant.", "Handschoenen tikken, het gevecht is begonnen. {b} kijkt je strak aan.", "De bel. De zaal is luid, en jij zoekt je afstand tot {b}."],
    voor: ["De bel. Je gaat met vertrouwen de ronde in.", "Je coach zei: 'Gewoon zo doorgaan.' Je loopt weer naar voren.", "{b} komt uit zijn hoek met een gezicht vol twijfel."],
    achter: ["De bel. Je hebt iets goed te maken, en dat weet je.", "Je coach schreeuwde in de hoek. Je komt met een nieuw plan terug.", "{b} komt zelfverzekerd uit zijn hoek. Hij ruikt zijn kans."],
    gelijk: ["De bel. Er is nog niets beslist.", "Beide hoeken roepen hetzelfde: nu versnellen.", "De zaal voelt dat dit nog alle kanten op kan."]
  },
  rondeEinde: {
    plus: ["De bel. Deze ronde was duidelijk voor jou.", "De bel. Je loopt met een goed gevoel naar je hoek.", "De bel redt {b}. Jouw ronde."],
    min: ["De bel. Deze ronde ging naar {b}, en dat weet je.", "De bel komt op tijd voor jou. Dit was zijn ronde.", "De bel. Je loopt iets langzamer terug naar je hoek."],
    gelijk: ["De bel. Deze ronde kon beide kanten op.", "De bel. De juryleden krabben aan hun hoofd.", "De bel. Heel gelijkwaardig."]
  },
  ko: ["Je ziet de opening en je rechterhand gaat er dwars doorheen. {b} valt en blijft liggen. KNOCK-OUT! Je hebt gewonnen!", "Een linkse hoek die niemand zag aankomen. {b} zakt in elkaar. De scheidsrechter telt tot tien. Jij wint op knock-out!", "Je jaagt {b} tegen de touwen met een serie stoten. Zijn hoek gooit de handdoek. Technische knock-out voor jou!"],
  koTegen: ["Je ziet zijn rechte te laat. Het licht gaat uit. Als je bijkomt, staat {b} te juichen. Je bent knock-out.", "Zijn hoek raakt je vol op de kaak. Je valt als een plank en haalt de tel niet. Verloren op knock-out.", "Je staat te wankelen en {b} blijft slaan. De scheidsrechter stapt ertussen. Technische knock-out tegen jou."]
};
