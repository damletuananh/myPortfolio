export type SocialPlatform = "github" | "linkedin" | "email";

export type LayoutStyle = 1 | 2 | 3 | 4 | 5 | 6;

export type ClientCategory = "web" | "3d" | "motion" | "brand";

export interface SocialLink {
  label: string;
  href: string;
  platform: SocialPlatform;
}

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface MediaAsset {
  imageSrc: string;
  respImageSrc?: string;
  videoSrc?: string;
  alt: string;
}

export interface SiteConfig {
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  roleTitle: string;
  tagline: string;
  heroBio: string[];
  manifestoTitle: string;
  manifestoBody: string;
  midNoteTitle: string;
  midNoteBody: string;
  locationLabel: string;
  coordinates: string;
  coordinateLines: [string, string];
  locationUrl: string;
  addressLines: string[];
  email: string;
  barcodeLabel: string;
  barcodeHref: string;
  heroTags: string[];
  footerTags: string[];
  footerInvite: string;
  footerAside: string;
  navLinks: NavLinkItem[];
  socials: SocialLink[];
  copyright: string;
}

export interface AwardItem {
  id: string;
  title: string;
  count: string;
  category?: string;
}

export interface CaseStudyAwardEntry {
  title: string;
  organization: string;
  year?: string;
}

export type CaseStudyBlock =
  | {
      type: "fullscreen169";
      media: MediaAsset;
      caption?: string;
    }
  | {
      type: "text";
      heading: string;
      paragraphs: string[];
    }
  | {
      type: "imageText";
      media: MediaAsset;
      align?: "left" | "right";
      aspect169?: boolean;
      heading: string;
      paragraphs: string[];
    }
  | {
      type: "split5050";
      left: MediaAsset;
      right: MediaAsset;
    }
  | {
      type: "mobileShowcase";
      screens: MediaAsset[];
      darkSurface?: boolean;
    }
  | {
      type: "awards";
      heading: string;
      awards: CaseStudyAwardEntry[];
    };

export interface ProjectItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  titleLines: string[];
  client: string;
  role: string;
  services: string[];
  tags: string[];
  year: string;
  summary: string;
  featured: boolean;
  layoutStyle: LayoutStyle;
  primaryMedia: MediaAsset;
  secondaryMedia?: MediaAsset;
  delaySecondary?: number;
  designCredit?: string;
  liveUrl?: string;
  caseStudyBlocks: CaseStudyBlock[];
}

export interface ClientRow {
  id: string;
  name: string;
  category: ClientCategory;
  year: string;
  featured?: boolean;
  tooltipLabel?: string;
  tooltipNote?: string;
  url?: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  items: string[];
}

export interface AboutContentData {
  title: string;
  headerSplit: {
    left: string;
    right: string;
  };
  headerCenterNote: string;
  tags: string[];
  introParagraph: string;
  sinceHeadline: string;
  bodyParagraphs: string[];
  awwwardsHeading: string;
  awwwardsCopy: string;
}

export interface TimelineEvent {
  id: string;
  period: string;
  title: string;
  context: string;
  highlight?: string;
  category: "education" | "engineering" | "award" | "community";
}

export interface CertificationItem {
  id: string;
  date: string;
  title: string;
  issuer: string;
  focus: string;
}

export interface ContactQuestionField {
  id: "name" | "email" | "message";
  question: string;
  placeholder: string;
  type: "text" | "email" | "textarea";
}

export interface ContactContentData {
  title: string;
  tags: string[];
  introCopy: string;
  questions: ContactQuestionField[];
  submitLabel: string;
  successMessage: string;
}

/**
 * MEDIA ASSET REPLACEMENT NOTE:
 * Existing verified assets under `public/media/` (`mascot/*`, `projects/*.jpg`,
 * `videos/*.webm`) are mapped across the 6 authentic projects and Cún mascot slots
 * so every route loads cleanly today. Replace `project-01..06`, `wide-01..06`,
 * `project-01..06-detail`, and `videos/project-01/04/06.webm` with Tuan Anh's
 * final screenshots & demos.
 */

export const SITE_CONFIG: SiteConfig = {
  firstName: "DAM LE",
  lastName: "TUAN ANH",
  fullName: "Dam Le Tuan Anh",
  initials: "T.A./",
  roleTitle: "Full-Stack Developer & System Thinker",
  tagline:
    "Software Engineering @ FPT University · Architecture, Applied AI & Tactile Craft",
  heroBio: [
    "I’m Dam Le Tuan Anh — a full-stack builder at FPT University Ho Chi Minh City (Class of 2028), learning to trade frantic sprints for calm, enduring architecture.",
  ],
  manifestoTitle: "[Craft & System Thinking]",
  manifestoBody:
    "Anyone can force a screen to render by Friday if they ignore the wreckage behind it. I am practicing the harder discipline: drawing clean boundaries before the first line is written, testing every AI assumption line by line, and leaving systems calm enough for the next engineer to inhabit.",
  midNoteTitle: "[Built to Endure]",
  midNoteBody:
    "Quiet systems hold up under pressure—clear domain boundaries, strict verification, and interfaces that stay calm after shipping.",
  locationLabel: "Ho Chi Minh City",
  coordinates: "/ 10.7770° N // 106.6954° E",
  coordinateLines: ["/ 10.7770° N", "// 106.6954° E"],
  locationUrl: "https://www.google.com/maps/place/Ho+Chi+Minh+City,+Vietnam/",
  addressLines: ["Dam Le Tuan Anh", "Ho Chi Minh City, Vietnam"],
  email: "damletuananh123@gmail.com",
  barcodeLabel: "damletuananh123@gmail.com",
  barcodeHref: "mailto:damletuananh123@gmail.com",
  heroTags: [
    "/Full-Stack",
    "/System Thinking",
    "/Applied AI",
    "/Ho Chi Minh City",
  ],
  footerTags: [
    "/Full-Stack",
    "/System Thinking",
    "/Applied AI",
    "/FPT University HCMC",
  ],
  footerInvite:
    "Always glad to connect over software engineering internships, resilient full-stack products, and grounded applied-AI work—in Ho Chi Minh City or anywhere teams build with care.",
  footerAside:
    "After hours: loyal to Manchester United—patient through rebuilds, built for stoppage time.",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/damletuananh",
      platform: "github",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/damletuananh123",
      platform: "linkedin",
    },
    {
      label: "Email",
      href: "mailto:damletuananh123@gmail.com",
      platform: "email",
    },
  ],
  copyright: "© 2026 Dam Le Tuan Anh — Craft & System Thinking",
};

