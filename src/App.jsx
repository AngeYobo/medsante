import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ============================================================
// MédSanté Pro v2 - Logiciel de Médecine du Travail
// ============================================================

const ROLES = {
  secretaire: { label: "Secrétaire", color: "#6366f1", icon: "📋" },
  infirmiere: { label: "Infirmier(e)", color: "#0d9488", icon: "💉" },
  medecin: { label: "Médecin", color: "#dc2626", icon: "⚕️" },
};

const USERS = [
  { id: 1, code: "SEC01", name: "Marie Dupont", role: "secretaire" },
  { id: 2, code: "INF01", name: "Sophie Martin", role: "infirmiere" },
  { id: 3, code: "MED01", name: "Dr. Laurent Moreau", role: "medecin" },
];

const VISIT_TYPES = [
  { value: "embauche", label: "Visite d'embauche", color: "#2563eb" },
  { value: "periodique", label: "Visite périodique", color: "#0d9488" },
  { value: "reprise", label: "Visite de reprise", color: "#d97706" },
  { value: "demande", label: "À la demande", color: "#7c3aed" },
  { value: "pre_reprise", label: "Pré-reprise", color: "#db2777" },
];

const APTITUDE_STATUS = [
  { value: "apte", label: "Apte", color: "#16a34a" },
  { value: "apte_restrictions", label: "Apte avec restrictions", color: "#d97706" },
  { value: "inapte_temporaire", label: "Inapte temporaire", color: "#dc2626" },
  { value: "inapte", label: "Inapte", color: "#991b1b" },
  { value: "en_attente", label: "En attente", color: "#6b7280" },
];

const SERVICES = [
  "Production", "Maintenance", "Administratif", "Logistique",
  "Qualité", "R&D", "Commercial", "Direction", "Informatique"
];

const RISQUES = [
  "Bruit", "Vibrations", "Produits chimiques", "Travail en hauteur",
  "Manutention manuelle", "Écran", "Travail de nuit", "Amiante",
  "Rayonnements", "Agents biologiques", "Températures extrêmes"
];

const AT_GRAVITY = [
  { value: "leger", label: "Léger", color: "#d97706" },
  { value: "modere", label: "Modéré", color: "#ea580c" },
  { value: "grave", label: "Grave", color: "#dc2626" },
  { value: "tres_grave", label: "Très grave", color: "#991b1b" },
  { value: "mortel", label: "Mortel", color: "#000" },
];

const CAMPAIGN_STATUS = [
  { value: "planifiee", label: "Planifiée", color: "#2563eb" },
  { value: "en_cours", label: "En cours", color: "#d97706" },
  { value: "terminee", label: "Terminée", color: "#16a34a" },
  { value: "annulee", label: "Annulée", color: "#dc2626" },
];

const defaultEmployees = [
  { id: 1, nom: "Durand", prenom: "Jean", matricule: "EMP001", dateNaissance: "1985-03-15", poste: "Opérateur machine", service: "Production", dateEmbauche: "2018-06-01", risques: ["Bruit", "Vibrations", "Manutention manuelle"], aptitude: "apte", derniereVisite: "2025-01-15", prochaineVisite: "2026-01-15", vaccinations: ["Tétanos (2023)", "Hépatite B (2020)"], notes: "" },
  { id: 2, nom: "Petit", prenom: "Claire", matricule: "EMP002", dateNaissance: "1990-07-22", poste: "Assistante RH", service: "Administratif", dateEmbauche: "2020-01-15", risques: ["Écran"], aptitude: "apte", derniereVisite: "2025-06-10", prochaineVisite: "2026-06-10", vaccinations: ["Tétanos (2022)"], notes: "" },
  { id: 3, nom: "Bernard", prenom: "Marc", matricule: "EMP003", dateNaissance: "1978-11-03", poste: "Technicien maintenance", service: "Maintenance", dateEmbauche: "2010-09-01", risques: ["Bruit", "Produits chimiques", "Travail en hauteur"], aptitude: "apte_restrictions", derniereVisite: "2025-03-20", prochaineVisite: "2025-09-20", vaccinations: ["Tétanos (2024)", "Hépatite B (2021)"], notes: "Restriction port de charges > 15kg" },
  { id: 4, nom: "Lemoine", prenom: "Sophie", matricule: "EMP004", dateNaissance: "1995-01-30", poste: "Cariste", service: "Logistique", dateEmbauche: "2022-03-01", risques: ["Vibrations", "Manutention manuelle"], aptitude: "apte", derniereVisite: "2025-05-05", prochaineVisite: "2026-05-05", vaccinations: ["Tétanos (2023)"], notes: "" },
  { id: 5, nom: "Rousseau", prenom: "Antoine", matricule: "EMP005", dateNaissance: "1982-09-14", poste: "Ingénieur qualité", service: "Qualité", dateEmbauche: "2015-02-01", risques: ["Produits chimiques", "Écran"], aptitude: "en_attente", derniereVisite: "2024-11-01", prochaineVisite: "2025-05-01", vaccinations: ["Tétanos (2021)"], notes: "Visite de reprise à programmer suite AT" },
  { id: 6, nom: "Garcia", prenom: "Elena", matricule: "EMP006", dateNaissance: "1988-12-05", poste: "Responsable logistique", service: "Logistique", dateEmbauche: "2016-04-15", risques: ["Écran", "Manutention manuelle"], aptitude: "apte", derniereVisite: "2025-08-12", prochaineVisite: "2026-08-12", vaccinations: ["Tétanos (2024)"], notes: "" },
  { id: 7, nom: "Moreau", prenom: "Lucas", matricule: "EMP007", dateNaissance: "1992-06-18", poste: "Soudeur", service: "Production", dateEmbauche: "2019-11-01", risques: ["Bruit", "Rayonnements", "Produits chimiques"], aptitude: "apte", derniereVisite: "2025-10-03", prochaineVisite: "2026-04-03", vaccinations: ["Tétanos (2023)", "Hépatite B (2022)"], notes: "" },
  { id: 8, nom: "Fournier", prenom: "Camille", matricule: "EMP008", dateNaissance: "1997-02-28", poste: "Laborantin", service: "R&D", dateEmbauche: "2023-09-01", risques: ["Produits chimiques", "Agents biologiques"], aptitude: "apte", derniereVisite: "2025-09-01", prochaineVisite: "2026-03-01", vaccinations: ["Tétanos (2023)", "Hépatite B (2023)", "Grippe (2025)"], notes: "" },
];

const buildDMST = () => ({
  // === Page 1 : DOSSIER MÉDICAL ===
  identite: {
    sexe: "",                // si tu veux le déplacer depuis employee
    nationalite: "",
    situationFamille: "",
    lieuNaissance: "",
    distanceDomicileKm: "",
    moyensTransport: "",
    adressesSuccessives: [{ adresse: "", dateDebut: "", dateFin: "" }],
  },

  entreprise: {
    raisonSociale: "",
    adresse: "",
    embaucheLe: "",
  },

  antecedents: {
    familiauxAscendantsCollateraux: "",
    familiauxConjointEnfants: "",
    personnels: "", // texte long
  },

  parcours: {
    formationScolairePro: "",
    activitesProAnterieures: "",
    serviceMilitaire: {
      arme: "", grade: "", lieu: "", outreMer: "",
      exemptionReforme: "", motif: "", pension: "",
    },
    emploiObligatoire: {
      victimeGuerre: false,
      accidenteTravail: false,
      travailleurHandicape: false,
    },
  },

  immunoBio: {
    vaccinations: [
      // type: "diphtérie-tétanos" etc.
      { type: "diphtérie-tétanos", date: "", commentaire: "" },
      { type: "poliomyélite", date: "", commentaire: "" },
      { type: "BCG", date: "", commentaire: "" },
      { type: "autres", date: "", commentaire: "" },
      { type: "test tuberculinique", date: "", commentaire: "" },
    ],
    serumsTransfusions: [{ type: "sérum", date: "", commentaire: "" }],
    groupeSanguin: { laboratoire: "", date: "", resultat: "" },
  },

  // === Page 2 : 1er EXAMEN ===
  premierExamen: buildExam(),

  // === Page 3 : EXAMENS ULTÉRIEURS ===
  examensUlterieurs: [], // liste de buildExam()
});

const buildExam = () => ({
  meta: { date: "", docteur: "", cachetService: "" },

  poste: {
    intitule: "",
    caracteristiques: "",
    risques: [], // tu peux réutiliser RISQUES
  },

  facteursExtraPro: "",

  constantes: { poidsKg: "", tailleCm: "" },

  auditif: { prothese: false, auditionOD: "", auditionOG: "" },

  oculaire: {
    couleurs: "",
    visionPresOD: "", visionPresOG: "",
    visionLoinOD: "", visionLoinOG: "",
    correction: { avec: true }, // simple flag
  },

  clinique: {
    teguments: "",
    appareilMoteur: "",
    respiratoire: { rhinoPharynx: "", capaciteVitale: "" },
    cardioVasculaire: { pouls: "", ta: "", varices: "" },
    digestif: { parois: "", regime: "" },
    genital: { regles: "" },
    urinaire: { albumine: "", sucre: "" },
    hemato: { ganglions: "", rate: "" },
    endocrines: "",
    nerveux: { tremblement: "", equilibre: "", reflexes: "" },
    psychisme: "",
    autres: "",
  },

  examensComplementaires: "",

  // IMPORTANT : séparer médical vs employeur
  conclusions: {
    medicale: "",              // 🔒 médecin uniquement
    professionnelleEmployeur: "" // avis à transmettre
  },
});

