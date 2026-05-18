import type { Language } from "@/i18n/LanguageContext";

export interface ApplicationTemplate {
  id: string;
  name: string;
  description: string;
  notes: string;
}

export function getApplicationTemplates(language: Language): ApplicationTemplate[] {
  if (language === "id") {
    return [
      {
        id: "fresh-start",
        name: "Mulai Santai",
        description: "Buat lamaran biasa yang pengen kamu pantau tanpa ribet.",
        notes: [
          "Kenapa role ini menarik:",
          "Hal yang mau aku tonjolkan:",
          "Versi CV/portfolio yang dipakai:",
          "Langkah kecil berikutnya:",
        ].join("\n"),
      },
      {
        id: "warm-lead",
        name: "Kenalan / Referral",
        description: "Untuk lamaran dari referral, recruiter, atau orang yang bantu buka jalan.",
        notes: [
          "Kontak yang bantu:",
          "Dari mana aku dapat info ini:",
          "Hal yang mereka mention:",
          "Ucapan terima kasih / follow-up yang perlu dikirim:",
        ].join("\n"),
      },
      {
        id: "interview-prep",
        name: "Siap Interview",
        description: "Biar persiapan interview nggak tercecer.",
        notes: [
          "Yang perlu dicek sebelum interview:",
          "- Produk/perusahaan",
          "- Role dan tanggung jawab",
          "- Cerita pengalaman yang relevan",
          "",
          "Pertanyaan yang mau aku tanyakan:",
          "Next step setelah interview:",
        ].join("\n"),
      },
      {
        id: "offer-watch",
        name: "Pantau Offer",
        description: "Untuk tahap akhir, negosiasi, dan detail kompensasi.",
        notes: [
          "Hal yang perlu dipastikan:",
          "- Gaji pokok / total package",
          "- Benefit",
          "- Sistem kerja",
          "- Deadline keputusan",
          "",
          "Catatan negosiasi:",
        ].join("\n"),
      },
      {
        id: "dream-role",
        name: "Role Incaran",
        description: "Untuk peluang yang beneran kamu pengen, jadi tracking-nya lebih niat.",
        notes: [
          "Kenapa aku pengen role ini:",
          "Bagian paling cocok dari pengalaman aku:",
          "Hal yang perlu aku personalisasi:",
          "Pertanyaan penting:",
          "Next tiny step:",
        ].join("\n"),
      },
      {
        id: "remote-fit",
        name: "Remote Nyaman",
        description: "Untuk role remote/hybrid, biar ekspektasi kerjanya jelas dari awal.",
        notes: [
          "Setup kerja yang ditawarkan:",
          "Jam kerja / overlap:",
          "Cara tim komunikasi:",
          "Hal yang perlu aku pastikan:",
        ].join("\n"),
      },
      {
        id: "quick-check",
        name: "Cek Cepat",
        description: "Template pendek kalau kamu cuma mau nyatet inti pentingnya.",
        notes: [
          "Yang menarik:",
          "Yang masih perlu dicek:",
          "Next step:",
        ].join("\n"),
      },
    ];
  }

  return [
    {
      id: "fresh-start",
      name: "Fresh Start",
      description: "For a normal application you want to track without overthinking it.",
      notes: [
        "Why this role feels worth tracking:",
        "What I want to highlight:",
        "Resume/portfolio version used:",
        "Next tiny step:",
      ].join("\n"),
    },
    {
      id: "warm-lead",
      name: "Warm Lead",
      description: "For referrals, recruiters, or someone who opened the door.",
      notes: [
        "Helpful contact:",
        "Where this lead came from:",
        "What they mentioned:",
        "Thank-you / follow-up to send:",
      ].join("\n"),
    },
    {
      id: "interview-prep",
      name: "Interview Prep",
      description: "For keeping interview prep calm and in one place.",
      notes: [
        "Before the interview, check:",
        "- Company/product",
        "- Role responsibilities",
        "- Relevant stories to share",
        "",
        "Questions I should ask:",
        "Next step after the interview:",
      ].join("\n"),
    },
    {
      id: "offer-watch",
      name: "Offer Watch",
      description: "For late-stage details, compensation, and negotiation notes.",
      notes: [
        "Details to confirm:",
        "- Base salary / total package",
        "- Benefits",
        "- Work setup",
        "- Decision deadline",
        "",
        "Negotiation notes:",
      ].join("\n"),
    },
    {
      id: "dream-role",
      name: "Dream Role",
      description: "For the opportunities you really care about.",
      notes: [
        "Why I want this role:",
        "Best-fit part of my experience:",
        "What I should personalize:",
        "Important questions:",
        "Next tiny step:",
      ].join("\n"),
    },
    {
      id: "remote-fit",
      name: "Remote Fit",
      description: "For remote or hybrid roles where the work setup matters.",
      notes: [
        "Work setup offered:",
        "Working hours / overlap:",
        "How the team communicates:",
        "What I should confirm:",
      ].join("\n"),
    },
    {
      id: "quick-check",
      name: "Quick Check",
      description: "A short template when you only want the essentials.",
      notes: [
        "What looks interesting:",
        "What I still need to check:",
        "Next step:",
      ].join("\n"),
    },
  ];
}
