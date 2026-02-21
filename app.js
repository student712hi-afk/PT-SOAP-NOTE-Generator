const inputEl = document.getElementById('patientInput');
const outputEl = document.getElementById('output');

const caseSummaryEl = document.getElementById('caseSummary');
const assessmentsEl = document.getElementById('assessments');
const physicalExamEl = document.getElementById('physicalExam');
const redFlagsEl = document.getElementById('redFlags');

const soapSubjectiveEl = document.getElementById('soapSubjective');
const soapObjectiveEl = document.getElementById('soapObjective');
const soapAssessmentEl = document.getElementById('soapAssessment');
const soapPlanEl = document.getElementById('soapPlan');

const keywordProfiles = [
  {
    keywords: ['low back', 'lumbar', 'back pain', 'sciatica'],
    assessments: [
      'Oswestry Disability Index (ODI)',
      'Numeric Pain Rating Scale',
      'Patient-Specific Functional Scale (PSFS)',
    ],
    exams: [
      'Lumbar active range of motion and repeated movement testing',
      'Neuro screen: myotomes, dermatomes, reflexes',
      'SLR / slump neural tension tests when indicated',
      'Hip mobility and lumbopelvic control assessment',
    ],
    redFlags: [
      'New bowel/bladder dysfunction or saddle anesthesia',
      'Progressive neurologic weakness',
      'Unexplained weight loss, fever, history of cancer',
      'Major trauma or suspected fracture',
    ],
  },
  {
    keywords: ['neck', 'cervical', 'headache', 'whiplash'],
    assessments: [
      'Neck Disability Index (NDI)',
      'Numeric Pain Rating Scale',
      'Dizziness Handicap Inventory if dizziness is present',
    ],
    exams: [
      'Cervical AROM and symptom response',
      'Upper quarter neuro screen',
      'Deep neck flexor endurance and scapular control',
      'Vestibular/oculomotor screen when dizziness is reported',
    ],
    redFlags: [
      'Signs of cervical myelopathy (gait change, bilateral symptoms)',
      '5Ds/3Ns with vascular concern (diplopia, dysarthria, etc.)',
      'Unrelenting night pain or constitutional symptoms',
    ],
  },
  {
    keywords: ['knee', 'acl', 'meniscus', 'patella'],
    assessments: [
      'Lower Extremity Functional Scale (LEFS)',
      'Numeric Pain Rating Scale',
      'Activity-specific movement tolerance tracking',
    ],
    exams: [
      'Knee ROM, swelling, and gait analysis',
      'Strength testing for quadriceps/hamstrings/gluteals',
      'Ligament or meniscal cluster tests as indicated',
      'Functional tests: squat, step-down, sit-to-stand',
    ],
    redFlags: [
      'Hot swollen joint with fever (possible infection)',
      'Inability to weight-bear after acute trauma',
      'Calf pain/swelling with clot risk factors',
    ],
  },
  {
    keywords: ['shoulder', 'rotator cuff', 'impingement'],
    assessments: [
      'QuickDASH or DASH',
      'Numeric Pain Rating Scale',
      'Patient-Specific Functional Scale (PSFS)',
    ],
    exams: [
      'Shoulder AROM/PROM with symptom provocation',
      'Scapulothoracic rhythm and postural assessment',
      'Rotator cuff and biceps load tests',
      'Cervical clearing exam for referred symptoms',
    ],
    redFlags: [
      'Acute traumatic deformity/dislocation signs',
      'Neurologic compromise into the limb',
      'Unexplained night pain/systemic symptoms',
    ],
  },
];

const defaults = {
  assessments: [
    'Numeric Pain Rating Scale',
    'Patient-Specific Functional Scale (PSFS)',
    'Region-specific disability index relevant to chief complaint',
  ],
  exams: [
    'Observation, posture, and movement pattern analysis',
    'Active/passive ROM and symptom behavior',
    'Strength/resisted testing and functional movement tests',
    'Neurologic and special tests as clinically indicated',
  ],
  redFlags: [
    'Severe, progressive, or unexplained neurologic deficits',
    'Systemic symptoms (fever, unexplained weight loss, malaise)',
    'Signs of fracture, infection, vascular emergency, or cancer history concern',
    'Worsening unrelenting pain not modified by position/activity',
  ],
};

