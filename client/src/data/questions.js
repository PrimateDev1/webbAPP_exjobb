const questions = [
  {
    id: 1,
    text: "Har du idag läst Blodcentralens information om när man inte ska ge blod?",
    followUp: {
     Ja: null,
     Nej: null
    },
    next: 2
  },
  {
    id: 2,
    text: "Har du tidigare givit blod, plasma, trombocyter eller tidigare anmält dig till blodgivning?",
    followUp: {
      Ja: [{"text" : "När gav du blod, plasma eller trombocyter tidigare? Vilken region?"}],
      Nej: null
    },
    next: 3
  },
  {
    id: 3,
    text: "Väger du över 50 kg?",
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 4
  },
  {
    id: 4,
    text: "Går du på läkarkontroller eller är du sjukskriven?",
    followUp: {
      Ja:[ {"text" : "För vad går du på kontroller eller är du sjukskriven?"}]
    },
    next: 5
  },
  {
    id: 5,
    text: "Har du, eller har du haft oregelbunden hjärtrytm, hjärtsjukdom, kärlkramp, hjärtinfarkt, hjärtsvikt, stroke, högt blodtryck som krävt behandling?",
    followUp: {
      Ja: null,
      Nej: null
    },
    next: 6
  },
  {
    id: 6,
    text: "Har du, eller har du haft cancer, ämnesomsättnings-sjukdomdiabetes, diabetes, reumatoid artrit, epilepsi, sjukdom i nervsystemet eller hjärnan?",
    followUp: {
      Ja: null,
      Nej: null
    },
    next: 7
  },
  {
    id: 7,
    text: "Har du, eller har du haft någon blodsjukdom eller blödningsrubbning?",
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 8
  },
  {
    id: 8,
    text: "Har du, eller har du haft någon allvarlig sjukdom i: mage-tarm, njurar, urinvägar, underliv?",
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 9
  },
  {
    id: 9,
    text: "Har du eller någon i din familj haft Creutzfeldt-Jakobs sjukdom? (en mycket ovanlig demenssjukdom)",
    followUp: {
      Ja:[{ "text" : "Är det dina barn, syskon, föräldrar eller far/morföräldrar som haft Creutzfeldt-Jakobs sjukdom?"}]
    },
    next: 10
  },
  {
    id: 10,
    text: "Har du, eller har du haft allvarlig infektionssjukdom, t.ex. hepatit (gulsot), syfilis, tuberkulos, reumatisk feber, HTLV-infektion, benröta (ostetit)?",
    followUp: {
      Ja: null,
      Nej: null
    },
    next: 11
  },
  {
    id: 11,
    text: "Har du infektion med HIV eller misstänker du att du kan vara smittad med HIV (aids-virus)?",
    followUp: {
      Ja: null,
      Nej: null
    },
    next: 12
  },
  {
    id: 12,
    text: "Har du, eller har du haft, malaria eller annan tropisk sjukdom?",
    nrFollowUp: 2,
    followUp: {
      Ja: [
          {"text" : "Vilken infektion har du haft, malaria eller annan tropisk sjukdom?"},
          {"text" :"När blev du frisk?"}
          ]
    },
    next: 13
  },
  {
    id: 13,
    text: "för män: Har du utretts eller behandlats för förstorad prostata eller prostatasjukdom?",
    nrFollowUp: 2,
    followUp: {
      Ja: [{"text" :"Vilken prostata-sjukdom?"},
          {"text" :  "Vilken behandling fick du?"}]
    },
    next: 14
  },
  {
    id: 14,
    text: "Har du under de senaste 6 månaderna vårdats på sjukhus, undersökts, opererats eller på annat sätt varit i kontakt med sjukvården?",
    nrFollowUp: 1,
    followUp: {
      Ja:[{"text" : "För vad har du de senaste 6 månaderna varit i kontakt med sjukvård?"}]
    },
    next: 15
  },
  {
    id: 15,
    text: "Har du fått blodtransfusion eller genomgått transplantation?",
    nrFollowUp: 3,
    followUp: {
     Ja: [{ "text": "Var det blodtransfusion eller transplantation?"},
        {"text" :  "När hände det?"},
        {"text" :  "I vilket land?"}]
    },
    next: 16
  },
  {
    id: 16,
    text: "Har du fått akupunktur de senaste 6 månaderna?",
    nrFollowUp: 2,
    followUp: {
      Ja: [{ "text" : "Varför fick du akupunktur?"},
        {"text" : "När utfördes den senaste akupunkturen?"}]
    },
    next: 17
  },
  {
    id: 17,
    text: "Har du vaccinerats de senaste 4 veckorna?",
    nrFollowUp: 2,
    followUp: {
      Ja: [{"text" : "Mot vad vaccinerades du?"},
          {"text" : "När fick du vaccinationen?"}]
    },
    next: 18
  },
  {
    id: 18,
    text: "Använder du receptbelagda läkemedel, receptfria läkemedel eller värktabletter?",
    nrFollowUp: 2,
    followUp: {
      Ja: [{"text" : "Varför har du använt läkemedel?"},
          {"text" : "Vilka läkemedel?"}]
    },
    next: 19
  },
  {
    id: 19,
    text: "Har du de senaste 3 åren använt receptbelagt läkemedel för behandling av: akne, håravfall, hudtumör, psoriasis?",
    nrFollowUp: 4,
    followUp: {
      Ja:[{"text": "För vad fick du behandling: akne, håravfall, hudtumör eller psoriasis?"},
         {"text" : "Vilket läkemedel fick du?"},
         {"text" : "Tabletter eller kräm/salva?"},
          {"text" : "När avslutades behandlingen?"}]
    },
    next: 20
  },
  {
    id: 20,
    text: "Har du behandlats med tillväxthormon?",
    nrFollowUp: 1,
    followUp: {
      Ja: [{"text" : "När fick du behandling med tillväxthormon?"}]
    },
    next: 21
  },
  {
    id: 21,
    text: "Har du någonsin utanför hälso- och sjukvården injicerat (sprutat in): narkotika, anabola steroider, hormoner, annat preparat?",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
      Nej: null
    },
    next: 22
  },
  {
    id: 22,
    text: "Har du de senaste 2 veckorna använt droger?(hasch, kokain, GHB, marijuana, rökheroin, khat, metamfetamin, ecstasy eller annan drog)",
    nrFollowUp: 1,
    followUp: {
      Ja:[{"text" :  "När använde du droger senast?"}]
    },
    next: 23
  },
  {
    id: 23,
    text: "Har du de senaste 6 månaderna blivit: tatuerad, piercad, t.ex. tagit hål i örat, kosmetiskt behandlad med nålar genom huden, fått injektion av kosmetiskt preparat?",
    nrFollowUp: 1,
    followUp: {
      Ja: [{ "text" : "När var senaste gången du tatuerades, piercades eller fick kosmetisk behandling med nålar genom huden?"}]
    },
    next: 24
  },
  {
    id: 24,
    text: "Har du bott mer än 5 år utanför Europa?(Exempelvis om du är född i ett land utanför Europa.)",
    nrFollowUp: 1,
    followUp: {
      Ja: [{ "text" : "I Vilket land utanför Europa har du bott i?"}]
    },
    next: 25
  },
  {
    id: 25,
    text: "Har du vistats sammanlagt mer än 6 månader i Storbritannien åren 1980–1996?",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 26
  },
  {
    id: 26,
    text: "Har du de senaste 6 månaderna rest utanför Norden?(Till Norden räknas Danmark, Finland, Island, Norge, Sverige, Färöarna, Grönland och Åland.)",
    nrFollowUp: 2,
    followUp: {
      Ja:[{"text": "Vilket resmål utanför Norden har du besökt?"},
          {"text" : "När kom du hem från resan?"}]
    },
    next: 27
  },
  {
    id: 27,
    text: "Har du haft feber utan förklaring vid besök i tropiskt område eller inom 6 månader efteråt?",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 28
  },
  {
    id: 28,
    text: "Har du de senaste 3 månaderna haft sexuellt umgänge med ny partner? Eftersom tester inte kan upptäcka virussmitta när en person är nysmittad, behöver vi fråga dig om sexuella smittvägar..)",
    nrFollowUp: 1,
    followUp: {
      Ja: [{"text" : "När var första gången? (Ny sexualpartner ger minst 3 månaders uppehåll för blodgivning.)"}]
    },
    next: 29
  },
  {
    id: 29,
    text: "Har du  eller vet du att din partner de senaste 6 månaderna haft sexuellt umgänge med: person med känd infektion med hepatit, syfilis, HTLV eller HIV? eller  person som du vet har injicerat narkotika eller dopingmedel? Eftersom tester inte kan upptäcka virussmitta när en person är nysmittad, behöver vi fråga dig om sexuella smittvägar. ",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 30
  },
  {
    id: 30,
    text: "Har du betalat eller fått betalt för sexuellt umgänge de senaste 6 månaderna? Eftersom tester inte kan upptäcka virussmitta när en person är nysmittad, behöver vi fråga dig om sexuella smittvägar.",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 31
  },
  {
    id: 31,
    text: "för män: Har du haft sexuellt umgänge med en annan man de senaste 6 månaderna? Eftersom tester inte kan upptäcka virussmitta när en person är nysmittad, behöver vi fråga dig om sexuella smittvägar",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
      Nej: null
    },
    next: 32
  },
  {
    id: 32,
    text: "för kvinnor: Har du de senaste 6 månaderna haft sexuellt umgänge med en man som du vet har haft sexuellt umgänge med annan man? Eftersom tester inte kan upptäcka virussmitta när en person är nysmittad, behöver vi fråga dig om sexuella smittvägar.",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 33
  },
  {
    id: 33,
    text: "för kvinnor: Försöker du bli gravid?",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
    next: 34
  },
  {
    id: 34,
    text: "Känner du dig frisk?",
    nrFollowUp: 0,
    followUp: {
      Ja: null,
     Nej: null
    },
  }
];

export default questions;
