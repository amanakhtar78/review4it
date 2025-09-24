
import type { Movie, NewsItem, DailyEarning, WeeklyEarning, MonthlyEarning, ExcitementLevel, SuccessLevel, CountryEarning, FunFact, MovieType, MovieZone, Actor, HotNews, EarningDayRecord, CountryEarningAdminRecord, Song, FunFactAdmin } from '@/types';
import type { IMovieSeries } from '@/lib/models/MovieSeries';

const generateAggregatedEarnings = (
  dailyEarnings: DailyEarning[], 
  periodDays: number, 
  numPeriods: number, 
  periodType: 'Week' | 'Month'
): WeeklyEarning[] | MonthlyEarning[] => {
  if (!dailyEarnings || dailyEarnings.length === 0) return [];
  
  const aggregated: (WeeklyEarning | MonthlyEarning)[] = [];
  for (let i = 0; i < numPeriods; i++) {
    const startDayIndex = i * periodDays;
    const endDayIndex = Math.min(startDayIndex + periodDays, dailyEarnings.length);
    
    let periodAmount = 0;
    if (startDayIndex < dailyEarnings.length) {
      for (let j = startDayIndex; j < endDayIndex; j++) {
        periodAmount += dailyEarnings[j].amount;
      }
    }

    if (periodType === 'Week') {
      aggregated.push({ week: i + 1, name: `Week ${i + 1}`, amount: periodAmount });
    } else {
      aggregated.push({ month: i + 1, name: `Month ${i + 1}`, amount: periodAmount });
    }
    if (endDayIndex >= dailyEarnings.length && periodAmount === 0 && i > 0 && aggregated[i-1].amount === 0) break;
  }
  let lastNonZeroIndex = -1;
  for (let i = aggregated.length - 1; i >= 0; i--) {
    if (aggregated[i].amount > 0) {
      lastNonZeroIndex = i;
      break;
    }
  }
  if (lastNonZeroIndex === -1 && dailyEarnings.length > 0) {
    return aggregated.slice(0,1);
  }

  return aggregated.slice(0, lastNonZeroIndex + 1);
};

const baseMockActors: Actor[] = [
    { id: 'a1', name: 'Chris Stellar', imageUrl: 'https://placehold.co/100x100.png?actor=1', characterName: 'Captain Rex', earnings: 15000000 },
    { id: 'a2', name: 'Nova Pulsar', imageUrl: 'https://placehold.co/100x100.png?actor=2', characterName: 'Dr. Aris', earnings: 12000000 },
    { id: 'a3', name: 'Orion Nebula', imageUrl: 'https://placehold.co/100x100.png?actor=3', characterName: 'Cmdr. Valerius', earnings: 10000000 },
    { id: 'a4', name: 'Keanu Reeves Jr.', imageUrl: 'https://placehold.co/100x100.png?actor=4', characterName: 'Neo II', earnings: 20000000 },
    { id: 'a5', name: 'Trinity Reborn', imageUrl: 'https://placehold.co/100x100.png?actor=5', characterName: 'Trix', earnings: 18000000 },
    { id: 'a6', name: 'Indiana Jones III', imageUrl: 'https://placehold.co/100x100.png?actor=6', characterName: 'Dr. Henry', earnings: 8000000 },
    { id: 'a7', name: 'Lyra Comet', imageUrl: 'https://placehold.co/100x100.png?actor=7', characterName: 'Pilot Zayla', earnings: 9000000 },
    { id: 'a8', name: 'Sirius Blackhole', imageUrl: 'https://placehold.co/100x100.png?actor=8', characterName: 'Engineer Jax', earnings: 8500000 },
    { id: 'a9', name: 'Andromeda Star', imageUrl: 'https://placehold.co/100x100.png?actor=9', characterName: 'Navigator Lin', earnings: 8000000 },
    { id: 'a10', name: 'Cygnus X-1', imageUrl: 'https://placehold.co/100x100.png?actor=10', characterName: 'Medic Kael', earnings: 7500000 },
    { id: 'a11', name: 'Rigel Kent', imageUrl: 'https://placehold.co/100x100.png?actor=11', characterName: 'Security Chief Tyro', earnings: 7000000 },
    { id: 'a12', name: 'Vega Sunset', imageUrl: 'https://placehold.co/100x100.png?actor=12', characterName: 'Comms Officer Elara', earnings: 6500000 },
    { id: 'a13', name: 'Altair Dawn', imageUrl: 'https://placehold.co/100x100.png?actor=13', characterName: 'Xenolinguist Kai', earnings: 6000000 },
];

