// AUTO-GENERATED from the Claude Design handoff bundle:
//   mobile-health-app-design-v2/project/PeptideTracker Web - Compounds copy.dc.html
// The literals below are copied verbatim from the design so the content never drifts.
// Edit the design and re-derive, or edit here directly — but keep the two in step.

export type Grade = "rct" | "animal" | "anec";
export type BulletKind = "ok" | "wt" | "bad";
export type Bullet = [BulletKind, string];

/** [label, icon, blurb] */
export type Goal = [string, string, string];

/** [name, alias, category, description, goals, grade, hasFullProfile] */
export type CompoundRow = [string, string, string, string, string[], Grade, 0 | 1];

export type CompoundGuide = {
  what: string;
  how: string;
  research: string;
  dosage: string;
  safety: Bullet[];
  faq: [string, string][];
  refs: string[];
};

export type GuideEntry = {
  id: string;
  tag: string;
  title: string;
  dek: string;
  time: string;
  ready: 0 | 1;
  sections?: [string, string][];
};

export const GOALS: Goal[] = [
      ["Sleep", "moon", "Deeper, more restorative sleep"],
      ["Weight loss", "pulse", "Appetite & fat metabolism"],
      ["Muscle growth", "chart", "Lean mass & strength"],
      ["Recovery", "shield", "Tissue repair & injury"],
      ["Longevity", "hourglass", "Healthspan & aging"],
      ["Cognitive", "target", "Focus, memory & mood"],
      ["Skin & hair", "droplet", "Collagen, skin & hair"],
      ["Libido", "heart", "Arousal & sexual function"],
      ["Immune", "lotus", "Immune modulation"],
      ["Energy", "sun", "Cellular energy & endurance"]
    ];

