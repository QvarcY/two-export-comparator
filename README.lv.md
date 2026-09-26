# Two-Export Comparator

[English](README.md) · [Latviešu](README.lv.md)

**Divi faili iekšā. Atšķirības ārā. Bez konta. Bez augšupielādes. Bez mākoņdatubāzes.**

Two-Export Comparator ir privātumam draudzīgs pārlūka rīks divu eksportētu datu kopu salīdzināšanai, lai atrastu trūkstošus, dublētus, neskaidri savietojamus vai atšķirīgus ierakstus.

Projekta mērķis apzināti ir šaurs: **ieliec divus eksportus, savieno vajadzīgās kolonnas, salīdzini lokāli, pārbaudi atšķirības un eksportē rezultātu.**

> **Pašreizējais statuss:** frontend prototips un arhitektūras pamats. Produkcijas CSV/TSV parseris un īstais salīdzināšanas dzinējs vēl nav ieviests. Pašreizējais interfeiss izmanto determinētus mock datus, kamēr īstais dzinējs tiek veidots aiz stabila servisa kontrakta.

## Kāpēc šis projekts pastāv

Mazie uzņēmumi regulāri eksportē datus no bankām, internetveikaliem, maksājumu sistēmām, noliktavas rīkiem, CRM, grāmatvedības sistēmām un izklājlapām. Sarežģītā daļa bieži nav eksporta iegūšana, bet atbilde uz vienkāršu jautājumu:

**Kas šajos divos failos nesakrīt?**

Tipiski piemēri:

- bankas eksports pret rēķinu eksportu;
- veikala pasūtījumi pret maksājumu sistēmas eksportu;
- noliktavas eksports pret internetveikala eksportu;
- vecais piegādātāja cenu saraksts pret jauno;
- divas atskaites, kurās būtu jābūt vienādām atsaucēm un summām.

Šis projekts nav paredzēts kā ERP, CRM, grāmatvedības sistēma vai mākoņa datu platforma.

## Privātuma modelis

Biznesa failos var būt sensitīva komerciāla vai personas informācija, tāpēc aplikācija tiek veidota ap lokālu apstrādi.

Plānotie produkcijas noteikumi:

- failu saturs tiek apstrādāts pārlūkā;
- aplikācija failus neaugšupielādē;
- lietotāja konts nav nepieciešams;
- aplikācijas datubāzē importētie faili netiek glabāti;
- salīdzināšanas darbplūsmai nav nepieciešama analītika vai telemetrija;
- ārējs JavaScript CDN nav nepieciešams;
- importētās vērtības tiek attēlotas ar drošām DOM metodēm;
- aizverot vai pārlādējot lapu, atmiņā ielādētie biznesa dati pazūd.

Šī arhitektūra samazina nevajadzīgu datu pārsūtīšanu, taču projekts neizsaka vispārīgus juridiskus apgalvojumus, piemēram, “100% atbilst GDPR”.

## Darbplūsma

~~~text
FAILS A + FAILS B
        ↓
PĀRBAUDE / PRIEKŠSKATS
        ↓
KOLONNU SAVIENOŠANA
        ↓
NORMALIZĀCIJAS IESTATĪŠANA
        ↓
LOKĀLA SALĪDZINĀŠANA
        ↓
SAKRĪT / TIKAI A / TIKAI B / NESAKRĪT / DUBLIKĀTS / NESKAIDRS
        ↓
DETALIZĒTA PĀRBAUDE
        ↓
ATSKAITES EKSPORTS
~~~

## Rezultātu kategorijas

| Statuss | Nozīme |
| --- | --- |
| MATCHED | Atrasts viens drošs ierakstu pāris un salīdzinātās vērtības atbilst. |
| ONLY_A | Ieraksts atrodas tikai Failā A. |
| ONLY_B | Ieraksts atrodas tikai Failā B. |
| MISMATCH | Atslēga sakrīt, bet viena vai vairākas salīdzinātās vērtības atšķiras. |
| DUPLICATE | Viena normalizēta atslēga sastopama vairākas reizes. |
| AMBIGUOUS | Nav iespējams droši noteikt vienu pāri; dzinējs nedrīkst minēt. |

## Arhitektūra

~~~text
src/
├── app/          aplikācijas stāvoklis un kontrolieris
├── i18n/         valodu reģistrs un tulkojumi
├── models/       stabili DTO / servisa kontrakti
├── services/     mock un nākotnes pārlūka salīdzināšanas serviss
├── ui/
│   ├── components/
│   ├── renderers/
│   └── views/
└── styles/
~~~

UI sazinās tikai ar ComparisonService robežu. Produkcijas parseris, normalizētāji un salīdzināšanas dzinējs atradīsies aiz BrowserComparisonService, tāpēc, nomainot mock servisu pret īsto dzinēju, interfeiss nav jāpārbūvē.

## Valodas

Pirmās oficiālās UI valodas:

- angļu (EN);
- latviešu (LV).

Valodu pārslēdzējs tiek veidots no valodu reģistra. Contributors var pievienot jaunu valodu, neaiztiekot salīdzināšanas loģiku.

Skati [Tulkošanas rokasgrāmatu](docs/TRANSLATIONS.md).

README tulkojumus var pievienot kā README.xx.md failus un pievienot valodu rindai README augšpusē.

## Izstrāde

~~~bash
npm install
npm run dev
npm run build
npm run preview
~~~

Node/Vite tiek izmantots tikai izstrādei un statiskā build izveidei. Produkcijas aplikācija paliek statiska pārlūka aplikācija.

## Attīstības plāns

Detalizētais un nepārtraukti atjauninātais plāns atrodas [ROADMAP.md](ROADMAP.md).

Augsta līmeņa ceļš:

1. ✅ Projekta ideja un arhitektūras pamats
2. 🟡 Frontend prototips, divvalodu UI pamats un dokumentācija
3. ⬜ Īsts CSV/TSV failu pārbaudes un parsēšanas slānis
4. ⬜ Normalizācija un kolonnu savienošanas noteikumi
5. ⬜ Determinēts salīdzināšanas dzinējs
6. ⬜ Eksports, privātums un drošības nostiprināšana
7. ⬜ Testu fixtures, veiktspēja un pieejamība
8. ⬜ Offline build un publiska izplatīšana
9. ⬜ Publisks release un contributor ekosistēma

**Roadmap noteikums:** pēc katras nozīmīgas izstrādes kārtas jāatjaunina ROADMAP.md, lai repo skaidri redzams, kas mainīts, kas pārbaudīts un kas seko tālāk.

## Contribution

Contribution būs gaidīti, tiklīdz attiecīgā projekta daļa būs pietiekami stabila drošam darbam. Tulkojumu contribution apzināti veidots vienkāršs.

Skati [CONTRIBUTING.md](CONTRIBUTING.md).

## Dizaina principi

- Viena skaidra problēma, atrisināta labi.
- Local-first, kur tas ir praktiski.
- Nekādas klusas minēšanas neskaidru datu gadījumā.
- Reāla uzvedība svarīgāka par funkciju skaitu.
- Minimālas dependencies.
- Pieejamas vadīklas, ne tikai drag-and-drop.
- Testiem jāpierāda uzvedība un jānokrīt, ja aizsargātā uzvedība tiek sabojāta.

## Licence

MIT — skati [LICENSE](LICENSE).
