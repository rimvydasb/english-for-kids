import { GameVariant, PhraseEntry, PhraseRecord, WordEntry, WordRecord } from '@/lib/types';

export interface GameSettings {
    variant: GameVariant;
    globalStorageKey: string;
    storageKey: string;
}

export const GlobalConfig = {

    // Start the game only with X subjects to guess and circle through them
    // Worst learned words and phrases will be used to draw the variants
    TOTAL_IN_GAME_SUBJECTS_TO_LEARN: 100,

    // How many decoys to show alongside the correct answer
    DEFAULT_DECOYS: 4,

    // How many weakest subjects to surface at the end of a game
    WORST_GUESSES_COUNT: 6,

    // Game specific settings
    GAMES: [
        {
            variant: 'guessTheWord' as GameVariant,
            globalStorageKey: 'GLOBAL_WORD_STATS', // global for all word-based games
            storageKey: 'GUESS_THE_WORD_GAME_STATS',
        },
        {
            variant: 'listenAndGuess' as GameVariant,
            globalStorageKey: 'GLOBAL_WORD_STATS', // global for all word-based games
            storageKey: 'LISTEN_AND_GUESS_GAME_STATS',
        },
        {
            variant: 'guessPhrase' as GameVariant,
            globalStorageKey: 'GLOBAL_PHRASE_STATS',
            storageKey: 'GUESS_THE_PHRASE_GAME_STATS',
        }
    ]
} satisfies {
    TOTAL_IN_GAME_SUBJECTS_TO_LEARN: number;
    DEFAULT_DECOYS: number;
    WORST_GUESSES_COUNT: number;
    GAMES: GameSettings[];
};

export const getGameSettings = (variant: GameVariant): GameSettings => {
    const settings = GlobalConfig.GAMES.find((game) => game.variant === variant);
    if (!settings) {
        throw new Error(`Unknown game variant: ${variant}`);
    }
    return settings;
};

export const PHRASES_DICTIONARY_DATA: PhraseEntry[] = [
    { phrase: 'The Hello Song', translation: 'Pasisveikinimo daina' },
    { phrase: 'Hello', translation: 'Labas' },
    { phrase: 'Hello, hello', translation: 'Labas, labas' },
    { phrase: 'How are you today?', translation: 'Kaip šiandien sekasi?' },
    { phrase: 'How are you?', translation: 'Kaip tu laikaisi?' },
    { phrase: 'And how about you?', translation: 'O kaip tau?' },
    { phrase: 'How about you?', translation: 'O kaip tu? / O tavo?' },
    { phrase: "I'm fine, thank you", translation: 'Man viskas gerai, ačiū' },
    { phrase: "I'm fine, thank you.", translation: 'Puikiai, ačiū.' },
    { phrase: "What's your name?", translation: 'Koks tavo vardas?' },
    { phrase: 'My name is Ariele', translation: 'Mano vardas yra Arielė' },
    { phrase: 'Goodbye!', translation: 'Viso gero!' },
    { phrase: "What's your favourite colour?", translation: 'Kokia yra tavo mėgstamiausia spalva?' },
    { phrase: 'My favourite colour is red.', translation: 'Mano mėgstamiausia spalva yra raudona.' },
    { phrase: 'My favourite colour is green.', translation: 'Mano mėgstamiausia spalva yra žalia.' },
    { phrase: "What's this?", translation: 'Kas tai?' },
    { phrase: "It's a desk.", translation: 'Tai yra rašomasis stalas.' },
    { phrase: 'Is it a plane?', translation: 'Ar tai lėktuvas?' },
    { phrase: 'Yes, it is.', translation: 'Taip, tai yra.' },
    { phrase: "No, it isn't.", translation: 'Ne, tai nėra.' },
];