export const DB: CompoundRow[] = [
      ["BPC-157", "Body Protection Compound", "Tissue repair", "Strong tendon- and gut-healing results in rodents. No adequately powered human trial has been published.", ["Recovery"], "animal", 1],
      ["TB-500", "Thymosin Beta-4 fragment", "Tissue repair", "Synthetic fragment of Tβ4, logged for whole-body recovery rather than a single injury site.", ["Recovery", "Muscle growth"], "animal", 1],
      ["Thymosin Beta-4", "Full-length Tβ4", "Tissue repair", "The parent molecule behind TB-500, with more actual human exposure — mostly eye and cardiac research.", ["Recovery"], "rct", 1],
      ["KPV", "α-MSH fragment", "Tissue repair", "Small anti-inflammatory fragment studied almost entirely in gut-inflammation animal models.", ["Recovery"], "animal", 1],
      ["LL-37", "Cathelicidin", "Immune & defense", "An antimicrobial peptide the body already makes, trialed clinically for chronic wounds.", ["Immune", "Recovery"], "rct", 1],
      ["GLP-1 (S)", "Weekly GLP-1 agonist", "Metabolic & GLP-1", "The mainstream weekly injectable, with deep RCT coverage for weight and glycemic control.", ["Weight loss", "Energy"], "rct", 1],
      ["GLP-1/GIP (T)", "Dual agonist, weekly", "Metabolic & GLP-1", "Dual-incretin agonist outperforming single GLP-1s in head-to-head weight trials.", ["Weight loss", "Energy"], "rct", 1],
      ["Retatrutide", "Triple agonist, in trials", "Metabolic & GLP-1", "The most-watched next-generation candidate. Striking early numbers; not yet approved.", ["Weight loss", "Energy"], "rct", 1],
      ["Cagrilintide", "Amylin analogue", "Metabolic & GLP-1", "Amylin-pathway satiety signal, trialed alongside weekly GLP-1s for combined effect.", ["Weight loss"], "rct", 1],
      ["Survodutide", "GLP-1/glucagon dual agonist", "Metabolic & GLP-1", "Late-stage dual agonist adding glucagon-driven energy burn to GLP-1 satiety.", ["Weight loss"], "rct", 1],
      ["Tesofensine", "Triple monoamine reuptake inhibitor", "Metabolic & GLP-1", "Non-peptide appetite drug with real phase-2 weight-loss data — and a stimulant side-effect profile to match.", ["Weight loss"], "rct", 1],
      ["5-Amino-1MQ", "NNMT inhibitor, small molecule", "Metabolic & GLP-1", "Oral NNMT inhibitor with intriguing fat-loss results in mice. Published human evidence: none.", ["Weight loss", "Energy"], "animal", 1],
      ["AOD-9604", "GH fragment", "Metabolic & GLP-1", "Marketed hard for fat loss — its own clinical trials showed little separation from placebo.", ["Weight loss"], "animal", 1],
      ["Ipamorelin", "GH releasing peptide", "Endocrine & GH", "The gentlest of the GHRP class in published comparisons. Commonly paired with CJC-1295.", ["Muscle growth", "Longevity", "Sleep"], "rct", 1],
      ["MK-677", "Ibutamoren — oral GH secretagogue", "Endocrine & GH", "Not a peptide: an oral small molecule with real human trials — GH and slow-wave sleep rise, so do appetite and glucose.", ["Sleep", "Muscle growth"], "rct", 1],
      ["CJC-1295", "GHRH analogue", "Endocrine & GH", "Comes in DAC and no-DAC forms — the choice materially changes the exposure profile.", ["Muscle growth", "Longevity"], "rct", 1],
      ["Sermorelin", "GHRH analogue", "Endocrine & GH", "Formerly FDA-approved, now prescribed off-label at longevity clinics. The clinical anchor of its class.", ["Muscle growth", "Longevity", "Sleep"], "rct", 1],
      ["Tesamorelin", "GHRH analogue", "Endocrine & GH", "FDA-approved for visceral fat in HIV lipodystrophy; used off-label for body composition.", ["Muscle growth", "Longevity"], "rct", 1],
      ["GHRP-2", "GH releasing peptide", "Endocrine & GH", "Older, stronger GHRP with human study history — more GH per dose than ipamorelin, more cortisol and hunger too.", ["Muscle growth", "Sleep"], "rct", 1],
      ["GHRP-6", "GH releasing peptide", "Endocrine & GH", "The hunger-heavy GHRP — famous for the appetite surge its ghrelin signal produces.", ["Muscle growth"], "rct", 1],
      ["Hexarelin", "Potent GHRP", "Endocrine & GH", "Strongest classic GHRP per dose, fastest receptor desensitization — a real ceiling on continuous use.", ["Muscle growth"], "animal", 0],
      ["IGF-1 LR3", "Long-arginine IGF-1 analogue", "Muscle & performance", "Extended-half-life IGF-1 built for cell culture, adopted by bodybuilding. Potent, unforgiving, untested in humans.", ["Muscle growth"], "animal", 1],
      ["GHK-Cu", "Copper tripeptide", "Skin & cosmetic", "Copper-binding tripeptide with legitimate topical clinical data from the cosmetics literature.", ["Skin & hair", "Recovery"], "rct", 1],
      ["Matrixyl", "Palmitoyl pentapeptide-4", "Skin & cosmetic", "Common, well-tolerated signal peptide already shipping in mainstream skincare.", ["Skin & hair"], "rct", 1],
      ["Melanotan II", "Melanocortin agonist", "Skin & cosmetic", "Unapproved tanning peptide carrying a real mole- and skin-monitoring caveat.", ["Skin & hair", "Libido"], "anec", 1],
      ["Argireline", "Acetyl hexapeptide-8, topical", "Skin & cosmetic", "Topical ‘Botox-like’ hexapeptide with small controlled studies on expression lines. Modest, real, cosmetic.", ["Skin & hair"], "rct", 1],
      ["Snap-8", "Acetyl octapeptide-3, topical", "Skin & cosmetic", "Argireline’s longer sibling, targeting the same expression-wrinkle pathway with mostly vendor-run data.", ["Skin & hair"], "anec", 0],
      ["PTD-DBM", "Wnt/β-catenin hair peptide", "Skin & cosmetic", "Topical hair-regrowth candidate from Wnt-pathway research — mouse and ex-vivo data only.", ["Skin & hair"], "animal", 0],
      ["Zinc-Thymulin", "Zinc-bound nonapeptide, topical", "Skin & cosmetic", "Thymic peptide complex explored topically for hair anagen support in one small trial program.", ["Skin & hair"], "anec", 0],
      ["Epithalon", "Telomerase research peptide", "Cellular & longevity", "Elderly-cohort human data exists — from one Russian program that hasn't been widely replicated.", ["Longevity", "Sleep"], "anec", 1],
      ["MOTS-c", "Mitochondrial peptide", "Cellular & longevity", "Mitochondria-encoded ‘exercise mimetic’ with strong bench interest and thin human data.", ["Longevity", "Energy", "Weight loss"], "animal", 1],
      ["SS-31", "Mitochondrial peptide", "Cellular & longevity", "Mitochondria-targeted candidate with genuine clinical-trial history in rare disease and heart failure.", ["Longevity", "Energy"], "rct", 1],
      ["Semax", "Nootropic peptide", "Neural & cognitive", "Decades of clinical use in Russia for stroke recovery; no Western regulatory approval.", ["Cognitive", "Recovery"], "anec", 1],
      ["Selank", "Anxiolytic peptide", "Neural & cognitive", "Anxiety-focused cousin of Semax — approved in Russia, untested in Western RCTs.", ["Cognitive"], "anec", 1],
      ["Cerebrolysin", "Porcine peptide mixture", "Neural & cognitive", "Injectable peptide mixture with decades of stroke and dementia trials across Europe and Asia — respectable but heterogeneous results.", ["Cognitive", "Recovery"], "rct", 1],
      ["Noopept", "Dipeptide nootropic, oral", "Neural & cognitive", "Oral dipeptide sold as a nootropic across Eastern Europe; small human studies, big forum reputation.", ["Cognitive"], "anec", 1],
      ["P21", "CNTF-derived peptide", "Neural & cognitive", "Neurogenesis candidate derived from CNTF; every headline result so far is rodent.", ["Cognitive"], "animal", 0],
      ["Dihexa", "Synaptogenic peptide", "Neural & cognitive", "Among the most potent synapse-formers in animal work, with essentially zero human safety data.", ["Cognitive"], "animal", 1],
      ["DSIP", "Delta sleep-inducing peptide", "Sleep & stress", "A compelling name on a thin, decades-old evidence base. We say so plainly.", ["Sleep"], "anec", 1],
      ["PT-141", "Bremelanotide", "Sexual health", "FDA-approved for low desire — the one libido peptide with real prescribing data behind it.", ["Libido"], "rct", 1],
      ["Kisspeptin-10", "Reproductive cascade", "Sexual health", "Sits at the very top of the reproductive hormone cascade. Well studied, poorly mapped for self-use.", ["Libido"], "rct", 1],
      ["Gonadorelin", "GnRH", "Sexual health", "Native GnRH — clinical fertility tool, also run alongside TRT to keep the natural axis signalling.", ["Libido"], "rct", 1],
      ["Oxytocin", "Neurohormone", "Sexual health", "A hormone everyone already makes — approved in obstetrics, studied intranasally for bonding.", ["Libido", "Cognitive"], "rct", 1],
      ["Thymosin Alpha-1", "Thymic peptide", "Immune & defense", "Approved abroad for immune support. One of the most clinically validated entries here.", ["Immune"], "rct", 1],
      ["Thymalin", "Thymic peptide", "Immune & defense", "Thymus-derived immune peptide from the Russian longevity literature.", ["Immune", "Longevity"], "anec", 0],
      ["Thymogen", "Glu-Trp dipeptide", "Immune & defense", "Russian-school immune dipeptide with local approvals and little independent Western data.", ["Immune"], "anec", 0],
      ["VIP", "Vasoactive intestinal peptide", "Immune & defense", "Native neuropeptide trialed in inflammatory and pulmonary conditions; nasal use popularized by mold-illness protocols.", ["Immune", "Energy"], "rct", 0],
      ["Humanin", "Mitochondrial-derived peptide", "Cellular & longevity", "Cell-stress protection candidate — almost entirely preclinical so far.", ["Longevity", "Cognitive"], "animal", 0],
      ["Follistatin 344", "Myostatin inhibitor", "Muscle & performance", "The exciting animal data mostly comes from gene-therapy studies, not the injectable form.", ["Muscle growth"], "animal", 0],
      ["FOXO4-DRI", "Senolytic peptide", "Cellular & longevity", "Headline mouse results on aging markers; zero human safety or efficacy data.", ["Longevity"], "animal", 0],
      ["L-Glutathione", "Antioxidant tripeptide", "Cellular & longevity", "Ubiquitous antioxidant tripeptide — oral evidence is weak; claims routinely outrun it.", ["Longevity"], "anec", 0],
      ["Carnosine", "Dipeptide antioxidant", "Cellular & longevity", "Dietary dipeptide with broad preclinical interest and modest human signals.", ["Longevity"], "anec", 0],
      ["NAD+", "Coenzyme infusion/injection", "Cellular & longevity", "Not a peptide — the coenzyme itself, dripped or injected. The biology is central; human benefit data is early and mixed.", ["Longevity", "Energy"], "anec", 1],
      ["Pinealon", "Peptide bioregulator", "Neural & cognitive", "Short bioregulator from the Russian peptide school; Western evidence is minimal.", ["Cognitive"], "anec", 0]
    ];