export const HERO_MEDIA: MediaAsset = {
  imageSrc: "/media/profile/tuan-anh-portrait.jpg",
  alt: "Studio portrait of Dam Le Tuan Anh, Software Engineering student at FPT University Ho Chi Minh City",
};

export const PROFILE_PORTRAIT_MEDIA: MediaAsset = {
  imageSrc: "/media/profile/tuan-anh-portrait.jpg",
  alt: "Studio portrait of Dam Le Tuan Anh, Software Engineering student at FPT University Ho Chi Minh City",
};

export const CONTACT_FOOTBALL_MEDIA: MediaAsset = {
  imageSrc: "/media/profile/football-with-friends.jpg",
  alt: "Dam Le Tuan Anh smiling outdoors with friends after playing football",
};

export const ABOUT_BIRD_MEDIA: MediaAsset = PROFILE_PORTRAIT_MEDIA;

export const ABOUT_MASCOT_MEDIA = PROFILE_PORTRAIT_MEDIA;

export const FOOTER_BIRD_MEDIA: MediaAsset = {
  imageSrc: "/media/mascot/mascot-footer.jpg",
  alt: "Nocturnal view of Old Trafford under misty floodlights with a classic stitched leather football and crimson-and-white knit scarf by the touchline",
};

export const FOOTER_MASCOT_MEDIA = FOOTER_BIRD_MEDIA;

export const NOT_FOUND_BIRD_MEDIA: MediaAsset = {
  imageSrc: "/media/mascot/mascot-notfound.png",
  alt: "Museum darkfield macro photograph of an isolated canine skull specimen on pure black background",
};

export const NOT_FOUND_MASCOT_MEDIA = NOT_FOUND_BIRD_MEDIA;

