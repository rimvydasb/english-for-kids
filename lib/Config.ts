import {PhraseEntry, PhraseRecord, WordEntry, WordRecord} from '@/lib/types';

export const GlobalConfig = {
    // Start the game only with X subjects to guess and circle through them
    // Worst learned words and phrases will be used to draw the variants
    TOTAL_IN_GAME_SUBJECTS_TO_LEARN: 100,

    // How many decoys to show alongside the correct answer
    DEFAULT_DECOYS: 4,

    // How many weakest subjects to surface at the end of a game
    WORST_GUESSES_COUNT: 6,
} satisfies {
    TOTAL_IN_GAME_SUBJECTS_TO_LEARN: number;
    DEFAULT_DECOYS: number;
    WORST_GUESSES_COUNT: number;
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
    [1, 'one', 'vienas', 'One black cat.'],
    [2, 'two', 'du', 'Two dogs play.'],
    [3, 'three', 'trys', 'Three red apples.'],
    [4, 'four', 'keturi', 'Four fish swim.'],
    [5, 'five', 'penki', 'Five green balloons.'],
    [6, 'six', 'šeši', 'Six crayons on the desk.'],
    [7, 'seven', 'septyni', 'Seven yellow puppets.'],
    [8, 'eight', 'aštuoni', 'Eight purple pencils.'],
    [9, 'nine', 'devyni', 'Nine brown eggs.'],
    [10, 'ten', 'dešimt', 'Ten white teddies.'],
    [11, 'eleven', 'vienuolika', 'Eleven red roses.'],
    [12, 'twelve', 'dvylika', 'Twelve blue birds.'],
    [13, 'thirteen', 'trylika', 'Thirteen green frogs.'],
    [14, 'fourteen', 'keturiolika', 'Fourteen yellow stars.'],
    [15, 'fifteen', 'penkiolika', 'Fifteen pink flowers.'],
    [16, 'sixteen', 'šešiolika', 'Sixteen orange fish.'],
    [17, 'seventeen', 'septyniolika', 'Seventeen white clouds.'],
    [18, 'eighteen', 'aštuoniolika', 'Eighteen black cats.'],
    [19, 'nineteen', 'devyniolika', 'Nineteen brown dogs.'],
    [20, 'twenty', 'dvidešimt', 'Twenty red apples.'],
].map(([displayAs, word, translation, example]) => ({
    word: word as string,
    translation: translation as string,
    examples: [example as string],
    type: 'number' as const,
    displayAs: displayAs as string,
}));

export const COLORS_DATA: WordEntry[] = [
    ['blue', 'mėlynas', 'Blue sky above.'],
    ['orange', 'oranžinis', 'Orange carrot here.'],
    ['red', 'raudonas', 'Red rose blooms.'],
    ['green', 'žalias', 'Green leaf falls.'],
    ['yellow', 'geltonas', 'Yellow banana peels.'],
    ['pink', 'rožinis', 'Pink pig oinks.'],
    ['purple', 'violetinis', 'Purple grape grows.'],
    ['white', 'baltas', 'White snow falls.'],
    ['black', 'juodas', 'Black night falls.'],
    ['brown', 'rudas', 'Brown bear roams.'],
    ['gray', 'pilkas', 'Gray cloud looms.']
].map(([word, translation, example]) => ({
    word: word as string,
    translation: translation as string,
    examples: [example as string],
    type: 'color' as const,
}));

export const WORDS_DICTIONARY_DATA: WordEntry[] = [
    ...NUMBERS_DATA,
    ...COLORS_DATA,
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
        word: 'teddy',
        translation: 'meškiukas',
        examples: ['Teddy sits here.'],
        type: 'noun',
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
        examples: ['Where is my hat?'],
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
        examples: ['This is small insect.'],
        type: 'noun',
    },
    {
        word: 'jug',
        translation: 'ąsotis',
        examples: ['Jug is full of water.'],
        type: 'noun',
    },
    {
        word: 'juice',
        translation: 'sultys',
        examples: ['Fresh orange juice.'],
        type: 'noun',
    },
    {
        word: 'kangaroo',
        translation: 'kengūra',
        examples: ['Kangaroo jumps high.'],
        type: 'noun',
    },
    {
        word: 'key',
        translation: 'raktas',
        examples: ['Small key here.'],
        type: 'noun',
    },
    {
        word: 'lion',
        translation: 'liūtas',
        examples: ['Lion roars loud.'],
        type: 'noun',
    },
    {
        word: 'lollipop',
        translation: 'čiulpinukas',
        examples: ['Sweet lollipop here.'],
        type: 'noun',
    },
    {
        word: 'boy',
        translation: 'berniukas',
        examples: ['The boy plays.'],
        type: 'noun',
        imageFile: 'boy,brother.png',
    },
    {
        word: 'brother',
        translation: 'brolis',
        examples: ['This is my brother.'],
        type: 'noun',
        imageFile: 'boy,brother.png',
    },
    {
        word: 'girl',
        translation: 'mergaitė',
        examples: ['The girl sings.'],
        type: 'noun',
        imageFile: 'girl,sister.png',
    },
    {
        word: 'sister',
        translation: 'sesė',
        examples: ['This is my sister.'],
        type: 'noun',
        imageFile: 'girl,sister.png',
    },
];

export const PHRASES_DICTIONARY: PhraseRecord[] = PHRASES_DICTIONARY_DATA.map((entry) => new PhraseRecord(entry));

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map((entry) => new WordRecord(entry));
