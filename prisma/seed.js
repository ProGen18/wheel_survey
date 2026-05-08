const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');

const prisma = new PrismaClient();

const LANG_PREFIX = { fr: 'FR', en: 'EN', ru: 'RU', zh: 'ZH' };

function makeCode(lang = 'fr') {
  const prefix = LANG_PREFIX[lang] || 'FR';
  return `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function createRespondent({ parentId = null, lang = 'fr', filterValue = 'reg', completed = true, data = {} }) {
  const node = await prisma.referralNode.create({
    data: {
      code: makeCode(lang),
      nodeType: 'RESPONDENT',
      lang,
      parentId,
    },
  });
  await prisma.surveyResponse.create({
    data: {
      nodeId: node.id,
      sessionToken: makeToken(),
      completedAt: completed ? new Date() : null,
      filterValue,
      ...data,
    },
  });
  return node;
}

async function main() {
  console.log('🧹 Resetting tables...');
  await prisma.surveyResponse.deleteMany({});
  await prisma.referralNode.deleteMany({});

  const now = Date.now();
  const expiresIn30 = new Date(now + 30 * 86400000);
  const expiredYesterday = new Date(now - 86400000);

  console.log('👤 Creating influencers...');
  const alice = await prisma.referralNode.create({
    data: { code: 'INFLU_ALICE', nodeType: 'INFLUENCER', label: 'Alice (YouTube FR)', lang: 'fr', visitCount: 47 },
  });
  const bob = await prisma.referralNode.create({
    data: { code: 'INFLU_BOB', nodeType: 'INFLUENCER', label: 'Bob (Reddit EN)', lang: 'en', expiresAt: expiresIn30, visitCount: 23 },
  });
  const chen = await prisma.referralNode.create({
    data: { code: 'INFLU_CHEN', nodeType: 'INFLUENCER', label: 'Chen (Bilibili ZH)', lang: 'zh', visitCount: 19 },
  });
  await prisma.referralNode.create({
    data: { code: 'INFLU_OLD', nodeType: 'INFLUENCER', label: 'Old campaign (expired)', lang: 'fr', expiresAt: expiredYesterday, visitCount: 8 },
  });
  await prisma.referralNode.create({
    data: { code: 'INFLU_REVOKED', nodeType: 'INFLUENCER', label: 'Revoked manually', lang: 'fr', isActive: false, visitCount: 3 },
  });

  console.log('📋 Creating respondents...');

  const fullProfile = {
    discovChannels: ['Friends', 'YouTube'],
    socialExposure: 'oui',
    adoptYear: 2022,
    acquisitionMode: 'neuf',
    priceCat: '1500-2500',
    adoptDelay: '3-6m',
    discount: 'non',
    learningTime: '5-10h',
    tutorials: 'oui',
    learningDifficulty: 2,
    weeklyDistance: '50-100km',
    mainUse: 'commute',
    transportReplace: 'voiture',
    carAccess: 'oui',
    comparison: { faster: 2, flexible: 2, convenient: 1, safer: 1, eco: 2, value: 2 },
    limitingFactors: { price: 2, learning: 1, safety: 2, regulation: 3, infrastructure: 2 },
    protections: ['casque', 'genoulleres'],
    regulationStatus: 'tolere',
    regulationInfluence: 'modere',
    regulationRenounced: 'non',
    socialCircle: '1-2',
    groupRides: 'parfois',
    onlineCommunity: 'oui',
    hedonic: { pleasure: 2, stimulation: 2, joy: 2 },
    instrumental: { proven: 1, risk: 2, breadth: 2 },
    socialMci: { discussion: 2, early: 1, peer: 2, community: 2 },
    symbolic: { personality: 2, image: 1, identity: 2, originality: 2 },
    cognitive: { complex: 2, time: 2, difficult: 2 },
    age: 28,
    gender: 'M',
    country: 'France',
    citySize: 'grande_agglo',
    occupation: 'salarie',
    income: '2000-3000',
  };

  const r1 = await createRespondent({ parentId: alice.id, lang: 'fr', filterValue: 'reg', data: fullProfile });
  const r2 = await createRespondent({ parentId: alice.id, lang: 'en', filterValue: 'occ', data: { ...fullProfile, age: 35, gender: 'F', country: 'United Kingdom', learningDifficulty: 1 } });
  const r3 = await createRespondent({ parentId: bob.id, lang: 'en', filterValue: 'curious', data: {
    discovChannels: ['Reddit'], socialExposure: 'non', age: 22, gender: 'M', country: 'United States', citySize: 'metropole',
    perception: { hard: 2, dangerous: 2, useful: 1, expensive: 2 },
    futureLikelihood: 'probable', barriers: ['prix', 'reglementation'],
    hedonic: { pleasure: 1, stimulation: 1, joy: 1 },
    instrumental: { proven: 2, risk: 1, breadth: 1 },
    socialMci: { discussion: 1, early: 1, peer: 1, community: 1 },
    symbolic: { personality: 1, image: 1, identity: 1, originality: 1 },
    cognitive: { complex: 1, time: 1, difficult: 1 },
  } });
  const r4 = await createRespondent({ parentId: bob.id, lang: 'ru', filterValue: 'never', data: { age: 45, gender: 'F', country: 'Russia', barriers: ['securite'] } });
  const r5 = await createRespondent({ parentId: chen.id, lang: 'zh', filterValue: 'reg', data: { ...fullProfile, age: 30, country: 'China', adoptYear: 2021, learningDifficulty: 1 } });
  const r6 = await createRespondent({ parentId: null, lang: 'fr', filterValue: 'ex', data: { ...fullProfile, age: 50, adoptYear: 2018, regulationRenounced: 'oui' } });

  console.log('   - 6 directs created');

  const r7 = await createRespondent({ parentId: r1.id, lang: 'fr', filterValue: 'curious', data: { age: 25, gender: 'F', country: 'France', perception: { hard: 1, dangerous: 2, useful: 2, expensive: 2 } } });
  const r8 = await createRespondent({ parentId: r1.id, lang: 'fr', filterValue: 'reg', data: { ...fullProfile, age: 32, country: 'Belgium', adoptYear: 2023 } });
  const r9 = await createRespondent({ parentId: r2.id, lang: 'en', filterValue: 'reg', data: { ...fullProfile, age: 40, country: 'United Kingdom' } });
  const r10 = await createRespondent({ parentId: r5.id, lang: 'zh', filterValue: 'reg', data: { ...fullProfile, age: 27, gender: 'F', country: 'China' } });

  console.log('   - 4 niveau 2 created');

  await createRespondent({ parentId: r7.id, lang: 'fr', filterValue: 'reg', data: { ...fullProfile, age: 33 } });
  await createRespondent({ parentId: r8.id, lang: 'fr', filterValue: 'occ', data: { ...fullProfile, age: 29, learningDifficulty: 3 } });
  await createRespondent({ parentId: r9.id, lang: 'en', filterValue: 'reg', data: { ...fullProfile, age: 24, country: 'Canada' } });

  console.log('   - 3 niveau 3 created');

  await createRespondent({
    parentId: alice.id,
    lang: 'fr',
    filterValue: 'reg',
    completed: false,
    data: { discovChannels: ['YouTube'], age: 30, socialExposure: 'oui' },
  });

  console.log('   - 1 brouillon (incomplete)');

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
