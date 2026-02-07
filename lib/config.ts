import {GameRules, PhraseEntry, PhraseRecord, WordCardMode, WordEntry, WordRecord} from '@/lib/types';

// File renamed to config.ts from Config.ts

export const GlobalConfig = {
    // Start the game only with X subjects to guess and circle through them
    // Worst learned words and phrases will be used to draw the variants
    TOTAL_IN_GAME_SUBJECTS_TO_LEARN: 100,

    // How many decoys to show alongside the correct answer
    DEFAULT_DECOYS: 7,

    // How many weakest subjects to surface at the end of a game
    WORST_GUESSES_COUNT: 99,
} satisfies {
    TOTAL_IN_GAME_SUBJECTS_TO_LEARN: number;
    DEFAULT_DECOYS: number;
    WORST_GUESSES_COUNT: number;
};

export const DEFAULT_RULES: Partial<GameRules> = {
    wordCardMode: WordCardMode.Learning,
    showImage: true,
    showTranslation: true,
    showWord: true,
    showWordPronunciation: true,
    totalInGameSubjectsToLearn: GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN,
    selectedWordEntryTypes: [],
};

export const KNOWN_GAME_STORAGE_KEYS = [
    'GUESS_THE_WORD_GAME_STATS',
    'LISTEN_AND_GUESS_GAME_STATS',
    'GUESS_THE_PHRASE_GAME_STATS',
];

export const PHRASES_DICTIONARY_DATA: PhraseEntry[] = [
    {phrase: 'The Hello Song', translation: 'Pasisveikinimo daina'},
    {phrase: 'Hello', translation: 'Labas'},
    {phrase: 'Hello, hello', translation: 'Labas, labas'},
    {phrase: 'How are you today?', translation: 'Kaip šiandien sekasi?'},
    {phrase: 'How are you?', translation: 'Kaip tu laikaisi?'},
    {phrase: 'And how about you?', translation: 'O kaip tau?'},
    {phrase: 'How about you?', translation: 'O kaip tu? / O tavo?'},
    {phrase: "I'm fine, thank you", translation: 'Man viskas gerai, ačiū'},
    {phrase: "I'm fine, thank you.", translation: 'Puikiai, ačiū.'},
    {phrase: "What's your name?", translation: 'Koks tavo vardas?'},
    {phrase: 'My name is Ariele', translation: 'Mano vardas yra Arielė'},
    {phrase: 'Goodbye!', translation: 'Viso gero!'},
    {phrase: "What's your favourite colour?", translation: 'Kokia yra tavo mėgstamiausia spalva?'},
    {phrase: 'My favourite colour is red.', translation: 'Mano mėgstamiausia spalva yra raudona.'},
    {phrase: 'My favourite colour is green.', translation: 'Mano mėgstamiausia spalva yra žalia.'},
    {phrase: "What's this?", translation: 'Kas tai?'},
    {phrase: "It's a desk.", translation: 'Tai yra rašomasis stalas.'},
    {phrase: 'Is it a plane?', translation: 'Ar tai lėktuvas?'},
    {phrase: 'Yes, it is.', translation: 'Taip, tai yra.'},
    {phrase: "No, it isn't.", translation: 'Ne, tai nėra.'},
];

