/**
 * FAB LAB CONTENT BANK — the single reviewable fact file.
 *
 * Every graded item is conceptual and sourced from the DAU semi curriculum.
 * Each item carries its source lesson id so a correction is a one-line edit.
 * No numeric-tolerance grading anywhere: multiple choice, ordering, mapping.
 */

export interface McqItem {
  /** Stable id — tests reference these. */
  id: string;
  /** DAU lesson this item was extracted from. */
  source: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  /** Shown after answering, win or lose. */
  why: string;
}

// ---------------------------------------------------------------------------
// Rayleigh / litho math — conceptual direction, not arithmetic drills
// ---------------------------------------------------------------------------

export const RAYLEIGH_ITEMS: McqItem[] = [
  {
    id: "ray-relation",
    source: "semi-rayleigh-10",
    prompt: "Which relation does the curriculum give for printable half-pitch?",
    choices: [
      "CD ≈ λ / (k1 · NA²)",
      "CD ≈ NA · λ / k1",
      "CD ≈ k1 · NA / λ",
      "CD ≈ k1 · λ / NA",
    ],
    answerIndex: 3,
    why: "Three knobs: wavelength, numerical aperture, and a process factor packing resist, illumination and tricks.",
  },
  {
    id: "ray-dof-bill",
    source: "semi-rayleigh-20",
    prompt: "You raise NA to buy a tighter pitch. What do you spend?",
    choices: [
      "k1, which rises toward its floor",
      "Depth of focus, falling roughly as λ / NA²",
      "Wavelength, which shortens to compensate",
      "Nothing — NA only helps",
    ],
    answerIndex: 1,
    why: "There is no knob that only helps: pitch bought as 1/NA is paid for in focus as 1/NA².",
  },
  {
    id: "ray-k1-floor",
    source: "semi-k1-10",
    prompt: "A briefing claims k1 = 0.15 on a SINGLE 193 nm exposure. The honest reading?",
    choices: [
      "Fine — k1 has no lower limit in imaging theory",
      "That NA must have been lowered to allow it",
      "Below the ~0.25 single-exposure floor — a second exposure is hiding somewhere",
      "A new resist record worth celebrating",
    ],
    answerIndex: 2,
    why: "Imaging theory will not let k1 fall much below ~0.25 for one exposure; pretending otherwise usually means multipatterning.",
  },
  {
    id: "ray-lambda-ladder",
    source: "semi-rayleigh-10",
    prompt: "Which ladder did the industry actually ride for decades before EUV?",
    choices: [
      "193 → 13.5 → 248 nm",
      "436 → 365 → 248 nm",
      "365 → 248 → 193 nm",
      "248 → 193 → 365 nm",
    ],
    answerIndex: 2,
    why: "The industry rode λ downhill (365 → 248 → 193), then spent NA and k1 because the next wavelength was late.",
  },
  {
    id: "ray-worked-pair",
    source: "semi-rayleigh-20",
    prompt: "193 nm at NA 0.93 with k1 0.31 gives CD ≈ 64 nm. Pushing to NA 1.35 gives roughly…",
    choices: [
      "32 nm CD and double the depth of focus",
      "the same CD with better uniformity",
      "110 nm CD",
      "44 nm CD and about half the depth of focus",
    ],
    answerIndex: 3,
    why: "CD ≈ 0.31 × 193 / 1.35 ≈ 44 nm while DoF falls from ~220 nm toward ~110 nm. You bought pitch, you spent height.",
  },
  {
    id: "ray-pitch-split",
    source: "semi-pitch-split-10",
    prompt: "A drawn 40 nm metal pitch was printed as two interleaved exposures. What pitch did each exposure see?",
    choices: [
      "160 nm",
      "80 nm",
      "40 nm",
      "20 nm",
    ],
    answerIndex: 1,
    why: "Two passes at twice the drawn pitch interleave to the union. Nobody exposed a 40 nm pitch.",
  },
  {
    id: "ray-lele-etch",
    source: "semi-multi-pattern-10",
    prompt: "Why is a plasma etch mandatory between multipatterning passes?",
    choices: [
      "The etch freezes pass 1 into a hard stencil pass 2 can sit beside",
      "It thins the resist so pass 2 fits the depth of focus",
      "It cleans organic contamination before recoat",
      "It raises NA for the second exposure",
    ],
    answerIndex: 0,
    why: "Expose-and-develop alone leaves a mess; the anisotropic etch turns each subset into hard geometry.",
  },
  {
    id: "ray-high-na-trade",
    source: "semi-high-na-10",
    prompt: "High-NA EUV pushes NA from 0.33 to 0.55. The curriculum's translation of 'reduces multipatterning'?",
    choices: [
      "Rayleigh is repealed for reflective columns",
      "193 nm leaves the factory flow entirely",
      "Some layers become single-exposure — paid for in focus slice, field size and stitch overlay",
      "Every layer on the wafer moves to the 0.55 tool",
    ],
    answerIndex: 2,
    why: "One purchased thing: single-exposure pitch on a specific layer family. Not every layer, not a repeal.",
  },
];

