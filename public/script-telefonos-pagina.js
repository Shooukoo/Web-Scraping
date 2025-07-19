// Datos de ejemplo (simulando la respuesta del scraper)
const sampleData = [
    {
        "description": "Galaxy Z Flip7",
        "price": "$\n25,499.00\n$28,499.00"
    },
    {
        "description": "iPhone 16e",
        "price": "$\n13,999.00\n$14,999.00"
    },
    {
        "description": "Axon 60 Lite",
        "price": "$\n1,799.00\n$2,999.00"
    },
    {
        "description": "Galaxy A06 5G",
        "price": "$\n2,299.00\n$2,799.00"
    },
    {
        "description": "Axon 40 SE",
        "price": "$\n2,099.00\n$5,499.00"
    },
    {
        "description": "Razr 50",
        "price": "$\n10,229.00\n$16,999.00"
    },
    {
        "description": "Redmi 12",
        "price": "$\n3,129.00\n$7,499.00"
    },
    {
        "description": "moto edge 60 fusion",
        "price": "$\n7,499.00\n$8,999.00"
    },
    {
        "description": "Xiaomi 14T",
        "price": "$\n10,339.00\n$13,999.00"
    },
    {
        "description": "Galaxy A56 5G",
        "price": "$\n7,999.00\n$10,999.00"
    },
    {
        "description": "Focus Pro",
        "price": "$\n2,899.00\n$5,999.00"
    },
    {
        "description": "OPPO A58",
        "price": "$\n3,499.00\n$5,999.00"
    },
    {
        "description": "Galaxy S24 FE",
        "price": "$\n10,999.00\n$15,499.00"
    },
    {
        "description": "14T Pro",
        "price": "$\n13,339.00\n$16,999.00"
    },
    {
        "description": "OPPO Reno10 256GB",
        "price": "$\n5,499.00\n$9,999.00"
    },
    {
        "description": "iPhone 13 128GB",
        "price": "$\n10,499.00\n$12,999.00"
    }
];

function parsePrices(priceString) {
    // Dividir por saltos de línea y filtrar elementos vacíos
    const prices = priceString.split('\n').filter(p => p.trim() !== '' && p.trim() !== '$');

    // El primer elemento después del $ inicial es el precio actual
    // El segundo elemento es el precio original
    return {
        current: prices.length > 0 ? `$${prices[0].trim()}` : '',
        original: prices.length > 1 ? `$${prices[1].trim()}` : ''
    };
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


function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');

    if (!products || products.length === 0) {
        noProducts.style.display = 'block';
        grid.style.display = 'none';
        return;
    }

    noProducts.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = products.map((product, index) => {
        const prices = parsePrices(product.price);
        const discount = calculateDiscount(prices.current, prices.original);

        return `
                    <div class="product-card" style="animation-delay: ${index * 0.1}s">
                        <div class="product-name">${product.description}</div>
                        <div class="price-container">
                            <span class="current-price">${prices.current}</span>
                            ${prices.original && prices.original !== prices.current ?
                `<span class="original-price">${prices.original}</span>` : ''
            }
                            ${discount > 0 ?
                `<div class="discount-badge">-${discount}% OFF</div>` : ''
            }
                        </div>
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

    button.disabled = true;
    button.textContent = 'Obteniendo datos...';
    loadingScreen.style.display = 'flex';

    try {
        const response = await fetch('http://localhost:3000/scrape-telcel');

        if (!response.ok) {
            throw new Error(`Respuesta HTTP no OK: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Datos recibidos:", data);

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No se recibieron productos válidos");
        }

        renderProducts(data);

    } catch (error) {
        console.error('❌ Error al obtener o procesar los datos:', error);
        alert('Error al obtener los datos. Revisa la consola.');

        // Mostrar fallback
        const grid = document.getElementById('productsGrid');
        const noProducts = document.getElementById('noProducts');
        noProducts.style.display = 'block';
        grid.style.display = 'none';

    } finally {
        loadingScreen.style.display = 'none';
        button.disabled = false;
        button.textContent = '🔄 Actualizar Datos';
    }
}