export const NUMBERS_DATA: WordEntry[] = [
    [0, 'zero', 'nulis', 'Zero red apples.'],
    [1, 'one', 'vienas', 'One black cat.', '2025-09-24'],
    [2, 'two', 'du', 'Two dogs play.', '2025-09-24'],
    [3, 'three', 'trys', 'Three red apples.', '2025-09-24'],
    [4, 'four', 'keturi', 'Four fish swim.', '2025-09-24'],
    [5, 'five', 'penki', 'Five green balloons.', '2025-09-24'],
    [6, 'six', 'šeši', 'Six crayons on the desk.', '2025-10-01'],
    [7, 'seven', 'septyni', 'Seven yellow puppets.', '2025-10-01'],
    [8, 'eight', 'aštuoni', 'Eight purple pencils.', '2025-10-01'],
    [9, 'nine', 'devyni', 'Nine brown eggs.', '2025-10-01'],
    [10, 'ten', 'dešimt', 'Ten white teddies.', '2025-10-01'],
    [11, 'eleven', 'vienuolika', 'Eleven red roses.', '2026-01-07'],
    [12, 'twelve', 'dvylika', 'Twelve blue birds.', '2026-01-07'],
    [13, 'thirteen', 'trylika', 'Thirteen green frogs.', '2026-01-07'],
    [14, 'fourteen', 'keturiolika', 'Fourteen yellow stars.', '2026-01-07'],
    [15, 'fifteen', 'penkiolika', 'Fifteen pink flowers.', '2026-01-07'],
    [16, 'sixteen', 'šešiolika', 'Sixteen orange fish.', '2026-01-07'],
    [17, 'seventeen', 'septyniolika', 'Seventeen white clouds.', '2026-01-07'],
    [18, 'eighteen', 'aštuoniolika', 'Eighteen black cats.', '2026-01-07'],
    [19, 'nineteen', 'devyniolika', 'Nineteen brown dogs.', '2026-01-07'],
    [20, 'twenty', 'dvidešimt', 'Twenty red apples.', '2026-01-07'],
].map(([displayAs, word, translation, example, addedAt]) => ({
    word: word as string,
    translation: translation as string,
    examples: [example as string],
    type: 'number' as const,
    displayAs: displayAs as string,
    ...(addedAt ? {addedAt: new Date(addedAt as string).getTime()} : {}),
}));

export const COLORS_DATA: WordEntry[] = [
    ['blue', 'mėlynas', 'Blue sky above.', '2025-10-08'],
    ['orange', 'oranžinis', 'Orange carrot here.', '2025-10-08'],
    ['red', 'raudonas', 'Red rose blooms.', '2025-10-08'],
    ['green', 'žalias', 'Green leaf falls.', '2025-10-08'],
    ['yellow', 'geltonas', 'Yellow banana peels.', '2025-10-08'],
    ['pink', 'rožinis', 'Pink pig oinks.', '2025-10-08'],
    ['purple', 'violetinis', 'Purple grape grows.', '2025-10-08'],
    ['white', 'baltas', 'White snow falls.', '2025-10-08'],
    ['black', 'juodas', 'Black night falls.', '2025-10-08'],
    ['brown', 'rudas', 'Brown bear roams.', '2025-10-08'],
    ['gray', 'pilkas', 'Gray cloud looms.'],
].map(([word, translation, example, addedAt]) => ({
    word: word as string,
    translation: translation as string,
    examples: [example as string],
    type: 'color' as const,
    ...(addedAt ? {addedAt: new Date(addedAt as string).getTime()} : {}),
}));