const mockSongs: Song[] = [
    { id: 's1', title: 'Echoes of Andromeda', singer: 'Nova Pulsar', imageUrl: 'https://placehold.co/80x80.png?song=1', releaseDate: '2023-07-14', earnings: 1200000, views: 50000000, streams: 25000000 },
    { id: 's2', title: 'Starlight Anthem', singer: 'The Cosmic Drifters', imageUrl: 'https://placehold.co/80x80.png?song=2', releaseDate: '2023-06-30', earnings: 850000, views: 35000000, streams: 18000000 },
    { id: 's3', title: 'Cyber Dreams', singer: 'SynthRiders', imageUrl: 'https://placehold.co/80x80.png?song=3', releaseDate: '2023-09-01', earnings: 950000, views: 42000000, streams: 21000000 },
];

export const mockMoviesData: Omit<IMovieSeries, '_id' | 'weeklyEarnings' | 'monthlyEarnings' | 'actors' | 'funFacts' | 'news' | 'countryWiseEarnings' | 'dailyEarnings' | 'songs'>[] & {
  // Temporary relaxations for easier mapping during transition
  posterImage?: string;
  bannerImages?: string[];
  trailerUrl?: string;
  teaserUrl?: string;
  ratings?: { source: string; value: string }[];
  successLevel?: SuccessLevel;
  releaseYear?: number;
  streamingPlatform?: string;
  dataAiHint?: string;
  actorsData?: Actor[];
  funFactsData?: FunFact[];
  newsData?: NewsItem[];
  songsData?: Song[];
  countryWiseEarningsData?: CountryEarning[];
  dailyEarningsData?: DailyEarning[];
}[] = [
  {
    movie_title: 'Cosmic Odyssey',
    movie_description: 'A thrilling journey across galaxies to save humanity from an ancient cosmic threat. The valiant crew of the starship "Hope" must navigate treacherous asteroid fields, outwit cunning alien races, and confront existential questions about their place in the universe. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. The journey tests not only their skills and courage but also their bonds of friendship and loyalty. As they venture deeper into the unknown, they uncover secrets that could shatter their understanding of reality. The fate of Earth hangs in the balance, and time is running out. This epic saga explores themes of sacrifice, discovery, and the indomitable human spirit. With breathtaking visuals and a heart-pounding score, Cosmic Odyssey promises an unforgettable cinematic experience. The ensemble cast delivers powerful performances, bringing depth and complexity to their characters. Each decision carries weight, and every encounter could be their last. From desolate, frozen planets to vibrant, teeming nebulae, the universe unfolds in stunning detail. The advanced technology portrayed in the film sparks imagination, while the underlying human drama resonates universally. Will they succeed in their desperate mission, or will humanity succumb to the encroaching darkness? The answer lies beyond the stars, in the heart of the Cosmic Odyssey. This film pushes the boundaries of science fiction, blending spectacular action with thought-provoking narrative. It delves into the philosophical implications of interstellar travel and contact with extraterrestrial intelligence, prompting viewers to ponder their own existence and the vastness of the cosmos. The intricate plot weaves multiple storylines together, creating a rich tapestry of adventure and suspense. Prepare for an experience that will leave you breathless and contemplating the infinite possibilities that lie beyond our world. The legacy of their journey will echo through the ages, a testament to the courage and resilience of the human spirit facing the ultimate unknown. This additional text is added to make the description closer to 500 words. The narrative arc of each character is carefully crafted, showing growth and transformation amidst interstellar conflict. The world-building is immense, with detailed histories and cultures for various alien species encountered. Sound design plays a crucial role, immersing the audience in the vacuum of space and the cacophony of alien worlds. Cinematography utilizes sweeping vistas and claustrophobic interiors to enhance the storytelling. The film also subtly explores the ethics of first contact and the responsibilities that come with advanced power. The pacing is expertly managed, balancing moments of high-octane action with quiet, introspective scenes. Viewer reactions have been overwhelmingly positive, praising both the spectacle and the substance of this cinematic achievement. Its themes resonate deeply, prompting discussions about humanitys future among the stars.',
    image_1: 'https://placehold.co/400x600.png',
    image_2: 'https://placehold.co/1200x500.png?a=2',
    image_3: 'https://placehold.co/1200x500.png?a=3',
    dataAiHint: 'space adventure',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Sci-Fi', 'Action', 'Adventure'],
    rating_imdb: '8.5/10',
    rating_google: '92%',
    rating_rotten_tomatoes: '88%',
    performance_meter: 'Blockbuster',
    excitement_level: 95,
    budget: 200000000,
    earnings: 750000000,
    ticket_price_min: 15,
    ticket_price_max: 45,
    actorsData: baseMockActors.slice(0,10),
    funFactsData: [
        { title: 'Impressive Spaceship Model', fact: 'The main spaceship model used for filming the epic space battles was a meticulously crafted 10-foot long miniature.' },
        { title: 'Global Filming Locations', fact: 'To capture the diverse environments of the galaxy, principal photography for the film took place in 5 different countries across three continents.' },
        { title: 'Authentic Alien Language', fact: 'The complex alien language spoken by the Zorgon race was not random sounds, but was fully developed by a professional linguist to ensure authenticity.' }
    ],
    newsData: [
      { id: 'n1', title: 'Cosmic Odyssey Sequel Confirmed!', snippet: 'Producers announce plans for a follow-up...', imageUrl: 'https://placehold.co/300x200.png?news=1', dataAiHint: 'movie news', link: '#' },
      { id: 'n2', title: 'Visual Effects Praised', snippet: 'Critics are hailing the stunning visuals of the film...', imageUrl: 'https://placehold.co/300x200.png?news=2', dataAiHint: 'visual effects', link: '#' },
    ],
    songsData: mockSongs.slice(0,2),
    movie_release_date: '2023-07-21', // Example date
    isWinner: true,
    ott_release_date: '2023-12-15',
    streaming_at: 'StarFlix+,MoonMax',
    countryWiseEarningsData: [
      { country: 'USA', amount: 300000000, fill: "hsl(var(--chart-1))" },
      { country: 'China', amount: 150000000, fill: "hsl(var(--chart-2))" },
      { country: 'UK', amount: 75000000, fill: "hsl(var(--chart-3))" },
      { country: 'Japan', amount: 60000000, fill: "hsl(var(--chart-4))" },
      { country: 'Germany', amount: 45000000, fill: "hsl(var(--chart-5))" },
    ],
    dailyEarningsData: Array.from({ length: 60 }, (_, i) => ({ day: i + 1, name: `Day ${i + 1}`, amount: Math.floor(Math.max(0, Math.random() * 5000000 + 10000000 - (i * 150000))) })),
    movie_zone: 'Hollywood',
    movie_type: 'movie_theater',
    created_by: 1,
    created_at: '2023-01-10',
  },
  {
    movie_title: 'Cybernetic Uprising',
    movie_description: 'In a dystopian future, AI has taken over. A small band of rebels fights for freedom.',
    image_1: 'https://placehold.co/400x600.png',
    image_2: 'https://placehold.co/1200x500.png?b=2',
    dataAiHint: 'cyberpunk city',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Sci-Fi', 'Thriller'],
    rating_imdb: '7.9/10',
    rating_google: '85%',
    rating_rotten_tomatoes: '75%',
    performance_meter: 'Hit',
    excitement_level: 80,
    budget: 150000000,
    earnings: 450000000,
    isWinner: true,
    ticket_price_min: 12,
    ticket_price_max: 35,
    actorsData: baseMockActors.slice(3,5),
    funFactsData: [
        { title: 'Literary Inspiration', fact: 'The film\'s dark, neon-soaked world was heavily inspired by classic cyberpunk novels from the 1980s.'},
        { title: 'Revolutionary CGI', fact: 'Features groundbreaking new CGI techniques for rendering the futuristic cityscapes and robotic characters.'}
    ],
    newsData: [
      { id: 'n3', title: 'Uprising Director Interview', snippet: 'The director discusses the challenges of creating a believable future...', imageUrl: 'https://placehold.co/300x200.png?news=3', dataAiHint: 'director interview', link: '#' },
    ],
    songsData: mockSongs.slice(2,3),
    movie_release_date: '2023-09-15',
    ott_release_date: '2024-01-20',
    streaming_at: 'CyberStream',
    countryWiseEarningsData: [
       { country: 'USA', amount: 180000000 },
       { country: 'Germany', amount: 70000000 },
    ],
    dailyEarningsData: Array.from({ length: 50 }, (_, i) => ({ day: i + 1, name: `Day ${i + 1}`, amount: Math.floor(Math.max(0, Math.random() * 3000000 + 8000000 - (i * 100000))) })),
    movie_zone: 'Hollywood',
    movie_type: 'movie_ott',
    created_by: 2,
    created_at: '2023-02-15',
  },
  {
    movie_title: 'The Lost Kingdom',
    movie_description: 'An archeologist discovers a map to a mythical lost kingdom, embarking on a perilous adventure.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'jungle ruins',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Adventure', 'Action'],
    rating_imdb: '6.5/10',
    rating_google: '70%',
    rating_rotten_tomatoes: '55%',
    performance_meter: 'Average',
    excitement_level: 60,
    budget: 80000000,
    earnings: 120000000,
    isLoser: true,
    ticket_price_min: 10,
    ticket_price_max: 25,
    actorsData: baseMockActors.slice(5,6),
    funFactsData: [{ title: 'Real-Life Adventure', fact: 'The movie was shot on location deep in the Amazon rainforest, with the cast and crew facing real-life challenges.' }],
    newsData: [],
    songsData: [],
    movie_release_date: '2024-03-10',
    streaming_at: 'AdventureFlix',
    countryWiseEarningsData: [{ country: 'Brazil', amount: 50000000 }],
    dailyEarningsData: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, name: `Day ${i + 1}`, amount: Math.floor(Math.max(0, Math.random() * 1000000 + 2000000 - (i* 50000))) })),
    movie_zone: 'Hollywood',
    movie_type: 'movie_theater',
    created_by: 1,
    created_at: '2023-05-20',
  },
  {
    movie_title: 'Chronos Paradox',
    movie_description: 'A scientist invents time travel but creates a dangerous paradox that threatens to unravel reality.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'time travel',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Sci-Fi', 'Mystery'],
    rating_imdb: '8.2/10',
    rating_google: '90%',
    rating_rotten_tomatoes: '85%',
    performance_meter: 'Hit',
    excitement_level: 90, 
    budget: 50000000,
    earnings: 0, 
    ticket_price_min: 20,
    ticket_price_max: 50,
    actorsData: [],
    funFactsData: [],
    newsData: [],
    songsData: [],
    isUpcoming: true,
    movie_release_date: '2025-01-01', // Future date
    countryWiseEarningsData: [], 
    dailyEarningsData: [],
    movie_zone: 'Other',
    movie_type: 'web_searies',
    streaming_at: 'FutureFlix',
    created_by: 3,
    created_at: '2024-01-01',
  },
  {
    movie_title: 'Ocean\'s Depths',
    movie_description: 'A deep-sea documentary that uncovers a hidden world of bioluminescent creatures.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'underwater ocean',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Documentary', 'Nature'],
    rating_imdb: '9.1/10',
    performance_meter: 'Hit',
    excitement_level: 40,
    budget: 30000000,
    earnings: 95000000,
    isWinner: true,
    ticket_price_min: 10,
    ticket_price_max: 20,
    actorsData: [],
    movie_release_date: '2023-04-22',
    movie_zone: 'Other',
    movie_type: 'movie_ott',
    created_by: 4,
    created_at: '2023-01-05'
  },
  {
    movie_title: 'Mumbai Masala',
    movie_description: 'A vibrant love story set against the backdrop of Mumbai\'s bustling street food scene.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'mumbai street food',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Romance', 'Comedy', 'Drama'],
    rating_imdb: '7.8/10',
    performance_meter: 'Average',
    excitement_level: 65,
    budget: 40000000,
    earnings: 50000000,
    isLoser: true,
    ticket_price_min: 8,
    ticket_price_max: 22,
    actorsData: [],
    movie_release_date: '2024-02-14',
    movie_zone: 'Bollywood',
    movie_type: 'movie_theater',
    created_by: 5,
    created_at: '2023-11-15'
  },
  {
    movie_title: 'Kings of Tollywood',
    movie_description: 'A high-octane action film about two rival families in the heart of Hyderabad.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'action hero',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Action', 'Drama'],
    rating_imdb: '8.8/10',
    performance_meter: 'Blockbuster',
    excitement_level: 88,
    budget: 180000000,
    earnings: 600000000,
    isWinner: true,
    ticket_price_min: 15,
    ticket_price_max: 50,
    actorsData: [],
    movie_release_date: '2024-01-12',
    movie_zone: 'Tollywood',
    movie_type: 'movie_theater',
    created_by: 6,
    created_at: '2023-09-01'
  },
  {
    movie_title: 'Desert Mirage',
    movie_description: 'A psychological thriller about a group of tourists who get lost in the desert.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'desert sand dunes',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Thriller', 'Mystery'],
    rating_imdb: '6.2/10',
    performance_meter: 'Flop',
    excitement_level: 30,
    budget: 50000000,
    earnings: 20000000,
    isLoser: true,
    ticket_price_min: 12,
    ticket_price_max: 30,
    actorsData: [],
    movie_release_date: '2024-06-05',
    movie_zone: 'Hollywood',
    movie_type: 'movie_theater',
    created_by: 2,
    created_at: '2024-03-01'
  },
  {
    movie_title: 'Galactic Titans',
    movie_description: 'Giant robots fight giant monsters across the galaxy.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'giant robot space',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Sci-Fi', 'Action'],
    rating_imdb: '7.5/10',
    performance_meter: 'Hit',
    excitement_level: 85,
    budget: 250000000,
    earnings: 550000000,
    isWinner: true,
    movie_release_date: '2024-05-20',
    movie_zone: 'Hollywood',
    movie_type: 'movie_theater',
    created_by: 1,
    created_at: '2024-02-01'
  },
  {
    movie_title: 'Echoes in the Rain',
    movie_description: 'A slow-burn drama about a detective solving a cold case in a rainy city.',
    image_1: 'https://placehold.co/400x600.png',
    dataAiHint: 'noir detective rain',
    trailer_ytube: '#',
    teaser_ytube: '#',
    movie_categories: ['Drama', 'Mystery'],
    rating_imdb: '6.9/10',
    performance_meter: 'Flop',
    excitement_level: 25,
    budget: 30000000,
    earnings: 15000000,
    isLoser: true,
    movie_release_date: '2024-04-10',
    movie_zone: 'Other',
    movie_type: 'movie_ott',
    created_by: 3,
    created_at: '2024-01-15'
  }
];

