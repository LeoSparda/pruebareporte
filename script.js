document.addEventListener('DOMContentLoaded', function() {
    // Usa una URL base dependiendo del entorno
    const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://pruebareporte-leospardas-projects.vercel.app/api';
    
    // Cargar el menú de tiendas y subtiendas
    const loadMenu = async () => {
        try {
            const response = await fetch(`${apiUrl}/tiendas`);
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API: ' + response.statusText);
            }
            const tiendas = await response.json();
            const storeMenu = document.getElementById('store-menu');

            if (!storeMenu) {
                throw new Error('Elemento #store-menu no encontrado');
            }

            storeMenu.innerHTML = ''; // Limpiar el menú existente

            for (const tienda of tiendas) {
                const tiendaItem = document.createElement('li');
                const tiendaLink = document.createElement('a');
                tiendaLink.href = '#';
                tiendaLink.classList.add('toggle-menu');
                tiendaLink.textContent = tienda.nombre;
                tiendaLink.dataset.target = `${tienda.id}-menu`;

                const subMenu = document.createElement('ul');
                subMenu.id = `${tienda.id}-menu`;
                subMenu.classList.add('sub-menu');
                tiendaItem.appendChild(tiendaLink);
                tiendaItem.appendChild(subMenu);
                storeMenu.appendChild(tiendaItem);

                // Cargar subtiendas
                const subResponse = await fetch(`${apiUrl}/subtiendas/${tienda.id}`);
                if (!subResponse.ok) {
                    throw new Error('Error en la respuesta de la API: ' + subResponse.statusText);
                }
                const subtiendas = await subResponse.json();

                for (const subtienda of subtiendas) {
                    const subtiendaItem = document.createElement('li');
                    const subtiendaLink = document.createElement('a');
                    subtiendaLink.href = '#';
                    subtiendaLink.textContent = subtienda.nombre;
                    subtiendaLink.addEventListener('click', () => {
                        window.location.href = `inventario.html?subtiendaId=${subtienda.id}`;
                    });
                    subtiendaItem.appendChild(subtiendaLink);
                    subMenu.appendChild(subtiendaItem);
                }
            }

            // Agregar el evento de clic para los enlaces de tienda
            document.querySelectorAll('.toggle-menu').forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const targetId = this.dataset.target;
                    const targetMenu = document.getElementById(targetId);

                    if (targetMenu.style.display === 'block') {
                        targetMenu.style.display = 'none';
                    } else {
                        hideAllMenus();
                        targetMenu.style.display = 'block';
                    }
                });
            });
        } catch (error) {
            console.error('Error al cargar el menú:', error);
        }
    };

    // Ocultar todos los sub-menús
    const hideAllMenus = () => {
        document.querySelectorAll('.sub-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    };

    // Mostrar el formulario para agregar tienda/subtienda
    const addStoreBtn = document.getElementById('add-store-btn');
    const addStoreForm = document.getElementById('add-store-form');
    const storeNameInput = document.getElementById('store-name');
    const warningMessage = document.getElementById('warning-message');

    addStoreBtn.addEventListener('click', () => {
        addStoreForm.classList.toggle('hidden');
        loadStoreOptions(); // Cargar opciones para subtiendas
    });

    // Agregar una nueva tienda/subtienda
    const submitStoreBtn = document.getElementById('submit-store-btn');
    submitStoreBtn.addEventListener('click', async () => {
        const storeName = storeNameInput.value.trim();
        const selectedStore = document.getElementById('store-select')?.value;

        if (storeName === '') {
            warningMessage.textContent = 'Por favor, ingrese un nombre para la tienda/subtienda.';
            warningMessage.style.display = 'block';
            return;
        }

        try {
            const endpoint = selectedStore ? `${apiUrl}/subtiendas` : `${apiUrl}/tiendas`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: storeName, tienda_id: selectedStore })
            });

            if (response.ok) {
                storeNameInput.value = '';
                addStoreForm.classList.add('hidden');
                warningMessage.style.display = 'none';
                loadMenu(); // Recargar el menú
            }
        } catch (error) {
            console.error('Error al agregar la tienda/subtienda:', error);
        }
    });

    // Mostrar el formulario para eliminar tienda/subtienda
    const removeStoreBtn = document.getElementById('remove-store-btn');
    const removeStoreForm = document.getElementById('remove-store-form');
    const removeStoreSelect = document.getElementById('remove-store-select');
    const removeWarningMessage = document.getElementById('remove-warning-message');

    removeStoreBtn.addEventListener('click', () => {
        removeStoreForm.classList.toggle('hidden');
        loadRemoveStoreOptions(); // Cargar opciones de eliminación al mostrar formulario
    });

    // Eliminar una tienda/subtienda
    const submitRemoveStoreBtn = document.getElementById('submit-remove-store-btn');
    submitRemoveStoreBtn.addEventListener('click', async () => {
        const selectedStore = removeStoreSelect.value;
        if (selectedStore === '') {
            removeWarningMessage.textContent = 'Por favor, seleccione una tienda/subtienda para eliminar.';
            removeWarningMessage.style.display = 'block';
            return;
        }

        try {
            const endpoint = `${apiUrl}/subtiendas/${selectedStore}`;
            const response = await fetch(endpoint, {
                method: 'DELETE'
            });

            if (response.ok) {
                removeWarningMessage.style.display = 'none';
                loadMenu(); // Recargar el menú
            } else if (response.status === 404) {
                removeWarningMessage.textContent = 'Subtienda no encontrada.';
                removeWarningMessage.style.display = 'block';
            } else {
                throw new Error('Error al eliminar la tienda/subtienda: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error al eliminar la tienda/subtienda:', error);
            removeWarningMessage.textContent = 'Hubo un problema al intentar eliminar. Intenta de nuevo.';
            removeWarningMessage.style.display = 'block';
        }
    });

    // Cargar las opciones para agregar subtienda
    const loadStoreOptions = async () => {
        try {
            const response = await fetch(`${apiUrl}/tiendas`);
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API: ' + response.statusText);
            }
            const tiendas = await response.json();
            const storeSelect = document.getElementById('store-select');

            if (storeSelect) {
                storeSelect.innerHTML = '<option value="">Seleccionar tienda principal</option>'; // Opción por defecto

                tiendas.forEach(tienda => {
                    const option = document.createElement('option');
                    option.value = tienda.id;
                    option.textContent = tienda.nombre;
                    storeSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar las opciones de tiendas:', error);
        }
    };

    // Cargar las opciones para eliminar tienda/subtienda
    const loadRemoveStoreOptions = async () => {
        try {
            const response = await fetch(`${apiUrl}/tiendas`);
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API: ' + response.statusText);
            }
            const tiendas = await response.json();
            removeStoreSelect.innerHTML = '<option value="">Seleccionar subtienda para eliminar</option>'; // Opción por defecto

            for (const tienda of tiendas) {
                const option = document.createElement('option');
                option.value = tienda.id;
                option.textContent = tienda.nombre;
                removeStoreSelect.appendChild(option);

                // Cargar subtiendas
                const subResponse = await fetch(`${apiUrl}/subtiendas/${tienda.id}`);
                if (!subResponse.ok) {
                    throw new Error('Error en la respuesta de la API: ' + subResponse.statusText);
                }
                const subtiendas = await subResponse.json();

                subtiendas.forEach(subtienda => {
                    const subOption = document.createElement('option');
                    subOption.value = subtienda.id;
                    subOption.textContent = `Subtienda: ${subtienda.nombre}`;
                    removeStoreSelect.appendChild(subOption);
                });
            }
        } catch (error) {
            console.error('Error al cargar las opciones para eliminar subtienda:', error);
        }
    };

    // Cargar el menú al iniciar
    loadMenu();
});