const MANUAL_WORDS_DATA: WordEntry[] = [
    // [word, translation, [examples], type, addedAt, imageFile]
    ['apple', 'obuolys', ['Red apple here.'], 'noun', null],
    ['baloon', 'balionas', ['Green baloon floats.'], 'noun', '2025-11-26'],
    ['cat', 'katė', ['Cat naps here.'], 'noun', null],
    ['crayon', 'kreidelė', ['One crayon ready.'], 'noun', '2025-11-12'],
    ['desk', 'rašomasis stalas', ['Desk is tidy.'], 'noun', '2025-11-12'],
    ['dog', 'šuo', ['Dog wags tail.'], 'noun', null],
    ['egg', 'kiaušinis', ['Brown egg here.'], 'noun', '2025-11-19'],
    ['elephant', 'dramblys', ['Elephant has ears.'], 'noun', '2025-11-19'],
    ['farm', 'ferma', ['Farm has animals.'], 'noun', '2025-11-19'],
    ['fish', 'žuvis', ['Fish swims fast.'], 'noun', '2025-11-19'],
    ['notebook', 'sąsiuvinis', ['Notebook is open.'], 'noun', '2025-11-12'],
    ['pencil', 'pieštukas', ['Sharp pencil ready.'], 'noun', '2025-11-12'],
    ['plain', 'lėktuvas', ['Red plane flies.'], 'noun', '2025-11-26'],
    ['puppet', 'lėlė', ['Puppet waves hello.'], 'noun', '2025-11-26'],
    ['teddy', 'meškiukas', ['Teddy sits here.'], 'noun', '2025-11-26'],
    ['dad', 'tėtis', ['This is my dad.'], 'noun', '2026-01-07', 'dad,man.png'],
    ['mum', 'mama', ['This is my mum.'], 'noun', '2026-01-07', 'mum,woman.png'],
    ['man', 'vyras', ['This is a man.'], 'noun', '2026-01-28', 'dad,man.png'],
    ['woman', 'moteris', ['This is a woman.'], 'noun', null, 'mum,woman.png'],
    ['grandma', 'močiutė', ['This is my grandma.'], 'noun', '2026-01-07'],
    ['grandpa', 'senelis', ['This is my grandpa.'], 'noun', '2026-01-07'],
    ['mango', 'mangas', ['Mango is sweet.'], 'noun', '2026-01-28'],
    ['neck', 'kaklas', ['My neck hurts.'], 'noun', '2026-01-28'],
    ['nose', 'nosis', ['Touch your nose.'], 'noun', '2026-01-28'],
    ['octopus', 'aštuonkojis', ['Octopus has eight legs.'], 'noun', '2026-01-28'],
    ['hat', 'kepurė', ['Where is my hat?'], 'noun', '2025-12-10'],
    ['horse', 'arklys', ['Horse runs fast.'], 'noun', '2025-12-10'],
    ['insect', 'vabzdys', ['This is small insect.'], 'noun', '2025-12-10'],
    ['jug', 'ąsotis', ['Jug is full of water.'], 'noun', '2026-01-14'],
    ['juice', 'sultys', ['Fresh orange juice.'], 'noun', '2026-01-14'],
    ['kangaroo', 'kengūra', ['Kangaroo jumps high.'], 'noun', '2026-01-14'],
    ['key', 'raktas', ['Small key here.'], 'noun', '2026-01-14'],
    ['lion', 'liūtas', ['Lion roars loud.'], 'noun', '2026-01-14'],
    ['lollipop', 'čiulpinukas', ['Sweet lollipop here.'], 'noun', '2026-01-14'],
    ['cold', 'šalta', ['It is cold outside.'], 'adjective', '2026-01-21'],
    ['happy', 'laimingas', ['I am very happy.'], 'adjective', '2026-01-21'],
    ['hot', 'karšta', ['The soup is hot.'], 'adjective', '2026-01-21'],
    ['hungry', 'alkanas', ['I am hungry now.'], 'adjective', '2026-01-21'],
    ['sad', 'liūdnas', ['Why are you sad?'], 'adjective', '2026-01-21'],
    ['thirsty', 'ištroškęs', ['I am thirsty.'], 'adjective', '2026-01-21'],
    ['boy', 'berniukas', ['The boy plays.'], 'noun', null, 'boy,brother.png'],
    ['brother', 'brolis', ['This is my brother.'], 'noun', '2026-01-07', 'boy,brother.png'],
    ['girl', 'mergaitė', ['The girl sings.'], 'noun', '2025-12-10', 'girl,sister.png'],
    ['sister', 'sesė', ['This is my sister.'], 'noun', '2026-01-07', 'girl,sister.png'],
].map(([word, translation, examples, type, addedAt, imageFile]) => ({
    word: word as string,
    translation: translation as string,
    examples: examples as string[],
    type: type as any,
    addedAt: addedAt ? new Date(addedAt as string).getTime() : undefined,
    ...(imageFile ? {imageFile: imageFile as string} : {}),
}));

export const WORDS_DICTIONARY_DATA: WordEntry[] = [...NUMBERS_DATA, ...COLORS_DATA, ...MANUAL_WORDS_DATA];

export const PHRASES_DICTIONARY: PhraseRecord[] = PHRASES_DICTIONARY_DATA.map((entry) => new PhraseRecord(entry));

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map((entry) => new WordRecord(entry));
