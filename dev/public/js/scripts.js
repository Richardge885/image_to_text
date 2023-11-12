const { ipcRenderer } = require('electron');
const imageInput = document.getElementById('imageInput');
const output = document.getElementById('output');
const extractBtn = document.getElementById('extract-btn');
let imagePath;

// input image event listaner
imageInput.addEventListener('change', async () => {
    const [file] = imageInput.files;
    if (file) {
        imagePath = file.path; // Assuming 'path' is a property of the File object
    }
});

extractBtn.addEventListener('click', () => {
    const exrtactLanguage = document.getElementById('language').value;
    const data = {
        imagePath: imagePath,
        language: exrtactLanguage,
    };
    ipcRenderer.send('extract-text', data);
});

ipcRenderer.on('text-extracted', (event, text) => {
    const language = document.getElementById('language').value;
    let formattedText;
    if (language == 'chinese') {
        formattedText = text.replace(/\n/g, '<br/>').replace(/\s/g, '');
    } else if (language == 'traditional-chinese') {
        formattedText = text.replace(/\n/g, '<br/>').replace(/\s/g, '');
    } else {
        formattedText = text;
    }

    output.innerHTML = formattedText;
});

ipcRenderer.on('update progress', (e, progress) => {
    progress = progress * 100;
    progress = Math.min(100, Math.max(0, progress));
    progress = Math.round(progress);
    document.getElementById('progress-bar').innerText = `${progress}%`;
});