function inferProfile(text) {
  const lower = text.toLowerCase();
  const match = keywordProfiles.find((profile) =>
    profile.keywords.some((keyword) => lower.includes(keyword))
  );

  return {
    assessments: match?.assessments || defaults.assessments,
    exams: match?.exams || defaults.exams,
    redFlags: match?.redFlags || defaults.redFlags,
  };
}

function extractSignals(text) {
  const painScore = text.match(/\b([0-9]|10)\/?10\b/);
  const duration = text.match(
    /\b\d+\s*(day|days|week|weeks|month|months|year|years)\b/i
  );
  const aggravating = text.match(
    /(worse with|aggravated by|increases with)\s+([^\.;\n]+)/i
  );
  const easing = text.match(
    /(better with|relieved by|eases with)\s+([^\.;\n]+)/i
  );

  return {
    painScore: painScore?.[0],
    duration: duration?.[0],
    aggravating: aggravating?.[2]?.trim(),
    easing: easing?.[2]?.trim(),
  };
}

function renderList(el, items) {
  el.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    el.appendChild(li);
  });
}

function buildSummary(text, signals) {
  const oneLiner = text.split(/\n+/)[0].slice(0, 180);
  const parts = [
    `Primary concern captured from interview: ${oneLiner || 'No details provided.'}`,
  ];

  if (signals.duration) parts.push(`Reported duration: ${signals.duration}.`);
  if (signals.painScore) parts.push(`Pain intensity noted: ${signals.painScore}.`);
  if (signals.aggravating)
    parts.push(`Aggravating factors include ${signals.aggravating}.`);
  if (signals.easing) parts.push(`Easing factors include ${signals.easing}.`);

  parts.push('Prioritize function-limiting activities, goals, and safety screening.');
  return parts.join(' ');
}

function buildSoap(text, signals, profile) {
  const subjective = [
    'Patient-reported history transcribed from interview.',
    signals.duration ? `Symptoms ongoing for ${signals.duration}.` : null,
    signals.painScore ? `Pain reported at ${signals.painScore}.` : null,
    signals.aggravating ? `Worse with ${signals.aggravating}.` : null,
    signals.easing ? `Improved with ${signals.easing}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const objective = `Plan objective exam around observed movement, ROM, strength, and relevant regional/neuro testing. Suggested starting exams: ${profile.exams
    .slice(0, 2)
    .join('; ')}.`;

  const assessment =
    'Presentation appears mechanically influenced based on interview context, pending full objective testing. Differential considerations and irritability level should be refined after exam.';

  const plan = `Perform prioritized tests (${profile.assessments
    .slice(0, 2)
    .join(', ')}), complete red-flag screen, set measurable functional goals, and begin individualized treatment/education based on exam findings.`;

  return { subjective, objective, assessment, plan };
}

document.getElementById('generateBtn').addEventListener('click', () => {
  const text = inputEl.value.trim();
  if (!text) {
    alert('Please enter patient conversation notes first.');
    return;
  }

  const signals = extractSignals(text);
  const profile = inferProfile(text);

  caseSummaryEl.textContent = buildSummary(text, signals);
  renderList(assessmentsEl, profile.assessments);
  renderList(physicalExamEl, profile.exams);
  renderList(redFlagsEl, profile.redFlags);

  const soap = buildSoap(text, signals, profile);
  soapSubjectiveEl.textContent = soap.subjective;
  soapObjectiveEl.textContent = soap.objective;
  soapAssessmentEl.textContent = soap.assessment;
  soapPlanEl.textContent = soap.plan;

  outputEl.classList.remove('hidden');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  inputEl.value = '';
  outputEl.classList.add('hidden');
});