export const FACTS: Record<string, [string, string, string]> = {
      "Ipamorelin": ["~2 hours", "200–300 mcg", "SubQ"], "Sermorelin": ["~10–20 min", "200–500 mcg", "SubQ"],
      "MK-677": ["~24 hours", "10–25 mg", "Oral"], "Epithalon": ["Short · limited data", "5–10 mg", "SubQ"],
      "DSIP": ["Short · limited data", "100–250 mcg", "SubQ"], "BPC-157": ["Short · limited data", "200–500 mcg", "SubQ · oral"],
      "TB-500": ["Days · limited data", "2–5 mg/week", "SubQ"], "GLP-1 (S)": ["~7 days", "0.25–2.4 mg/week", "SubQ"],
      "GLP-1/GIP (T)": ["~5 days", "2.5–15 mg/week", "SubQ"], "Cagrilintide": ["~8 days", "0.3–4.5 mg/week", "SubQ"],
      "CJC-1295": ["DAC ~8 days · no-DAC ~30 min", "100 mcg – 2 mg", "SubQ"], "Tesamorelin": ["~40 min", "1–2 mg", "SubQ"],
      "GHK-Cu": ["Minutes in serum", "Topical · 1–2 mg SubQ", "Topical · SubQ"], "PT-141": ["~11 hours", "1.75 mg", "SubQ"],
      "Thymosin Alpha-1": ["~2 hours", "1.6 mg", "SubQ"], "Semax": ["Minutes", "200–600 mcg", "Nasal"],
      "Selank": ["Minutes", "250–500 mcg", "Nasal"], "Oxytocin": ["~20 min", "12–24 IU", "Nasal"],
      "GHRP-2": ["~30 min", "100–300 mcg", "SubQ"], "GHRP-6": ["~30 min", "100–300 mcg", "SubQ"],
      "Tesofensine": ["~9 days", "0.25–0.5 mg", "Oral"], "Survodutide": ["~ weekly", "0.6–4.8 mg/week", "SubQ"],
      "5-Amino-1MQ": ["Short", "50–150 mg", "Oral"], "IGF-1 LR3": ["~20–30 hours", "20–50 mcg", "SubQ · IM"],
      "Argireline": ["Topical", "5–10% solution", "Topical"], "Gonadorelin": ["Minutes", "100–200 mcg", "SubQ"],
      "NAD+": ["Minutes in plasma", "100–500 mg", "IV · SubQ"], "Cerebrolysin": ["Hours", "5–10 mL courses", "IM · IV"],
      "Noopept": ["~1 hour", "10–30 mg", "Oral"], "Retatrutide": ["~6 days", "1–12 mg/week", "SubQ"],
      "AOD-9604": ["~30 min", "300–500 mcg", "SubQ"], "Melanotan II": ["~1 hour", "250–500 mcg", "SubQ"],
      "Kisspeptin-10": ["Minutes", "1–4 nmol/kg", "SubQ"], "Matrixyl": ["Topical", "3–8% formulation", "Topical"]
    };

