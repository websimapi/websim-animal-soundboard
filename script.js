const animals = [
    {
        name: 'bunny',
        image: 'bunny.png',
        sounds: ['bunny1.mp3', 'bunny2.mp3', 'bunny3.mp3']
    },
    {
        name: 'cat',
        image: 'cat.png',
        sounds: ['cat1.mp3', 'cat2.mp3', 'cat3.mp3']
    },
    {
        name: 'dog',
        image: 'dog.png',
        sounds: ['dog1.mp3', 'dog2.mp3', 'dog3.mp3']
    },
    {
        name: 'fox',
        image: 'fox.png',
        sounds: ['fox1.mp3', 'fox2.mp3', 'fox3.mp3']
    },
    {
        name: 'frog',
        image: 'frog.png',
        sounds: ['frog1.mp3', 'frog2.mp3', 'frog3.mp3']
    }
];

const soundboardContainer = document.getElementById('soundboard-container');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundCache = {};
let activeSource = null;

// Preload sounds
function preloadSounds() {
    animals.forEach(animal => {
        animal.sounds.forEach(soundFile => {
            const soundPath = `./${soundFile}`;
            if (!soundCache[soundPath]) {
                fetch(soundPath)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        soundCache[soundPath] = audioBuffer;
                    })
                    .catch(error => console.error(`Error preloading sound ${soundFile}:`, error));
            }
        });
    });
}

function playSound(soundPath) {
    // If a sound is already playing, stop it.
    if (activeSource) {
        activeSource.stop();
        activeSource.disconnect();
    }

    const audioBuffer = soundCache[soundPath];
    if (audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        activeSource = source;

        // When the sound finishes, clear the active source
        source.onended = () => {
            if(activeSource === source) {
                activeSource = null;
            }
        };

    } else {
        console.error(`Sound not found in cache: ${soundPath}`);
    }
}

function createAnimalCard(animal) {
    const card = document.createElement('div');
    card.classList.add('animal-card');

    const image = document.createElement('img');
    image.src = animal.image;
    image.alt = `A cute ${animal.name}`;

    const name = document.createElement('div');
    name.classList.add('animal-name');
    name.textContent = animal.name;

    card.appendChild(image);
    card.appendChild(name);

    card.addEventListener('click', () => {
        // Resume AudioContext on user gesture
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Play a random sound for the animal
        const randomSound = animal.sounds[Math.floor(Math.random() * animal.sounds.length)];
        playSound(`./${randomSound}`);
        
        // Add animation
        card.classList.add('playing');
        card.addEventListener('animationend', () => {
            card.classList.remove('playing');
        }, { once: true });
    });

    soundboardContainer.appendChild(card);
}

document.addEventListener('DOMContentLoaded', () => {
    preloadSounds();
    animals.forEach(createAnimalCard);
});

