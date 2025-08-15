// Group Extractor para WhatsApp Web JS
class GroupExtractor {
    constructor() {
        console.log("GroupExtractor constructor llamado");
        this.groups = [];
        this.selectedGroup = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        console.log("bindEvents() llamado");
        
        // Botón para cargar grupos
        const extractBtn = document.getElementById("extractBtn");
        console.log("extractBtn encontrado:", !!extractBtn);
        if (extractBtn) {
            extractBtn.addEventListener("click", () => this.loadGroups());
        }

        // Botón para descargar números
        const downloadBtn = document.getElementById("downloadBtn");
        console.log("downloadBtn encontrado:", !!downloadBtn);
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => this.downloadNumbers());
        }
    }

    async loadGroups() {
        try {
            const extractBtn = document.getElementById("extractBtn");
            const groupInfo = document.getElementById("group-info");
            
            // Mostrar estado de carga
            extractBtn.disabled = true;
            extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando grupos...';
            groupInfo.innerHTML = '<div class="loading">Cargando grupos...</div>';

            // Verificar que las funciones necesarias estén disponibles
            if (typeof getServerUrl !== 'function') {
                throw new Error("Función getServerUrl no está disponible. Verifica que config.js se haya cargado correctamente.");
            }

            // Obtener el userId de la sesión actual
            const userId = await this.getCurrentUserId();
            if (!userId) {
                throw new Error("No hay una sesión activa de WhatsApp. Inicia sesión primero.");
            }

            console.log("Cargando grupos para userId:", userId);

            // Obtener la URL del servidor
            const serverUrl = await getServerUrl();
            console.log("Servidor URL:", serverUrl);
            
            // Hacer la petición para obtener grupos
            const response = await fetch(`${serverUrl}/groups/${userId}`);
            
            if (!response.ok) {
                if (response.status === 0) {
                    throw new Error("No se puede conectar al servidor. Verifica que el servidor esté ejecutándose en el puerto 3000.");
                }
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log("Respuesta del servidor:", data);

            if (!data.success) {
                throw new Error(data.error || "Error al cargar grupos");
            }

            this.groups = data.groups || [];
            console.log("Grupos cargados:", this.groups.length);
            
            // Actualizar la UI
            this.updateGroupsUI();
            
            // Restaurar el botón
            extractBtn.disabled = false;
            extractBtn.innerHTML = '<i class="fas fa-download"></i> Cargar Grupos';
            
            if (this.groups.length === 0) {
                groupInfo.innerHTML = '<div class="no-groups">No se encontraron grupos. Asegúrate de tener grupos en tu cuenta de WhatsApp.</div>';
            }

        } catch (error) {
            console.error("Error al cargar grupos:", error);
            
            const extractBtn = document.getElementById("extractBtn");
            const groupInfo = document.getElementById("group-info");
            
            extractBtn.disabled = false;
            extractBtn.innerHTML = '<i class="fas fa-download"></i> Cargar Grupos';
            groupInfo.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    updateGroupsUI() {
        const groupInfo = document.getElementById("group-info");
        
        if (this.groups.length === 0) {
            groupInfo.innerHTML = '<div class="no-groups">No se encontraron grupos</div>';
            return;
        }

        let html = `
            <div class="groups-container">
                <h4>Grupos encontrados (${this.groups.length})</h4>
                
                <div class="group-selector-container">
                    <div class="group-search-container">
                        <i class="fas fa-search group-search-icon"></i>
                        <input type="text" class="group-search-input" placeholder="Buscar grupos por nombre..." id="groupSearchInput">
                    </div>
                    
                    <div class="group-select-dropdown">
                        <select class="group-select" id="groupSelect">
                            <option value="">Selecciona un grupo</option>
        `;

        this.groups.forEach((group, index) => {
            html += `<option value="${group.id}" data-group-name="${group.name.toLowerCase()}">${group.name}</option>`;
        });

        html += `
                        </select>
                    </div>
                    
                    <div class="groups-counter">
                        <span id="filtered-count">${this.groups.length}</span> de ${this.groups.length} grupos disponibles
                    </div>
                </div>
            </div>
        `;

        groupInfo.innerHTML = html;
        
        // Agregar event listeners para el buscador y selector
        this.bindGroupSelectorEvents();
    }

    bindGroupSelectorEvents() {
        const searchInput = document.getElementById("groupSearchInput");
        const groupSelect = document.getElementById("groupSelect");
        
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.filterGroups(e.target.value);
            });
        }
        
        if (groupSelect) {
            groupSelect.addEventListener("change", (e) => {
                if (e.target.value) {
                    this.selectGroup(e.target.value);
                }
            });
        }
    }

    filterGroups(searchTerm) {
        const groupOptions = document.querySelectorAll("#groupSelect option");
        const filteredCount = document.getElementById("filtered-count");
        let visibleCount = 0;
        
        const searchLower = searchTerm.toLowerCase();
        
        // Filtrar opciones del selector
        groupOptions.forEach(option => {
            if (option.value === "") return; // No filtrar la opción por defecto
            
            const groupName = option.getAttribute("data-group-name");
            if (groupName.includes(searchLower)) {
                option.style.display = "";
                visibleCount++;
            } else {
                option.style.display = "none";
            }
        });
        
        // Actualizar contador
        if (filteredCount) {
            filteredCount.textContent = visibleCount;
        }
    }

    async selectGroup(groupId) {
        try {
            this.selectedGroup = this.groups.find(g => g.id === groupId);
            
            if (!this.selectedGroup) {
                throw new Error("Grupo no encontrado");
            }

            // Actualizar UI para mostrar el grupo seleccionado
            this.updateSelectedGroupUI();

        } catch (error) {
            console.error("Error al seleccionar grupo:", error);
            alert(`Error: ${error.message}`);
        }
    }

    updateSelectedGroupUI() {
        const groupInfo = document.getElementById("group-info");
        
        let html = `
            <div class="selected-group">
                <h4>
                    <i class="fas fa-check-circle"></i>
                    Grupo Seleccionado
                </h4>
                <div class="group-details">
                    <strong>Nombre:</strong> ${this.selectedGroup.name}<br>
                    <strong>ID:</strong> ${this.selectedGroup.id}<br>
                    <strong>Participantes:</strong> ${this.selectedGroup.participantsCount || 'N/A'}
                </div>
                <div class="group-actions">
                    <button class="btn green" onclick="groupExtractor.downloadNumbers()">
                        <i class="fas fa-download"></i> Extraer Números
                    </button>
                    <button class="btn red" onclick="groupExtractor.clearSelection()">
                        <i class="fas fa-times"></i> Cambiar Grupo
                    </button>
                </div>
            </div>
        `;

        groupInfo.innerHTML = html;
    }

    async downloadNumbers() {
        console.log("downloadNumbers() llamado");
        
        if (!this.selectedGroup) {
            alert("Por favor selecciona un grupo primero");
            return;
        }

        try {
            // Obtener el userId de la sesión actual
            const userId = await this.getCurrentUserId();
            if (!userId) {
                throw new Error("No hay una sesión activa de WhatsApp. Inicia sesión primero.");
            }

            console.log("Descargando números del grupo:", this.selectedGroup.name, "ID:", this.selectedGroup.id);

            // Verificar que las funciones necesarias estén disponibles
            if (typeof getServerUrl !== 'function') {
                throw new Error("Función getServerUrl no está disponible. Verifica que config.js se haya cargado correctamente.");
            }

            // Obtener la URL del servidor
            const serverUrl = await getServerUrl();
            
            // Hacer la petición para obtener participantes
            const response = await fetch(`${serverUrl}/groups/${userId}/${this.selectedGroup.id}/participants`);
            
            if (!response.ok) {
                if (response.status === 0) {
                    throw new Error("No se puede conectar al servidor. Verifica que el servidor esté ejecutándose en el puerto 3000.");
                }
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log("Respuesta de participantes:", data);

            if (!data.success) {
                throw new Error(data.error || "Error al obtener participantes");
            }

            const numbers = data.numbers || [];
            console.log("Números obtenidos:", numbers.length);
            
            if (numbers.length === 0) {
                alert("No se encontraron números en este grupo. Verifica que tengas permisos para ver la información del grupo.");
                return;
            }

            // Generar archivo de texto
            await this.generateTextFile(numbers, this.selectedGroup.name);

            alert(`Se guardaron ${numbers.length} números del grupo "${this.selectedGroup.name}" en un archivo TXT.`);

        } catch (error) {
            console.error("Error al descargar números:", error);
            alert(`Error: ${error.message}`);
        }
    }

    async generateTextFile(numbers, groupName) {
        try {
            console.log("generateTextFile() llamado con:", { numbers: numbers.length, groupName });
            
            // Crear contenido del archivo de texto con "+" al inicio de cada número
            const content = numbers.map(number => `+${number}`).join('\n');
            console.log("Contenido del archivo creado, longitud:", content.length);
            
            // Limpiar nombre del grupo para el archivo
            const cleanGroupName = groupName.replace(/[\/\\:*?"<>|]/g, "").trim();
            const defaultPath = `${cleanGroupName}_numeros.txt`;
            console.log("Ruta por defecto:", defaultPath);
            
            // Verificar que estamos en Electron
            console.log("Verificando APIs de Electron...");
            console.log("window.electronAPI:", !!window.electronAPI);
            console.log("window.electronAPI.saveTextFile:", !!(window.electronAPI && window.electronAPI.saveTextFile));
            
            if (window.electronAPI && window.electronAPI.saveTextFile) {
                console.log("Usando API de Electron para guardar archivo...");
                // Usar la API de Electron para guardar el archivo
                const result = await window.electronAPI.saveTextFile(content, defaultPath);
                console.log("Resultado de saveTextFile:", result);
                
                if (result.success) {
                    console.log('Archivo guardado exitosamente:', result.filePath);
                } else if (result.canceled) {
                    console.log('Usuario canceló la operación de guardado');
                } else {
                    throw new Error(result.error || 'Error al guardar el archivo');
                }
            } else {
                // Fallback para navegador web (no debería ocurrir en Electron)
                const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = defaultPath;
                link.click();
                URL.revokeObjectURL(link.href);
            }

        } catch (error) {
            console.error("Error al generar archivo de texto:", error);
            throw error;
        }
    }

    clearSelection() {
        this.selectedGroup = null;
        this.updateGroupsUI();
    }

    async getCurrentUserId() {
        // Obtener el userId de la sesión actual
        if (window.whatsappSession && window.whatsappSession.getUserId) {
            return window.whatsappSession.getUserId();
        }
        
        // Fallback: intentar obtener del localStorage
        return localStorage.getItem('whatsapp_user_id');
    }

    updateUI() {
        // Actualizar la UI inicial
        const groupInfo = document.getElementById("group-info");
        if (groupInfo) {
            groupInfo.innerHTML = '<div class="info">Haz clic en "Cargar Grupos" para ver los grupos disponibles</div>';
        }
    }
}

// Función para cargar números desde Excel (mantener compatibilidad)
function cargarNumerosDesdeExcel(datos) {
    const numberListElement = document.getElementById('numberList');

    // Limpiar la lista antes de agregar nuevos números
    numberListElement.innerHTML = '';

    // Llenar la lista con los números del archivo Excel
    datos.forEach(dato => {
        const div = document.createElement('div');
        div.classList.add('checkbox-item');
        div.innerHTML = `<input type="checkbox" value="${dato.Número}" /> ${dato.Número}`;
        numberListElement.appendChild(div);
    });
}

// Inicializar el extractor cuando el DOM esté listo
let groupExtractor;
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, inicializando GroupExtractor");
    groupExtractor = new GroupExtractor();
    
    // Exportar para uso global después de la inicialización
    window.groupExtractor = groupExtractor;
    window.cargarNumerosDesdeExcel = cargarNumerosDesdeExcel;
    
    console.log("GroupExtractor inicializado y exportado");
});
