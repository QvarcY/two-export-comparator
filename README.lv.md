# Two-Export Comparator

[English](README.md) · [Latviešu](README.lv.md)

![Two-Export Comparator — vizuāls salīdzinājums blakus](docs/assets/hero.svg)

> **Divi faili iekšā. Atšķirības ārā.**  
> Privātumam draudzīgs pārlūka rīks, kas lokāli salīdzina divus CSV/TSV eksportus un vizuāli parāda atšķirības blakus.

**Statuss:** jaunākais pirmslaidiens: `v0.1.0-alpha.2` — aktīvā izstrādē

## Kāpēc šis projekts pastāv

Divu eksportu salīdzināšanai nevajadzētu prasīt Excel formulu labirintu, failu augšupielādi mākonī vai datu inženiera zināšanas.

Two-Export Comparator tiek veidots ap vienu ļoti vienkāršu plūsmu:

```text
Ieliec Failu A + Failu B
        ↓
Automātiska lokāla analīze
        ↓
Vizuāls salīdzinājums blakus
        ↓
Sarkans = atšķiras
Neitrāls / zils = sakrīt
        ↓
Eksportē rezultātu
```

Parastam lietotājam nav jāzina salīdzināšanas algoritmi, normalizācijas noteikumi vai kolonnu sasaistes terminoloģija. Rīks cenšas šo darbu izdarīt automātiski. Manuālā sasaistīšana paliek tikai zem **Eksperta iestatījumiem**.

## Ko rīks meklē

Salīdzināšanas dzinējs ierakstus var klasificēt šādi:

| Statuss | Nozīme |
| --- | --- |
| `MATCHED` | Atrasts viens drošs ierakstu pāris, un salīdzinātās vērtības sakrīt. |
| `MISMATCH` | Tas pats ieraksts atrasts abos failos, bet viena vai vairākas vērtības atšķiras. |
| `ONLY_A` | Ieraksts atrodas tikai Failā A. |
| `ONLY_B` | Ieraksts atrodas tikai Failā B. |
| `DUPLICATE` | Viena normalizēta atslēga sastopama vairākas reizes. |
| `AMBIGUOUS` | Vienu drošu pāri nav iespējams noteikt. Dzinējs nemin. |

## Pašreizējās iespējas

- CSV un TSV faili
- komata, semikola un tabulācijas atdalītāju noteikšana
- CSV lauki pēdiņās
- vairāku rindu vērtības pēdiņās
- UTF-8 un UTF-8 BOM
- teksta, skaitļu un datumu pamata tipu noteikšana
- automātiski kolonnu pāru ieteikumi
- determinēta lokāla salīdzināšana
- skaitliska pielaide
- dublikātu un neskaidru sasaistes gadījumu noteikšana
- avota rindu izsekojamība
- vizuāls salīdzinājums blakus
- CSV rezultāta eksports
- angļu un latviešu interfeiss
- valodu reģistrs, kuru viegli papildināt contributoriem

## Privātums pēc arhitektūras

Biznesa eksportos var būt sensitīva informācija. Tāpēc aplikācijas parastajai salīdzināšanas plūsmai nav nepieciešams sūtīt failus uz serveri.

- faili tiek nolasīti pārlūkā;
- aplikācija failu saturu neaugšupielādē;
- nav nepieciešams lietotāja konts;
- importētie biznesa dati netiek glabāti aplikācijas datubāzē;
- salīdzināšanai nav nepieciešama analītika vai telemetrija;
- importētās vērtības tiek attēlotas ar drošām DOM metodēm;
- pārlādējot vai aizverot lapu, atmiņā ielādētie dati pazūd.

Tas apraksta arhitektūru, nevis ir vispārīgs juridisks apgalvojums, piemēram, “100% atbilst GDPR”.

## Ātra palaišana

Nepieciešams:

- aktuāls Node.js
- npm

```bash
git clone https://github.com/QvarcY/two-export-comparator.git
cd two-export-comparator
npm install
npm test
npm run dev
```

Produkcijas build:

```bash
npm run build
npm run preview
```

## Kā darbojas automātiskā sasaistīšana

Aplikācija analizē kolonnu nosaukumus, noteiktos datu tipus, vērtību pārklāšanos un unikalitāti, lai piedāvātu, kuras kolonnas abos failos nozīmē vienu un to pašu.

Piemēram:

```text
Reference   ↔ Payment Ref
Amount      ↔ Total
Date        ↔ Paid Date
```

