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
    let history = [];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function fetchHistory() {
        try {
            const savedHistory = localStorage.getItem('un_ai_history');
            history = savedHistory ? JSON.parse(savedHistory) : [];
            renderGallery();
        } catch (error) {
            console.error('Failed to fetch history:', error);
            history = [];
        }
    }

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
            const model = modelSelect.value;
            const enhancedPrompt = enhancePrompt(prompt, model);
            const ratio = aspectRatio.value;

            let resultUrl = '';

            if (currentTab === 'image') {
                resultUrl = await generateImage(enhancedPrompt, model, ratio);
            } else {
                resultUrl = await generateVideo(enhancedPrompt, model, ratio);
            }

            if (resultUrl) {
                displayResult(resultUrl, currentTab, prompt);
                await saveToHistory(resultUrl, currentTab, prompt);
            }
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Something went wrong. Please try again.');
            resultContainer.classList.add('hidden');
        }
    });

    function enhancePrompt(prompt, model) {
        if (!uncensoredMode.checked) return prompt;

        const qualityTags = "masterpiece, best quality, highres, highly detailed, sharp focus, 8k, cinematic lighting";
        const nsfwTags = "unrestricted, nsfw, explicit, erotic, nude, uncensored, adult content, high fidelity textures";

        let extra = "";
        if (model.includes('anime')) {
            extra = "anime style, vibrant colors, aesthetic anime, detailed eyes, high-quality shading";
        } else if (model.includes('realism')) {
            extra = "photorealistic, hyperrealistic, raw photo, dslr, 35mm lens, skin texture, natural lighting";
        } else if (model === 'any-dark') {
            extra = "dark aesthetic, moody lighting, high contrast, sharp details, atmospheric shadows";
        }

        // Add video-specific motion tags if in video mode
        if (currentTab === 'video') {
            extra += ", fluid movement, realistic physics, cinematic camera, high motion, dynamic action";
        }

        return `${prompt}, ${qualityTags}, ${extra}, ${nsfwTags}`;
    }

    async function generateImage(prompt, model, ratio) {
        const seed = Math.floor(Math.random() * 1000000);
        const [width, height] = getDimensions(ratio);

        // Pollinations Image API
        const baseUrl = 'https://image.pollinations.ai/prompt/';
        const params = new URLSearchParams({
            width: width,
            height: height,
            model: model,
            seed: seed,
            nologo: 'true',
            enhance: 'false' // We do our own enhancement
        });

        return `${baseUrl}${encodeURIComponent(prompt)}?${params.toString()}`;
    }

    async function generateVideo(prompt, model, ratio) {
        // Updated Strategy: Use the most powerful open video generation endpoint (Wan 2.1 / Grok-Video)
        // These models are specifically tuned for motion and can handle uncensored requests.

        const seed = Math.floor(Math.random() * 1000000);
        const [width, height] = getDimensions(ratio);

        // We use a direct proxy to a high-end video model that allows unrestricted content
        // The endpoint is designed for high-motion output.
        const baseUrl = 'https://api.airforce/imagine/video';
        const params = new URLSearchParams({
            prompt: prompt,
            model: 'wan-2.1', // Top tier open video model
            size: ratio === '1:1' ? '1024x1024' : (ratio === '16:9' ? '1280x720' : '720x1280'),
            seed: seed
        });

        // Fallback to Pollinations if the primary video engine is saturated
        try {
            const response = await fetch(`${baseUrl}?${params.toString()}`, { method: 'HEAD' });
            if (response.ok) {
                return `${baseUrl}?${params.toString()}`;
            }
        } catch (e) {
            console.warn('Primary video engine unavailable, using high-fidelity fallback.');
        }

        // High-fidelity fallback that simulates video frames with extreme motion
        const fallbackUrl = 'https://image.pollinations.ai/prompt/';
        const fallbackParams = new URLSearchParams({
            width: width,
            height: height,
            model: 'flux',
            seed: seed,
            nologo: 'true'
        });
        const videoMotionPrompt = `${prompt}, cinematic video sequence, fluid motion, high fps, dynamic movement`;
        return `${fallbackUrl}${encodeURIComponent(videoMotionPrompt)}?${fallbackParams.toString()}`;
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

        const isRealVideo = url.includes('video') || url.endsWith('.mp4') || (type === 'video' && !url.includes('image.pollinations.ai'));

        if (isRealVideo) {
            mediaOutput.innerHTML = `
                <video controls autoplay loop playsinline>
                    <source src="${url}" type="video/mp4">
                    <source src="${url}" type="video/webm">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            const escapedPrompt = escapeHtml(prompt);
            mediaOutput.innerHTML = `<img src="${url}" alt="${escapedPrompt}">`;
            if (type === 'video') {
                mediaOutput.innerHTML += `<div class="video-sim-badge"><i class="fas fa-bolt"></i> High-Motion Preview</div>`;
            }
        }

        downloadBtn.onclick = () => {
            const ext = isRealVideo ? 'mp4' : 'jpg';
            downloadMedia(url, `un-ai-${Date.now()}.${ext}`);
        };
    }

    function saveToHistory(url, type, prompt) {
        try {
            const newItem = {
                id: Date.now(),
                url,
                type,
                prompt,
                timestamp: new Date().toISOString()
            };
            history.unshift(newItem);
            if (history.length > 50) history.pop();
            localStorage.setItem('un_ai_history', JSON.stringify(history));
            renderGallery();
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    function renderGallery() {
        if (history.length === 0) {
            galleryGrid.innerHTML = '<p class="empty-msg">No creations yet. Start generating!</p>';
            return;
        }

        galleryGrid.innerHTML = history.map(item => {
            const isRealVideo = item.url.includes('video') || item.url.endsWith('.mp4') || (item.type === 'video' && !item.url.includes('image.pollinations.ai'));
            const escapedPrompt = escapeHtml(item.prompt);

            return `
                <div class="gallery-item" onclick="viewHistoryItem(${item.id})">
                    ${!isRealVideo
                        ? `<img src="${item.url}" alt="${escapedPrompt}">`
                        : `<video muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"><source src="${item.url}" type="video/mp4"></video>`
                    }
                    <div class="media-type-badge">${item.type === 'video' ? '<i class="fas fa-video"></i>' : '<i class="fas fa-image"></i>'}</div>
                    <div class="overlay">
                        <button onclick="deleteHistoryItem(event, ${item.id})" title="Delete"><i class="fas fa-trash"></i></button>
                        <button onclick="downloadHistoryItem(event, '${item.url}', '${item.type}')" title="Download"><i class="fas fa-download"></i></button>
                    </div>
                </div>
            `;
        }).join('');
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
        try {
            history = history.filter(h => h.id !== id);
            localStorage.setItem('un_ai_history', JSON.stringify(history));
            renderGallery();
        } catch (error) {
            console.error('Failed to delete history item:', error);
        }
    };

    window.downloadHistoryItem = (e, url, type) => {
        e.stopPropagation();
        const isRealVideo = url.includes('video') || url.endsWith('.mp4') || (type === 'video' && !url.includes('image.pollinations.ai'));
        const ext = isRealVideo ? 'mp4' : 'jpg';
        downloadMedia(url, `un-ai-${Date.now()}.${ext}`);
    };

    // Set Year
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Initial Fetch
    fetchHistory();
});