export const EXTRA: Record<string, string> = {
      "Ipamorelin": "The sleep interest is secondary: GH secretagogues deepen slow-wave sleep when dosed at night, which is why it appears in sleep stacks at all.",
      "Sermorelin": "Evening dosing rides the natural GH pulse, and the older clinical literature reports improved sleep quality as a side observation — not its indication.",
      "MK-677": "Human trials consistently show raised GH/IGF-1 and more slow-wave sleep — alongside real appetite increase, water retention and fasting-glucose drift. Glucose is the marker to watch in the app.",
      "Epithalon": "The sleep claim traces to melatonin normalization in elderly cohorts from one Russian research program that has not been widely replicated.",
      "DSIP": "Named for sleep induction in 1970s animal work; human replication has been inconsistent for decades. A compelling name on a thin evidence base — we grade it accordingly.",
      "BPC-157": "Most circulating claims extrapolate far beyond the rodent data. No adequately powered human RCT has been published."
    };

export const BULLETS: Record<Grade, Bullet[]> = {
      rct: [["ok", "Published human RCTs cover the primary indication — read them before extrapolating"], ["wt", "Off-label and stacking claims go beyond the trial populations"], ["bad", "Long-term self-administration data is thin outside clinical settings"]],
      animal: [["ok", "Animal models show the headline effects, often consistently"], ["wt", "Human evidence is case reports and anecdote — nothing controlled"], ["bad", "No long-term human safety data at any dose"]],
      anec: [["wt", "Published human evidence is minimal, dated, or unreplicated"], ["wt", "Most circulating claims come from forums and vendors"], ["bad", "Safety profile for self-use is not established"]]
    };

