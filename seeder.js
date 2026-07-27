const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();
connectDB();

const users = [
  {
    name: 'Admin GostMood Creative Lab',
    email: 'admin@soundmarket.com',
    password: 'admin1234',
    role: 'admin',
    sellerInfo: { storeName: 'GostMood Creative Lab Official', isApproved: true }
  }
];

const getProducts = (adminId) => [
  // INSTRUMENTAUX
  {
    seller: adminId,
    name: 'Dark Trap Beat "Midnight"',
    description: 'Beat Trap sombre et puissant avec des 808 profonds. Ideal pour le rap francais et l\'afro trap. Livraison instantanee apres achat.',
    price: 29.99,
    category: 'instrumental',
    subcategory: 'Trap',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isDigital: true,
    genre: 'Trap',
    bpm: 140,
    musicalKey: 'Dm',
    license: 'Basique',
    isFeatured: true,
    stock: 9999,
    rating: 4.5,
    numReviews: 12
  },
  {
    seller: adminId,
    name: 'Afrobeats Vibe "Lagos Nights"',
    description: 'Instrumental Afrobeats ensoleillee avec des percussions africaines authentiques et une melodie accrocheuse. Parfait pour vos freestyles et projets musicaux.',
    price: 24.99,
    category: 'instrumental',
    subcategory: 'Afrobeats',
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=300&fit=crop',
    isDigital: true,
    genre: 'Afrobeats',
    bpm: 102,
    musicalKey: 'Gm',
    license: 'Basique',
    isFeatured: true,
    stock: 9999,
    rating: 4.8,
    numReviews: 20
  },
  {
    seller: adminId,
    name: 'R&B Smooth "Velvet Touch"',
    description: 'Beat R&B doux et sensuel avec des cordes elegantes. Convient parfaitement pour des chansons d\'amour ou des projets neo-soul.',
    price: 34.99,
    category: 'instrumental',
    subcategory: 'R&B',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop',
    isDigital: true,
    genre: 'R&B',
    bpm: 88,
    musicalKey: 'Fm',
    license: 'Premium',
    isFeatured: false,
    stock: 9999,
    rating: 4.3,
    numReviews: 8
  },
  {
    seller: adminId,
    name: 'Drill Beat "UK Pressure"',
    description: 'Beat Drill style UK avec des slides de guitare caracteristiques et une basse lourde. Exclusif et non partage.',
    price: 79.99,
    category: 'instrumental',
    subcategory: 'Drill',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
    isDigital: true,
    genre: 'Drill',
    bpm: 145,
    musicalKey: 'Cm',
    license: 'Exclusif',
    isFeatured: true,
    stock: 9999,
    rating: 5.0,
    numReviews: 5
  },
  {
    seller: adminId,
    name: 'Pop Electronic "Neon City"',
    description: 'Instrumental electro-pop moderne avec des synthetiseurs brillants. Ideal pour des artistes pop ou des publicites.',
    price: 19.99,
    category: 'instrumental',
    subcategory: 'Pop',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop',
    isDigital: true,
    genre: 'Pop',
    bpm: 128,
    musicalKey: 'Am',
    license: 'Basique',
    isFeatured: false,
    stock: 9999,
    rating: 4.1,
    numReviews: 15
  },
  // MATERIEL
  {
    seller: adminId,
    name: 'Focusrite Scarlett 2i2 4th Gen',
    description: 'Interface audio USB professionnelle 2 entrees / 2 sorties. Preamplis de qualite studio, latence ultra-faible. Ideal pour enregistrer des vocaux et instruments.',
    price: 159.99,
    category: 'equipment',
    subcategory: 'Carte son',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Focusrite',
    stock: 15,
    isFeatured: true,
    rating: 4.9,
    numReviews: 45
  },
  {
    seller: adminId,
    name: 'Audio-Technica AT2020',
    description: 'Microphone a condensateur cardioide de qualite studio. Reponse en frequence etendue, faible bruit de fond. Le micro de reference pour l\'enregistrement vocal.',
    price: 99.99,
    category: 'equipment',
    subcategory: 'Microphone',
    image: 'https://images.unsplash.com/photo-1478737270197-f28ba0f37e63?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Audio-Technica',
    stock: 25,
    isFeatured: true,
    rating: 4.7,
    numReviews: 67
  },
  {
    seller: adminId,
    name: 'Yamaha HS8 Studio Monitor',
    description: 'Enceinte de monitoring active 8 pouces. Reponse en frequence plate et neutre pour un mixage precis. La reference des studios d\'enregistrement.',
    price: 349.99,
    category: 'equipment',
    subcategory: 'Enceinte',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Yamaha',
    stock: 8,
    isFeatured: true,
    rating: 4.8,
    numReviews: 33
  },
  {
    seller: adminId,
    name: 'Sony MDR-7506 Casque Studio',
    description: 'Casque de monitoring professionnel. Reponse en frequence 10Hz-20kHz, impedance 63 ohms. Utilise dans les studios du monde entier depuis 30 ans.',
    price: 89.99,
    category: 'equipment',
    subcategory: 'Casque',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Sony',
    stock: 30,
    isFeatured: false,
    rating: 4.6,
    numReviews: 89
  },
  {
    seller: adminId,
    name: 'Shure SM7B Microphone Vocal',
    description: 'Le microphone dynamique prefere des podcasteurs et chanteurs professionnels. Rejet des bruits environnementaux exceptionnel, son chaleureux et present.',
    price: 299.99,
    category: 'equipment',
    subcategory: 'Microphone',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Shure',
    stock: 10,
    isFeatured: true,
    rating: 4.9,
    numReviews: 120
  },
  // INSTRUMENTS
  {
    seller: adminId,
    name: 'Fender Player Stratocaster',
    description: 'Guitare electrique Stratocaster Made in Mexico. Corps en aulne, manche en erable, micros Player Series Alnico 5. Le son Fender classique a prix accessible.',
    price: 649.99,
    category: 'instrument',
    subcategory: 'Guitare',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Fender',
    stock: 7,
    isFeatured: true,
    rating: 4.7,
    numReviews: 28
  },
  {
    seller: adminId,
    name: 'Roland FP-30X Piano Numerique',
    description: 'Piano numerique portable avec 88 touches a contrepoids. Technologie PHA-4 Standard, sons SuperNATURAL. Parfait pour les debutants et musiciens confirmes.',
    price: 549.99,
    category: 'instrument',
    subcategory: 'Clavier',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Roland',
    stock: 5,
    isFeatured: true,
    rating: 4.8,
    numReviews: 42
  },
  {
    seller: adminId,
    name: 'Pearl Export EXX Batterie',
    description: 'Kit de batterie acoustique 5 pieces. Caisse claire de 14 pouces, grosse caisse de 22 pouces. Inclut les cymbales. Ideal pour les musiciens intermediaires.',
    price: 799.99,
    category: 'instrument',
    subcategory: 'Batterie',
    image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Pearl',
    stock: 4,
    isFeatured: false,
    rating: 4.5,
    numReviews: 18
  },
  {
    seller: adminId,
    name: 'Akai MPK Mini MK3',
    description: 'Controleur MIDI compact 25 touches. 8 pads MPC, encodeurs, arpeggiateur integre. Compatible avec tous les DAW (FL Studio, Ableton, Logic). USB plug-and-play.',
    price: 99.99,
    category: 'instrument',
    subcategory: 'Controleur MIDI',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop',
    isDigital: false,
    brand: 'Akai',
    stock: 20,
    isFeatured: true,
    rating: 4.6,
    numReviews: 95
  }
];

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await Promise.all(users.map(u => User.create(u)));
    const adminUser = createdUsers[0];

    const products = getProducts(adminUser._id);
    await Product.insertMany(products);

    console.log('Donnees importees avec succes!');
    console.log('---');
    console.log('Compte admin: admin@soundmarket.com / admin1234');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Donnees supprimees!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