export const WORDS_DICTIONARY_DATA: WordEntry[] = [
    {
        word: 'apple',
        translation: 'obuolys',
        examples: ['Red apple here.'],
        type: 'noun',
    },
    {
        word: 'baloon',
        translation: 'balionas',
        examples: ['Green baloon floats.'],
        type: 'noun',
    },
    {
        word: 'black',
        translation: 'juodas',
        examples: ['Black cat naps.'],
        type: 'color',
    },
    {
        word: 'brown',
        translation: 'rudas',
        examples: ['Brown desk here.'],
        type: 'color',
    },
    {
        word: 'cat',
        translation: 'katė',
        examples: ['Cat naps here.'],
        type: 'noun',
    },
    {
        word: 'crayon',
        translation: 'kreidelė',
        examples: ['One crayon ready.'],
        type: 'noun',
    },
    {
        word: 'desk',
        translation: 'rašomasis stalas',
        examples: ['Desk is tidy.'],
        type: 'noun',
    },
    {
        word: 'dog',
        translation: 'šuo',
        examples: ['Dog wags tail.'],
        type: 'noun',
    },
    {
        word: 'egg',
        translation: 'kiaušinis',
        examples: ['Brown egg here.'],
        type: 'noun',
    },
    {
        word: 'elephant',
        translation: 'dramblys',
        examples: ['Elephant has ears.'],
        type: 'noun',
    },
    {
        word: 'farm',
        translation: 'ferma',
        examples: ['Farm has animals.'],
        type: 'noun',
    },
    {
        word: 'fish',
        translation: 'žuvis',
        examples: ['Fish swims fast.'],
        type: 'noun',
    },
    {
        word: 'green',
        translation: 'žalias',
        examples: ['Green grass grows.'],
        type: 'color',
    },
    {
        word: 'notebook',
        translation: 'sąsiuvinis',
        examples: ['Notebook is open.'],
        type: 'noun',
    },
    {
        word: 'pencil',
        translation: 'pieštukas',
        examples: ['Sharp pencil ready.'],
        type: 'noun',
    },
    {
        word: 'pink',
        translation: 'rožinis',
        examples: ['Pink flower grows.'],
        type: 'color',
    },
    {
        word: 'plain',
        translation: 'lėktuvas',
        examples: ['Red plane flies.'],
        type: 'noun',
    },
    {
        word: 'puppet',
        translation: 'lėlė',
        examples: ['Puppet waves hello.'],
        type: 'noun',
    },
    {
        word: 'purple',
        translation: 'violetinis',
        examples: ['Purple hat fits.'],
        type: 'color',
    },
    {
        word: 'red',
        translation: 'raudonas',
        examples: ['Red baloon floats.'],
        type: 'color',
    },
    {
        word: 'teddy',
        translation: 'meškiukas',
        examples: ['Teddy sits here.'],
        type: 'noun',
    },
    {
        word: 'white',
        translation: 'baltas',
        examples: ['White clouds move.'],
        type: 'color',
    },
    {
        word: 'yellow',
        translation: 'geltonas',
        examples: ['Yellow sun shines.'],
        type: 'color',
    },
    {
        word: 'zero',
        translation: 'nulis',
        examples: ['Zero red apples.'],
        type: 'number',
    },
    {
        word: 'one',
        translation: 'vienas',
        examples: ['One black cat.'],
        type: 'number',
    },
    {
        word: 'two',
        translation: 'du',
        examples: ['Two dogs play.'],
        type: 'number',
    },
    {
        word: 'three',
        translation: 'trys',
        examples: ['Three red apples.'],
        type: 'number',
    },
    {
        word: 'four',
        translation: 'keturi',
        examples: ['Four fish swim.'],
        type: 'number',
    },
    {
        word: 'five',
        translation: 'penki',
        examples: ['Five green balloons.'],
        type: 'number',
    },
    {
        word: 'six',
        translation: 'šeši',
        examples: ['Six crayons on the desk.'],
        type: 'number',
    },
    {
        word: 'seven',
        translation: 'septyni',
        examples: ['Seven yellow puppets.'],
        type: 'number',
    },
    {
        word: 'eight',
        translation: 'aštuoni',
        examples: ['Eight purple pencils.'],
        type: 'number',
    },
    {
        word: 'nine',
        translation: 'devyni',
        examples: ['Nine brown eggs.'],
        type: 'number',
    },
    {
        word: 'ten',
        translation: 'dešimt',
        examples: ['Ten white teddies.'],
        type: 'number',
    },
    {
        word: 'dad',
        translation: 'tėtis',
        examples: ['This is my dad.'],
        type: 'noun',
    },
    {
        word: 'mum',
        translation: 'mama',
        examples: ['This is my mum.'],
        type: 'noun',
    },
    {
        word: 'grandma',
        translation: 'močiutė',
        examples: ['This is my grandma.'],
        type: 'noun',
    },
    {
        word: 'grandpa',
        translation: 'senelis',
        examples: ['This is my grandpa.'],
        type: 'noun',
    },
    {
        word: 'hat',
        translation: 'kepurė',
        examples: ['Wear a hat.'],
        type: 'noun',
    },
    {
        word: 'horse',
        translation: 'arklys',
        examples: ['Horse runs fast.'],
        type: 'noun',
    },
    {
        word: 'insect',
        translation: 'vabzdys',
        examples: ['Small insect crawls.'],
        type: 'noun',
    },
    {
        word: 'boy',
        translation: 'berniukas',
        examples: ['The boy plays.'],
        type: 'noun',
        imageFile: 'boy,brother.png'
    },
    {
        word: 'brother',
        translation: 'brolis',
        examples: ['This is my brother.'],
        type: 'noun',
        imageFile: 'boy,brother.png'
    },
    {
        word: 'girl',
        translation: 'mergaitė',
        examples: ['The girl sings.'],
        type: 'noun',
        imageFile: 'girl,sister.png'
    },
    {
        word: 'sister',
        translation: 'sesė',
        examples: ['This is my sister.'],
        type: 'noun',
        imageFile: 'girl,sister.png'
    },
];

export const PHRASES_DICTIONARY: PhraseRecord[] = PHRASES_DICTIONARY_DATA.map(
    (entry) => new PhraseRecord(entry),
);

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map(
    (entry) => new WordRecord(entry),
);