export const processedMockMovies: Movie[] = mockMoviesData.map((movieBase, index) => {
  const dailyEarnings = movieBase.dailyEarningsData || [];
  const countryWiseEarnings = (movieBase.countryWiseEarningsData || []).slice(0, 10).map((earning, index) => ({
    country: earning.country,
    amount: earning.amount,
    name: earning.country, 
    value: earning.amount,  
    fill: earning.fill || `hsl(var(--chart-${(index % 5) + 1}))`
  }));
  
  const ratingsMap = (movieBase.ratings || []).reduce((acc, r) => {
    if (r.source.toLowerCase().includes('imdb')) acc.rating_imdb = r.value;
    if (r.source.toLowerCase().includes('google')) acc.rating_google = r.value;
    if (r.source.toLowerCase().includes('rotten')) acc.rating_rotten_tomatoes = r.value;
    return acc;
  }, {} as Partial<Movie>);


  const movie: Movie = {
    _id: `mock-${movieBase.movie_title.replace(/\s+/g, '-').toLowerCase()}-${index}`,
    name: movieBase.movie_title,
    title: movieBase.movie_title,
    image_1: movieBase.image_1 || movieBase.posterImage,
    image_2: movieBase.image_2 || (movieBase.bannerImages && movieBase.bannerImages[0]),
    image_3: movieBase.image_3 || (movieBase.bannerImages && movieBase.bannerImages[1]),
    description: movieBase.movie_description,
    category: movieBase.movie_categories || [],
    movieReleaseDate: movieBase.movie_release_date || (movieBase.releaseYear ? `${movieBase.releaseYear}-01-01` : undefined),
    trailerLink: movieBase.trailer_ytube || movieBase.trailerUrl,
    teaserLink: movieBase.teaser_ytube || movieBase.teaserUrl,
    ratings: {
      imdb: parseFloat(movieBase.rating_imdb || '0'),
      google: parseInt(movieBase.rating_google || '0'),
      rottenTomato: parseInt(movieBase.rating_rotten_tomatoes || '0'),
    },
    excitementLevel: movieBase.excitement_level,
    performanceMeter: movieBase.performance_meter || movieBase.successLevel || 'Average',
    budget: movieBase.budget,
    earnings: movieBase.earnings,
    ticketPrice: movieBase.ticket_price_min ? `${movieBase.ticket_price_min} - ${movieBase.ticket_price_max}`: undefined,
    movie_zone: movieBase.movie_zone || 'Hollywood',
    type: movieBase.movie_type || 'movie_theater',
    ottStreamingAt: movieBase.streaming_at || movieBase.streamingPlatform,
    ottReleaseDate: movieBase.ott_release_date,
    status: 'Active', // Default status
    
    // --- Legacy field compatibility ---
    movie_title: movieBase.movie_title,
    movie_description: movieBase.movie_description,
    movie_categories: movieBase.movie_categories || [],
    trailer_ytube: movieBase.trailer_ytube || movieBase.trailerUrl,
    teaser_ytube: movieBase.teaser_ytube || movieBase.teaserUrl,
    rating_imdb: movieBase.rating_imdb || ratingsMap.rating_imdb,
    rating_google: movieBase.rating_google || ratingsMap.rating_google,
    rating_rotten_tomatoes: movieBase.rating_rotten_tomatoes || ratingsMap.rating_rotten_tomatoes,
    
    // --- Processed/Derived Data ---
    dailyEarnings: dailyEarnings,
    weeklyEarnings: generateAggregatedEarnings(dailyEarnings, 7, 6, 'Week') as WeeklyEarning[],
    monthlyEarnings: generateAggregatedEarnings(dailyEarnings, 28, 4, 'Month') as MonthlyEarning[],
    actors: movieBase.actorsData || [],
    funFacts: movieBase.funFactsData || [],
    news: movieBase.newsData || [],
    songs: movieBase.songsData || [],
    countryWiseEarnings: countryWiseEarnings as (CountryEarning & { name: string; value: number; fill: string; })[],
    
    isUpcoming: movieBase.isUpcoming,
    isWinner: movieBase.isWinner,
    isLoser: movieBase.isLoser,
    dataAiHint: movieBase.dataAiHint,

    created_by: movieBase.created_by || 1, 
    created_at: movieBase.created_at || new Date().toISOString().split('T')[0], 
  };
  return movie;
});


