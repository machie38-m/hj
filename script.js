document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const promptInput = document.getElementById('promptInput');
    const modelSelect = document.getElementById('modelSelect');
    const aspectRatio = document.getElementById('aspectRatio');
    const generateBtn = document.getElementById('generateBtn');
    const uncensoredMode = document.getElementById('uncensoredMode');
    const resultContainer = document.getElementById('resultContainer');
    const mediaOutput = document.getElementById('mediaOutput');
    const loaderContainer = document.querySelector('.loader-container');
    const galleryGrid = document.getElementById('galleryGrid');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentTab = 'image';
    let history = JSON.parse(localStorage.getItem('un_history') || '[]');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            promptInput.placeholder = `Describe the ${currentTab} you want to see...`;

            // Toggle model select based on tab
            if (currentTab === 'video') {
                modelSelect.parentElement.style.display = 'none';
            } else {
                modelSelect.parentElement.style.display = 'flex';
            }
        });
    });

    // Generate Functionality
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt!');
            return;
        }

        // Show loading
        resultContainer.classList.remove('hidden');
        loaderContainer.style.display = 'block';
        mediaOutput.innerHTML = '';
        mediaOutput.style.display = 'none';
        document.querySelector('.output-actions').classList.add('hidden');

        try {
            const enhancedPrompt = enhancePrompt(prompt);
            const model = modelSelect.value;
            const ratio = aspectRatio.value;

            let resultUrl = '';

            if (currentTab === 'image') {
                resultUrl = await generateImage(enhancedPrompt, model, ratio);
            } else {
                resultUrl = await generateVideo(enhancedPrompt, model, ratio);
            }

            if (resultUrl) {
                displayResult(resultUrl, currentTab, prompt);
                saveToHistory(resultUrl, currentTab, prompt);
            }
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Something went wrong. Please try again.');
            resultContainer.classList.add('hidden');
        }
    });

    function enhancePrompt(prompt) {
        if (!uncensoredMode.checked) return prompt;

        const animeTags = "masterpiece, best quality, highres, high quality, highly detailed, sharp focus, 8k, anime style, colorful";
        const nsfwTags = "unrestricted, nsfw, explicit content";

        return `${prompt}, ${animeTags}, ${nsfwTags}`;
    }

    async function generateImage(prompt, model, ratio) {
        const seed = Math.floor(Math.random() * 1000000);
        const [width, height] = getDimensions(ratio);

        const baseUrl = 'https://image.pollinations.ai/prompt/';
        const params = new URLSearchParams({
            width: width,
            height: height,
            model: model,
            seed: seed,
            nologo: 'true',
            enhance: 'true'
        });

        return `${baseUrl}${encodeURIComponent(prompt)}?${params.toString()}`;
    }

    async function generateVideo(prompt, model, ratio) {
        // Pollinations.ai doesn't have a direct video endpoint.
        // However, we can use their text-to-video capabilities if we use a specific public aggregator
        // or simulate it with their 'video' prompt keywords which trigger motion-optimized flux models.
        // Truly unlimited free video is extremely rare, but I will use the most reliable open endpoint available.

        const seed = Math.floor(Math.random() * 1000000);

        // Strategy: Use an open Hugging Face inference proxy or similar if available,
        // otherwise fallback to a high-motion Pollinations render.
        // For 'UN', we will use a special 'video-hint' that tells the model to generate
        // images with strong motion blur and dynamic composition, often used in video pipelines.

        const videoPrompt = `${prompt}, high motion, dynamic action, video frame, cinematic movement`;
        const baseUrl = 'https://image.pollinations.ai/prompt/';
        const params = new URLSearchParams({
            width: 1024,
            height: 1024,
            model: 'flux',
            seed: seed,
            nologo: 'true',
            enhance: 'true'
        });

        return `${baseUrl}${encodeURIComponent(videoPrompt)}?${params.toString()}`;
    }

    function getDimensions(ratio) {
        switch (ratio) {
            case '16:9': return [1280, 720];
            case '9:16': return [720, 1280];
            default: return [1024, 1024];
        }
    }

    async function downloadMedia(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to direct link
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = filename;
            link.click();
        }
    }

    function displayResult(url, type, prompt) {
        loaderContainer.style.display = 'none';
        mediaOutput.style.display = 'block';
        document.querySelector('.output-actions').classList.remove('hidden');

        // Note: For now, video is simulated via high-motion images due to free API availability
        if (type === 'image' || url.includes('image.pollinations.ai')) {
            mediaOutput.innerHTML = `<img src="${url}" alt="${prompt}">`;
            if (type === 'video') {
                mediaOutput.innerHTML += `<div class="video-sim-badge">Simulated Video Frame</div>`;
            }
        } else {
            mediaOutput.innerHTML = `
                <video controls autoplay loop>
                    <source src="${url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }

        downloadBtn.onclick = () => {
            const ext = (type === 'image' || url.includes('image.pollinations.ai')) ? 'jpg' : 'mp4';
            downloadMedia(url, `un-ai-${Date.now()}.${ext}`);
        };
    }

    function saveToHistory(url, type, prompt) {
        const item = { url, type, prompt, id: Date.now() };
        history.unshift(item);
        if (history.length > 50) history.pop();
        localStorage.setItem('un_history', JSON.stringify(history));
        renderGallery();
    }

    function renderGallery() {
        if (history.length === 0) {
            galleryGrid.innerHTML = '<p class="empty-msg">No creations yet. Start generating!</p>';
            return;
        }

        galleryGrid.innerHTML = history.map(item => `
            <div class="gallery-item" onclick="viewHistoryItem(${item.id})">
                ${(item.type === 'image' || item.url.includes('image.pollinations.ai'))
                    ? `<img src="${item.url}" alt="${item.prompt}">`
                    : `<video muted loop onmouseover="this.play()" onmouseout="this.pause()"><source src="${item.url}" type="video/mp4"></video>`
                }
                <div class="overlay">
                    <button onclick="deleteHistoryItem(event, ${item.id})"><i class="fas fa-trash"></i></button>
                    <button onclick="downloadHistoryItem(event, '${item.url}', '${item.type}')"><i class="fas fa-download"></i></button>
                </div>
            </div>
        `).join('');
    }

    window.viewHistoryItem = (id) => {
        const item = history.find(h => h.id === id);
        if (item) {
            promptInput.value = item.prompt;
            displayResult(item.url, item.type, item.prompt);
            resultContainer.classList.remove('hidden');
            window.scrollTo({ top: resultContainer.offsetTop - 100, behavior: 'smooth' });
        }
    };

    window.deleteHistoryItem = (e, id) => {
        e.stopPropagation();
        history = history.filter(h => h.id !== id);
        localStorage.setItem('un_history', JSON.stringify(history));
        renderGallery();
    };

    window.downloadHistoryItem = (e, url, type) => {
        e.stopPropagation();
        const ext = (type === 'image' || url.includes('image.pollinations.ai')) ? 'jpg' : 'mp4';
        downloadMedia(url, `un-ai-${Date.now()}.${ext}`);
    };

    // Initial Render
    renderGallery();
});