export const GUIDES: Record<string, CompoundGuide> = {
      "Ipamorelin": {
        what: "A five-amino-acid GH secretagogue that prompts the pituitary to release its own growth hormone. Its reputation rests on selectivity — GH rises without the cortisol and prolactin spillover older GHRPs are known for. It was explored pharmaceutically, never brought to market, and today circulates as a research compound, most often as half of a stack with CJC-1295.",
        how: "It selectively activates the ghrelin receptor (GHS-R1a) in the pituitary, producing a short, pulsatile GH burst that follows the body’s natural rhythm rather than a flat elevation. GHRH analogues like CJC-1295 work the complementary receptor — hitting both pathways at once is the whole logic of the classic pairing.",
        research: "Characterized in the late 1990s, where it raised GH with minimal effect on cortisol, prolactin and ACTH — the selectivity claim holds up well at the mechanistic level. The honest limitation: development stopped there, so the body-composition, recovery and sleep uses it is marketed for today have no modern outcome-trial base. Solid mechanism, thin outcomes.",
        dosage: "No approved dose exists. Community and clinic convention references roughly 200–300 mcg SubQ, once to a few times daily, usually timed before sleep and often alongside CJC-1295. These figures come from practice and early research, not dose-finding trials — convention, not validated medicine.",
        safety: [["ok", "Generally the best-tolerated of the GHRP class in published comparisons"], ["wt", "Short-term reports: water retention, head-rush, increased appetite"], ["bad", "No long-term human safety data at community doses — chronically raised GH/IGF-1 carries theoretical risk"], ["bad", "Not FDA-approved for these uses; legal status varies by jurisdiction"]],
        faq: [["Why is it stacked with CJC-1295?", "They raise GH through two different receptors — ghrelin (ipamorelin) and GHRH (CJC-1295) — so the combination stimulates complementary pathways in a pattern closer to natural pulses."], ["Is it safer than other GHRPs?", "Better tolerated in comparisons, mostly thanks to selectivity. “Cleaner” is not “proven safe long-term” — that data does not exist."], ["Is it FDA-approved?", "No. It was studied pharmaceutically and never marketed. It sells as a research compound, with the purity and legal caveats that implies."]],
        refs: ["Raun K et al. — Ipamorelin, the first selective growth hormone secretagogue · Eur J Endocrinol, 1998", "Teichman SL et al. — Prolonged GH/IGF-1 stimulation by CJC-1295 in healthy adults · JCEM, 2006"],
      },
      "Sermorelin": {
        what: "A 29-amino-acid fragment of natural GHRH — the shortest piece that keeps full activity. It was once FDA-approved for pediatric GH deficiency and later withdrawn for commercial reasons, which leaves it with the deepest clinical paper trail of the GHRH analogues. Today it is prescribed off-label at longevity clinics.",
        how: "It binds the pituitary’s GHRH receptor and triggers a natural GH pulse, preserving the feedback loops that a direct GH injection bypasses — the body can still down-regulate if levels run high. Evening dosing rides the largest natural pulse of the day.",
        research: "Approval-era trials established GH and IGF-1 elevation and mapped tolerability in real patients — rare ground truth in this category. Modern anti-aging and sleep uses lean on that older base plus small newer studies; deeper slow-wave sleep shows up as a secondary observation, not a proven indication.",
        dosage: "Historical prescribing used roughly 0.2–0.5 mg SubQ nightly, and clinic protocols today look similar. Night dosing is deliberate — it stacks the induced pulse on the natural one.",
        safety: [["ok", "The class’s clinical anchor — real prescribing history and tolerability data"], ["wt", "Common: injection-site reactions, flushing, transient head-rush"], ["wt", "The long-term data is pediatric — it does not cover adult anti-aging use"], ["bad", "Off-label today; sourcing and purity vary"]],
        faq: [["How is it different from ipamorelin?", "Different receptor: sermorelin mimics GHRH, ipamorelin mimics ghrelin. Both end in a GH pulse — which is why clinics often combine them."], ["Why was it withdrawn?", "Commercial reasons, not safety — recombinant GH took its market."]],
        refs: ["Prakash A, Goa KL — Sermorelin: a review of its use · BioDrugs, 1999", "Walker RF — Sermorelin: a better approach to management of adult-onset GH insufficiency? · Clin Interv Aging, 2006"],
      },
      "MK-677": {
        what: "Not a peptide: an oral small-molecule ghrelin mimetic (ibutamoren) that raises GH and IGF-1 around the clock. The pill form and a genuine human-trial history made it the most mainstream entry in the GH-secretagogue conversation — and the one with the best-documented side effects.",
        how: "It agonizes the same ghrelin receptor as the injectable GHRPs, but a ~24-hour half-life produces sustained elevation rather than pulses. That persistence is the source of both its convenience and its side-effect profile.",
        research: "Multiple human trials show raised IGF-1, more slow-wave sleep, and modest lean-mass gains in some cohorts — alongside consistent appetite increase, water retention and fasting-glucose drift. A large trial in frail elderly adults was stopped early over a heart-failure signal in that population.",
        dosage: "Trials used 10–25 mg orally once daily, usually at night. There is no approved indication at any dose.",
        safety: [["ok", "Real RCT base — effects and side effects are unusually well documented"], ["wt", "Expect appetite increase and water retention early"], ["wt", "Fasting glucose and insulin sensitivity drift — the biomarker to actually track"], ["bad", "Heart-failure signal in one elderly trial; avoid with cardiac risk"]],
        faq: [["Is MK-677 a peptide?", "No — an oral small molecule that mimics ghrelin. It is catalogued here because it competes directly with the injectable secretagogues."], ["Why does sleep improve on it?", "GH secretagogues increase slow-wave sleep, and MK-677’s trials measured that directly rather than by anecdote."]],
        refs: ["Nass R et al. — Effects of an oral ghrelin mimetic in healthy older adults · Ann Intern Med, 2008", "Murphy MG et al. — MK-677, an orally active growth hormone secretagogue · JCEM, 1998"],
      },
      "Epithalon": {
        what: "A synthetic four-amino-acid peptide (AEDG) from the Russian bioregulator school, proposed to activate telomerase and normalize pineal melatonin rhythm — the basis of both its longevity and sleep claims.",
        how: "The proposed mechanism — telomerase activation plus pineal support — comes from cell and animal work and small human cohorts from a single research program. It has never been independently replicated at scale, which matters more than the mechanism’s elegance.",
        research: "Elderly-cohort studies from the St. Petersburg program reported normalized melatonin and even long-term mortality improvements — striking claims that remain single-source after decades. We grade it anecdotal despite the human data because reproducibility, not existence, is the bar.",
        dosage: "Community protocols reference 5–10 mg SubQ daily in short 10–20-day courses, cycled a few times a year — inherited from the original program, not from dose-finding trials.",
        safety: [["ok", "Short courses appear well tolerated in the published cohorts"], ["wt", "Single-source evidence is the core limitation — respect it"], ["bad", "No Western regulatory review of any kind"], ["bad", "Long-term self-use data does not exist"]],
        faq: [["Why anecdotal if human studies exist?", "The studies are real but come from one program without independent replication. Our grade reflects reproducibility, not just existence."]],
        refs: ["Khavinson VKh, Morozov VG — Peptides of pineal gland and thymus prolong human life · Neuro Endocrinol Lett, 2003"],
      },
      "DSIP": {
        what: "Delta sleep-inducing peptide — a nonapeptide isolated in the 1970s from rabbit brain during sleep experiments, and named for what it appeared to do in those first studies.",
        how: "Half a century later its receptor and mechanism remain unidentified — a rare gap for a compound this old, and a big part of why replication has been so inconsistent.",
        research: "Early animal and small human studies suggested more delta-wave sleep; later attempts frequently failed to reproduce it. The literature is old, thin and contradictory. A compelling name on a weak base — we say so plainly.",
        dosage: "No established protocol exists. Community references cluster around 100–250 mcg SubQ before bed.",
        safety: [["ok", "Short-term reports are unremarkable"], ["wt", "The base is far too thin to call it safe"], ["bad", "Mechanism unknown — an honest red flag"], ["bad", "No modern trials, no regulatory review anywhere"]],
        faq: [["Does DSIP actually improve sleep?", "Unproven. Early positives were followed by failed replications, and no modern trial has settled the question."]],
        refs: ["Schoenenberger GA, Monnier M — Characterization of a delta-EEG-sleep-inducing peptide · PNAS, 1977"],
      },
      "BPC-157": {
        what: "A 15-amino-acid fragment related to a protective protein found in gastric juice — and the internet’s favorite healing peptide. Nearly all of that reputation rests on rodent studies.",
        how: "Proposed mechanisms center on angiogenesis via VEGF upregulation and nitric-oxide pathway modulation, mapped almost entirely in preclinical models.",
        research: "The rodent results across tendon, ligament, gut and vascular injury are remarkably consistent — that part is real. Human evidence is case reports and one small unblinded pilot; no adequately powered RCT has been published, and marketing claims routinely outrun the data.",
        dosage: "No approved dose. Community convention references 200–500 mcg SubQ daily, often injected near the injury site — a practice the animal literature (mostly systemic dosing) doesn’t actually settle.",
        safety: [["ok", "Well tolerated in animal work and short-term anecdote"], ["bad", "Zero controlled human safety data at any dose"], ["wt", "Pro-angiogenic mechanisms carry a theoretical oncology caution"], ["wt", "WADA-prohibited for competing athletes"]],
        faq: [["Does injection site matter?", "Community lore says near the injury; the animal literature mostly used systemic dosing. Genuinely unsettled."], ["Oral or injected?", "The gut studies used oral routes; the soft-tissue claims come from injected models."]],
        refs: ["Sikiric P et al. — Stable gastric pentadecapeptide BPC 157 · Curr Pharm Des, 2020", "Chang CH et al. — BPC 157 enhances tendon fibroblast outgrowth · J Appl Physiol, 2011"],
      }
    };