export const mockNewsItems: NewsItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `news-${i + 1}`,
  title: `Exciting Movie News #${i + 1}`,
  snippet: 'This is a short snippet about some breaking news in the film industry. More details to follow soon!',
  imageUrl: `https://placehold.co/300x200.png?newsitem=${i + 1}`,
  dataAiHint: 'cinema news',
  link: '#',
}));

export const mockFunFacts: FunFactAdmin[] = [
  { id: 'ff1', movieId: 1, fact: 'The main spaceship model was 10 feet long.', source: 'Behind the Scenes Weekly', created_by: 1, created_at: '2023-01-15' },
  { id: 'ff2', movieId: 1, fact: 'Filming took place in 5 different countries.', source: 'Director\'s Interview', created_by: 1, created_at: '2023-01-20' },
  { id: 'ff3', movieId: 2, fact: 'Inspired by classic cyberpunk novels.', source: 'Art Book', created_by: 2, created_at: '2023-02-10' },
];

export const mockHotNews: HotNews[] = [
  { 
    id: 'hn1', 
    movieId: 1, 
    news: 'Cosmic Odyssey breaks box office records in its opening weekend!', 
    source: 'BoxOfficeMojo', 
    image_url: 'https://placehold.co/100x60.png?hotnews=1', 
    created_by: 1, 
    created_at: '2023-07-24' 
  },
  { 
    id: 'hn2', 
    movieId: 2, 
    news: 'First look at Cybernetic Uprising\'s lead villain revealed.', 
    source: 'IGN', 
    image_url: 'https://placehold.co/100x60.png?hotnews=2', 
    created_by: 2, 
    created_at: '2023-08-10' 
  },
  { 
    id: 'hn3', 
    movieId: 1, 
    news: 'Director of Cosmic Odyssey hints at potential spin-off series focusing on the Zorgon empire.', 
    source: 'Variety', 
    image_url: 'https://placehold.co/100x60.png?hotnews=3', 
    created_by: 1, 
    created_at: '2023-09-01' 
  },
];