// Función para volver a la página anterior
function goBack() {
    window.history.back();
}

// Función para cargar inventario
const loadInventory = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const subtiendaId = urlParams.get('subtiendaId');
    const errorMessage = document.getElementById('error-message');
    const inventoryTableBody = document.querySelector('#inventory-table tbody');

    if (!subtiendaId) {
        errorMessage.textContent = 'ID de subtienda no proporcionado.';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/inventario/${subtiendaId}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API: ' + response.statusText);
        }
        const inventario = await response.json();

        if (inventario.length === 0) {
            errorMessage.textContent = 'No se encontraron productos en el inventario.';         
        } else {
            errorMessage.textContent = ''; // Limpiar mensaje de error

            inventoryTableBody.innerHTML = ''; // Limpiar tabla existente

            inventario.forEach(producto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.marca}</td>
                    <td>${producto.procesador}</td>
                    <td>${producto.otros_datos}</td>
                `;
                inventoryTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error al cargar el inventario:', error);
        errorMessage.textContent = 'Hubo un problema al cargar el inventario. Intente de nuevo.';
    }
};

// Llamar a la función para cargar el inventario al cargar la página
if (window.location.pathname === '/inventario.html') {
    loadInventory();
}

// Funcion para generar un reporte

// Mostrar el formulario para generar reporte
const showReportFormBtn = document.getElementById('show-report-form-btn');
const reportForm = document.getElementById('report-form');

showReportFormBtn.addEventListener('click', () => {
    reportForm.classList.toggle('hidden');
    loadInventoryOptions(); // Cargar las opciones de inventario
});

// Función para cargar las opciones de inventario en el formulario de reportes
const loadInventoryOptions = async () => {
    try {
        const response = await fetch(`${apiUrl}/inventarios`);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API: ' + response.statusText);
        }
        const inventarios = await response.json();
        const inventorySelect = document.getElementById('report-inventory');

        if (inventorySelect) {
            inventorySelect.innerHTML = '<option value="">Seleccionar inventario</option>'; // Opción por defecto

            inventarios.forEach(inventario => {
                const option = document.createElement('option');
                option.value = inventario.id;
                option.textContent = inventario.nombre;
                inventorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar las opciones de inventario:', error);
    }
};

// Generar el reporte
const generateReportBtn = document.getElementById('generate-report-btn');
generateReportBtn.addEventListener('click', async () => {
    const reportDate = document.getElementById('report-date').value;
    const reportDescription = document.getElementById('report-description').value;
    const inventoryId = document.getElementById('report-inventory').value;
    const errorMessage = document.getElementById('report-error-message');

    if (!reportDate || !reportDescription || !inventoryId) {
        errorMessage.textContent = 'Por favor, complete todos los campos.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/reportes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fecha: reportDate, descripcion: reportDescription, inventario_id: inventoryId })
        });

        if (response.ok) {
            // Aquí podrías limpiar el formulario o mostrar un mensaje de éxito
            document.getElementById('report-date').value = '';
            document.getElementById('report-description').value = '';
            document.getElementById('report-inventory').value = '';
            errorMessage.style.display = 'none';
            alert('Reporte generado exitosamente.');
        } else {
            throw new Error('Error al generar el reporte: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        errorMessage.textContent = 'Hubo un problema al generar el reporte. Inténtalo de nuevo.';
        errorMessage.style.display = 'block';
    }
});