const defaultVisits = [
  { id: 1, employeeId: 1, type: "periodique", date: "2025-01-15", heure: "09:00", medecin: "Dr. Laurent Moreau", statut: "realisee", conclusion: "RAS - Apte sans restriction", aptitude: "apte" },
  { id: 2, employeeId: 2, type: "periodique", date: "2025-06-10", heure: "10:30", medecin: "Dr. Laurent Moreau", statut: "realisee", conclusion: "RAS", aptitude: "apte" },
  { id: 3, employeeId: 3, type: "periodique", date: "2025-03-20", heure: "14:00", medecin: "Dr. Laurent Moreau", statut: "realisee", conclusion: "Apte avec restriction - Port de charges limité à 15kg", aptitude: "apte_restrictions" },
  { id: 4, employeeId: 5, type: "reprise", date: "2026-02-15", heure: "09:00", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" },
  { id: 5, employeeId: 4, type: "periodique", date: "2026-02-20", heure: "11:00", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" },
  { id: 6, employeeId: 1, type: "demande", date: "2026-03-01", heure: "14:30", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" },
  { id: 7, employeeId: 6, type: "periodique", date: "2026-02-25", heure: "09:00", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" },
  { id: 8, employeeId: 7, type: "periodique", date: "2026-03-10", heure: "10:00", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" },
  { id: 9, employeeId: 8, type: "periodique", date: "2026-03-01", heure: "14:00", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" },
];

const defaultNotifications = [
  { id: 1, message: "Visite de reprise à programmer pour Antoine Rousseau", type: "urgent", date: "2026-02-09", read: false },
  { id: 2, message: "3 visites périodiques à planifier ce mois", type: "info", date: "2026-02-09", read: false },
  { id: 3, message: "Campagne vaccination grippe - relance", type: "warning", date: "2026-02-07", read: true },
  { id: 4, message: "Visite de Camille Fournier prévue le 01/03", type: "info", date: "2026-02-08", read: false },
];

const defaultAccidents = [
  { id: 1, employeeId: 5, type: "at", date: "2024-10-15", description: "Chute dans les escaliers du bâtiment qualité", gravite: "modere", arretJours: 45, lieu: "Bâtiment Qualité - escalier B", cause: "Sol glissant", mesures: "Bandes antidérapantes posées, nettoyage renforcé", statut: "clos", dateReprise: "2024-12-01" },
  { id: 2, employeeId: 1, type: "at", date: "2025-07-03", description: "Coupure main droite lors du réglage machine", gravite: "leger", arretJours: 3, lieu: "Atelier production - ligne 2", cause: "Absence de gants de protection", mesures: "Rappel port EPI, gants fournis", statut: "clos", dateReprise: "2025-07-06" },
  { id: 3, employeeId: 7, type: "mp", date: "2025-11-20", description: "Suspicion de surdité professionnelle", gravite: "modere", arretJours: 0, lieu: "Atelier soudure", cause: "Exposition prolongée au bruit", mesures: "Audiogramme programmé, bouchons moulés commandés", statut: "en_cours", dateReprise: "" },
];

const defaultCampaigns = [
  { id: 1, nom: "Vaccination grippe 2025-2026", type: "vaccination", dateDebut: "2025-10-15", dateFin: "2025-12-31", statut: "terminee", description: "Campagne annuelle de vaccination contre la grippe saisonnière", cible: "Tous les salariés", participants: 42, objectif: 80, responsable: "Dr. Laurent Moreau" },
  { id: 2, nom: "Sensibilisation TMS", type: "formation", dateDebut: "2026-01-15", dateFin: "2026-03-30", statut: "en_cours", description: "Ateliers de sensibilisation aux troubles musculo-squelettiques pour les postes à risque", cible: "Production, Logistique, Maintenance", participants: 18, objectif: 35, responsable: "Sophie Martin" },
  { id: 3, nom: "Bilan auditif production", type: "depistage", dateDebut: "2026-03-01", dateFin: "2026-04-15", statut: "planifiee", description: "Audiogrammes de contrôle pour les salariés exposés au bruit", cible: "Production", participants: 0, objectif: 15, responsable: "Dr. Laurent Moreau" },
];

// ============================================================
// Storage helpers
// ============================================================
const loadData = async (key, fallback) => {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : fallback;
  } catch { return fallback; }
};
const saveData = async (key, data) => {
  try { await window.storage.set(key, JSON.stringify(data)); } catch (e) { console.error("Storage:", e); }
};

// ============================================================
// CSV Helpers
// ============================================================
const exportCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(";"),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      const str = Array.isArray(val) ? val.join(", ") : String(val ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    }).join(";"))
  ].join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map(line => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ";" && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => {
      let val = (values[i] || "").replace(/^"|"$/g, "");
      if (h === "risques" || h === "vaccinations") val = val.split(",").map(s => s.trim()).filter(Boolean);
      else if (h === "id" || h === "employeeId" || h === "arretJours") val = parseInt(val) || 0;
      obj[h] = val;
    });
    return obj;
  });
};