// ---------------------------------------------------------------------------
// Yield economics + defect classes
// ---------------------------------------------------------------------------

export const YIELD_ITEMS: McqItem[] = [
  {
    id: "yield-poisson-direction",
    source: "semi-yield-model-10",
    prompt: "Under Y ≈ e^(−A·D), you double die area at constant defect density D. What happens?",
    choices: [
      "Yield is unchanged — only D matters",
      "Yield doubles",
      "Yield falls exactly by half",
      "Yield falls more than proportionally once you are off the small-A plateau",
    ],
    answerIndex: 3,
    why: "The exponential punishes area faster than linearly off the plateau — why a huge monolithic die can look brilliant in a slide and die in a fab.",
  },
  {
    id: "yield-clustering",
    source: "semi-yield-model-10",
    prompt: "Real defects cluster. What does that do to the simple Poisson model?",
    choices: [
      "Makes it exact",
      "Makes it pessimistic",
      "Turns it into a linear model",
      "Makes it optimistic — clustered killers hurt more than the exponential predicts",
    ],
    answerIndex: 3,
    why: "Poisson is a start, not a religion: clustering plus critical-area effects make the simple exponential optimistic.",
  },
  {
    id: "yield-layer-product",
    source: "semi-yield-model-10",
    prompt: "Five independent layers each limit yield to 0.95. The combined layer-limited yield is…",
    choices: [
      "0.95 plus a small bonus",
      "0.95 divided by five",
      "well below 0.95 — the product of several 0.95s",
      "exactly 0.95",
    ],
    answerIndex: 2,
    why: "Layer-limited yields multiply: the product of several 0.95s is not 0.95.",
  },
  {
    id: "yield-class-particle",
    source: "semi-defect-class-10",
    prompt: "Inline review finds lumps shadowing features across random die. Name the class and where it points.",
    choices: [
      "Parametric miss — furnaces and implanters",
      "Overlay error — alignment marks",
      "Particle — cleans, loaders, dirty depositions",
      "Pattern defect — lithography or etch",
    ],
    answerIndex: 2,
    why: "Particles point at cleans, loaders, and dirty depositions. Name the class before you name the tool.",
  },
  {
    id: "yield-class-parametric",
    source: "semi-defect-class-10",
    prompt: "Every die on the wafer measures 80 mV high. No particles found. The class?",
    choices: [
      "Particle — hunt the clean",
      "Pattern defect — rework the reticle",
      "Random killer — accept the loss",
      "Parametric miss — furnaces, implanters, or metrology that missed a drift",
    ],
    answerIndex: 3,
    why: "Recleaning a furnace because every die is 80 mV high is the wrong class; parametric misses point at knobs, not lumps.",
  },
  {
    id: "yield-class-pattern",
    source: "semi-defect-class-10",
    prompt: "Bridges and mousebites appear exactly where the drawing was densest. The class points at…",
    choices: [
      "Lithography, etch, sometimes CMP scratches that print",
      "Bond-pad metals",
      "The well implant",
      "Wafer crystal growth",
    ],
    answerIndex: 0,
    why: "Pattern defects are features that are not what the mask asked for — they point at litho, etch, and printing CMP scratches.",
  },
  {
    id: "yield-cost-wafer",
    source: "semi-cost-per-wafer-10",
    prompt: "A layer prints legally but only at a dose that halves scanner WPH. The cost consequence?",
    choices: [
      "Roughly doubles that layer's scanner bill",
      "No cost impact if yield holds",
      "Halves the bill — fewer wafers, less wear",
      "Only affects the resist budget",
    ],
    answerIndex: 0,
    why: "Depreciation per hour divided by wafers per hour is cost per wafer; halve WPH and you double the bill.",
  },
];

// ---------------------------------------------------------------------------
// Unit-process literacy
// ---------------------------------------------------------------------------

