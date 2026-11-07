const API_URL = "http://127.0.0.1:8000";

window.onload = function() {
    carregarPartituras();
    loadDarkModePreference();
};

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('acervo_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function loadDarkModePreference() {
    if (localStorage.getItem('acervo_theme') === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('themeIcon');
    icon.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
}

async function carregarPartituras() {
    try {
        const response = await fetch(`${API_URL}/partituras/`);
        const partituras = await response.json();
        
        const grid = document.getElementById('sheetsGrid');
        grid.innerHTML = '';

        if (partituras.length === 0) {
            grid.innerHTML = `<p class="text-slate-400 col-span-full text-center py-8">Nenhuma partitura cadastrada ainda.</p>`;
            return;
        }

        partituras.forEach(sheet => {
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between";
            card.innerHTML = `
                <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">${sheet.instrumento}</span>
                    <h3 class="font-bold text-base mt-2">${sheet.titulo}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${sheet.compositor}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <a href="${sheet.url_arquivo || '#'}" target="_blank" class="block text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Abrir Ficheiro <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao conectar com a API:", error);
    }
}

async function handleAddSheet(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "A enviar...";
    btn.disabled = true;

    const formData = new FormData();
    formData.append("titulo", document.getElementById('addTitle').value);
    formData.append("compositor", document.getElementById('addComposer').value);
    formData.append("instrumento", document.getElementById('addInstrument').value);
    formData.append("genero", "Geral");
    formData.append("arquivo", document.getElementById('addFile').files[0]);

    try {
        const response = await fetch(`${API_URL}/partituras/`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('addSheetForm').reset();
            closeModal('addModal');
            carregarPartituras();
        } else {
            alert("Erro ao enviar o ficheiro.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    } finally {
        btn.innerText = "Salvar Ficheiro";
        btn.disabled = false;
    }
}