// ============================================================
// PDF Report Generator
// ============================================================
const generateAnnualReport = (employees, visits, accidents, campaigns, year) => {
  const yearVisits = visits.filter(v => v.date.startsWith(String(year)));
  const realised = yearVisits.filter(v => v.statut === "realisee");
  const yearAT = accidents.filter(a => a.date.startsWith(String(year)));
  const atCount = yearAT.filter(a => a.type === "at").length;
  const mpCount = yearAT.filter(a => a.type === "mp").length;
  const totalArret = yearAT.reduce((s, a) => s + (a.arretJours || 0), 0);

  const byService = {};
  employees.forEach(e => { byService[e.service] = (byService[e.service] || 0) + 1; });
  const byAptitude = {};
  APTITUDE_STATUS.forEach(a => { byAptitude[a.label] = employees.filter(e => e.aptitude === a.value).length; });
  const byVisitType = {};
  VISIT_TYPES.forEach(t => { byVisitType[t.label] = yearVisits.filter(v => v.type === t.value).length; });
  const byRisk = {};
  employees.forEach(e => e.risques.forEach(r => { byRisk[r] = (byRisk[r] || 0) + 1; }));

  const now = new Date().toLocaleDateString("fr-FR");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Annuel Santé au Travail ${year}</title>
<style>
@page { size: A4; margin: 20mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11pt; color: #1a1a2e; line-height: 1.6; }
.header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
.header h1 { font-size: 22pt; color: #1e40af; margin-bottom: 4px; }
.header h2 { font-size: 14pt; color: #475569; font-weight: 400; }
.header .date { font-size: 10pt; color: #94a3b8; margin-top: 8px; }
.section { margin-bottom: 28px; page-break-inside: avoid; }
.section h3 { font-size: 13pt; color: #1e40af; border-bottom: 1.5px solid #dbeafe; padding-bottom: 6px; margin-bottom: 14px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
.kpi .value { font-size: 24pt; font-weight: 700; color: #1e40af; }
.kpi .label { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
th { background: #1e40af; color: white; padding: 8px 12px; text-align: left; font-weight: 600; }
td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
tr:nth-child(even) td { background: #f8fafc; }
.bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.bar-label { width: 160px; font-size: 10pt; text-align: right; }
.bar-track { flex: 1; height: 18px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; }
.bar-val { width: 30px; font-size: 10pt; font-weight: 600; }
.footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9pt; color: #94a3b8; }
.signature { margin-top: 40px; display: flex; justify-content: space-between; }
.signature div { text-align: center; }
.signature .line { border-top: 1px solid #333; width: 200px; margin: 40px auto 6px; }
@media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>Rapport Annuel de Santé au Travail</h1>
  <h2>Année ${year}</h2>
  <div class="date">Généré le ${now} — MédSanté Pro</div>
</div>

<div class="section">
  <h3>1. Indicateurs clés</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${employees.length}</div><div class="label">Effectif suivi</div></div>
    <div class="kpi"><div class="value">${yearVisits.length}</div><div class="label">Visites programmées</div></div>
    <div class="kpi"><div class="value">${realised.length}</div><div class="label">Visites réalisées</div></div>
    <div class="kpi"><div class="value">${atCount + mpCount}</div><div class="label">AT / MP déclarés</div></div>
  </div>
</div>

<div class="section">
  <h3>2. Répartition de l'effectif par service</h3>
  ${Object.entries(byService).sort((a,b)=>b[1]-a[1]).map(([s,c]) => `
  <div class="bar-row">
    <div class="bar-label">${s}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/employees.length*100)}%;background:#1e40af;"></div></div>
    <div class="bar-val">${c}</div>
  </div>`).join("")}
</div>

<div class="section">
  <h3>3. Bilan des visites médicales</h3>
  <table>
    <thead><tr><th>Type de visite</th><th>Nombre</th><th>% du total</th></tr></thead>
    <tbody>
    ${Object.entries(byVisitType).map(([t,c]) => `<tr><td>${t}</td><td>${c}</td><td>${yearVisits.length ? Math.round(c/yearVisits.length*100) : 0}%</td></tr>`).join("")}
    <tr style="font-weight:700;background:#dbeafe"><td>Total</td><td>${yearVisits.length}</td><td>100%</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h3>4. Aptitudes</h3>
  <table>
    <thead><tr><th>Aptitude</th><th>Effectif</th><th>%</th></tr></thead>
    <tbody>
    ${Object.entries(byAptitude).map(([a,c]) => `<tr><td>${a}</td><td>${c}</td><td>${employees.length ? Math.round(c/employees.length*100) : 0}%</td></tr>`).join("")}
    </tbody>
  </table>
</div>

<div class="section">
  <h3>5. Exposition aux risques professionnels</h3>
  ${Object.entries(byRisk).sort((a,b)=>b[1]-a[1]).map(([r,c]) => `
  <div class="bar-row">
    <div class="bar-label">${r}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/employees.length*100)}%;background:#d97706;"></div></div>
    <div class="bar-val">${c}</div>
  </div>`).join("")}
</div>

<div class="section">
  <h3>6. Accidents du travail et maladies professionnelles</h3>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi"><div class="value">${atCount}</div><div class="label">Accidents du travail</div></div>
    <div class="kpi"><div class="value">${mpCount}</div><div class="label">Maladies prof.</div></div>
    <div class="kpi"><div class="value">${totalArret}</div><div class="label">Jours d'arrêt</div></div>
  </div>
  ${yearAT.length > 0 ? `<table>
    <thead><tr><th>Date</th><th>Type</th><th>Salarié</th><th>Gravité</th><th>Arrêt (j)</th></tr></thead>
    <tbody>${yearAT.map(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      return `<tr><td>${a.date}</td><td>${a.type === 'at' ? 'AT' : 'MP'}</td><td>${emp ? emp.prenom + ' ' + emp.nom : '—'}</td><td>${a.gravite}</td><td>${a.arretJours}</td></tr>`;
    }).join("")}</tbody>
  </table>` : '<p>Aucun AT/MP enregistré sur la période.</p>'}
</div>

<div class="section">
  <h3>7. Actions de prévention</h3>
  ${campaigns.filter(c => c.dateDebut.startsWith(String(year)) || c.dateFin.startsWith(String(year))).length > 0 ? `<table>
    <thead><tr><th>Campagne</th><th>Type</th><th>Période</th><th>Statut</th><th>Participation</th></tr></thead>
    <tbody>${campaigns.filter(c => c.dateDebut.startsWith(String(year)) || c.dateFin.startsWith(String(year))).map(c =>
      `<tr><td>${c.nom}</td><td>${c.type}</td><td>${c.dateDebut} → ${c.dateFin}</td><td>${c.statut}</td><td>${c.participants}/${c.objectif}</td></tr>`
    ).join("")}</tbody>
  </table>` : '<p>Aucune campagne sur la période.</p>'}
</div>

<div class="signature">
  <div><div class="line"></div>Le Médecin du Travail</div>
  <div><div class="line"></div>La Direction</div>
</div>

<div class="footer">
  Document généré automatiquement par MédSanté Pro — Confidentiel médical — Archivage RGPD
</div>
</body></html>`;
  return html;
};

// ============================================================
// Styles
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #f0f2f5; --surface: #ffffff; --surface-alt: #f8f9fb;
  --border: #e2e5ea; --border-light: #eef0f3;
  --text: #1a1d23; --text-secondary: #5f6577; --text-muted: #9098a9;
  --primary: #1e40af; --primary-light: #dbeafe; --primary-hover: #1e3a8a;
  --accent: #0d9488; --accent-light: #ccfbf1;
  --danger: #dc2626; --danger-light: #fee2e2;
  --warning: #d97706; --warning-light: #fef3c7;
  --success: #16a34a; --success-light: #dcfce7;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.1);
  --radius: 10px; --radius-sm: 6px; --radius-lg: 16px;
  --font: 'DM Sans', system-ui, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --transition: 0.2s ease;
}
body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.5; }

/* Login */
.login-wrapper { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f4c5c 100%); position:relative; overflow:hidden; }
.login-wrapper::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(ellipse at 30% 50%,rgba(14,165,233,0.08) 0%,transparent 50%),radial-gradient(ellipse at 70% 20%,rgba(13,148,136,0.06) 0%,transparent 50%); animation:drift 20s ease-in-out infinite; }
@keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2%,1%)} }
.login-card { position:relative; background:rgba(255,255,255,0.97); border-radius:20px; padding:48px 40px; width:400px; max-width:90vw; box-shadow:0 25px 60px rgba(0,0,0,0.3); animation:fadeUp 0.6s ease-out; }
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.login-logo { text-align:center; margin-bottom:32px; }
.login-logo h1 { font-family:var(--font-serif); font-size:28px; font-weight:600; color:var(--primary); }
.login-logo p { font-size:13px; color:var(--text-secondary); margin-top:4px; }
.login-input-group { margin-bottom:20px; }
.login-input-group label { display:block; font-size:13px; font-weight:500; color:var(--text-secondary); margin-bottom:6px; }
.login-input { width:100%; padding:12px 16px; border:1.5px solid var(--border); border-radius:var(--radius); font-size:15px; font-family:var(--font); transition:var(--transition); background:var(--surface-alt); }
.login-input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-light); background:white; }
.login-btn { width:100%; padding:13px; background:var(--primary); color:white; border:none; border-radius:var(--radius); font-size:15px; font-weight:600; font-family:var(--font); cursor:pointer; transition:var(--transition); margin-top:8px; }
.login-btn:hover { background:var(--primary-hover); transform:translateY(-1px); box-shadow:var(--shadow-md); }
.login-error { background:var(--danger-light); color:var(--danger); padding:10px 14px; border-radius:var(--radius-sm); font-size:13px; margin-bottom:16px; text-align:center; }
.login-codes { margin-top:24px; padding-top:20px; border-top:1px solid var(--border-light); }
.login-codes p { font-size:12px; color:var(--text-muted); text-align:center; margin-bottom:8px; }
.login-codes-list { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
.login-code-chip { font-size:11px; padding:4px 10px; background:var(--surface-alt); border-radius:20px; color:var(--text-secondary); cursor:pointer; transition:var(--transition); border:1px solid var(--border-light); }
.login-code-chip:hover { background:var(--primary-light); color:var(--primary); border-color:var(--primary); }

/* App Layout */
.app { display:flex; min-height:100vh; }
.sidebar { width:260px; background:#0f172a; color:white; display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:50; transition:transform 0.3s ease; }
.sidebar-brand { padding:24px 20px; border-bottom:1px solid rgba(255,255,255,0.08); }
.sidebar-brand h1 { font-family:var(--font-serif); font-size:20px; font-weight:600; }
.sidebar-brand span { font-size:10px; background:rgba(255,255,255,0.15); padding:2px 7px; border-radius:4px; margin-left:6px; vertical-align:middle; }
.sidebar-brand p { font-size:11px; color:rgba(255,255,255,0.4); margin-top:2px; }
.sidebar-nav { flex:1; padding:12px; overflow-y:auto; }
.sidebar-section-title { font-size:10px; text-transform:uppercase; letter-spacing:1.2px; color:rgba(255,255,255,0.3); padding:12px 12px 6px; font-weight:600; }
.nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; transition:var(--transition); font-size:14px; color:rgba(255,255,255,0.65); margin-bottom:2px; border:none; background:none; width:100%; text-align:left; font-family:var(--font); }
.nav-item:hover { background:rgba(255,255,255,0.06); color:white; }
.nav-item.active { background:rgba(255,255,255,0.1); color:white; font-weight:500; }
.nav-item .nav-icon { font-size:18px; width:24px; text-align:center; }
.nav-badge { margin-left:auto; background:var(--danger); color:white; font-size:10px; font-weight:700; padding:2px 7px; border-radius:10px; }
.sidebar-user { padding:16px 20px; border-top:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:10px; }
.sidebar-user-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.sidebar-user-info { flex:1; min-width:0; }
.sidebar-user-name { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sidebar-user-role { font-size:11px; color:rgba(255,255,255,0.4); }
.logout-btn { background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:18px; padding:4px; transition:var(--transition); }
.logout-btn:hover { color:white; }

/* Main */
.main { flex:1; margin-left:260px; min-height:100vh; }
.topbar { background:var(--surface); border-bottom:1px solid var(--border); padding:16px 32px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:40; }
.topbar h2 { font-size:20px; font-weight:600; letter-spacing:-0.3px; }
.topbar-actions { display:flex; align-items:center; gap:12px; }
.content { padding:28px 32px; }

/* Global Search */
.global-search-wrapper { position:relative; }
.global-search { width:340px; padding:9px 14px 9px 36px; border:1px solid var(--border); border-radius:var(--radius); font-size:13px; font-family:var(--font); background:var(--surface-alt); transition:var(--transition); }
.global-search:focus { outline:none; border-color:var(--primary); background:white; box-shadow:0 0 0 3px var(--primary-light); width:420px; }
.global-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; color:var(--text-muted); }
.search-results { position:absolute; top:calc(100% + 6px); left:0; right:0; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow-lg); max-height:360px; overflow-y:auto; z-index:100; }
.search-result-item { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; transition:var(--transition); border-bottom:1px solid var(--border-light); }
.search-result-item:hover { background:var(--surface-alt); }
.search-result-item:last-child { border-bottom:none; }
.search-result-type { font-size:10px; text-transform:uppercase; letter-spacing:0.5px; padding:2px 6px; border-radius:3px; font-weight:600; white-space:nowrap; }
.search-result-text { font-size:13px; }
.search-result-sub { font-size:11px; color:var(--text-muted); }

/* Cards & Stats */
.card { background:var(--surface); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; }
.card-header { padding:20px 24px; border-bottom:1px solid var(--border-light); display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.card-header h3 { font-size:16px; font-weight:600; }
.card-body { padding:24px; }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:24px; }
.stat-card { background:var(--surface); border-radius:var(--radius-lg); border:1px solid var(--border); padding:22px 24px; box-shadow:var(--shadow-sm); transition:var(--transition); }
.stat-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
.stat-label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; font-weight:500; margin-bottom:8px; }
.stat-value { font-size:32px; font-weight:700; letter-spacing:-1px; line-height:1; }
.stat-sub { font-size:12px; color:var(--text-secondary); margin-top:6px; }

/* Tables */
.table-wrapper { overflow-x:auto; }
table { width:100%; border-collapse:collapse; }
th { text-align:left; padding:12px 16px; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-muted); font-weight:600; border-bottom:1px solid var(--border); background:var(--surface-alt); white-space:nowrap; }
td { padding:14px 16px; font-size:14px; border-bottom:1px solid var(--border-light); }
tr:hover td { background:var(--surface-alt); }
tr:last-child td { border-bottom:none; }

/* Badges */
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:500; white-space:nowrap; }

/* Buttons */
.btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:var(--radius-sm); font-size:13px; font-weight:500; font-family:var(--font); cursor:pointer; transition:var(--transition); border:1px solid transparent; white-space:nowrap; }
.btn-primary { background:var(--primary); color:white; }
.btn-primary:hover { background:var(--primary-hover); }
.btn-secondary { background:var(--surface); color:var(--text); border-color:var(--border); }
.btn-secondary:hover { background:var(--surface-alt); }
.btn-success { background:var(--success); color:white; }
.btn-success:hover { background:#15803d; }
.btn-danger { background:var(--danger); color:white; }
.btn-danger:hover { background:#b91c1c; }
.btn-sm { padding:6px 10px; font-size:12px; }
.btn-icon { width:36px; height:36px; padding:0; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-size:16px; transition:var(--transition); }
.btn-icon:hover { background:var(--surface-alt); }

/* Search box */
.search-box { position:relative; }
.search-box input { width:100%; padding:9px 14px 9px 36px; border:1px solid var(--border); border-radius:var(--radius); font-size:13px; font-family:var(--font); background:var(--surface-alt); transition:var(--transition); }
.search-box input:focus { outline:none; border-color:var(--primary); background:white; }
.search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; color:var(--text-muted); }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; animation:fadeIn 0.2s; }
@keyframes fadeIn { from{opacity:0} }
.modal { background:var(--surface); border-radius:var(--radius-lg); width:640px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:var(--shadow-lg); animation:slideUp 0.3s ease-out; }
@keyframes slideUp { from{transform:translateY(16px);opacity:0} }
.modal-header { padding:20px 24px; border-bottom:1px solid var(--border-light); display:flex; align-items:center; justify-content:space-between; }
.modal-header h3 { font-size:18px; font-weight:600; }
.modal-close { background:none; border:none; font-size:22px; cursor:pointer; color:var(--text-muted); padding:4px; line-height:1; }
.modal-close:hover { color:var(--text); }
.modal-body { padding:24px; }
.modal-footer { padding:16px 24px; border-top:1px solid var(--border-light); display:flex; justify-content:flex-end; gap:10px; }

/* Form */
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-group { margin-bottom:16px; }
.form-group.full { grid-column:1/-1; }
.form-group label { display:block; font-size:12px; font-weight:500; color:var(--text-secondary); margin-bottom:5px; }
.form-control { width:100%; padding:9px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:14px; font-family:var(--font); background:white; transition:var(--transition); }
.form-control:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 2px var(--primary-light); }
textarea.form-control { resize:vertical; min-height:80px; }
.checkbox-group { display:flex; flex-wrap:wrap; gap:8px; }
.checkbox-chip { display:flex; align-items:center; gap:5px; padding:5px 10px; border-radius:20px; font-size:12px; border:1px solid var(--border); cursor:pointer; transition:var(--transition); user-select:none; }
.checkbox-chip.selected { background:var(--primary-light); border-color:var(--primary); color:var(--primary); }

/* Notifications */
.notif-list { display:flex; flex-direction:column; gap:8px; }
.notif-item { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border-radius:var(--radius); border:1px solid var(--border-light); transition:var(--transition); }
.notif-item:hover { background:var(--surface-alt); }
.notif-item.unread { border-left:3px solid var(--primary); background:rgba(30,64,175,0.02); }
.notif-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:4px; }
.notif-content { flex:1; }
.notif-message { font-size:14px; }
.notif-date { font-size:12px; color:var(--text-muted); margin-top:2px; }

/* Tabs */
.tabs { display:flex; gap:4px; border-bottom:1px solid var(--border); margin-bottom:20px; padding:0 4px; }
.tab { padding:10px 16px; font-size:13px; font-weight:500; color:var(--text-muted); background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:var(--transition); font-family:var(--font); }
.tab:hover { color:var(--text); }
.tab.active { color:var(--primary); border-bottom-color:var(--primary); }

/* Detail panel */
.detail-panel { display:grid; grid-template-columns:300px 1fr; gap:24px; }
.detail-field { margin-bottom:14px; }
.detail-field-label { font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); font-weight:600; margin-bottom:3px; }
.detail-field-value { font-size:14px; }
.risk-tag { display:inline-block; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:500; background:#fef3c7; color:#92400e; margin:2px; }
.vacc-tag { display:inline-block; padding:3px 8px; border-radius:4px; font-size:11px; background:var(--accent-light); color:#0f766e; margin:2px; }

/* Calendar */
.calendar { user-select:none; }
.calendar-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.calendar-header h3 { font-size:16px; font-weight:600; }
.calendar-nav { display:flex; gap:6px; }
.calendar-nav button { width:32px; height:32px; border-radius:6px; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:var(--transition); }
.calendar-nav button:hover { background:var(--surface-alt); }
.calendar-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; background:var(--border); border-radius:var(--radius); overflow:hidden; }
.calendar-day-header { background:var(--surface-alt); padding:10px; text-align:center; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); }
.calendar-day { background:var(--surface); min-height:90px; padding:6px 8px; cursor:pointer; transition:var(--transition); position:relative; }
.calendar-day:hover { background:var(--surface-alt); }
.calendar-day.other-month { background:#fafbfc; }
.calendar-day.other-month .day-num { color:var(--text-muted); opacity:0.4; }
.calendar-day.today { background:#eff6ff; }
.calendar-day.today .day-num { background:var(--primary); color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
.day-num { font-size:12px; font-weight:500; margin-bottom:4px; }
.day-event { font-size:10px; padding:2px 4px; border-radius:3px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; }
.day-more { font-size:10px; color:var(--text-muted); padding:1px 4px; }

/* Progress bar */
.progress-track { height:8px; background:var(--surface-alt); border-radius:4px; overflow:hidden; }
.progress-fill { height:100%; border-radius:4px; transition:width 0.5s; }

/* Toast */
.toast { position:fixed; bottom:24px; right:24px; background:#0f172a; color:white; padding:14px 20px; border-radius:var(--radius); font-size:14px; box-shadow:var(--shadow-lg); z-index:200; animation:slideUp 0.3s ease-out; display:flex; align-items:center; gap:10px; }
.toast-success { border-left:4px solid var(--success); }
.toast-error { border-left:4px solid var(--danger); }

/* Empty state */
.empty-state { text-align:center; padding:60px 20px; color:var(--text-muted); }
.empty-state-icon { font-size:48px; margin-bottom:12px; }

/* Responsive */
@media (max-width:900px) {
  .sidebar { transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .main { margin-left:0; }
  .form-grid { grid-template-columns:1fr; }
  .detail-panel { grid-template-columns:1fr; }
  .stats-grid { grid-template-columns:repeat(2,1fr); }
  .content { padding:20px 16px; }
  .topbar { padding:12px 16px; }
  .global-search, .global-search:focus { width:200px; }
}
`;

// ============================================================
// Shared Components
// ============================================================

function LoginScreen({ onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    const user = USERS.find(u => u.code.toUpperCase() === code.toUpperCase().trim());
    if (user) onLogin(user); else setError("Code d'accès invalide");
  };
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo"><h1>MédSanté Pro</h1><p>Médecine du Travail</p></div>
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="login-input-group">
            <label>Code d'accès</label>
            <input type="text" className="login-input" placeholder="Entrez votre code" value={code} onChange={e => { setCode(e.target.value); setError(""); }} autoFocus />
          </div>
          <button type="submit" className="login-btn">Se connecter</button>
        </form>
        <div className="login-codes">
          <p>Codes de démonstration :</p>
          <div className="login-codes-list">
            {USERS.map(u => <span key={u.id} className="login-code-chip" onClick={() => setCode(u.code)}>{ROLES[u.role].icon} {u.code}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ status, type = "aptitude" }) {
  if (type === "aptitude") { const s = APTITUDE_STATUS.find(a => a.value === status); if (!s) return null; return <span className="badge" style={{ background: s.color + "18", color: s.color }}>{s.label}</span>; }
  if (type === "visit") { const s = VISIT_TYPES.find(v => v.value === status); if (!s) return null; return <span className="badge" style={{ background: s.color + "18", color: s.color }}>{s.label}</span>; }
  if (type === "statut") { const map = { planifiee: { l: "Planifiée", c: "#2563eb" }, realisee: { l: "Réalisée", c: "#16a34a" }, annulee: { l: "Annulée", c: "#dc2626" } }; const m = map[status]; if (!m) return null; return <span className="badge" style={{ background: m.c + "18", color: m.c }}>{m.l}</span>; }
  if (type === "gravity") { const g = AT_GRAVITY.find(a => a.value === status); if (!g) return null; return <span className="badge" style={{ background: g.color + "18", color: g.color }}>{g.label}</span>; }
  if (type === "campaign") { const c = CAMPAIGN_STATUS.find(a => a.value === status); if (!c) return null; return <span className="badge" style={{ background: c.color + "18", color: c.color }}>{c.label}</span>; }
  return null;
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { width: 800 } : {}}>
        <div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{type === "success" ? "✓" : "✕"} {message}</div>;
}

function Field({ label, children, hint }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Text({ value, onChange, placeholder }) {
  return <input className="form-control" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function DateInput({ value, onChange }) {
  return <input type="date" className="form-control" value={value || ""} onChange={e => onChange(e.target.value)} />;
}

function TextArea({ value, onChange, placeholder }) {
  return <textarea className="form-control" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function Switch({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function DMSTPage({ emp, onUpdate, user, showToast }) {
  const canEditMedical = user.role === "medecin";
  const canEditAdmin = user.role !== "infirmiere"; // secrétaire + médecin

  const dmst = emp.dmst || buildDMST();
  const setDMST = (next) => onUpdate({ dmst: next });

  const setPath = (path, value) => {
    const clone = structuredClone(dmst);
    let cur = clone;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = value;
    setDMST(clone);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div className="card-header">
          <h3>Dossier médical (ouverture)</h3>
          <button className="btn btn-secondary" onClick={() => { setDMST(dmst); showToast("Dossier sauvegardé", "success"); }}>
            💾 Sauvegarder
          </button>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Nationalité</label>
              <input className="form-control" value={dmst.identite.nationalite || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["identite", "nationalite"], e.target.value)} />
            </div>
            <div className="form-group">
              <label>Situation de famille</label>
              <input className="form-control" value={dmst.identite.situationFamille || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["identite", "situationFamille"], e.target.value)} />
            </div>

            <div className="form-group">
              <label>Distance domicile (km)</label>
              <input className="form-control" value={dmst.identite.distanceDomicileKm || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["identite", "distanceDomicileKm"], e.target.value)} />
            </div>
            <div className="form-group">
              <label>Moyens de transport</label>
              <input className="form-control" value={dmst.identite.moyensTransport || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["identite", "moyensTransport"], e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Entreprise — Raison sociale</label>
              <input className="form-control" value={dmst.entreprise.raisonSociale || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["entreprise", "raisonSociale"], e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Entreprise — Adresse</label>
              <input className="form-control" value={dmst.entreprise.adresse || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["entreprise", "adresse"], e.target.value)} />
            </div>
            <div className="form-group">
              <label>Embauche le</label>
              <input type="date" className="form-control" value={dmst.entreprise.embaucheLe || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["entreprise", "embaucheLe"], e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Antécédents héréditaires et familiaux — Ascendants / collatéraux</label>
              <textarea className="form-control" value={dmst.antecedents.familiauxAscendantsCollateraux || ""} disabled={!canEditMedical}
                onChange={e => setPath(["antecedents", "familiauxAscendantsCollateraux"], e.target.value)} />
              {!canEditMedical && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>🔒 Réservé au médecin</div>}
            </div>

            <div className="form-group full">
              <label>Antécédents héréditaires et familiaux — Conjoint / enfants</label>
              <textarea className="form-control" value={dmst.antecedents.familiauxConjointEnfants || ""} disabled={!canEditMedical}
                onChange={e => setPath(["antecedents", "familiauxConjointEnfants"], e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Antécédents personnels</label>
              <textarea className="form-control" value={dmst.antecedents.personnels || ""} disabled={!canEditMedical}
                onChange={e => setPath(["antecedents", "personnels"], e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Formation scolaire et professionnelle</label>
              <textarea className="form-control" value={dmst.parcours.formationScolairePro || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["parcours", "formationScolairePro"], e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Activités professionnelles antérieures</label>
              <textarea className="form-control" value={dmst.parcours.activitesProAnterieures || ""} disabled={!canEditAdmin}
                onChange={e => setPath(["parcours", "activitesProAnterieures"], e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Emploi obligatoire</label>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Switch
                  checked={dmst.parcours.emploiObligatoire.victimeGuerre}
                  onChange={(v) => canEditAdmin && setPath(["parcours", "emploiObligatoire", "victimeGuerre"], v)}
                  label="Victime de guerre"
                />
                <Switch
                  checked={dmst.parcours.emploiObligatoire.accidenteTravail}
                  onChange={(v) => canEditAdmin && setPath(["parcours", "emploiObligatoire", "accidenteTravail"], v)}
                  label="Accidenté du travail"
                />
                <Switch
                  checked={dmst.parcours.emploiObligatoire.travailleurHandicape}
                  onChange={(v) => canEditAdmin && setPath(["parcours", "emploiObligatoire", "travailleurHandicape"], v)}
                  label="Travailleur handicapé"
                />
              </div>
            </div>

            <div className="form-group full">
              <label>Vaccinations (type / date / commentaire)</label>
              <div style={{ display: "grid", gap: 10 }}>
                {dmst.immunoBio.vaccinations.map((row, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "220px 160px 1fr", gap: 10 }}>
                    <input className="form-control" value={row.type} disabled={!canEditAdmin}
                      onChange={e => {
                        const next = structuredClone(dmst);
                        next.immunoBio.vaccinations[idx].type = e.target.value;
                        setDMST(next);
                      }} />
                    <input type="date" className="form-control" value={row.date || ""} disabled={!canEditAdmin}
                      onChange={e => {
                        const next = structuredClone(dmst);
                        next.immunoBio.vaccinations[idx].date = e.target.value;
                        setDMST(next);
                      }} />
                    <input className="form-control" value={row.commentaire || ""} disabled={!canEditAdmin}
                      onChange={e => {
                        const next = structuredClone(dmst);
                        next.immunoBio.vaccinations[idx].commentaire = e.target.value;
                        setDMST(next);
                      }} />
                  </div>
                ))}
                {canEditAdmin && (
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const next = structuredClone(dmst);
                    next.immunoBio.vaccinations.push({ type: "", date: "", commentaire: "" });
                    setDMST(next);
                  }}>+ Ajouter</button>
                )}
              </div>
            </div>

            <div className="form-group full">
              <label>Groupe sanguin</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 1fr", gap: 10 }}>
                <input className="form-control" placeholder="Laboratoire" value={dmst.immunoBio.groupeSanguin.laboratoire || ""} disabled={!canEditMedical}
                  onChange={e => setPath(["immunoBio","groupeSanguin","laboratoire"], e.target.value)} />
                <input type="date" className="form-control" value={dmst.immunoBio.groupeSanguin.date || ""} disabled={!canEditMedical}
                  onChange={e => setPath(["immunoBio","groupeSanguin","date"], e.target.value)} />
                <input className="form-control" placeholder="Résultat" value={dmst.immunoBio.groupeSanguin.resultat || ""} disabled={!canEditMedical}
                  onChange={e => setPath(["immunoBio","groupeSanguin","resultat"], e.target.value)} />
              </div>
              {!canEditMedical && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>🔒 Réservé au médecin</div>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function ExamPage({ title, exam, onUpdate, user, showToast }) {
  const canEditMedical = user.role === "medecin";
  const canEditNursing = user.role === "infirmiere" || user.role === "medecin"; // constantes, tests, etc.

  const [form, setForm] = useState(exam || buildExam());
  useEffect(() => { setForm(exam || buildExam()); }, [exam]);

  const setPath = (path, value) => {
    const next = structuredClone(form);
    let cur = next;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = value;
    setForm(next);
  };

  const save = () => {
    onUpdate(form);
    showToast("Examen sauvegardé", "success");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <button className="btn btn-secondary" onClick={save}>💾 Sauvegarder</button>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group"><label>Date</label>
            <input type="date" className="form-control" value={form.meta.date || ""} onChange={e => setPath(["meta","date"], e.target.value)} />
          </div>
          <div className="form-group"><label>Docteur</label>
            <input className="form-control" value={form.meta.docteur || ""} onChange={e => setPath(["meta","docteur"], e.target.value)} />
          </div>

          <div className="form-group full"><label>Poste — Intitulé</label>
            <input className="form-control" value={form.poste.intitule || ""} onChange={e => setPath(["poste","intitule"], e.target.value)} />
          </div>

          <div className="form-group full"><label>Poste — Caractéristiques / risques</label>
            <textarea className="form-control" value={form.poste.caracteristiques || ""} onChange={e => setPath(["poste","caracteristiques"], e.target.value)} />
          </div>

          <div className="form-group full"><label>Risques (liste)</label>
            <div className="checkbox-group">
              {RISQUES.map(r => (
                <span key={r}
                  className={`checkbox-chip ${form.poste.risques.includes(r) ? "selected" : ""}`}
                  onClick={() => {
                    const next = structuredClone(form);
                    next.poste.risques = next.poste.risques.includes(r)
                      ? next.poste.risques.filter(x => x !== r)
                      : [...next.poste.risques, r];
                    setForm(next);
                  }}
                >{r}</span>
              ))}
            </div>
          </div>

          <div className="form-group full"><label>Facteurs extra-professionnels</label>
            <textarea className="form-control" value={form.facteursExtraPro || ""} onChange={e => setPath(["facteursExtraPro"], e.target.value)} />
          </div>

          <div className="form-group"><label>Poids (kg)</label>
            <input className="form-control" value={form.constantes.poidsKg || ""} disabled={!canEditNursing}
              onChange={e => setPath(["constantes","poidsKg"], e.target.value)} />
          </div>
          <div className="form-group"><label>Taille (cm)</label>
            <input className="form-control" value={form.constantes.tailleCm || ""} disabled={!canEditNursing}
              onChange={e => setPath(["constantes","tailleCm"], e.target.value)} />
          </div>

          <div className="form-group full"><label>Auditif</label>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 10 }}>
              <label style={{ display:"flex", gap: 8, alignItems:"center" }}>
                <input type="checkbox" checked={!!form.auditif.prothese} disabled={!canEditNursing}
                  onChange={e => setPath(["auditif","prothese"], e.target.checked)} />
                Prothèse
              </label>
              <input className="form-control" placeholder="Audition OD" value={form.auditif.auditionOD || ""} disabled={!canEditNursing}
                onChange={e => setPath(["auditif","auditionOD"], e.target.value)} />
              <input className="form-control" placeholder="Audition OG" value={form.auditif.auditionOG || ""} disabled={!canEditNursing}
                onChange={e => setPath(["auditif","auditionOG"], e.target.value)} />
            </div>
          </div>

          <div className="form-group full"><label>Oculaire</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input className="form-control" placeholder="Couleurs" value={form.oculaire.couleurs || ""} disabled={!canEditNursing}
                onChange={e => setPath(["oculaire","couleurs"], e.target.value)} />
              <label style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="checkbox" checked={form.oculaire.correction.avec} disabled={!canEditNursing}
                  onChange={e => setPath(["oculaire","correction","avec"], e.target.checked)} />
                Avec correction
              </label>
              <input className="form-control" placeholder="Vision près OD" value={form.oculaire.visionPresOD || ""} disabled={!canEditNursing}
                onChange={e => setPath(["oculaire","visionPresOD"], e.target.value)} />
              <input className="form-control" placeholder="Vision près OG" value={form.oculaire.visionPresOG || ""} disabled={!canEditNursing}
                onChange={e => setPath(["oculaire","visionPresOG"], e.target.value)} />
              <input className="form-control" placeholder="Vision loin OD" value={form.oculaire.visionLoinOD || ""} disabled={!canEditNursing}
                onChange={e => setPath(["oculaire","visionLoinOD"], e.target.value)} />
              <input className="form-control" placeholder="Vision loin OG" value={form.oculaire.visionLoinOG || ""} disabled={!canEditNursing}
                onChange={e => setPath(["oculaire","visionLoinOG"], e.target.value)} />
            </div>
          </div>

          <div className="form-group full"><label>Constatations cliniques</label>
            <textarea className="form-control" value={form.clinique.autres || ""} disabled={!canEditMedical}
              onChange={e => setPath(["clinique","autres"], e.target.value)} placeholder="Synthèse ou autres constatations..." />
            {!canEditMedical && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>🔒 Réservé au médecin</div>}
          </div>

          <div className="form-group full"><label>Examens complémentaires</label>
            <textarea className="form-control" value={form.examensComplementaires || ""} disabled={!canEditMedical}
              onChange={e => setPath(["examensComplementaires"], e.target.value)} />
          </div>

          <div className="form-group full"><label>Conclusion médicale 🔒</label>
            <textarea className="form-control" value={form.conclusions.medicale || ""} disabled={!canEditMedical}
              onChange={e => setPath(["conclusions","medicale"], e.target.value)} />
          </div>

          <div className="form-group full"><label>Conclusion professionnelle (à transmettre à l’employeur)</label>
            <textarea className="form-control" value={form.conclusions.professionnelleEmployeur || ""} disabled={!canEditMedical}
              onChange={e => setPath(["conclusions","professionnelleEmployeur"], e.target.value)} />
          </div>

        </div>
      </div>
    </div>
  );
}

function FollowupsPage({ exams, onChange, user, showToast }) {
  const canEdit = user.role === "medecin";
  const add = () => {
    const next = [...exams, buildExam()];
    onChange(next);
    showToast("Examen ajouté", "success");
  };
  const updateAt = (idx, newExam) => {
    const next = exams.map((e, i) => i === idx ? newExam : e);
    onChange(next);
  };
  const removeAt = (idx) => {
    if (!confirm("Supprimer cet examen ?")) return;
    onChange(exams.filter((_, i) => i !== idx));
    showToast("Examen supprimé", "success");
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {canEdit && <button className="btn btn-primary" onClick={add}>+ Ajouter un examen</button>}
      </div>

      {exams.length === 0 ? (
        <div className="card"><div className="card-body">
          <div className="empty-state"><div className="empty-state-icon">🩺</div><p>Aucun examen ultérieur</p></div>
        </div></div>
      ) : (
        exams.map((ex, idx) => (
          <div className="card" key={idx}>
            <div className="card-header">
              <h3>Examen #{idx + 1} {ex.meta?.date ? `— ${new Date(ex.meta.date).toLocaleDateString("fr-FR")}` : ""}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {canEdit && <button className="btn btn-danger btn-sm" onClick={() => removeAt(idx)}>Supprimer</button>}
              </div>
            </div>
            <div className="card-body">
              <ExamPage
                title={null}
                exam={ex}
                onUpdate={(newExam) => updateAt(idx, newExam)}
                user={user}
                showToast={showToast}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}


// ============================================================
// Global Search Component
// ============================================================
function GlobalSearch({ employees, visits, accidents, campaigns, onNavigate }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const res = [];
    employees.forEach(e => {
      if (`${e.nom} ${e.prenom} ${e.matricule} ${e.poste} ${e.service}`.toLowerCase().includes(q))
        res.push({ type: "Salarié", icon: "👤", label: `${e.prenom} ${e.nom}`, sub: `${e.poste} — ${e.service}`, action: () => onNavigate("employees", e.id) });
    });
    visits.forEach(v => {
      const emp = employees.find(e => e.id === v.employeeId);
      const label = emp ? `${emp.prenom} ${emp.nom}` : "—";
      if (`${label} ${v.type} ${v.date} ${v.medecin}`.toLowerCase().includes(q))
        res.push({ type: "Visite", icon: "🩺", label: `${label} — ${v.date}`, sub: VISIT_TYPES.find(t => t.value === v.type)?.label || v.type, action: () => onNavigate("visits") });
    });
    accidents.forEach(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      if (`${emp?.nom} ${emp?.prenom} ${a.description} ${a.lieu}`.toLowerCase().includes(q))
        res.push({ type: a.type === "at" ? "AT" : "MP", icon: "⚠️", label: emp ? `${emp.prenom} ${emp.nom}` : "—", sub: a.description.slice(0, 60), action: () => onNavigate("accidents") });
    });
    campaigns.forEach(c => {
      if (`${c.nom} ${c.type} ${c.description}`.toLowerCase().includes(q))
        res.push({ type: "Campagne", icon: "📢", label: c.nom, sub: c.type, action: () => onNavigate("campaigns") });
    });
    return res.slice(0, 10);
  }, [query, employees, visits, accidents, campaigns, onNavigate]);

  return (
    <div className="global-search-wrapper" ref={ref}>
      <span className="global-search-icon">🔍</span>
      <input
        className="global-search"
        placeholder="Recherche globale : salarié, visite, AT, campagne..."
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <div key={i} className="search-result-item" onClick={() => { r.action(); setOpen(false); setQuery(""); }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="search-result-text">{r.label}</div>
                <div className="search-result-sub">{r.sub}</div>
              </div>
              <span className="search-result-type" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>{r.type}</span>
            </div>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="search-results" style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Aucun résultat pour "{query}"</div>
      )}
    </div>
  );
}

// ============================================================
// Dashboard Page
// ============================================================
function DashboardPage({ employees, visits, notifications, accidents }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcomingVisits = visits.filter(v => v.statut === "planifiee" && v.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const overdueCount = employees.filter(e => e.prochaineVisite < today).length;
  const totalVisitsThisYear = visits.filter(v => v.date.startsWith("2026") && v.statut === "realisee").length;
  const restrictionCount = employees.filter(e => ["apte_restrictions", "inapte_temporaire", "inapte"].includes(e.aptitude)).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const atThisYear = accidents.filter(a => a.date.startsWith("2026")).length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Effectif suivi</div><div className="stat-value" style={{ color: "var(--primary)" }}>{employees.length}</div><div className="stat-sub">salariés actifs</div></div>
        <div className="stat-card"><div className="stat-label">Visites à venir</div><div className="stat-value" style={{ color: "var(--accent)" }}>{upcomingVisits.length}</div><div className="stat-sub">{overdueCount > 0 ? `⚠ ${overdueCount} en retard` : "tout est à jour"}</div></div>
        <div className="stat-card"><div className="stat-label">Visites 2026</div><div className="stat-value" style={{ color: "#7c3aed" }}>{totalVisitsThisYear}</div><div className="stat-sub">réalisées cette année</div></div>
        <div className="stat-card"><div className="stat-label">Restrictions</div><div className="stat-value" style={{ color: "var(--warning)" }}>{restrictionCount}</div><div className="stat-sub">salariés concernés</div></div>
        <div className="stat-card"><div className="stat-label">AT/MP 2026</div><div className="stat-value" style={{ color: "var(--danger)" }}>{atThisYear}</div><div className="stat-sub">déclarés cette année</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3>Prochaines visites</h3></div>
          {upcomingVisits.length === 0 ? <div className="card-body"><div className="empty-state"><p>Aucune visite planifiée</p></div></div> : (
            <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Heure</th><th>Salarié</th><th>Type</th></tr></thead><tbody>
              {upcomingVisits.slice(0, 6).map(v => { const emp = employees.find(e => e.id === v.employeeId); return (
                <tr key={v.id}><td>{new Date(v.date).toLocaleDateString("fr-FR")}</td><td>{v.heure}</td><td>{emp ? `${emp.prenom} ${emp.nom}` : "—"}</td><td><Badge status={v.type} type="visit" /></td></tr>
              ); })}
            </tbody></table></div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><h3>Notifications {unreadNotifs > 0 && <span className="nav-badge" style={{ fontSize: 10, verticalAlign: "middle" }}>{unreadNotifs}</span>}</h3></div>
          <div className="card-body"><div className="notif-list">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                <div className="notif-dot" style={{ background: n.type === "urgent" ? "var(--danger)" : n.type === "warning" ? "var(--warning)" : "var(--primary)" }} />
                <div className="notif-content"><div className="notif-message">{n.message}</div><div className="notif-date">{new Date(n.date).toLocaleDateString("fr-FR")}</div></div>
              </div>
            ))}
          </div></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>Répartition des aptitudes</h3></div>
        <div className="card-body"><div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {APTITUDE_STATUS.map(a => { const count = employees.filter(e => e.aptitude === a.value).length; const pct = employees.length ? Math.round((count / employees.length) * 100) : 0; return (
            <div key={a.value} style={{ flex: "1 1 150px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{a.label}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{count}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: a.color }} /></div>
            </div>
          ); })}
        </div></div>
      </div>
    </div>
  );
}

// ============================================================
// Employees Page
// ============================================================
function EmployeesPage({ employees, visits, setEmployees, user, showToast }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filterService, setFilterService] = useState("");
  const [filterAptitude, setFilterAptitude] = useState("");
  const [tab, setTab] = useState("profil");
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => employees.filter(e => {
    const s = search.toLowerCase();
    return (!s || `${e.nom} ${e.prenom} ${e.matricule} ${e.poste}`.toLowerCase().includes(s))
      && (!filterService || e.service === filterService)
      && (!filterAptitude || e.aptitude === filterAptitude);
  }), [employees, search, filterService, filterAptitude]);

  const blank = { nom: "", prenom: "", matricule: "", dateNaissance: "", poste: "", service: "Production", dateEmbauche: "", risques: [], aptitude: "en_attente", derniereVisite: "", prochaineVisite: "", vaccinations: [], notes: "", dmst: buildDMST(), };

  const handleSave = (emp) => {
    if (editing) setEmployees(employees.map(e => e.id === editing.id ? { ...emp, id: editing.id } : e));
    else setEmployees([...employees, { ...emp, id: Date.now() }]);
    setShowForm(false); setEditing(null);
    showToast(editing ? "Salarié modifié" : "Salarié ajouté", "success");
  };
  const handleDelete = (id) => { if (confirm("Supprimer ce salarié ?")) { setEmployees(employees.filter(e => e.id !== id)); setSelected(null); showToast("Salarié supprimé", "success"); } };

  const handleExportCSV = () => {
    const data = employees.map(e => ({ ...e, risques: e.risques.join(", "), vaccinations: e.vaccinations.join(", ") }));
    exportCSV(data, `salaries_export_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast("Export CSV réussi", "success");
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) { showToast("Fichier CSV vide ou invalide", "error"); return; }
        const imported = parsed.map((p, i) => ({
          ...blank,
          ...p,
          id: Date.now() + i,
          risques: Array.isArray(p.risques) ? p.risques : [],
          vaccinations: Array.isArray(p.vaccinations) ? p.vaccinations : [],
        }));
        setEmployees(prev => [...prev, ...imported]);
        showToast(`${imported.length} salarié(s) importé(s)`, "success");
      } catch { showToast("Erreur lors de l'import", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (selected) {
    const emp = employees.find(e => e.id === selected);
    if (!emp) { setSelected(null); return null; }
    const empVisits = visits.filter(v => v.employeeId === emp.id).sort((a, b) => b.date.localeCompare(a.date));
    return (
      <div>
        <button className="btn btn-secondary" onClick={() => setSelected(null)} style={{ marginBottom: 20 }}>← Retour à la liste</button>
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={`tab ${tab === "profil" ? "active" : ""}`} onClick={() => setTab("profil")}>Profil</button>
          <button className={`tab ${tab === "dmst" ? "active" : ""}`} onClick={() => setTab("dmst")}>Dossier médical</button>
          <button className={`tab ${tab === "first" ? "active" : ""}`} onClick={() => setTab("first")}>1er examen</button>
          <button className={`tab ${tab === "followups" ? "active" : ""}`} onClick={() => setTab("followups")}>Examens ultérieurs</button>
        </div>
        {tab === "profil" && (
  <div className="detail-panel">
    {/* === TON UI PROFIL EXISTANTE (inchangée) === */}
    <div>
      <div className="card">
        <div className="card-body" style={{ textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: "var(--primary)", margin: "0 auto 12px" }}>
            {emp.prenom[0]}{emp.nom[0]}
          </div>
          <h3 style={{ fontSize: 18 }}>{emp.prenom} {emp.nom}</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{emp.poste}</p>
          <div style={{ marginTop: 10 }}><Badge status={emp.aptitude} /></div>
        </div>

        <div className="card-body" style={{ borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
          {[
            ["Matricule", emp.matricule],
            ["Service", emp.service],
            ["Naissance", emp.dateNaissance ? new Date(emp.dateNaissance).toLocaleDateString("fr-FR") : "—"],
            ["Embauche", emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString("fr-FR") : "—"],
            ["Prochaine visite", emp.prochaineVisite ? new Date(emp.prochaineVisite).toLocaleDateString("fr-FR") : "—"],
          ].map(([l, v]) => (
            <div key={l} className="detail-field">
              <div className="detail-field-label">{l}</div>
              <div className="detail-field-value">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Risques professionnels</h3></div>
        <div className="card-body">
          {emp.risques.length === 0
            ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun risque identifié</p>
            : emp.risques.map(r => <span key={r} className="risk-tag">{r}</span>)
          }
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Vaccinations</h3></div>
        <div className="card-body">
          {emp.vaccinations.length === 0
            ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucune vaccination</p>
            : emp.vaccinations.map((v, i) => <span key={i} className="vacc-tag">{v}</span>)
          }
        </div>
      </div>

      {emp.notes && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>Notes</h3></div>
          <div className="card-body"><p style={{ fontSize: 14 }}>{emp.notes}</p></div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>Historique des visites</h3></div>
        {empVisits.length === 0 ? (
          <div className="card-body"><p style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucune visite</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Statut</th><th>Conclusion</th></tr></thead>
              <tbody>
                {empVisits.map(v => (
                  <tr key={v.id}>
                    <td>{new Date(v.date).toLocaleDateString("fr-FR")}</td>
                    <td><Badge status={v.type} type="visit" /></td>
                    <td><Badge status={v.statut} type="statut" /></td>
                    <td style={{ whiteSpace: "normal", maxWidth: 300 }}>{v.conclusion || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{tab === "dmst" && (
  <DMSTPage
    emp={emp}
    onUpdate={(patch) =>
      setEmployees(prev =>
        prev.map(e => e.id === emp.id ? ({ ...e, ...patch }) : e)
      )
    }
    user={user}
    showToast={showToast}
  />
)}

{tab === "first" && (
  <ExamPage
    title="1er examen médical"
    exam={emp.dmst?.premierExamen}
    onUpdate={(newExam) =>
      setEmployees(prev =>
        prev.map(e => {
          if (e.id !== emp.id) return e;
          const base = e.dmst ?? buildDMST(); // ✅ évite spread undefined
          return { ...e, dmst: { ...base, premierExamen: newExam } };
        })
      )
    }
    user={user}
    showToast={showToast}
  />
)}

{tab === "followups" && (
  <FollowupsPage
    exams={emp.dmst?.examensUlterieurs || []}
    onChange={(newList) =>
      setEmployees(prev =>
        prev.map(e => {
          if (e.id !== emp.id) return e;
          const base = e.dmst ?? buildDMST(); // ✅ évite spread undefined
          return { ...e, dmst: { ...base, examensUlterieurs: newList } };
        })
      )
    }
    user={user}
    showToast={showToast}
  />
)}

      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ width: 260 }}><span className="search-icon">🔍</span><input placeholder="Rechercher un salarié..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="form-control" style={{ width: 150 }} value={filterService} onChange={e => setFilterService(e.target.value)}><option value="">Tous services</option>{SERVICES.map(s => <option key={s}>{s}</option>)}</select>
        <select className="form-control" style={{ width: 170 }} value={filterAptitude} onChange={e => setFilterAptitude(e.target.value)}><option value="">Toutes aptitudes</option>{APTITUDE_STATUS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary" onClick={handleExportCSV}>📥 Export CSV</button>
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>📤 Import CSV</button>
        <input type="file" accept=".csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleImportCSV} />
        {user.role !== "infirmiere" && <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Nouveau salarié</button>}
      </div>
      <div className="card">
        <div className="table-wrapper"><table><thead><tr><th>Salarié</th><th>Matricule</th><th>Poste</th><th>Service</th><th>Aptitude</th><th>Prochaine visite</th><th></th></tr></thead><tbody>
          {filtered.map(e => (
            <tr key={e.id} style={{ cursor: "pointer" }} onClick={() => { setSelected(e.id); setTab("profil"); }}>
              <td style={{ fontWeight: 500 }}>{e.prenom} {e.nom}</td><td style={{ color: "var(--text-secondary)" }}>{e.matricule}</td><td>{e.poste}</td><td>{e.service}</td><td><Badge status={e.aptitude} /></td><td>{e.prochaineVisite ? new Date(e.prochaineVisite).toLocaleDateString("fr-FR") : "—"}</td>
              <td>{user.role !== "infirmiere" && <button className="btn btn-sm btn-secondary" onClick={ev => { ev.stopPropagation(); setEditing(e); setShowForm(true); }}>✎</button>}</td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucun salarié trouvé</td></tr>}
        </tbody></table></div>
      </div>
      {showForm && <EmployeeFormModal employee={editing || blank} onSave={handleSave} onDelete={editing ? () => handleDelete(editing.id) : null} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function EmployeeFormModal({ employee, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...employee });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleRisk = (r) => set("risques", form.risques.includes(r) ? form.risques.filter(x => x !== r) : [...form.risques, r]);
  return (
    <Modal title={employee.id ? "Modifier le salarié" : "Nouveau salarié"} onClose={onClose} footer={<>
      {onDelete && <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: "auto" }}>Supprimer</button>}
      <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
      <button className="btn btn-primary" onClick={() => onSave(form)}>Enregistrer</button>
    </>}>
      <div className="form-grid">
        {[["Nom *", "nom", "text"], ["Prénom *", "prenom", "text"], ["Matricule", "matricule", "text"], ["Date de naissance", "dateNaissance", "date"], ["Poste", "poste", "text"]].map(([l, k, t]) => (
          <div key={k} className="form-group"><label>{l}</label><input type={t} className="form-control" value={form[k]} onChange={e => set(k, e.target.value)} /></div>
        ))}
        <div className="form-group"><label>Service</label><select className="form-control" value={form.service} onChange={e => set("service", e.target.value)}>{SERVICES.map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="form-group"><label>Date d'embauche</label><input type="date" className="form-control" value={form.dateEmbauche} onChange={e => set("dateEmbauche", e.target.value)} /></div>
        <div className="form-group"><label>Aptitude</label><select className="form-control" value={form.aptitude} onChange={e => set("aptitude", e.target.value)}>{APTITUDE_STATUS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
        <div className="form-group"><label>Dernière visite</label><input type="date" className="form-control" value={form.derniereVisite} onChange={e => set("derniereVisite", e.target.value)} /></div>
        <div className="form-group"><label>Prochaine visite</label><input type="date" className="form-control" value={form.prochaineVisite} onChange={e => set("prochaineVisite", e.target.value)} /></div>
        <div className="form-group full"><label>Risques professionnels</label><div className="checkbox-group">{RISQUES.map(r => <span key={r} className={`checkbox-chip ${form.risques.includes(r) ? "selected" : ""}`} onClick={() => toggleRisk(r)}>{r}</span>)}</div></div>
        <div className="form-group full"><label>Notes</label><textarea className="form-control" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Observations, restrictions..." /></div>
      </div>
    </Modal>
  );
}

// ============================================================
// Visits Page
// ============================================================
function VisitsPage({ employees, visits, setVisits, user, showToast }) {
  const [tab, setTab] = useState("planifiee");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtered = visits.filter(v => tab === "all" || v.statut === tab).sort((a, b) => tab === "realisee" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  const blank = { employeeId: employees[0]?.id || 0, type: "periodique", date: "", heure: "09:00", medecin: "Dr. Laurent Moreau", statut: "planifiee", conclusion: "", aptitude: "en_attente" };
  const handleSave = (v) => {
    if (editing) setVisits(visits.map(x => x.id === editing.id ? { ...v, id: editing.id } : x));
    else setVisits([...visits, { ...v, id: Date.now() }]);
    setShowForm(false); setEditing(null); showToast("Visite enregistrée", "success");
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[{ v: "planifiee", l: "Planifiées" }, { v: "realisee", l: "Réalisées" }, { v: "all", l: "Toutes" }].map(t => <button key={t.v} className={`tab ${tab === t.v ? "active" : ""}`} onClick={() => setTab(t.v)}>{t.l}</button>)}
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Nouvelle visite</button>
      </div>
      <div className="card"><div className="table-wrapper"><table><thead><tr><th>Date</th><th>Heure</th><th>Salarié</th><th>Type</th><th>Médecin</th><th>Statut</th><th>Aptitude</th><th></th></tr></thead><tbody>
        {filtered.map(v => { const emp = employees.find(e => e.id === v.employeeId); return (
          <tr key={v.id}><td>{new Date(v.date).toLocaleDateString("fr-FR")}</td><td>{v.heure}</td><td style={{ fontWeight: 500 }}>{emp ? `${emp.prenom} ${emp.nom}` : "—"}</td><td><Badge status={v.type} type="visit" /></td><td>{v.medecin}</td><td><Badge status={v.statut} type="statut" /></td><td><Badge status={v.aptitude} /></td><td><button className="btn btn-sm btn-secondary" onClick={() => { setEditing(v); setShowForm(true); }}>✎</button></td></tr>
        ); })}
        {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucune visite</td></tr>}
      </tbody></table></div></div>
      {showForm && <VisitFormModal visit={editing || blank} employees={employees} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} user={user} />}
    </div>
  );
}

function VisitFormModal({ visit, employees, onSave, onClose, user }) {
  const [form, setForm] = useState({ ...visit });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canEditMedical = user.role === "medecin";
  return (
    <Modal title={visit.id ? "Modifier la visite" : "Planifier une visite"} onClose={onClose} footer={<>
      <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
      <button className="btn btn-primary" onClick={() => onSave(form)}>Enregistrer</button>
    </>}>
      <div className="form-grid">
        <div className="form-group full"><label>Salarié *</label><select className="form-control" value={form.employeeId} onChange={e => set("employeeId", Number(e.target.value))}>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom} ({emp.matricule})</option>)}</select></div>
        <div className="form-group"><label>Type</label><select className="form-control" value={form.type} onChange={e => set("type", e.target.value)}>{VISIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        <div className="form-group"><label>Statut</label><select className="form-control" value={form.statut} onChange={e => set("statut", e.target.value)}><option value="planifiee">Planifiée</option><option value="realisee">Réalisée</option><option value="annulee">Annulée</option></select></div>
        <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.date} onChange={e => set("date", e.target.value)} /></div>
        <div className="form-group"><label>Heure</label><input type="time" className="form-control" value={form.heure} onChange={e => set("heure", e.target.value)} /></div>
        <div className="form-group full"><label>Médecin</label><input className="form-control" value={form.medecin} onChange={e => set("medecin", e.target.value)} /></div>
        {canEditMedical ? (<>
          <div className="form-group full"><label>Conclusion médicale 🔒</label><textarea className="form-control" value={form.conclusion} onChange={e => set("conclusion", e.target.value)} /></div>
          <div className="form-group full"><label>Aptitude</label><select className="form-control" value={form.aptitude} onChange={e => set("aptitude", e.target.value)}>{APTITUDE_STATUS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
        </>) : <div className="form-group full"><p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>🔒 Conclusions médicales réservées au médecin.</p></div>}
      </div>
    </Modal>
  );
}

// ============================================================
// Calendar Page
// ============================================================
function CalendarPage({ employees, visits, setPage }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().slice(0, 10);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, current: true });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ day: i, current: false });

  const getEventsForDay = (day, isCurrent) => {
    if (!isCurrent) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return visits.filter(v => v.date === dateStr).map(v => {
      const emp = employees.find(e => e.id === v.employeeId);
      const vt = VISIT_TYPES.find(t => t.value === v.type);
      return { ...v, empName: emp ? `${emp.prenom} ${emp.nom}` : "—", color: vt?.color || "#6b7280" };
    });
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3>{monthNames[month]} {year}</h3>
        <div className="calendar-nav">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
          <button onClick={() => setCurrentDate(new Date())} style={{ fontSize: 12, width: "auto", padding: "0 10px" }}>Aujourd'hui</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
        </div>
      </div>
      <div className="calendar-grid">
        {dayNames.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
        {days.map((d, i) => {
          const dateStr = d.current ? `${year}-${String(month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` : "";
          const isToday = dateStr === today;
          const events = getEventsForDay(d.day, d.current);
          return (
            <div key={i} className={`calendar-day ${!d.current ? "other-month" : ""} ${isToday ? "today" : ""}`}>
              <div className="day-num">{isToday ? <span>{d.day}</span> : d.day}</div>
              {events.slice(0, 3).map(ev => (
                <div key={ev.id} className="day-event" style={{ background: ev.color + "20", color: ev.color }} title={`${ev.heure} - ${ev.empName}`}>
                  {ev.heure} {ev.empName}
                </div>
              ))}
              {events.length > 3 && <div className="day-more">+{events.length - 3} autre(s)</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Accidents / Maladies Pro Page
// ============================================================
function AccidentsPage({ employees, accidents, setAccidents, showToast }) {
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtered = accidents.filter(a => tab === "all" || a.type === tab).sort((a, b) => b.date.localeCompare(a.date));
  const blank = { employeeId: employees[0]?.id || 0, type: "at", date: "", description: "", gravite: "leger", arretJours: 0, lieu: "", cause: "", mesures: "", statut: "en_cours", dateReprise: "" };
  const handleSave = (a) => {
    if (editing) setAccidents(accidents.map(x => x.id === editing.id ? { ...a, id: editing.id } : x));
    else setAccidents([...accidents, { ...a, id: Date.now() }]);
    setShowForm(false); setEditing(null); showToast("Enregistrement sauvegardé", "success");
  };
  const handleDelete = (id) => { if (confirm("Supprimer cet enregistrement ?")) { setAccidents(accidents.filter(a => a.id !== id)); showToast("Supprimé", "success"); } };
  const totalArret = accidents.reduce((s, a) => s + (a.arretJours || 0), 0);

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-label">Accidents du travail</div><div className="stat-value" style={{ color: "var(--danger)" }}>{accidents.filter(a => a.type === "at").length}</div></div>
        <div className="stat-card"><div className="stat-label">Maladies professionnelles</div><div className="stat-value" style={{ color: "var(--warning)" }}>{accidents.filter(a => a.type === "mp").length}</div></div>
        <div className="stat-card"><div className="stat-label">Jours d'arrêt total</div><div className="stat-value" style={{ color: "#7c3aed" }}>{totalArret}</div></div>
        <div className="stat-card"><div className="stat-label">En cours</div><div className="stat-value" style={{ color: "var(--accent)" }}>{accidents.filter(a => a.statut === "en_cours").length}</div></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[{ v: "all", l: "Tous" }, { v: "at", l: "Accidents du travail" }, { v: "mp", l: "Maladies pro." }].map(t => <button key={t.v} className={`tab ${tab === t.v ? "active" : ""}`} onClick={() => setTab(t.v)}>{t.l}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => { exportCSV(accidents.map(a => { const emp = employees.find(e => e.id === a.employeeId); return { ...a, salarie: emp ? `${emp.prenom} ${emp.nom}` : "—" }; }), `at_mp_export_${new Date().toISOString().slice(0, 10)}.csv`); showToast("Export CSV réussi", "success"); }}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Nouveau</button>
        </div>
      </div>
      <div className="card"><div className="table-wrapper"><table><thead><tr><th>Date</th><th>Type</th><th>Salarié</th><th>Description</th><th>Gravité</th><th>Arrêt (j)</th><th>Statut</th><th></th></tr></thead><tbody>
        {filtered.map(a => { const emp = employees.find(e => e.id === a.employeeId); return (
          <tr key={a.id}>
            <td>{new Date(a.date).toLocaleDateString("fr-FR")}</td>
            <td><span className="badge" style={{ background: a.type === "at" ? "var(--danger-light)" : "var(--warning-light)", color: a.type === "at" ? "var(--danger)" : "var(--warning)" }}>{a.type === "at" ? "AT" : "MP"}</span></td>
            <td style={{ fontWeight: 500 }}>{emp ? `${emp.prenom} ${emp.nom}` : "—"}</td>
            <td style={{ maxWidth: 250, whiteSpace: "normal" }}>{a.description}</td>
            <td><Badge status={a.gravite} type="gravity" /></td>
            <td>{a.arretJours}</td>
            <td><span className="badge" style={{ background: a.statut === "en_cours" ? "#dbeafe" : "#dcfce7", color: a.statut === "en_cours" ? "#2563eb" : "#16a34a" }}>{a.statut === "en_cours" ? "En cours" : "Clos"}</span></td>
            <td><button className="btn btn-sm btn-secondary" onClick={() => { setEditing(a); setShowForm(true); }}>✎</button></td>
          </tr>
        ); })}
        {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucun enregistrement</td></tr>}
      </tbody></table></div></div>
      {showForm && <AccidentFormModal accident={editing || blank} employees={employees} onSave={handleSave} onDelete={editing ? () => handleDelete(editing.id) : null} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function AccidentFormModal({ accident, employees, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...accident });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal title={accident.id ? "Modifier" : "Nouvel enregistrement AT/MP"} onClose={onClose} wide footer={<>
      {onDelete && <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: "auto" }}>Supprimer</button>}
      <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
      <button className="btn btn-primary" onClick={() => onSave(form)}>Enregistrer</button>
    </>}>
      <div className="form-grid">
        <div className="form-group"><label>Salarié *</label><select className="form-control" value={form.employeeId} onChange={e => set("employeeId", Number(e.target.value))}>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}</select></div>
        <div className="form-group"><label>Type</label><select className="form-control" value={form.type} onChange={e => set("type", e.target.value)}><option value="at">Accident du travail</option><option value="mp">Maladie professionnelle</option></select></div>
        <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.date} onChange={e => set("date", e.target.value)} /></div>
        <div className="form-group"><label>Gravité</label><select className="form-control" value={form.gravite} onChange={e => set("gravite", e.target.value)}>{AT_GRAVITY.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
        <div className="form-group full"><label>Description *</label><textarea className="form-control" value={form.description} onChange={e => set("description", e.target.value)} /></div>
        <div className="form-group"><label>Lieu</label><input className="form-control" value={form.lieu} onChange={e => set("lieu", e.target.value)} /></div>
        <div className="form-group"><label>Cause identifiée</label><input className="form-control" value={form.cause} onChange={e => set("cause", e.target.value)} /></div>
        <div className="form-group"><label>Jours d'arrêt</label><input type="number" className="form-control" value={form.arretJours} onChange={e => set("arretJours", parseInt(e.target.value) || 0)} /></div>
        <div className="form-group"><label>Statut</label><select className="form-control" value={form.statut} onChange={e => set("statut", e.target.value)}><option value="en_cours">En cours</option><option value="clos">Clos</option></select></div>
        <div className="form-group full"><label>Mesures correctives</label><textarea className="form-control" value={form.mesures} onChange={e => set("mesures", e.target.value)} /></div>
        <div className="form-group"><label>Date de reprise</label><input type="date" className="form-control" value={form.dateReprise} onChange={e => set("dateReprise", e.target.value)} /></div>
      </div>
    </Modal>
  );
}

// ============================================================
// Campaigns Page
// ============================================================
function CampaignsPage({ campaigns, setCampaigns, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = { nom: "", type: "vaccination", dateDebut: "", dateFin: "", statut: "planifiee", description: "", cible: "", participants: 0, objectif: 50, responsable: "" };
  const handleSave = (c) => {
    if (editing) setCampaigns(campaigns.map(x => x.id === editing.id ? { ...c, id: editing.id } : x));
    else setCampaigns([...campaigns, { ...c, id: Date.now() }]);
    setShowForm(false); setEditing(null); showToast("Campagne enregistrée", "success");
  };
  const handleDelete = (id) => { if (confirm("Supprimer cette campagne ?")) { setCampaigns(campaigns.filter(c => c.id !== id)); showToast("Campagne supprimée", "success"); } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Nouvelle campagne</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {campaigns.map(c => {
          const pct = c.objectif > 0 ? Math.round((c.participants / c.objectif) * 100) : 0;
          return (
            <div key={c.id} className="card" style={{ cursor: "pointer" }} onClick={() => { setEditing(c); setShowForm(true); }}>
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{c.nom}</h3>
                    <span className="badge" style={{ background: "#f1f5f9", color: "#475569" }}>{c.type}</span>
                  </div>
                  <Badge status={c.statut} type="campaign" />
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>{c.description}</p>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  📅 {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString("fr-FR") : "?"} → {c.dateFin ? new Date(c.dateFin).toLocaleDateString("fr-FR") : "?"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>🎯 Cible : {c.cible || "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>👤 Responsable : {c.responsable || "—"}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>Participation</span><span style={{ fontWeight: 600 }}>{c.participants}/{c.objectif} ({pct}%)</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)" }} /></div>
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && <div className="empty-state" style={{ gridColumn: "1 / -1" }}><div className="empty-state-icon">📢</div><p>Aucune campagne de prévention</p></div>}
      </div>
      {showForm && <CampaignFormModal campaign={editing || blank} onSave={handleSave} onDelete={editing ? () => handleDelete(editing.id) : null} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function CampaignFormModal({ campaign, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...campaign });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal title={campaign.id ? "Modifier la campagne" : "Nouvelle campagne"} onClose={onClose} footer={<>
      {onDelete && <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: "auto" }}>Supprimer</button>}
      <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
      <button className="btn btn-primary" onClick={() => onSave(form)}>Enregistrer</button>
    </>}>
      <div className="form-grid">
        <div className="form-group full"><label>Nom de la campagne *</label><input className="form-control" value={form.nom} onChange={e => set("nom", e.target.value)} /></div>
        <div className="form-group"><label>Type</label><select className="form-control" value={form.type} onChange={e => set("type", e.target.value)}><option value="vaccination">Vaccination</option><option value="depistage">Dépistage</option><option value="formation">Formation</option><option value="sensibilisation">Sensibilisation</option><option value="autre">Autre</option></select></div>
        <div className="form-group"><label>Statut</label><select className="form-control" value={form.statut} onChange={e => set("statut", e.target.value)}>{CAMPAIGN_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
        <div className="form-group"><label>Date de début</label><input type="date" className="form-control" value={form.dateDebut} onChange={e => set("dateDebut", e.target.value)} /></div>
        <div className="form-group"><label>Date de fin</label><input type="date" className="form-control" value={form.dateFin} onChange={e => set("dateFin", e.target.value)} /></div>
        <div className="form-group full"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => set("description", e.target.value)} /></div>
        <div className="form-group"><label>Population cible</label><input className="form-control" value={form.cible} onChange={e => set("cible", e.target.value)} /></div>
        <div className="form-group"><label>Responsable</label><input className="form-control" value={form.responsable} onChange={e => set("responsable", e.target.value)} /></div>
        <div className="form-group"><label>Participants</label><input type="number" className="form-control" value={form.participants} onChange={e => set("participants", parseInt(e.target.value) || 0)} /></div>
        <div className="form-group"><label>Objectif</label><input type="number" className="form-control" value={form.objectif} onChange={e => set("objectif", parseInt(e.target.value) || 0)} /></div>
      </div>
    </Modal>
  );
}

// ============================================================
// Stats Page
// ============================================================
function StatsPage({ employees, visits, accidents }) {
  const byService = {}; employees.forEach(e => { byService[e.service] = (byService[e.service] || 0) + 1; });
  const byRisk = {}; employees.forEach(e => e.risques.forEach(r => { byRisk[r] = (byRisk[r] || 0) + 1; }));
  const byType = {}; visits.forEach(v => { byType[v.type] = (byType[v.type] || 0) + 1; });
  const maxRisk = Math.max(...Object.values(byRisk), 1);
  const maxService = Math.max(...Object.values(byService), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3>Effectif par service</h3></div>
          <div className="card-body">{Object.entries(byService).sort((a, b) => b[1] - a[1]).map(([s, c]) => (
            <div key={s} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{s}</span><span style={{ fontWeight: 600 }}>{c}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(c / maxService) * 100}%`, background: "var(--primary)" }} /></div></div>
          ))}</div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Exposition aux risques</h3></div>
          <div className="card-body">{Object.entries(byRisk).sort((a, b) => b[1] - a[1]).map(([r, c]) => (
            <div key={r} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{r}</span><span style={{ fontWeight: 600 }}>{c}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(c / maxRisk) * 100}%`, background: "var(--warning)" }} /></div></div>
          ))}</div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Visites par type</h3></div>
          <div className="card-body"><div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {VISIT_TYPES.map(vt => { const count = byType[vt.value] || 0; return (
              <div key={vt.value} style={{ textAlign: "center", flex: "1 1 100px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: vt.color + "18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}><span style={{ fontSize: 22, fontWeight: 700, color: vt.color }}>{count}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{vt.label}</div></div>
            ); })}
          </div></div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Aptitudes</h3></div>
          <div className="card-body"><div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {APTITUDE_STATUS.map(a => { const count = employees.filter(e => e.aptitude === a.value).length; return (
              <div key={a.value} style={{ textAlign: "center", flex: "1 1 100px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}><span style={{ fontSize: 22, fontWeight: 700, color: a.color }}>{count}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.label}</div></div>
            ); })}
          </div></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Notifications Page
// ============================================================
function NotificationsPage({ notifications, setNotifications }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>Tout marquer comme lu</button>
      </div>
      <div className="card"><div className="card-body"><div className="notif-list">
        {notifications.length === 0 ? <div className="empty-state"><div className="empty-state-icon">🔔</div><p>Aucune notification</p></div> :
          notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
              <div className="notif-dot" style={{ background: n.type === "urgent" ? "var(--danger)" : n.type === "warning" ? "var(--warning)" : "var(--primary)" }} />
              <div className="notif-content"><div className="notif-message">{n.message}</div><div className="notif-date">{new Date(n.date).toLocaleDateString("fr-FR")}</div></div>
              <button className="btn-icon" style={{ flexShrink: 0 }} onClick={() => setNotifications(notifications.filter(x => x.id !== n.id))} title="Supprimer">×</button>
            </div>
          ))
        }
      </div></div></div>
    </div>
  );
}

// ============================================================
// Reports Page (PDF export)
// ============================================================
function ReportsPage({ employees, visits, accidents, campaigns, showToast }) {
  const [year, setYear] = useState(2026);
  const [previewHtml, setPreviewHtml] = useState(null);

  const handleGenerate = () => {
    const html = generateAnnualReport(employees, visits, accidents, campaigns, year);
    setPreviewHtml(html);
  };

  const handleDownload = () => {
    if (!previewHtml) return;
    const w = window.open("", "_blank");
    w.document.write(previewHtml);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
    showToast("Rapport ouvert — utilisez Imprimer > PDF", "success");
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Année du rapport</label>
              <select className="form-control" style={{ width: 120 }} value={year} onChange={e => { setYear(Number(e.target.value)); setPreviewHtml(null); }}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleGenerate} style={{ marginTop: 16 }}>📊 Générer le rapport</button>
            {previewHtml && <button className="btn btn-success" onClick={handleDownload} style={{ marginTop: 16 }}>📄 Exporter en PDF</button>}
          </div>
        </div>
      </div>
      {previewHtml && (
        <div className="card">
          <div className="card-header"><h3>Aperçu du rapport annuel {year}</h3></div>
          <div style={{ padding: 24 }}>
            <iframe srcDoc={previewHtml} style={{ width: "100%", height: 700, border: "1px solid var(--border)", borderRadius: "var(--radius)" }} title="Rapport" />
          </div>
        </div>
      )}
      {!previewHtml && (
        <div className="card"><div className="card-body"><div className="empty-state"><div className="empty-state-icon">📄</div><p>Sélectionnez une année et générez le rapport annuel</p><p style={{ fontSize: 12, marginTop: 4 }}>Le rapport inclut : effectif, visites, aptitudes, AT/MP, risques, campagnes</p></div></div></div>
      )}
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
const NAV_ITEMS = [
  { section: "Général" },
  { id: "dashboard", label: "Tableau de bord", icon: "📊" },
  { id: "calendar", label: "Calendrier", icon: "📅" },
  { id: "notifications", label: "Notifications", icon: "🔔", showBadge: true },
  { section: "Gestion" },
  { id: "employees", label: "Salariés", icon: "👥" },
  { id: "visits", label: "Visites médicales", icon: "🩺" },
  { id: "accidents", label: "Registre AT / MP", icon: "⚠️" },
  { id: "campaigns", label: "Prévention", icon: "📢" },
  { section: "Analyses" },
  { id: "stats", label: "Statistiques", icon: "📈" },
  { id: "reports", label: "Rapports PDF", icon: "📄" },
];

const PAGE_TITLES = {
  dashboard: "Tableau de bord", calendar: "Calendrier des visites", employees: "Gestion des salariés",
  visits: "Visites médicales", stats: "Statistiques", notifications: "Notifications",
  accidents: "Registre AT / Maladies professionnelles", campaigns: "Campagnes de prévention", reports: "Rapports annuels",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [employees, setEmployees] = useState(defaultEmployees);
  const [visits, setVisits] = useState(defaultVisits);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [accidents, setAccidents] = useState(defaultAccidents);
  const [campaigns, setCampaigns] = useState(defaultCampaigns);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => setToast({ message, type, key: Date.now() }), []);

  useEffect(() => {
    (async () => {
      const [e, v, n, a, c] = await Promise.all([
        loadData("ms2-employees", null), loadData("ms2-visits", null),
        loadData("ms2-notifications", null), loadData("ms2-accidents", null), loadData("ms2-campaigns", null),
      ]);
      if (e) setEmployees(e); if (v) setVisits(v); if (n) setNotifications(n);
      if (a) setAccidents(a); if (c) setCampaigns(c);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) saveData("ms2-employees", employees); }, [employees, loaded]);
  useEffect(() => { if (loaded) saveData("ms2-visits", visits); }, [visits, loaded]);
  useEffect(() => { if (loaded) saveData("ms2-notifications", notifications); }, [notifications, loaded]);
  useEffect(() => { if (loaded) saveData("ms2-accidents", accidents); }, [accidents, loaded]);
  useEffect(() => { if (loaded) saveData("ms2-campaigns", campaigns); }, [campaigns, loaded]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavigate = useCallback((p, empId) => {
    setPage(p);
    // If navigating to employees with an id, we'd need to pass it — simplified here
  }, []);

  if (!user) return (<><style>{CSS}</style><LoginScreen onLogin={setUser} /></>);

  return (
    <><style>{CSS}</style>
      <div className="app">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand"><h1>MédSanté Pro <span>v2</span></h1><p>Médecine du Travail</p></div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item, i) => item.section ? <div key={i} className="sidebar-section-title">{item.section}</div> : (
              <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                <span className="nav-icon">{item.icon}</span>{item.label}
                {item.showBadge && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" style={{ background: ROLES[user.role].color + "25", color: ROLES[user.role].color }}>{ROLES[user.role].icon}</div>
            <div className="sidebar-user-info"><div className="sidebar-user-name">{user.name}</div><div className="sidebar-user-role">{ROLES[user.role].label}</div></div>
            <button className="logout-btn" onClick={() => setUser(null)} title="Déconnexion">⏻</button>
          </div>
        </aside>
        <main className="main">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2>{PAGE_TITLES[page]}</h2>
            </div>
            <div className="topbar-actions">
              <GlobalSearch employees={employees} visits={visits} accidents={accidents} campaigns={campaigns} onNavigate={handleNavigate} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
          <div className="content">
            {page === "dashboard" && <DashboardPage employees={employees} visits={visits} notifications={notifications} accidents={accidents} />}
            {page === "calendar" && <CalendarPage employees={employees} visits={visits} setPage={setPage} />}
            {page === "employees" && <EmployeesPage employees={employees} visits={visits} setEmployees={setEmployees} user={user} showToast={showToast} />}
            {page === "visits" && <VisitsPage employees={employees} visits={visits} setVisits={setVisits} user={user} showToast={showToast} />}
            {page === "accidents" && <AccidentsPage employees={employees} accidents={accidents} setAccidents={setAccidents} showToast={showToast} />}
            {page === "campaigns" && <CampaignsPage campaigns={campaigns} setCampaigns={setCampaigns} showToast={showToast} />}
            {page === "stats" && <StatsPage employees={employees} visits={visits} accidents={accidents} />}
            {page === "reports" && <ReportsPage employees={employees} visits={visits} accidents={accidents} campaigns={campaigns} showToast={showToast} />}
            {page === "notifications" && <NotificationsPage notifications={notifications} setNotifications={setNotifications} />}
          </div>
        </main>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} key={toast.key} />}
    </>
  );
}