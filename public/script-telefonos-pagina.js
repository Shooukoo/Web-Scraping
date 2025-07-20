const WHATSAPP_NUMBER = "+523531844881";

// Variables globales
let allProducts = [];
let filteredProducts = [];
let availableBrands = [];

function extractBrandFromModel(model) {
    if (!model || typeof model !== 'string') return 'OTROS';
    const parts = model.split('|');
    return parts[0].trim().toUpperCase();
}

function getAvailableBrands(products) {
    const brands = new Set();
    products.forEach(product => {
        const brand = extractBrandFromModel(product.model);
        brands.add(brand);
    });
    return Array.from(brands).sort();
}

function populateBrandFilter(brands) {
    const brandFilter = document.getElementById('brandFilter');
    brandFilter.innerHTML = '<option value="">Todas las marcas</option>';

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function filterByBrand() {
    const selectedBrand = document.getElementById('brandFilter').value;

    if (selectedBrand === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => {
            const productBrand = extractBrandFromModel(product.model);
            return productBrand === selectedBrand;
        });
    }

    updateResultsInfo();
    renderProducts(filteredProducts);
}

function updateResultsInfo() {
    const resultsInfo = document.getElementById('resultsInfo');
    const selectedBrand = document.getElementById('brandFilter').value;

    if (allProducts.length === 0) {
        resultsInfo.style.display = 'none';
        return;
    }

    resultsInfo.style.display = 'block';

    if (selectedBrand === '') {
        resultsInfo.textContent = `Mostrando ${filteredProducts.length} productos de todas las marcas`;
    } else {
        resultsInfo.textContent = `Mostrando ${filteredProducts.length} productos de ${selectedBrand}`;
    }
}

function parsePrices(priceString) {
    const prices = priceString.split('\n').filter(p => p.trim() !== '' && p.trim() !== '$');

    return {
        current: prices.length > 0 ? prices[0].trim() : '',
        original: prices.length > 1 ? prices[1].trim() : ''
    };
}

function adjustPrice(priceString) {
    // Extraer el número del precio
    const numericPrice = parseFloat(priceString.replace(/[$,]/g, ''));

    // Agregar 500 pesos
    const adjustedPrice = numericPrice + 500;

    // Redondear a enteros
    const roundedPrice = Math.round(adjustedPrice);

    // Formatear con comas
    return `$${roundedPrice.toLocaleString('es-MX')}`;
}

function calculateDiscount(current, original) {
    if (!original || original === current) return 0;

    const currentNum = parseFloat(current.replace(/[$,]/g, ''));
    const originalNum = parseFloat(original.replace(/[$,]/g, ''));

    if (originalNum > currentNum && !isNaN(currentNum) && !isNaN(originalNum)) {
        const discount = Math.round(((originalNum - currentNum) / originalNum) * 100);
        return discount;
    }
    return 0;
}

function generateWhatsAppMessage(product, adjustedPrice) {
    const message = `¡Hola! Me interesa cotizar el siguiente teléfono:

📱 *${product.description}*
🏷️ Modelo: ${product.model}
💰 Precio: ${adjustedPrice}

¿Podrías darme más información sobre disponibilidad y formas de pago?

¡Gracias!`;

    return encodeURIComponent(message);
}

function openWhatsApp(product, adjustedPrice) {
    const message = generateWhatsAppMessage(product, adjustedPrice);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');

    if (!products || products.length === 0) {
        noProducts.style.display = 'block';
        grid.style.display = 'none';
        grid.classList.remove('show');
        return;
    }

    noProducts.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = products.map((product, index) => {
        const prices = parsePrices(product.price);
        const adjustedCurrentPrice = adjustPrice(prices.current);
        const adjustedOriginalPrice = prices.original ? adjustPrice(prices.original) : '';
        const discount = calculateDiscount(prices.current, prices.original);

        return `
                    <div class="product-card" style="animation-delay: ${(index % 12) * 0.1}s">
                        <img src="${product.image}" alt="${product.description}" class="product-image" onerror="this.src='/placeholder.svg?height=120&width=120&text=Phone'">
                        <div class="product-name">${product.description}</div>
                        <div class="product-model">${product.model}</div>
                        <div class="price-container">
                            <span class="current-price">${adjustedCurrentPrice}</span>
                            ${adjustedOriginalPrice && adjustedOriginalPrice !== adjustedCurrentPrice ?
                `<span class="original-price">${adjustedOriginalPrice}</span>` : ''
            }
                            ${discount > 0 ?
                `<div class="discount-badge">-${discount}% OFF</div>` : ''
            }
                        </div>
                        <button class="whatsapp-button" onclick="openWhatsApp(${JSON.stringify(product).replace(/"/g, '&quot;')}, '${adjustedCurrentPrice}')">
                            <svg class="whatsapp-icon" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            Me interesa
                        </button>
                    </div>
                `;
    }).join('');

    // Trigger animation
    setTimeout(() => {
        grid.classList.add('show');
    }, 100);
}

async function fetchPhoneData() {
    const button = document.querySelector('.fetch-button');
    const loadingScreen = document.getElementById('loadingScreen');
    const filtersSection = document.getElementById('filtersSection');
    
    button.disabled = true;
    button.textContent = 'Obteniendo datos...';
    loadingScreen.style.display = 'flex';
    
    try {
        const response = await fetch('http://localhost:3000/scrape-telcel');
        if (!response.ok) {
            throw new Error(`Respuesta HTTP no OK: ${response.status}`);
        }
        const data = await response.json();
        console.log("Datos recibidos:", data);
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No se recibieron productos válidos");
        }
        
        allProducts = data;
        filteredProducts = [...data];
        availableBrands = getAvailableBrands(data);
        populateBrandFilter(availableBrands);
        filtersSection.classList.add('show'); 
        updateResultsInfo();
        renderProducts(filteredProducts);
        
    } catch (error) {
        console.error('Error al obtener o procesar los datos:', error);
        alert('Error al obtener los datos. Revisa la consola.');
        // Mostrar fallback
        const grid = document.getElementById('productsGrid');
        const noProducts = document.getElementById('noProducts');
        noProducts.style.display = 'block';
        grid.style.display = 'none';
    } finally {
        loadingScreen.style.display = 'none';
        button.disabled = false;
        button.textContent = 'Actualizar Datos';
    }
}