export const IDENTIFY_ITEMS: McqItem[] = [
  {
    id: "id-cvd",
    source: "semi-cvd-10",
    prompt: "A trench must be LINED with film on its sidewalls, not just sprinkled from above. Which deposition family?",
    choices: [
      "CMP",
      "Wet etch",
      "CVD — gas precursors react at the surface, conformally",
      "PVD — line-of-sight atoms",
    ],
    answerIndex: 2,
    why: "CVD is the one you reach for when a trench must be lined; slow reaction relative to arrival keeps coverage conformal.",
  },
  {
    id: "id-pvd-keyhole",
    source: "semi-pvd-10",
    prompt: "Sputtering into a high-aspect-ratio hole leaves a starved bottom and closing overhangs. That failure is called…",
    choices: [
      "An open silicide",
      "A keyhole",
      "A mousebite",
      "Dishing",
    ],
    answerIndex: 1,
    why: "Line-of-sight arrival thickens top corners, starves the bottom — PVD is a catcher's mitt, not a chemist.",
  },
  {
    id: "id-cmp-purpose",
    source: "semi-cmp-10",
    prompt: "Why does the lithography course claim CMP as its own input?",
    choices: [
      "CMP replaces etch for dense lines",
      "CMP grows the gate oxide flat",
      "Flatness is what the lens is given — a hill and a valley cannot share one depth-of-focus slice",
      "CMP polishes the reticle before exposure",
    ],
    answerIndex: 2,
    why: "Chemistry weakens high spots, the pad wipes them; leftover topography makes a later exposure print one feature and blur its neighbour.",
  },
  {
    id: "id-silicide",
    source: "semi-silicide-10",
    prompt: "What is a silicide, and why bother?",
    choices: [
      "A compound the chosen metal forms WITH silicon — low-resistance contact without a leaky raw meeting",
      "A deposited liner that blocks copper diffusion",
      "The photoresist used on polysilicon gates",
      "An isolation tub for the MOSFET body",
    ],
    answerIndex: 0,
    why: "TiSi2, CoSi2, NiSi — formed by reaction, blocked by native oxide, spiked by too much heat. Salicide uses a spacer to self-align it.",
  },
  {
    id: "id-gate-stack",
    source: "semi-gate-stack-10",
    prompt: "In the classical gate stack, which film is GROWN and which is DEPOSITED?",
    choices: [
      "Both grown — the furnace does the whole stack",
      "Dielectric grown from the wafer; electrode deposited on top",
      "Electrode grown; dielectric deposited",
      "Both deposited — nothing is grown after the well",
    ],
    answerIndex: 1,
    why: "You grow the insulator on silicon (thin, clean interface, silicon consumed on purpose) and deposit the plate that biases the channel.",
  },
  {
    id: "id-contamination-cu",
    source: "semi-contamination-10",
    prompt: "Copper's standing in a fab, in one sentence?",
    choices: [
      "A legal conductor in the back end and a lifetime killer if it reaches a gate-oxidation furnace",
      "Illegal everywhere since aluminium won",
      "Safe anywhere because barriers contain it completely",
      "Only dangerous in bond pads",
    ],
    answerIndex: 0,
    why: "Tools are segregated by material: front-end furnaces never see copper wafers; Cu polish lives in its own aisle.",
  },
  {
    id: "id-euv-source",
    source: "semi-euv-source-10",
    prompt: "The industrial 13.5 nm source is…",
    choices: [
      "A mercury arc lamp filtered to 13.5 nm",
      "A free-electron laser in the basement",
      "Synchrotron radiation piped to each tool",
      "A CO2 laser striking tin droplets tens of thousands of times a second — a pulsed tin plasma",
    ],
    answerIndex: 3,
    why: "The collector gathers a fraction of the plasma emission; useful output is the photons that survive to the wafer, per second.",
  },
  {
    id: "id-euv-mirrors",
    source: "semi-euv-mirrors-10",
    prompt: "Six Bragg-mirror bounces at ~65% reflectivity each leave roughly what fraction of the light?",
    choices: [
      "About 65%",
      "About 40%",
      "Nearly all of it",
      "About 8%",
    ],
    answerIndex: 3,
    why: "Each bounce keeps maybe two-thirds; six bounces is about 8% through — which is why source power is a throughput budget.",
  },
  {
    id: "id-euv-vacuum",
    source: "semi-euv-vacuum-10",
    prompt: "Why does the entire EUV optical path live in vacuum?",
    choices: [
      "To keep the tin droplets from oxidising mid-flight",
      "For vibration isolation of the stages",
      "Regulatory cleanliness requirement only",
      "A few millimetres of air swallow 13.5 nm — vacuum is the medium the photons travel in",
    ],
    answerIndex: 3,
    why: "Absorption is molecular, not a cleanliness slogan; a vented beam path eats dose at the wafer.",
  },
  {
    id: "id-resist",
    source: "semi-resist-10",
    prompt: "Photoresist, in the curriculum's phrase, is…",
    choices: [
      "A solubility switch",
      "A hardness standard",
      "A planarization blanket",
      "A dopant carrier",
    ],
    answerIndex: 0,
    why: "Exposure flips its solubility so develop can turn the aerial image into a physical stencil.",
  },
];

// ---------------------------------------------------------------------------
// Process sequence — the integration order from semi-integration-10
// ---------------------------------------------------------------------------

export interface SequenceStep {
  id: string;
  name: string;
  why: string;
}

export const SEQUENCE_STEPS: SequenceStep[] = [
  {
    id: "isolation",
    name: "Isolation — define the active islands",
    why: "First, so neighbours cannot share a channel.",
  },
  {
    id: "wells",
    name: "Wells — implant the body",
    why: "Each island needs its body before anything sits on it.",
  },
  {
    id: "gate",
    name: "Gate oxide + electrode",
    why: "Grown then deposited — and it self-aligns everything implanted after it.",
  },
  {
    id: "sd",
    name: "Source/drain implants",
    why: "Placed against the gate edge, which is why the gate went first.",
  },
  {
    id: "silicide",
    name: "Silicide + contacts",
    why: "After the LAST high heat — a metal that sees a furnace spikes or melts.",
  },
];

/** Free-mode explorer: no grading, just the wafer speaking. */
export const FREE_HINT =
  "Pick a die size and a defect density. The map redraws from a seeded draw; watch good die fall faster than area grows.";