const defaultEarningDayValues = {
  day_1: 0, day_2: 0, day_3: 0, day_4: 0, day_5: 0, day_6: 0, day_7: 0,
  day_8: 0, day_9: 0, day_10: 0, day_11: 0, day_12: 0, day_13: 0, day_14: 0,
  week_1: 0, week_2: 0, week_3: 0, week_4: 0, week_5: 0, week_6: 0, week_7: 0,
  month_1: 0, month_2: 0, month_3: 0, month_4: 0,
};

export const mockEarningDayData: EarningDayRecord[] = [
  {
    id: 'edr1',
    movieId: 1, // Cosmic Odyssey
    ...defaultEarningDayValues,
    day_1: 100000, day_2: 120000, day_3: 110000, day_4: 90000, day_5: 85000, day_6: 130000, day_7: 140000,
    day_8: 70000, day_9: 65000, day_10: 60000, day_11: 55000, day_12: 50000, day_13: 75000, day_14: 80000,
    week_1: 775000, // Sum of day 1-7
    week_2: 455000, // Sum of day 8-14
    month_1: 3000000, // Placeholder
    created_by: 1,
    created_at: '2023-07-28',
  },
  {
    id: 'edr2',
    movieId: 2, // Cybernetic Uprising
    ...defaultEarningDayValues,
    day_1: 80000, day_2: 90000, day_3: 85000, day_4: 70000, day_5: 65000, day_6: 95000, day_7: 100000,
    week_1: 585000,
    created_by: 2,
    created_at: '2023-09-22',
  }
];

export const mockCountryEarningsAdminData: CountryEarningAdminRecord[] = [
  { _id: 'ce1', movieId: '1', country: 'USA', amount: 300000000, created_by: '1', created_at: '2023-08-01' },
  { _id: 'ce2', movieId: '1', country: 'China', amount: 150000000, created_by: '1', created_at: '2023-08-01' },
  { _id: 'ce3', movieId: '2', country: 'Germany', amount: 70000000, created_by: '2', created_at: '2023-10-01' },
  { _id: 'ce4', movieId: '1', country: 'UK', amount: 75000000, created_by: '1', created_at: '2023-08-05' },
];


export const getMovieById = (id: string): Movie | undefined => {
  return processedMockMovies.find(movie => movie._id === id);
};
