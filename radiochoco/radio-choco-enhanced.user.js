// ==UserScript==
// @name         Radio Choco - Enhanced Player
// @namespace    https://radiochoco.com/
// @version      1.8
// @description  Immersive UI with cover-based background, track progress, album, buy-link, history tooltip
// @author       you
// @match        https://radiochoco.com/*
// @match        https://player.radioking.io/radiochoco-sound/*
// @icon         https://radiochoco.com/favicon-32x32.png
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const isPlayer = location.hostname.includes('player.radioking.io');
    const isParent = location.hostname.includes('radiochoco.com');

    // ============================================================
    //  IFRAME — player.radioking.io/radiochoco-sound
    // ============================================================
    if (isPlayer) {
        GM_addStyle(`
            img#cover {
                width: 220px !important;
                height: 220px !important;
                object-fit: cover !important;
                border-radius: 16px !important;
            }
            div:has(> img#cover) {
                min-width: 220px !important;
                width: 220px !important;
                height: 220px !important;
                border-radius: 16px !important;
                overflow: hidden !important;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
            }

            #current-title {
                font-size: 28px !important;
                font-weight: 800 !important;
                height: auto !important;
                line-height: 1.2 !important;
                margin-bottom: 4px !important;
                letter-spacing: -0.3px !important;
            }
            #current-artist {
                font-size: 20px !important;
                font-weight: 500 !important;
                height: auto !important;
                line-height: 1.3 !important;
                opacity: 0.9 !important;
            }
            #current-album {
                display: none !important;
            }

            .volume-container, #download, #share, #HD, #popup,
            .cover-like, .share-zone-container {
                display: none !important;
            }
            #radio-infos {
                padding-top: 6px !important;
            }

            #action-buttons > :not(#play-pause) {
                display: none !important;
            }
            #action-buttons {
                justify-content: flex-start !important;
                padding-left: 4px !important;
                margin-top: 8px !important;
                gap: 0 !important;
            }
            #play-pause {
                position: relative !important;
                width: 48px !important;
                height: 48px !important;
                background: rgba(255,255,255,0.18) !important;
                border-radius: 50% !important;
                backdrop-filter: blur(6px) !important;
                transition: all 0.2s ease !important;
                cursor: pointer !important;
            }
            #play-pause:hover {
                background: rgba(255,255,255,0.3) !important;
            }
            #play-pause svg {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                fill: #fff !important;
                color: #fff !important;
                width: 24px !important;
                height: 24px !important;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)) !important;
            }

            #player {
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                gap: 20px !important;
                padding: 20px !important;
                background: rgba(10, 10, 20, 0.45) !important;
                backdrop-filter: blur(12px) !important;
                height: 100% !important;
                box-sizing: border-box !important;
            }

            #current-title, #current-artist, #current-album {
                text-shadow: 0 2px 12px rgba(0,0,0,0.6) !important;
            }

            #infos {
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                padding: 0 !important;
                min-width: 0 !important;
            }

            #track {
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
            }

            #track .title, #track .artist, #track .album {
                overflow: visible !important;
            }

            /* ---- progress bar ---- */
            #rk-progress-wrap {
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: rgba(255,255,255,0.1);
                margin-top: 10px;
                overflow: hidden;
                position: relative;
            }
            #rk-progress-bar {
                height: 100%;
                width: 0%;
                border-radius: 2px;
                background: rgba(255,255,255,0.65);
                transition: width 1s linear;
            }
            #rk-time {
                font-size: 12px;
                opacity: 0.5;
                margin-top: 2px;
                font-variant-numeric: tabular-nums;
            }

            /* ---- up next ---- */
            #rk-next {
                font-size: 12px;
                text-align: right;
                margin-top: 6px;
                letter-spacing: 0.3px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                padding-top: 6px;
                color: rgba(255,255,255,0.9);
            }
            #rk-next .rk-next-icon {
                margin-right: 4px;
            }
            #rk-next .rk-next-label {
                opacity: 0.55;
            }
            #rk-next .rk-next-artist {
                opacity: 0.65;
            }
            #rk-next .rk-next-anim {
                display: inline-block;
                animation: rkNextSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes rkNextSlide {
                from { opacity: 0; transform: translateX(18px); }
                to   { opacity: 1; transform: translateX(0); }
            }

            /* ---- history tooltip ---- */
            #rk-next-wrap {
                position: relative;
            }
            #rk-history-backdrop {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.35);
                z-index: 199;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease;
            }
            #rk-history-backdrop.visible {
                opacity: 1;
                pointer-events: auto;
            }
            #rk-history-tooltip {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                background: rgba(10,10,20,0.94);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                border-radius: 12px;
                padding: 16px 20px;
                min-width: 280px;
                max-width: 360px;
                max-height: 200px;
                overflow-y: auto;
                box-shadow: 0 12px 48px rgba(0,0,0,0.6);
                border: 1px solid rgba(255,255,255,0.08);
                font-size: 13px;
                color: rgba(255,255,255,0.9);
                line-height: 1.5;
                z-index: 200;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease, transform 0.25s ease;
            }
            #rk-history-tooltip.visible {
                opacity: 1;
                pointer-events: auto;
                transform: translate(-50%, -50%) scale(1);
            }
            #rk-history-tooltip .rk-tt-header {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                opacity: 0.35;
                margin-bottom: 6px;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            #rk-history-tooltip .rk-tt-item {
                display: flex;
                gap: 6px;
                padding: 2px 0;
                opacity: 0.7;
                transition: opacity 0.15s;
            }
            #rk-history-tooltip .rk-tt-item:hover {
                opacity: 1;
            }
            #rk-history-tooltip .rk-tt-num {
                opacity: 0.3;
                min-width: 20px;
                text-align: right;
                font-variant-numeric: tabular-nums;
            }
            #rk-history-tooltip .rk-tt-title {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            #rk-history-tooltip .rk-tt-artist {
                opacity: 0.55;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            #rk-history-tooltip::-webkit-scrollbar {
                width: 4px;
            }
            #rk-history-tooltip::-webkit-scrollbar-track {
                background: transparent;
            }
            #rk-history-tooltip::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
            }
        `);

        /* ---- hide like/dislike via JS (hashed class names) ---- */
        function hideLikeDislike() {
            const c = document.getElementById('action-buttons');
            if (!c) return;
            for (const ch of c.children) {
                if (ch.id !== 'play-pause') ch.style.display = 'none';
            }
        }
        hideLikeDislike();
        new MutationObserver(hideLikeDislike).observe(
            document.body || document.documentElement,
            { childList: true, subtree: true }
        );

        /* ---- enlarge cover container (hashed class) ---- */
        function enlargeCover() {
            const img = document.getElementById('cover');
            if (!img) return false;
            const p = img.parentElement;
            if (p) {
                Object.assign(p.style, {
                    minWidth: '220px', width: '220px', height: '220px',
                    borderRadius: '16px', overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                });
            }
            return true;
        }
        if (!enlargeCover()) {
            const obs = new MutationObserver(() => { if (enlargeCover()) obs.disconnect(); });
            obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }

        /* ---- progress bar DOM ---- */
        let startedAt = null;
        let trackDuration = 0;
        const progressWrap = document.createElement('div');
        progressWrap.id = 'rk-progress-wrap';
        const progressBar = document.createElement('div');
        progressBar.id = 'rk-progress-bar';
        progressWrap.appendChild(progressBar);
        const timeLabel = document.createElement('div');
        timeLabel.id = 'rk-time';

        const nextWrap = document.createElement('div');
        nextWrap.id = 'rk-next-wrap';
        const nextEl = document.createElement('div');
        nextEl.id = 'rk-next';
        nextWrap.appendChild(nextEl);
        const backdropEl = document.createElement('div');
        backdropEl.id = 'rk-history-backdrop';
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'rk-history-tooltip';
        document.body.appendChild(backdropEl);
        document.body.appendChild(tooltipEl);
        let tooltipTimer = null;
        function showTooltip() { clearTimeout(tooltipTimer); backdropEl.classList.add('visible'); tooltipEl.classList.add('visible'); }
        function hideTooltip() { tooltipTimer = setTimeout(() => { backdropEl.classList.remove('visible'); tooltipEl.classList.remove('visible'); }, 200); }
        nextWrap.addEventListener('mouseenter', showTooltip);
        nextWrap.addEventListener('mouseleave', hideTooltip);
        tooltipEl.addEventListener('mouseenter', showTooltip);
        tooltipEl.addEventListener('mouseleave', hideTooltip);

        function fmt(sec) {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return `${m}:${String(s).padStart(2, '0')}`;
        }

        function updateProgress() {
            if (!startedAt || !trackDuration) {
                progressBar.style.width = '0%';
                timeLabel.textContent = '';
                return;
            }
            const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000 - 10;
            const clamped = Math.max(0, Math.min(elapsed, trackDuration));
            const pct = trackDuration > 0 ? (clamped / trackDuration * 100) : 0;
            progressBar.style.width = `${pct}%`;
            timeLabel.textContent = `${fmt(clamped)} / ${fmt(trackDuration)}`;
        }
        setInterval(updateProgress, 1000);

        function injectProgressBar() {
            const infos = document.getElementById('infos');
            if (!infos || document.getElementById('rk-progress-wrap')) return;
            infos.appendChild(progressWrap);
            infos.appendChild(timeLabel);
            infos.appendChild(nextWrap);
        }

        /* ---- watch for infos element to insert progress bar ---- */
        if (!injectProgressBar()) {
            const obs = new MutationObserver(() => { if (injectProgressBar()) obs.disconnect(); });
            obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
        }

        /* ---- send cover to parent ---- */
        let lastCover = null;

        function sendCover(force) {
            const img = document.getElementById('cover');
            if (!img || !img.src) return;
            if (force) lastCover = null;
            if (img.src === lastCover) return;
            lastCover = img.src;
            try { window.parent.postMessage({ type: 'rk-cover', url: img.src }, '*'); } catch (_) {}
        }

        function watchEl(id, fn) {
            const el = document.getElementById(id);
            if (el) { fn(el); return true; }
            return false;
        }

        if (!watchEl('cover', (img) => {
            sendCover();
            new MutationObserver(() => sendCover()).observe(img, {
                attributes: true, attributeFilter: ['src'],
            });
        })) {
            const obs = new MutationObserver(() => { if (watchEl('cover', () => {})) obs.disconnect(); });
            obs.observe(document.body, { childList: true, subtree: true });
        }

        /* ---- poll API directly for fast updates & progress data ---- */
        const slug = location.pathname.split('/').filter(Boolean)[0] || 'radiochoco-sound';
        const API = `https://api.radioking.io/widget/radio/${slug}/track/current`;
        const NEXT_API = `https://api.radioking.io/widget/radio/${slug}/track/next`;
        let lastTrackId = null;
        let lastChangeTs = 0;
        let currentTitle = '';
        let currentArtist = '';
        let currentAlbum = '';

        async function pollApi() {
            try {
                const r = await fetch(`${API}?_=${Date.now()}`, { credentials: 'omit' });
                if (!r.ok) { console.warn('rk api', r.status); return; }
                const d = await r.json();
                if (!d || !d.id) return;

                /* same track — update progress data from API */
                if (d.id === lastTrackId) {
                    startedAt = d.started_at;
                    trackDuration = d.duration || 0;
                    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000 - 10;
                    if (elapsed > trackDuration) {
                        console.log('rk past end', { id: d.id, title: d.title, artist: d.artist, elapsed, duration: trackDuration });
                    }
                    return;
                }

                /* new track ID — debounce against flapping */
                if (Date.now() - lastChangeTs < 5000) return;

                lastTrackId = d.id;
                lastChangeTs = Date.now();
                startedAt = d.started_at;
                trackDuration = d.duration || 0;
                currentTitle = fixEnc(d.title || '');
                currentArtist = fixEnc(d.artist || '');
                currentAlbum = fixEnc(d.album || '');
                console.log('rk new track', { id: d.id, title: currentTitle, artist: currentArtist, album: currentAlbum, started_at: d.started_at, duration: trackDuration });

                try { window.parent.postMessage({ type: 'rk-track', title: d.title, artist: d.artist }, '*'); } catch (_) {}
                document.title = d.title && d.artist ? `${d.artist} - ${d.title}` : (d.title || d.artist || 'Radio Choco');

                const titleEl = document.getElementById('current-title');
                const artistEl = document.getElementById('current-artist');
                const coverImg = document.getElementById('cover');

                if (titleEl && d.title != null) titleEl.firstElementChild.innerText = currentTitle;
                if (artistEl && d.artist != null) {
                    let txt = esc(currentArtist);
                    if (currentAlbum) txt += ` <span style="opacity:0.35">· ${esc(currentAlbum)}</span>`;
                    const child = artistEl.firstElementChild;
                    if (child) {
                        child.innerHTML = txt;
                        watchArtistForAlbum(child);
                    } else {
                        artistEl.innerHTML = `<span class="artist">${txt}</span>`;
                    }
                }
                if (coverImg && d.cover) coverImg.setAttribute('src', d.cover);
                sendCover(true);
            } catch (e) { console.warn('rk api error', e); }
        }

        /* observer to re-apply album when player overwrites it */
        let artistObs = null;
        let artistSuppress = false;
        function watchArtistForAlbum(child) {
            if (artistObs) artistObs.disconnect();
            artistObs = new MutationObserver(() => {
                if (!currentAlbum || artistSuppress) return;
                if (child.querySelector('span[style*="opacity"]')) return;
                artistSuppress = true;
                child.innerHTML = `${esc(currentArtist)} <span style="opacity:0.35">· ${esc(currentAlbum)}</span>`;
                artistSuppress = false;
            });
            artistObs.observe(child, { childList: true, characterData: true, subtree: true });
        }

        /* adaptive polling: 1s near/after track end, 8s otherwise */
        function scheduleNext() {
            let delay = 8000;
            if (startedAt && trackDuration) {
                const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000 - 10;
                if (elapsed >= trackDuration * 0.95) delay = 1000;
            }
            setTimeout(() => { pollApi(); scheduleNext(); }, delay);
        }
        setTimeout(() => { pollApi(); scheduleNext(); }, 500);

        /* ---- up next ---- */
        let lastNextKey = '';
        let lastNextTs = 0;

        function setNextTrack(next) {
            if (!next || (!next.title && !next.artist)) {
                nextEl.style.display = 'none';
                return;
            }
            const nTitle = fixEnc(next.title || '');
            const nArtist = fixEnc(next.artist || '');
            nextEl.style.display = '';
            const key = `${nTitle}|${nArtist}`;
            const now = Date.now();
            const anim = (key !== lastNextKey && now - lastNextTs > 500);
            if (anim) {
                lastNextKey = key;
                lastNextTs = now;
            }
            const icon = '<span class="rk-next-icon">♪</span>';
            const label = '<span class="rk-next-label">Up Next</span>';
            const sep = '<span style="opacity:0.3;margin:0 4px;">·</span>';
            const title = `<span class="rk-next-title">${esc(nTitle)}</span>`;
            const artist = `<span class="rk-next-artist">${esc(nArtist)}</span>`;
            const html = `${icon}${label}${sep}${title}${sep}${artist}`;
            if (anim) {
                nextEl.innerHTML = `<span class="rk-next-anim">${html}</span>`;
            } else {
                nextEl.innerHTML = `<span>${html}</span>`;
            }
        }

        function fixEnc(s) {
            if (!s) return s;
            const m = {'\x80':"'",'\x82':"'",'\x83':'f','\x84':'"','\x85':'...','\x86':'+','\x87':'+','\x88':'^','\x89':'%','\x8A':'S','\x8B':'<','\x8C':'OE','\x8E':'Z','\x91':"'",'\x92':"'",'\x93':'"','\x94':'"','\x95':'*','\x96':'-','\x97':'-','\x98':'~','\x99':"'",'\x9A':'s','\x9B':'>','\x9C':'oe','\x9E':'z','\x9F':'Y'};
            return s.replace(/[\x80-\x9F]/g, c => m[c] || '');
        }

        function esc(s) {
            const d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }

        async function pollNextTrack() {
            try {
                const r = await fetch(`${NEXT_API}?_=${Date.now()}`, { credentials: 'omit' });
                if (!r.ok) { console.warn('rk next api', r.status); return; }
                const list = await r.json();
                if (!list || !list.length) { nextEl.style.display = 'none'; return; }
                setNextTrack(list[0]);
            } catch (e) { console.warn('rk next api error', e); }
        }
        setTimeout(pollNextTrack, 1000);
        setInterval(pollNextTrack, 5000);

        /* ---- history tooltip ---- */
        const HISTORY_API = `https://api.radioking.io/widget/radio/${slug}/track/history`;

        function renderHistory(list) {
            if (!list || !list.length) { tooltipEl.innerHTML = ''; return; }
            const filtered = list.filter(t => t.title !== currentTitle || t.artist !== currentArtist);
            if (!filtered.length) { tooltipEl.innerHTML = ''; return; }
            const parts = ['<div class="rk-tt-header">Previously played</div>'];
            for (let i = 0; i < Math.min(filtered.length, 10); i++) {
                const t = filtered[i];
                parts.push(`<div class="rk-tt-item">` +
                    `<span class="rk-tt-num">${i + 1}.</span>` +
                    `<span class="rk-tt-title">${esc(fixEnc(t.title || ''))}</span>` +
                    `<span class="rk-tt-artist">${esc(fixEnc(t.artist || ''))}</span>` +
                    `</div>`);
            }
            tooltipEl.innerHTML = parts.join('');
        }

        async function pollHistory() {
            try {
                const r = await fetch(`${HISTORY_API}?_=${Date.now()}`, { credentials: 'omit' });
                if (!r.ok) return;
                const list = await r.json();
                renderHistory(list);
            } catch (_) {}
        }
        setTimeout(pollHistory, 2000);
        setInterval(pollHistory, 30000);
    }

    // ============================================================
    //  PARENT — radiochoco.com
    // ============================================================
    if (isParent) {
        const FALLBACK_BG = 'linear-gradient(135deg, #2d1b00, #1a0f00, #3d2b1f)';

        GM_addStyle(`
            .container > .content { display: none !important; }
            .container > div:last-of-type:not([class]) { display: none !important; }
            .hosting-info { display: none !important; }
            .social-links { display: none !important; }

            html, body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: ${FALLBACK_BG} !important;
            }

            #page, .page {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: transparent !important;
                position: relative !important;
                z-index: 1;
            }
            #page {
                width: 100vw !important;
                height: 100vh !important;
                table-layout: auto !important;
            }
            .page:before { display: none !important; }

            .container {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: transparent !important;
                padding: 0 !important;
                position: relative !important;
                z-index: 2 !important;
                vertical-align: middle !important;
            }

            iframe[src*="player.radioking.io"] {
                width: 95vw !important;
                max-width: 820px !important;
                height: 260px !important;
                border-radius: 20px !important;
            }
        `);

        /* ---- background layer ---- */
        const bgDiv = document.createElement('div');
        bgDiv.style.cssText = [
            'position:fixed', 'top:-60px', 'left:-60px',
            'right:-60px', 'bottom:-60px',
            `background:${FALLBACK_BG} center/cover no-repeat`,
            'filter:blur(50px) brightness(0.3) saturate(1.4)',
            'z-index:0', 'transition:background 1s ease',
        ].join(';');
        document.documentElement.insertBefore(bgDiv, document.documentElement.firstChild);

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        bgDiv.after(canvas);

        let kawarp = null;
        let pendingCover = null;

        async function initKawarp() {
            try {
                const mod = await import('https://cdn.jsdelivr.net/npm/@kawarp/core/+esm');
                const { Kawarp } = mod;
                kawarp = new Kawarp(canvas, {
                    warpIntensity: 0.8, blurPasses: 6, animationSpeed: 1.0,
                    transitionDuration: 2000, saturation: 1.4,
                    tintColor: [0.12, 0.06, 0.0], tintIntensity: 0.15,
                });
                if (pendingCover) await kawarp.loadImage(pendingCover);
                kawarp.start();
            } catch (_) {}
        }
        initKawarp();

        function setBackground(url) {
            pendingCover = url;
            bgDiv.style.background = `url("${url.replace(/"/g, '%22')}") center/cover no-repeat`;
            if (kawarp) kawarp.loadImage(url);
        }

        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'rk-cover' && e.data.url) setBackground(e.data.url);
            if (e.data && e.data.type === 'rk-track') {
                document.title = e.data.title && e.data.artist ? `${e.data.artist} - ${e.data.title}` : (e.data.title || e.data.artist || 'Radio Choco');
            }
        });

        setInterval(() => {
            const f = document.querySelector('iframe[src*="player.radioking.io"]');
            if (f && f.contentWindow) try { f.contentWindow.postMessage({ type: 'rk-cover-req' }, '*'); } catch (_) {}
        }, 8000);
    }
})();
