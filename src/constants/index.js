export const SB = "https://qbjtiximcchhnxhttogq.supabase.co";
export const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianRpeGltY2NoaG54aHR0b2dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg1MDM5NCwiZXhwIjoyMDkxNDI2Mzk0fQ.485SXyI0Lvcr7eTtXA2Derlap8n2OTnqItZ0w15IJbM";
export const SH = {
  "apikey": SK,
  "Authorization": "Bearer " + SK,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

export const SEC_A = ["Crèche", "KG1", "KG2", "Nursery 1", "Nursery 2", "Primary 1"];
export const SEC_B = ["Primary 2", "Primary 3", "Primary 4", "Primary 5", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
export const ALL_CLS = [...SEC_A, ...SEC_B];

export const FEE_GROUPS = [
  {label: "Crèche", classes: ["Crèche"]},
  {label: "KG1", classes: ["KG1"]},
  {label: "KG2", classes: ["KG2"]},
  {label: "Nursery 1 & 2", classes: ["Nursery 1", "Nursery 2"]},
  {label: "Primary 1–5", classes: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5"]},
  {label: "JSS 1–3", classes: ["JSS1", "JSS2", "JSS3"]},
  {label: "SS1–SS3", classes: ["SS1", "SS2", "SS3"]},
];

export const DEF_CATS = [
  "Tuition Fee", "Exam Fee", "Report Card Fee", "End of Year Party Fee", "Sports Fee", "Sports Wears", "Outstanding/Backlog"
];

export const PAY_MODES = ["Cash", "Bank Transfer", "POS"];
export const EXAM_CLS = ["Primary 5", "JSS3", "SS3"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const SCHOOL_NAME = "Way to Success Standard School, Ejigbo";
export const SCHOOL_SHORT = "Way to Success Standard School";

export const PROP_USER = "waytosuccess";
export const PROP_PIN_KEY = "ssfp_prop_pin";
export const PROP_DEFAULT_PIN = "246810";
export const SUPER_USER = "superadmin";
export const SUPER_PASS = "7878";