export const SAFE_FB: Record<Grade, Bullet[]> = {
      rct: [["ok", "Clinical side-effect profiles exist for the approved or trialed indication"], ["wt", "Off-label and enhancement use falls outside the trial populations"], ["bad", "No long-term data for self-directed use"]],
      animal: [["wt", "Tolerability impressions come from animal work and anecdote"], ["bad", "No controlled human safety data at any dose"], ["bad", "Not approved for human use — verify regulatory status independently"]],
      anec: [["wt", "Safety profile for self-use is not established"], ["bad", "No regulatory review; sourcing and purity vary widely"], ["bad", "Claims circulate faster than evidence — treat all of them as unverified"]]
    };

export const GUIDE_LIST: GuideEntry[] = [
      { id: "recon", tag: "GETTING STARTED", title: "Reconstitution, step by step", dek: "From lyophilized powder to a vial you can actually dose from — without wrecking the peptide.", time: "6 min", ready: 1, sections: [
        ["What you need", "The vial of lyophilized peptide, bacteriostatic (BAC) water, an insulin syringe for the transfer, and alcohol swabs. BAC water — not sterile water — is what lets a vial live in the fridge for weeks: the 0.9% benzyl alcohol keeps it bacteriostatic across multiple draws."],
        ["The maths, before the water", "Decide the concentration first. Vial mg ÷ water mL = mg/mL. A 5 mg vial with 2.5 mL gives 2 mg/mL, so a 250 mcg dose is 0.125 mL — 12.5 units on a U-100 syringe. Run it in the calculator and sanity-check that your usual dose lands between 5 and 50 units: too little water makes doses hard to measure, too much makes them uncomfortable volumes."],
        ["Adding the water", "Swab both stoppers. Draw the BAC water, then inject it slowly down the inside wall of the peptide vial — never jet it onto the powder. Most peptides dissolve on their own in a minute or two; a gentle swirl is fine, shaking is not. Cloudiness or floaters after full dissolution means the vial is suspect."],
        ["Storage and shelf life", "Reconstituted vials live in the fridge, dark, stopper up. Community convention treats 3–4 weeks as the sensible window for most compounds — log the reconstitution date in the app and the vial tracker counts doses down for you."]
      ]},
      { id: "labs", tag: "LABS", title: "How to read your first lab panel", dek: "Reference ranges are population statistics — the useful question is whether a marker moved for you.", time: "8 min", ready: 1, sections: [
        ["The range is not the point", "A lab’s reference interval covers 95% of a broad population — it says almost nothing about what is normal for you. You can drift 20% from your own baseline and still sit comfortably ‘in range’. That drift is usually the earliest signal worth having, which is why the app flags against your baseline, not the printed interval."],
        ["Establish the baseline first", "Two panels before you start anything — ideally a few weeks apart, same lab, same morning conditions, fasted — give you a median to compare against. One panel is a snapshot; two is a baseline; three makes drift statistics honest."],
        ["What a starter panel covers", "Lipids (ApoB if you can get it), fasting glucose and HbA1c, a liver pair (ALT/AST), kidney basics (creatinine/eGFR), hs-CRP for inflammation, and the hormone anchors relevant to your protocol — IGF-1 for GH secretagogues, a testosterone panel for anything touching the HPTA axis."],
        ["Timing around a protocol", "Draw at consistent times relative to dosing — trough values are comparable, random ones are noise. Re-test 6–8 weeks into a new protocol, then quarterly. Upload each PDF and the timeline places every result next to the doses that preceded it."]
      ]},
      { id: "sites", tag: "GETTING STARTED", title: "Injection sites and rotation", dek: "Why the same two inches of abdomen shouldn’t take every dose — and a rotation that survives real life.", time: "5 min", ready: 1, sections: [
        ["Why rotation matters", "Repeated injections into one site cause lipohypertrophy — fat-layer scarring that is unsightly, slows absorption, and makes doses erratic. The fix is boring and absolute: never the same spot twice in a row, and days of rest before a site repeats."],
        ["The usual map", "SubQ sites: the abdomen at least two finger-widths from the navel (left/right, upper/lower), the flanks, the front-outer thighs, and the back of the upper arm if someone else injects. The app’s site map colours recency and suggests the longest-rested site — accept it and rotation stops being a memory task."],
        ["Technique in one paragraph", "Clean skin, new needle every time, pinch a fold, 45–90° depending on lean-ness, steady push, count three before withdrawing. A drop of blood is nothing; persistent pain, heat or swelling is a site telling you to rest it — and worth a note on the dose log."],
        ["When to worry", "Redness that spreads after 48 hours, warmth, or induration that grows rather than fades belongs to a clinician, not a forum. Log it either way — patterns across sites are exactly what the notes field is for."]
      ]},
      { id: "g4", tag: "PROTOCOLS", title: "Choosing a first protocol", dek: "Goal first, compound second — and one variable at a time.", time: "7 min", ready: 0 },
      { id: "g5", tag: "PROTOCOLS", title: "GLP-1 titration, explained", dek: "Why every schedule steps up slowly, and what each step is waiting for.", time: "6 min", ready: 0 },
      { id: "g6", tag: "GETTING STARTED", title: "Storing peptides properly", dek: "Freezer, fridge, or drawer — what actually degrades a peptide.", time: "4 min", ready: 0 },
      { id: "g7", tag: "EVIDENCE", title: "How our evidence grades work", dek: "Human RCT, animal data only, anecdotal — where each line sits and why.", time: "5 min", ready: 0 },
      { id: "g8", tag: "DATA", title: "Wearables and the recovery score", dek: "HRV, resting HR and sleep — compared to your own median, not a leaderboard.", time: "5 min", ready: 0 }
    ];