export const AWARDS_ITEMS: AwardItem[] = [
  {
    id: "award-webdev",
    title: "WebDev Adventure · UIT",
    count: "3rd",
    category: "National Track · SmartRoute (05/2026)",
  },
  {
    id: "award-seal",
    title: "SEAL Hackathon · QA Track",
    count: "Top 3",
    category: "3rd Place Agile QA · SEAL Underrate (Fall 2025)",
  },
  {
    id: "award-thuduc",
    title: "Thu Duc Youth Informatics",
    count: "2nd",
    category: "District Algorithmic Olympiad · Age 16 (06/2022)",
  },
  {
    id: "award-coursera",
    title: "Coursera Specializations",
    count: "7x",
    category: "HKUST, Michigan, IBM, Duke/UCSD, Sydney",
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "smartroute",
    slug: "smartroute",
    number: "01",
    title: "SmartRoute",
    titleLines: ["Smart", "Route"],
    client: "WebDev Adventure",
    role: "3rd Place · National Track",
    services: ["Next.js 15", "XGBoost Forecasting", "MapLibre GL", "TypeScript"],
    tags: ["Next.js 15", "MapLibre GL", "XGBoost", "TypeScript"],
    year: "2026",
    summary:
      "Reading Ho Chi Minh City gridlock sixty minutes before junctions lock up—pairing 97.78% XGBoost forecasting (<2ms) across 9,841 road segments with a silky 60 FPS WebGL map.",
    featured: true,
    layoutStyle: 1,
    primaryMedia: {
      imageSrc: "/media/projects/project-01.jpg",
      alt: "Elevated twilight river bridges carrying luminous long-exposure amber traffic light ribbons across dark water, an editorial metaphor for SmartRoute urban transit forecasting",
    },
    secondaryMedia: {
      imageSrc: "/media/projects/project-01-detail.jpg",
      videoSrc: "/media/videos/project-01.webm",
      alt: "Low-angle macro study of rain-slick nocturnal asphalt reflecting glowing amber vehicle lights in wet ripples, evoking SmartRoute weather-aware corridor forecasting",
    },
    delaySecondary: 0.35,
    caseStudyBlocks: [
      {
        type: "fullscreen169",
        media: {
          imageSrc: "/media/projects/wide-01.jpg",
          videoSrc: "/media/videos/project-01.webm",
          alt: "Nocturnal aerial panorama of sweeping amber highway arteries curving through an illuminated city grid, representing SmartRoute forecasting across 9,841 Ho Chi Minh City road segments",
        },
        caption:
          "Anticipating bottlenecks (+15 / +30 / +60 min) across 9,841 Ho Chi Minh City corridors.",
      },
      {
        type: "text",
        heading: "Seeing Gridlock Before Junctions Lock",
        paragraphs: [
          "Ordinary maps only confess to a traffic jam after your wheels have already stopped turning. Built for the WebDev Adventure National Track (hosted by UIT – VNU-HCM, 05/2026), where our team won 3rd Place, SmartRoute shifts city navigation from rearview reaction to quiet foresight—predicting road density 15, 30, and 60 minutes ahead across 9,841 Ho Chi Minh City segments.",
          "By fusing live TomTom corridor speeds with OpenWeather telemetry, the forecast reads early warning signs before sudden tropical rain or evening rush spillovers saturate arterial intersections.",
        ],
      },
      {
        type: "imageText",
        media: {
          imageSrc: "/media/projects/project-01-detail.jpg",
          alt: "Rain-slick night pavement mirroring amber traffic reflections in crisp puddle ripples, illustrating SmartRoute viewport-bounded rendering and sub-2ms XGBoost inference",
        },
        align: "left",
        heading: "97.78% XGBoost Meets 60 FPS WebGL",
        paragraphs: [
          "Flooding a browser with nearly ten thousand live-scored road geometries at once would choke memory and stutter every pan. To hold a fluid 60 FPS, the Next.js 15 TypeScript client streams only what enters the active MapLibre GL viewport.",
          "Behind that crisp boundary, the XGBoost regressor delivers 97.78% prediction accuracy in under 2ms per inference—so scrubbing between +15, +30, and +60 minutes feels less like waiting on an API and more like turning a calibrated lens.",
        ],
      },
      {
        type: "split5050",
        left: {
          imageSrc: "/media/projects/project-01.jpg",
          alt: "Twilight river bridges traced by continuous long-exposure amber traffic light ribbons, framing SmartRoute corridor-level transit flow",
        },
        right: {
          imageSrc: "/media/projects/project-01-detail.jpg",
          alt: "Close-up of wet nocturnal asphalt glowing with amber taillight reflections during tropical rain, echoing live OpenWeather and corridor telemetry",
        },
      },
      {
        type: "awards",
        heading: "Competition Recognition",
        awards: [
          {
            title: "3rd Place · National Track",
            organization: "WebDev Adventure (UIT - VNU-HCM)",
            year: "05/2026",
          },
        ],
      },
    ],
  },
  {
    id: "seal-underrate",
    slug: "seal-underrate",
    number: "02",
    title: "SEAL Underrate",
    titleLines: ["SEAL", "Underrate"],
    client: "SEAL Hackathon",
    role: "Ideation, System Architecture & Frontend Lead",
    services: ["Next.js 16", "FastAPI", "Playwright", "Multi-Agent"],
    tags: ["Next.js 16", "FastAPI", "Playwright", "Multi-Agent"],
    year: "2025",
    summary:
      "Opening a three-season Software Engineering Agile League (SEAL) streak at FPT University HCMC: Team UNDERATE's 3rd Place (Top 3 Finalist) Agile QA auditor (01–02/11/2025), followed by internal-doc RAG (11–12/04/2026) and WebSocket IoT factory safety agents (15–16/08/2026).",
    featured: true,
    layoutStyle: 2,
    primaryMedia: {
      imageSrc: "/media/projects/project-02.jpg",
      alt: "Team Underrate pitching on stage with Dam Le Tuan Anh presenting at the FPT University SEAL Hackathon",
    },
    caseStudyBlocks: [
      {
        type: "fullscreen169",
        media: {
          imageSrc: "/media/projects/wide-02.jpg",
          alt: "Packed student atrium and judges watching presentations at the FPT University SEAL Hackathon",
        },
        caption:
          "Three consecutive FPT University SEAL Hackathons moving from Agile QA to internal RAG and live IoT operations.",
      },
      {
        type: "text",
        heading: "Three Seasons, One Relentless Year",
        paragraphs: [
          "Hosted by the Software Engineering Department and Student Affairs Office (CTSV) at FPT University HCMC across its three-semester-per-year calendar, the Software Engineering Agile League (SEAL) tests builders every Fall, Spring, and Summer. On 01–02/11/2025 (Fall 2025, \"AI Agents for Software Innovation\"), Team UNDERATE opened our three-season streak with SEAL Underrate—winning 3rd Place (Top 3 Finalist) in the Agile QA track while I led ideation, architecture, and the Next.js 16 frontend.",
          "To cure LLM design audits of inventing CSS breaks from raw markup, Playwright captures exact 1920×1080, 768×1024, and 375×667 screenshots and DOM measurements first. Three parallel agents (OpenRouter / Claude 3.5 Sonnet) then cross-check visual proof against a RAG design rubric and write deterministic JSON payloads into PostgreSQL.",
        ],
      },
      {
        type: "mobileShowcase",
        darkSurface: true,
        screens: [
          {
            imageSrc: "/media/projects/mobile-01-a.jpg",
            alt: "Official Fall 2025 SEAL Hackathon Third Prize award graphic featuring Team Underrate",
          },
          {
            imageSrc: "/media/projects/mobile-01-b.jpg",
            alt: "Spring 2026 SEAL Hackathon event poster focused on Mastering Domain-Specific AI RAG Systems",
          },
          {
            imageSrc: "/media/projects/mobile-01-c.jpg",
            alt: "Judge and speaker addressing competitors on stage during Summer 2026 SEAL Hackathon for AI-Driven Smart Operations",
          },
        ],
      },
      {
        type: "imageText",
        media: {
          imageSrc: "/media/projects/project-02-detail.jpg",
          alt: "Teammates collaborating around a laptop during a SEAL Hackathon build sprint at FPT University",
        },
        align: "right",
        heading: "From QA Podium to Internal RAG & Factory IoT",
        paragraphs: [
          "Fall's podium was only the opening chapter. On 11–12/04/2026 (Spring 2026, \"Mastering Domain-Specific AI RAG Systems\"), we built an internal employee AI chatbot strictly constrained to verified company documents via RAG—sharpening retrieval precision and zero-leakage guardrails. On 15–16/08/2026 (Summer 2026, \"AI-Driven Smart Operations: Turning Real-Time IoT Data into Intelligent Actions\"), we engineered factory equipment safety AI agents streaming real-time WebSocket telemetry (temperature, humidity, and smoke) to modulate IoT actuators before hazards escalated.",
          "Though neither Spring nor Summer brought home a stage trophy, completing all three consecutive seasons was officially honored by the organizers at the Summer 2026 finale—and forged the RAG boundaries and agentic control that immediately crystallized in ChiChan.",
        ],
      },
      {
        type: "awards",
        heading: "Hackathon Recognition",
        awards: [
          {
            title: "3rd Place (Top 3) · Agile QA Track (Team UNDERATE)",
            organization: "SEAL · FPTU HCMC",
            year: "11/2025",
          },
          {
            title: "Three-Season Consecutive Honor (Fall '25 – Summer '26)",
            organization: "SEAL · SE & CTSV",
            year: "08/2026",
          },
        ],
      },
    ],
  },
  {
    id: "trao-em-sac-ha",
    slug: "trao-em-sac-ha",
    number: "03",
    title: "Trao Em Sac Ha",
    titleLines: ["Trao Em", "Sac Ha"],
    client: "Bright Summer",
    role: "Interactive AI Builder & Volunteer",
    services: ["Interactive AI", "STEM Outreach", "Community", "Education"],
    tags: ["Interactive AI", "STEM Outreach", "Community", "Education"],
    year: "2026",
    summary:
      "A three-phase charity summer outreach campaign (03/08/2026 – 12/08/2026) every Monday and Wednesday at Binh Tho Center in Thu Duc—culminating in a hands-on AI playroom where kids met technology through joy.",
    featured: true,
    layoutStyle: 3,
    designCredit: "F-Code × SiTiGroup Volunteers · 26a Street 13, Thu Duc",
    primaryMedia: {
      imageSrc: "/media/projects/project-03.jpg",
      alt: "Children smiling with colorful handmade paper flower crafts during Lưu Giữ Sắc Hạ at Binh Tho Center, Thu Duc",
    },
    caseStudyBlocks: [
      {
        type: "fullscreen169",
        media: {
          imageSrc: "/media/projects/wide-03.jpg",
          alt: "F-Code × SiTiGroup volunteers receiving the Recap Gala appreciation certificate at Binh Tho Center",
        },
        caption:
          "Recap Gala — F-Code × SiTiGroup volunteers receiving the Lưu Giữ Sắc Hạ certificate at Binh Tho Center, 26a Street 13, Thu Duc (03–12/08/2026).",
      },
      {
        type: "text",
        heading: "Monday & Wednesday Mornings at Binh Tho",
        paragraphs: [
          "Across August 3–12, 2026, Bright Summer (Trao Em Sac Ha) unfolded every Monday and Wednesday inside Binh Tho Center at 26a Street 13 in Thu Duc—moving through three dedicated volunteer phases: First Summer Streak (grassroots fundraising and lesson prep), Painting Summer (crafts, STEM discovery, and live science experiments), and Keeping Summer Hues (celebrating what the children built).",
          "Joining F-Code—FPT University's twelve-year-old student tech club—alongside SiTiGroup volunteers during Painting Summer, I shipped a live, screen-interactive AI playroom app so neighborhood kids with rare access to laptops could touch, prompt, and explore how technology responds in real time.",
        ],
      },
      {
        type: "imageText",
        media: {
          imageSrc: "/media/projects/project-03-detail.jpg",
          alt: "Hands-on paper flower craft and creative joy with children at Lớp Học Tình Thương Summer 2026",
        },
        align: "left",
        aspect169: true,
        heading: "Software Measured in Shared Curiosity",
        paragraphs: [
          "Designing for a charity classroom strips every ounce of engineering vanity away. You hide every sharp technical edge, enlarge every inviting visual cue, and step back the moment a child leans toward the monitor and asks, 'Wait—can we try mine next?'",
        ],
      },
    ],
  },
  {
    id: "chichan-platform",
    slug: "chichan-platform",
    number: "04",
    title: "ChiChan Platform",
    titleLines: ["ChiChan", "Platform"],
    client: "Youth Health EdTech",
    role: "System Architect & Technical Mentor",
    services: [
      "768-dim pgvector RAG",
      "Gemini SSE Streaming",
      "FastAPI & Supabase",
      "Next.js 16",
    ],
    tags: ["Next.js 16", "FastAPI", "pgvector", "Gemini AI"],
    year: "2026",
    liveUrl: "https://github.com/damletuananh/chichan_platform",
    summary:
      "Mentoring high-school researchers building a confidential youth sex-education platform—uniting WHO/CDC 768-dim pgvector RAG, Gemini SSE streaming, and empathetic AI personas forged from two earlier hackathon seasons.",
    featured: true,
    layoutStyle: 4,
    primaryMedia: {
      imageSrc: "/media/projects/project-04.jpg",
      videoSrc: "/media/videos/project-04.webm",
      alt: "Sculpted matte amber glass vessels standing beside calm cream archival books on sunlit travertine stone, a quiet metaphor for ChiChan empathetic youth guidance",
    },
    caseStudyBlocks: [
      {
        type: "fullscreen169",
        media: {
          imageSrc: "/media/projects/wide-04.jpg",
          videoSrc: "/media/videos/project-04.webm",
          alt: "Sunlit travertine sanctuary bathed in slatted daylight with archival volumes and twin matte vessels along a stone bench, evoking ChiChan confidential youth health space",
        },
        caption:
          "WHO/CDC health truth indexed in 768-dim pgvector, delivered through empathetic Gemini SSE personas.",
      },
      {
        type: "text",
        heading: "Grounded Truth, Spoken With Human Warmth",
        paragraphs: [
          "From January to October 2026, I mentored a student research team from Giong Ong To High School in Ho Chi Minh City preparing ChiChan for a national science showcase. Adolescent sex education lives in fragile silence: teenagers hesitate to ask adults face-to-face, yet generic chatbots either preach stiffly or hallucinate unsafe guidance.",
          "Everything I learned across two unrewarded SEAL seasons—Spring 2026's strict internal-document RAG and Summer 2026's autonomous agent orchestration—crystallized here. We indexed vetted WHO and CDC educational guidelines inside Supabase PostgreSQL via 768-dimensional pgvector embeddings and real-time Gemini SSE streaming, while shaping the AI agents into distinct, empathetic human personas so young people feel safe opening up without fear of judgment.",
        ],
      },
      {
        type: "imageText",
        media: {
          imageSrc: "/media/projects/project-04-detail.jpg",
          alt: "Ascending stepped layers of translucent parchment framed by cut amber blocks on warm travertine stone, symbolizing ChiChan structured 768-dim pgvector RAG boundaries",
        },
        align: "right",
        heading: "Architecture Teenage Builders Could Defend",
        paragraphs: [
          "Separating Next.js 16 streaming consumption from FastAPI retrieval orchestration and Supabase pgvector indexing gave first-time student engineers clear, legible boundaries—letting them trace every answer back to verified sources and defend their craft calmly before competition judges.",
        ],
      },
    ],
  },
  {
    id: "self-storage-platform",
    slug: "self-storage-platform",
    number: "05",
    title: "Self-Storage Platform",
    titleLines: ["Self-Storage", "Platform"],
    client: "Full-Stack Logistics",
    role: "Full-Stack Developer",
    services: ["React", "Spring Boot", "SQL Server", "REST API"],
    tags: ["React", "Spring Boot", "SQL Server", "REST API"],
    year: "2026",
    liveUrl: "https://github.com/damletuananh/swp391",
    summary:
      "Eighteen months connecting digital leasing to physical warehouse truth—unifying unit discovery, transparent duration pricing, and staff inventory workflows across React, Spring Boot, and SQL Server.",
    featured: true,
    layoutStyle: 5,
    primaryMedia: {
      imageSrc: "/media/projects/project-05.jpg",
      alt: "Modular brushed-steel louver storage compartments and travertine structural piers striped with daylight, an architectural study for Self-Storage Platform unit discovery and allocation",
    },
    caseStudyBlocks: [
      {
        type: "fullscreen169",
        media: {
          imageSrc: "/media/projects/wide-05.jpg",
          alt: "Daylight architectural pavilion framing folded brushed-steel panels and sculpted travertine arches inside a sunlit gallery, reflecting Self-Storage Platform bay logistics",
        },
        caption:
          "Built across 01/2025 – 08/2026 bridging customer bay discovery with live warehouse operations.",
      },
      {
        type: "text",
        heading: "Keeping Digital Leasing Honest With Floor State",
        paragraphs: [
          "Storage software stays invisible until a renter books a bay online that staff have already allocated on the warehouse floor. Built steadily from January 2025 through August 2026, this full-stack system binds public unit discovery directly to internal warehouse workflows.",
          "Customers compare bay dimensions, calculate duration pricing transparently, and initiate leases online, while warehouse staff manage allocations, check-ins, and turnover from one shared source of truth.",
        ],
      },
      {
        type: "imageText",
        media: {
          imageSrc: "/media/projects/project-05-detail.jpg",
          alt: "Twilight geometric concrete warehouse vaults and monumental columns lit by warm amber recessed slits under a dusk sky, evoking Self-Storage Platform Spring Boot and SQL Server durability",
        },
        align: "left",
        heading: "Where Domain Discipline Quietly Began",
        paragraphs: [
          "Modeling contracts, multi-tier durations, and role-scoped workflows inside SQL Server behind explicit Spring Boot REST controllers forced me to think beneath the surface UI—planting early roots for my late-2026 turn toward deliberate System Thinking.",
        ],
      },
    ],
  },
  {
    id: "undoredo-canvas",
    slug: "undoredo-canvas",
    number: "06",
    title: "UndoRedo Canvas",
    titleLines: ["UndoRedo", "Canvas"],
    client: "Open Source Engine",
    role: "Creator & Systems Engineer",
    services: ["Dual-Stack LIFO", "HTML5 Canvas", "Java", "O(1) State Engine"],
    tags: ["Java", "HTML5 Canvas", "Dual-Stack LIFO", "Algorithms"],
    year: "2025",
    liveUrl: "https://github.com/damletuananh/UndoRedo-Canvas",
    summary:
      "Making foundational data structures tactile: an interactive HTML5 Canvas sketching engine driven by a Dual-Stack (LIFO) Java state machine where every stroke, Undo, and Redo runs in O(1) time.",
    featured: true,
    layoutStyle: 6,
    primaryMedia: {
      imageSrc: "/media/projects/project-06.jpg",
      alt: "Sweeping midnight-indigo and amber ink brushstrokes on textured cotton rag paper beside stacked dark-blue and amber discs, an editorial metaphor for UndoRedo Canvas",
    },
    secondaryMedia: {
      imageSrc: "/media/projects/project-06-detail.jpg",
      videoSrc: "/media/videos/project-06.webm",
      alt: "Dual parallel vertical stacks of smooth dark-blue and amber pigment stones aligned on travertine beside cotton rag paper, symbolizing UndoRedo Canvas O(1) Dual-Stack LIFO history",
    },
    delaySecondary: 0.35,
    caseStudyBlocks: [
      {
        type: "fullscreen169",
        media: {
          imageSrc: "/media/projects/wide-06.jpg",
          videoSrc: "/media/videos/project-06.webm",
          alt: "Overhead canvas studio worktable pairing sweeping midnight-indigo and amber ink brushstrokes on cotton rag paper with dual parallel vertical stacks of dark-blue and amber pigment stones",
        },
        caption:
          "Constant-time O(1) Dual-Stack (LIFO) state invariants brought to life on HTML5 Canvas.",
      },
      {
        type: "text",
        heading: "Data Structures Your Hand Can Feel",
        paragraphs: [
          "Textbook stacks usually stay trapped in dry terminal printouts, hiding why strict invariants make creative tools feel instantaneous under your fingers. UndoRedo Canvas turns a pure Dual-Stack (LIFO) state machine into a sketching workspace you can test directly.",
          "Each committed stroke pushes onto the undo stack in O(1) time; stepping backward pops cleanly onto the redo stack; drawing a fresh mark mid-history clears invalidated future branches deterministically.",
        ],
      },
      {
        type: "imageText",
        media: {
          imageSrc: "/media/projects/project-06-detail.jpg",
          alt: "Dual parallel vertical stacks of dark-blue and amber pigment stones resting on travertine, illustrating UndoRedo Canvas deterministic LIFO Undo and Redo invariants",
        },
        align: "right",
        heading: "Calm Surfaces Start With Honest State",
        paragraphs: [
          "Bridging clean Java state modeling with immediate HTML5 Canvas rendering reinforced an enduring conviction: calm, predictable interfaces are never cosmetic—they emerge from clarity at the data layer underneath.",
        ],
      },
      {
        type: "split5050",
        left: {
          imageSrc: "/media/projects/project-06.jpg",
          alt: "Overhead studio sheet of sweeping midnight-indigo and amber ink brushstrokes on textured cotton rag paper beside stacked state discs",
        },
        right: {
          imageSrc: "/media/projects/project-06-detail.jpg",
          alt: "Overhead study of dual parallel vertical stacks of dark-blue and amber pigment stones on travertine",
        },
      },
    ],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
export const REGULAR_WORK_PROJECTS = PROJECTS.filter((p) => !p.featured);

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getNextProject(currentSlug: string): ProjectItem {
  const idx = PROJECTS.findIndex((p) => p.slug === currentSlug);
  return PROJECTS[(idx + 1) % PROJECTS.length];
}

export const CLIENTS: ClientRow[] = [
  {
    id: "m-webdev",
    name: "WebDev Adventure · 3rd Place",
    category: "3d",
    year: "05/2026",
    featured: true,
    tooltipLabel: "National Track · UIT VNU-HCM",
    tooltipNote:
      "3rd Place for SmartRoute—forecasting Ho Chi Minh City gridlock +15/+30/+60m ahead across 9,841 segments at 97.78% XGBoost accuracy.",
    url: "https://github.com/damletuananh",
  },
  {
    id: "m-seal",
    name: "SEAL Hackathon · 3-Term Streak",
    category: "brand",
    year: "2025–2026",
    featured: true,
    tooltipLabel: "QA Podium -> RAG -> IoT Safety",
    tooltipNote:
      "Fall 2025 Top 3 Agile QA (SEAL Underrate), Spring 2026 internal-only company RAG chatbot, and Summer 2026 WebSocket AI × IoT factory-floor safety.",
  },
  {
    id: "m-fptu",
    name: "FPT University HCMC · SE",
    category: "web",
    year: "2024–2028",
    featured: true,
    tooltipLabel: "B.Eng. Software Engineering",
    tooltipNote:
      "Accelerated 3-semester-per-year Software Engineering degree in Ho Chi Minh City (09/2024 – 12/2028 expected).",
  },
  {
    id: "m-fcode",
    name: "F-Code Tech Club",
    category: "web",
    year: "2024–Now",
    featured: true,
    tooltipLabel: "12-Year Student Engineering Club",
    tooltipNote:
      "Builder, workshop peer, and Bright Summer outreach contributor inside FPT University's oldest student tech club.",
  },
  {
    id: "m-brightsummer",
    name: "Bright Summer · AI Playroom",
    category: "motion",
    year: "08/2026",
    featured: true,
    tooltipLabel: "03–12/08/2026 · Mon & Wed, Thu Duc",
    tooltipNote:
      "3-phase F-Code × SiTiGroup campaign at Binh Tho Center (26a Street 13), sparking kids' wonder through a screen-interactive AI playroom.",
  },
  {
    id: "m-chichan",
    name: "ChiChan · Tech Mentor",
    category: "3d",
    year: "2026",
    featured: true,
    tooltipLabel: "National Research Mentorship",
    tooltipNote:
      "Mentored Giong Ong To High School students uniting WHO/CDC 768-dim pgvector RAG, Gemini SSE streaming, and empathetic human personas.",
    url: "https://github.com/damletuananh/chichan_platform",
  },
  {
    id: "m-umich",
    name: "Univ. of Michigan · UX Research",
    category: "brand",
    year: "10/2026",
    tooltipLabel: "Coursera Specializations (x2)",
    tooltipNote:
      "User Experience Research & Design (10/2026) and Web Design for Everybody (09/2025).",
  },
  {
    id: "m-hkust",
    name: "HKUST · Software Engineering",
    category: "web",
    year: "07/2026",
    tooltipLabel: "Coursera Specialization",
    tooltipNote:
      "Software Engineering Specialization from The Hong Kong University of Science and Technology.",
  },
  {
    id: "m-ibm",
    name: "IBM · Generative AI",
    category: "3d",
    year: "06/2026",
    tooltipLabel: "Coursera Specializations (x2)",
    tooltipNote:
      "Generative AI Fundamentals (06/2026) and Generative AI for Executives & Business Leaders (05/2026).",
  },
  {
    id: "m-duke",
    name: "Duke & UCSD · OOP Java",
    category: "web",
    year: "01/2026",
    tooltipLabel: "Coursera Specialization",
    tooltipNote:
      "Object Oriented Programming in Java Specialization from Duke University & UC San Diego.",
  },
  {
    id: "m-thuduc",
    name: "Thu Duc Youth Coding · 2nd Prize",
    category: "brand",
    year: "06/2022",
    featured: true,
    tooltipLabel: "Age 16 · District Olympiad",
    tooltipNote:
      "2nd Prize at the Thu Duc City Youth Informatics Olympiad representing newly established Duong Van Thi High School.",
  },
  {
    id: "m-stem",
    name: "High School STEM Co-Founder",
    category: "motion",
    year: "2022–2023",
    tooltipLabel: "Grades 10–11 · Over 1 Year",
    tooltipNote:
      "Entrusted to co-found Duong Van Thi High School's inaugural STEM/STEAM club, coaching city robotics & autonomous car teams.",
  },
  {
    id: "m-community",
    name: "Temple Kitchen & Mobile Militia",
    category: "brand",
    year: "2022–Now",
    tooltipLabel: "Grounded Away From Screens",
    tooltipNote:
      "Preparing free community temple meals on lunar full moons & holidays (01/2022–Now) alongside neighborhood mobile militia patrols (04/2025–Now).",
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: "srv-frontend",
    number: "01",
    title: "Frontend & Interactive WebGL",
    description:
      "Calm, tactile React and Next.js interfaces tuned for responsive legibility, fluid motion, and viewport-bounded spatial data at 60 FPS.",
    items: [
      "Next.js 15 / 16 & React",
      "TypeScript & Tailwind CSS",
      "MapLibre GL Vector Maps",
      "Viewport-Bounded Rendering",
    ],
  },
  {
    id: "srv-backend",
    number: "02",
    title: "Backend & System Boundaries",
    description:
      "Decoupled APIs, honest domain state, and relational plus vector stores designed so future engineers can extend systems without fear.",
    items: [
      "FastAPI & Spring Boot",
      "PostgreSQL, pgvector & SQL Server",
      "Supabase Auth & Storage",
      "REST Schemas & WebSocket Telemetry",
    ],
  },
  {
    id: "srv-ai",
    number: "03",
    title: "Applied AI, RAG & Sensor Agents",
    description:
      "Grounded retrieval pipelines, empathetic conversational personas, and real-time hardware telemetry constrained by strict verification boundaries.",
    items: [
      "768-dim pgvector Semantic RAG",
      "Multi-Agent & Persona Design",
      "Gemini SSE & OpenRouter / Claude",
      "XGBoost <2ms & IoT Actuators",
    ],
  },
  {
    id: "srv-qa",
    number: "04",
    title: "QA Automation & Mentorship",
    description:
      "Deterministic Playwright checks, $0-discipline AI reasoning audits, and patient mentorship that turns younger students into independent builders.",
    items: [
      "Playwright Multi-Viewport QA",
      "Strict JSON Schema Guardrails",
      "$0-Cost AI Reasoning Audits",
      "Student & Outreach Mentorship",
    ],
  },
];

export const ABOUT_CONTENT: AboutContentData = {
  title: "About",
  headerSplit: { left: "TUAN", right: "ANH" },
  headerCenterNote:
    "Full-Stack Developer & System Thinker at FPT University HCMC — building calm architecture, applied AI & tactile craft.",
  tags: [
    "/Software Engineering",
    "/System Thinking",
    "/Applied AI",
    "/Ho Chi Minh City",
  ],
  introParagraph:
    "Born in 2006—the Year of the Dog—Dam Le Tuan Anh carries his childhood nickname \"Cún\" and the Vietnamese grass dog emblem into Software Engineering at FPT University Ho Chi Minh City (09/2024 – 12/2028), building calm, resilient systems with quiet care.",
  sinceHeadline:
    "From post-lockdown curiosity to system thinking—software matures the day clarity comes before speed.",
  bodyParagraphs: [
    "At home my parents called me \"Cún,\" and both family and teachers knew the same steady traits: respectful, polite, quick-witted, and eager to learn. At fifteen, entering Duong Van Thi High School's third cohort in Thu Duc City as post-COVID classes reopened in early 2022, that alertness kept me pulling apart open HTML, CSS, JavaScript, ReactJS, Tailwind CSS, AngularJS, and Bootstrap templates before formal theory—rebuilding designs just to watch how interfaces breathed. By June 2022, at sixteen, winning 2nd Prize at the Thu Duc City Youth Informatics Olympiad anchored that visual wonder in real algorithmic footing.",
    "Seeing promise in a small circle of us, our Informatics teacher trusted us to co-found the school's very first STEM/STEAM club (01/2022 – 05/2023), rallying teammates into citywide robotics and autonomous-vehicle contests to put a young school on the map. Then Grade 12 brought the hardest trade-off of my teens. Coding was what I loved most, yet Informatics did not count toward core university entrance admissions at the time—so I stepped off the Informatics roster to join the Chemistry Olympiad team, choosing the long horizon over immediate attachment.",
    "Arriving at FPT University Ho Chi Minh City in September 2024—on an intense three-semester-per-year calendar and inside its twelve-year-old F-Code technical club—dropped me straight into the first wave of ChatGPT and Cursor IDE. Rather than surrendering thought to autocomplete, I built a habit of letting the AI agent attempt even tiny bugs I already knew how to fix, tracing its reasoning step by step until I caught its smallest blind spots and turned prompt discipline into reliable workflows often costing $0.",
    "That discipline carried me through three consecutive seasons of the Software Engineering Agile League (SEAL), hosted by the Software Engineering Department and Student Affairs Office (CTSV) at FPT University HCMC. On 01–02/11/2025 (Fall 2025, \"AI Agents for Software Innovation\"), Team UNDERATE won 3rd Place (Top 3 Finalist) in Agile QA with SEAL Underrate (Next.js, Playwright, and three schema-locked agents). Spring 2026 (11–12/04/2026, \"Mastering Domain-Specific AI RAG Systems\") narrowed focus to an internal employee AI chatbot strictly constrained to verified company documents via RAG; Summer 2026 (15–16/08/2026, \"AI-Driven Smart Operations: Turning Real-Time IoT Data into Intelligent Actions\") streamed real-time WebSocket telemetry (temperature, humidity, and smoke) into factory equipment safety AI agents to modulate IoT actuators before hazards escalated, earning three-season SEAL completion honors. Between them, SmartRoute—forecasting 9,841 Ho Chi Minh City segments at 97.78% XGBoost accuracy and 60 FPS—took 3rd Place at WebDev Adventure (05/2026).",
    "Those two unrewarded hackathons forged what mattered next: mentoring Giong Ong To High School students on ChiChan (01/2026 – 10/2026), grounding WHO/CDC guidance in 768-dim pgvector RAG while shaping Gemini SSE agents into empathetic personas teenagers trust. Every Monday and Wednesday of Bright Summer (08/2026) at Binh Tho Center (26a Street 13, Thu Duc), an F-Code × SiTiGroup interactive AI playroom brought that care to children. That affectionate, warmhearted instinct to help wherever needed holds steady away from screens too—across lunar full-moon temple kitchens (01/2022 – Present) and mobile militia holiday patrols (04/2025 – Present).",
    "Today, backed by seven completed Coursera Specializations across Software Engineering (HKUST), UX Research and Web Design (Michigan), Java OOP (Duke & UC San Diego), Generative AI (IBM), and Academic Inquiry (Sydney), I am making my clearest pivot yet: walking away from the habit of shipping a working screen at any price while leaving a chaotic battlefield behind the scenes—and committing instead to clean boundaries, honest abstractions, and durable systems a real team can trust.",
  ],
  awwwardsHeading: "7X COURSERA",
  awwwardsCopy:
    "Seven completed Coursera Specializations anchoring competition velocity in software engineering discipline, UX research, Java OOP, and applied generative AI.",
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "tl-dvt-hs",
    period: "09/2021 – 05/2024",
    title: "Duong Van Thi High School (Cohort #3)",
    context:
      "Entered the third graduating cohort of a newly built public high school in Thu Duc City, joining its Competitive Informatics squad while campus traditions were still taking shape.",
    category: "education",
  },
  {
    id: "tl-web-spark",
    period: "01/2022 – 05/2022",
    title: "Self-Taught Web Curiosity",
    context:
      "Grade 10 Term 2 post-COVID return: learned HTML, CSS, and JavaScript independently, dissecting and reshaping ReactJS, Tailwind CSS, AngularJS, and Bootstrap templates to see how software breathed.",
    category: "engineering",
  },
  {
    id: "tl-stem-club",
    period: "01/2022 – 05/2023",
    title: "Inaugural STEM/STEAM Co-Founder",
    context:
      "Entrusted by our Informatics teacher to co-found the young school's very first STEM/STEAM club, coaching teammates into citywide robotics and autonomous-vehicle contests for over a year.",
    highlight: "Co-Founder",
    category: "community",
  },
  {
    id: "tl-temple-kitchen",
    period: "01/2022 – Present",
    title: "Temple Kitchen Volunteering",
    context:
      "Joining friends, monks, and local donors on lunar full moons and major holidays to cook and serve free meals across the community—keeping care tangible away from keyboards.",
    category: "community",
  },
  {
    id: "tl-thuduc-olympiad",
    period: "06/2022",
    title: "Thu Duc City Youth Informatics",
    context:
      "Won district algorithmic podium at age sixteen representing newly founded Duong Van Thi High School—proving computer science fundamentals matched late-night UI curiosity.",
    highlight: "2nd Prize",
    category: "award",
  },
  {
    id: "tl-chem-pivot",
    period: "09/2023 – 05/2024",
    title: "Grade 12 Chemistry Olympiad Pivot",
    context:
      "Stepped off the Informatics squad I loved to join the Chemistry Olympiad team when admissions excluded Informatics—choosing long-term horizon over short-term attachment.",
    highlight: "Heart vs. Horizon",
    category: "education",
  },
  {
    id: "tl-fptu-se",
    period: "09/2024 – 12/2028",
    title: "FPT University HCMC — B.Eng. SE",
    context:
      "Began Software Engineering at eighteen on FPT's relentless three-semester-per-year Fall-Spring-Summer calendar (expected graduation 12/2028).",
    highlight: "3 Terms / Yr",
    category: "education",
  },
  {
    id: "tl-fcode",
    period: "09/2024 – Present",
    title: "F-Code Technical Club",
    context:
      "Found peer builders inside FPT University's twelve-year-old student tech club—growing through late-night reviews, technical sharing, and community engineering builds.",
    category: "community",
  },
  {
    id: "tl-ai-craft",
    period: "09/2024 – 11/2026",
    title: "Wave 1 AI & $0 Cost Discipline",
    context:
      "Early ChatGPT and Cursor IDE adopter: even on bugs I already knew how to fix, I let agents attempt them first to reverse-engineer their blind spots—building reliable workflows near $0 spend.",
    category: "engineering",
  },
  {
    id: "tl-militia",
    period: "04/2025 – Present",
    title: "Local Mobile Militia",
    context:
      "Standing neighborhood holiday security patrols while others rest, assisting residents in need, and forging physical stamina and ironclad discipline outside screens.",
    highlight: "Civic Duty",
    category: "community",
  },
  {
    id: "tl-seal-fall",
    period: "01–02/11/2025",
    title: "SEAL Fall 2025 · Agile QA (Team UNDERATE)",
    context:
      "Opened a three-season Software Engineering Agile League (SEAL) streak hosted by FPTU HCMC's SE Dept & CTSV (theme: \"AI Agents for Software Innovation\")—leading Team UNDERATE's Next.js + Playwright multi-agent QA auditor (SEAL Underrate) to 3rd Place (Top 3 Finalist).",
    highlight: "Top 3 / 3rd",
    category: "award",
  },
  {
    id: "tl-seal-sprints",
    period: "11–12/04 & 15–16/08/2026",
    title: "SEAL Spring & Summer · RAG × IoT",
    context:
      "Spring 2026 (11–12/04/2026, \"Mastering Domain-Specific AI RAG Systems\") built an internal employee AI chatbot strictly constrained to verified company documents via RAG; Summer 2026 (15–16/08/2026, \"AI-Driven Smart Operations: Turning Real-Time IoT Data into Intelligent Actions\") streamed WebSocket temperature, humidity & smoke telemetry into factory equipment safety AI agents to modulate IoT actuators—honored at Summer 2026 for completing all three consecutive SEAL seasons.",
    highlight: "3-Season Streak",
    category: "engineering",
  },
  {
    id: "tl-chichan-mentor",
    period: "01/2026 – 10/2026",
    title: "Technical Mentor · ChiChan",
    context:
      "Crystallized SEAL RAG & agent lessons into mentoring Giong Ong To High School students on WHO/CDC 768-dim pgvector RAG + Gemini SSE streaming wrapped in empathetic personas teens trust.",
    highlight: "Tech Mentor",
    category: "community",
  },
  {
    id: "tl-webdev-adventure",
    period: "05/2026",
    title: "WebDev Adventure · UIT VNU-HCM",
    context:
      "Co-built SmartRoute predicting urban gridlock +15/+30/+60 minutes ahead across 9,841 Ho Chi Minh City road segments—97.78% XGBoost accuracy under 2ms inside a 60 FPS WebGL map.",
    highlight: "3rd Place",
    category: "award",
  },
  {
    id: "tl-bright-summer",
    period: "03–12/08/2026",
    title: "Bright Summer (Trao Em Sac Ha)",
    context:
      "Joined F-Code × SiTiGroup every Monday & Wednesday at Binh Tho Center (26a Street 13, Thu Duc) across 3 volunteer phases—shipping a playful interactive AI room for kids.",
    category: "community",
  },
  {
    id: "tl-system-thinking",
    period: "11/2026 – Present",
    title: "System Thinking Maturity",
    context:
      "Stepping intentionally away from shipping a working screen at any price while leaving chaos behind—toward clean abstractions, honest boundaries, and scalable systems teams trust.",
    highlight: "Current Focus",
    category: "engineering",
  },
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: "cert-umich-ux",
    date: "10/2026",
    title: "User Experience Research and Design Specialization",
    issuer: "University of Michigan",
    focus: "User research, usability testing & interaction design",
  },
  {
    id: "cert-hkust-se",
    date: "07/2026",
    title: "Software Engineering Specialization",
    issuer: "The Hong Kong University of Science and Technology",
    focus: "Software architecture, lifecycle modeling & testing",
  },
  {
    id: "cert-ibm-genai-fund",
    date: "06/2026",
    title: "Generative AI Fundamentals Specialization",
    issuer: "IBM",
    focus: "LLM mechanics, prompt reliability & applied AI workflows",
  },
  {
    id: "cert-ibm-genai-exec",
    date: "05/2026",
    title: "Generative AI for Executives and Business Leaders Specialization",
    issuer: "IBM",
    focus: "AI product viability, governance & operational impact",
  },
  {
    id: "cert-duke-java",
    date: "01/2026",
    title: "Object Oriented Programming in Java Specialization",
    issuer: "Duke University & UC San Diego",
    focus: "OOP architecture, data structures & clean Java design",
  },
  {
    id: "cert-umich-web",
    date: "09/2025",
    title:
      "Web Design for Everybody: Basics of Web Development & Coding Specialization",
    issuer: "University of Michigan",
    focus: "Semantic HTML, accessible CSS & responsive web fundamentals",
  },
  {
    id: "cert-usyd-acad",
    date: "05/2025",
    title: "Academic Skills for University Success Specialization",
    issuer: "The University of Sydney",
    focus: "Critical inquiry, structured research & technical communication",
  },
];

export const CONTACT_CONTENT: ContactContentData = {
  title: "Contact",
  tags: [
    "/Full-Stack",
    "/System Thinking",
    "/Applied AI",
    "/Ho Chi Minh City",
  ],
  introCopy:
    "Hiring a software engineering intern, shaping a full-stack or applied-AI product, or simply care about systems built to endure—leave a note.",
  questions: [
    {
      id: "name",
      question: "01 / What should I call you?",
      placeholder: "Your name or team",
      type: "text",
    },
    {
      id: "email",
      question: "02 / Where should I write back?",
      placeholder: "you@company.com",
      type: "email",
    },
    {
      id: "message",
      question: "03 / What are we building or exploring together?",
      placeholder:
        "Role, system challenge, timeline, or anything on your mind...",
      type: "textarea",
    },
  ],
  submitLabel: "Prepare Message",
  successMessage:
    "Your note is ready to fly. Send it straight to damletuananh123@gmail.com, or find my work on GitHub and LinkedIn anytime.",
};