Spēcīgākais identifikatora kandidāts tiek izmantots ierakstu sasaistīšanai. Papildu saderīgie pāri tiek izmantoti vērtību salīdzināšanai.

Automātiskie ieteikumi apzināti ir konservatīvi. Ja drošu sasaisti nevar noteikt, lietotājs var atvērt **Eksperta iestatījumus**, nevis dzinējs klusām izdomā rezultātu.

## Atbalstītie ievades dati

Šobrīd:

- `.csv`
- `.tsv`
- UTF-8 / UTF-8 BOM
- līdz 50 MiB vienam failam pašreizējā MVP

Tādus formātus kā XLSX ir jēga pievienot tikai tad, kad CSV/TSV kodols ir stabils.

## Projekta robežas

Šis projekts apzināti paliek mazs.

**Kodola solījums:**

> Paņem divus failus un vizuāli parādi, kas tajos atšķiras.

Tam nav jākļūst par ERP, CRM, grāmatvedības sistēmu, mākoņa darba vidi, BI platformu vai failu glabātuvi.

Pirms pievienot jaunu funkciju, jāuzdod viens jautājums:

> Vai tas palīdz lietotājam ātrāk saprast atšķirības starp diviem failiem?

Ja nē, tad šī funkcija, visticamāk, nepieder projekta kodolam.

Skati [PROJECT_SCOPE.md](docs/PROJECT_SCOPE.md).

## Arhitektūra

```text
src/
├── app/          stāvoklis + aplikācijas kontrolieris
├── engine/       parsēšana, normalizācija, sasaistīšana un salīdzināšana
├── i18n/         valodu reģistrs un tulkojumi
├── models/       DTO / servisa kontrakti
├── services/     pārlūka salīdzināšanas serviss
├── ui/
│   ├── components/
│   ├── renderers/
│   └── views/
└── styles/
```

UI ir atkarīgs no `ComparisonService` robežas, nevis no parsera iekšējās uzbūves. Tas neļauj salīdzināšanas loģikai sajaukties ar UI komponentiem.

## Izstrādes principi

- viena skaidra problēma, atrisināta labi;
- local-first, kur tas ir praktiski;
- nekādas klusās minēšanas neskaidru datu gadījumā;
- minimālas dependencies;
- droša importēto vērtību attēlošana;
- pieejamas vadīklas;
- determinēta loģika pirms AI;
- regression testam jānokrīt, ja aizsargātā uzvedība tiek sabojāta.

## Valodas

Oficiālās UI valodas:

- English (`en`)
- Latviešu (`lv`)

Jaunas valodas pievienošana neprasa mainīt salīdzināšanas loģiku.

Skati [Tulkošanas rokasgrāmatu](docs/TRANSLATIONS.md).

README tulkojumus var pievienot kā `README.xx.md`.

## Attīstības plāns

Projekta kanoniskais attīstības žurnāls ir [ROADMAP.md](ROADMAP.md).

Pašreizējais virziens:

1. ✅ projekta arhitektūra un frontend pamats
2. ✅ Visual Diff kā galvenais UX
3. ✅ īsta lokāla CSV/TSV dzinēja MVP versija
4. ✅ sasaistīšanas un normalizācijas nostiprināšana
5. 🟡 eksporta, privātuma un drošības audits
6. 🟡 pieejamības, veiktspējas un regression kvalitātes vārti
7. 🟡 statiskās izplatīšanas nostiprināšana
8. ⬜ publisks laidiens

Pēc katras nozīmīgas izstrādes kārtas tiek atjaunināts `ROADMAP.md`.

## Contribution

Īpaši noderīgi contribution virzieni:

- parsera edge cases;
- determinēta sasaistīšana;
- testa fixtures;
- pieejamība;
- veiktspēja;
- drošības nostiprināšana;
- tulkojumi;
- dokumentācija.

Pirms PR izveides izlasi [CONTRIBUTING.md](CONTRIBUTING.md).

## Autors un atbalsts

Two-Export Comparator ir neatkarīgs projekts, ko radījis **[QvarcY](https://github.com/QvarcY)**.

Ja rīks Tev ietaupa laiku un vēlies atbalstīt tā tālāku attīstību:

**☕ [Uzsauc man kafiju](https://buymeacoffee.com/craftin)**

## Drošība

Lūdzu, nepublicē sensitīvus biznesa eksportus issues, pull requestos, screenshots vai testa fixtures.

Skati [SECURITY.md](SECURITY.md).

## Licence

MIT — skati [LICENSE](LICENSE).