export const GLOSS: [string, string][] = [
      ["Agonist", "A molecule that binds a receptor and switches it on — most peptides here are agonists of something."],
      ["Anecdotal evidence", "Reports without controls: forums, testimonials, clinic lore. Our lowest grade, stated plainly."],
      ["BAC water", "Bacteriostatic water — 0.9% benzyl alcohol lets a reconstituted vial survive weeks of repeated draws."],
      ["Baseline", "Your own pre-protocol values — the median of at least two panels. Every flag in the app is drift from this."],
      ["Bioavailability", "The fraction of a dose that reaches circulation. Injection ≈ high; oral peptides usually very low."],
      ["Biomarker", "Anything measurable that tracks a biological state — ApoB, hs-CRP, IGF-1, resting heart rate."],
      ["Cycle", "A planned on/off period for a protocol. The off weeks are part of the design, not a lapse."],
      ["Desensitization", "Receptors down-regulating under constant stimulation — why pulses beat flat elevation for some pathways."],
      ["GHRH", "Growth-hormone-releasing hormone. Sermorelin, CJC-1295 and tesamorelin imitate it."],
      ["Ghrelin", "The hunger hormone — also the receptor GHRPs, ipamorelin and MK-677 use to trigger GH release."],
      ["GHRP", "GH-releasing peptide — the ghrelin-receptor family: GHRP-2, GHRP-6, hexarelin, ipamorelin."],
      ["Half-life", "Time for blood levels to fall by half. Sets dosing frequency — minutes for sermorelin, a week for GLP-1s."],
      ["HPTA axis", "Hypothalamus–pituitary–testes signalling chain. ‘Keeping the axis alive’ means not letting it go silent."],
      ["IGF-1", "Insulin-like growth factor 1 — the downstream marker that shows a GH protocol is actually doing something."],
      ["Incretin", "Gut hormones (GLP-1, GIP) that regulate insulin and appetite — the pathway behind the weight-loss injectables."],
      ["IU", "International unit — an activity-based measure. On an insulin syringe, 100 units = 1 mL."],
      ["Lipohypertrophy", "Fat-layer scarring from repeated injections in one spot. The reason site rotation exists."],
      ["Peptide", "A short chain of amino acids — smaller than a protein. Most compounds here are 2–50 residues."],
      ["Pulsatile release", "Hormones released in bursts rather than steadily. GH secretagogues try to amplify pulses, not flatten them."],
      ["RCT", "Randomized controlled trial — the strongest single study design, and the bar for our top grade."],
      ["Receptor", "The cellular lock a peptide’s key fits. Selectivity — hitting one lock only — is what made ipamorelin famous."],
      ["Reconstitution", "Dissolving lyophilized peptide in BAC water at a concentration you chose on purpose."],
      ["SubQ", "Subcutaneous — injected into the fat layer under the skin. The default route for most peptides."],
      ["Titration", "Stepping a dose up on a schedule, letting tolerance to side effects catch up before the next step."],
      ["Trough", "The lowest blood level between doses — the consistent moment to draw comparable labs."],
      ["Vial tracker", "The app’s per-compound counter: concentration, remaining volume, and doses left at your current dose."]
    ];
