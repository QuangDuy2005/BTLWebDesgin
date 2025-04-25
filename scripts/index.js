import {cart} from './cart.js';


$(window).on('load', function () {
    $('.andro_preloader').addClass('hidden');

    if (!checkCookie('newsletter_popup_viewed')) {
        setTimeout(function () {
            $("#androNewsletterPopup").modal('show');
        }, 3000);
    }

});



/*-------------------------------------------------------------------------------
Aside Menu
-------------------------------------------------------------------------------*/
$(".aside-trigger-right").on('click', function () {
    var $el = $(".andro_aside-right")
    $el.toggleClass('open');
    if ($el.hasClass('open')) {
        setTimeout(function () {
            $el.find('.sidebar').fadeIn();
        }, 300);
    } else {
        $el.find('.sidebar').fadeOut();
    }
});

$(".aside-trigger-left").on('click', function () {
    $(".andro_aside-left").toggleClass('open');
});

$(".andro_aside .menu-item-has-children > a").on('click', function (e) {
    var submenu = $(this).next(".sub-menu");
    e.preventDefault();

    submenu.slideToggle(200);
});
$(document).ready(function () {
    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Load cart count
    function loadCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        $('#cart-count').text(count);
    }

    // Load products from JSON
    function loadProducts() {
        fetch('data/flashsale.json')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                renderFlashSaleProducts(products.filter(p => p.discount > 0).slice(0, 4));
                displayFeaturedProducts(products.slice(0, 5));
                renderCategories(products);
                renderPromotions(products.filter(p => p.discount > 0).slice(0, 4));
            })
            .catch(error => {
                console.error('Error loading products:', error);
                $('#featured-products').html(
                    '<p class="error-message">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>'
                );
            });
    }

    // Flash Sale Countdown
    function updateFlashSaleTimer() {
        const now = new Date();
        const endTime = new Date();
        endTime.setHours(23, 59, 59, 0);
        let diff = endTime - now;
        
        if (diff < 0) {
            endTime.setDate(endTime.getDate() + 1);
            diff = endTime - now;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        $('#hours').text(hours.toString().padStart(2, '0'));
        $('#minutes').text(minutes.toString().padStart(2, '0'));
        $('#seconds').text(seconds.toString().padStart(2, '0'));
        let Countdown = document.getElementById('countdown');
        if (diff <= 0) {
            Countdown.innerHTML = '<p class="error-message">Flash Sale đã kết thúc!</p>';
            clearInterval(Countdown);
        } else {
            Countdown.innerHTML = `Kết thúc sau: <span id="hours">${hours}</span>:<span id="minutes">${minutes}</span>:<span id="seconds">${seconds}</span>`;
        }
    }

    // Render flash sale products
    function renderFlashSaleProducts(products) {
        const container = $('#flashSaleProducts');
        
        container.html(products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-badge">Giảm ${product.discount}</div>
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${product.price}</span>
                        <span class="old-price">${product.old_price}</span>
                    </div>
                    <div class="stock">🔥 ${product.stock}</div>
                    <button class="add-to-cart">Mua ngay</button>
                </div>
            </div>
        `).join(''));
    }

    function loadFlashSaleProducts() {
        fetch('data/flashsale.json')
            .then(response => response.json())
            .then(data => {
                if (data.products && data.products.length > 0) {
                    renderFlashSaleProducts(data.products);
                    updateFlashSaleTimer();
                } else {
                    showFlashSaleError('Không có sản phẩm flash sale nào.');
                }
            })
            .catch(error => {
                console.error('Error loading flash sale products:', error);
                showFlashSaleError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
            });
    }
    
    function showFlashSaleError(message) {
        const container = $('#flashSaleProducts');
        container.html(`
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `);
    }

    // Display featured products
    function displayFeaturedProducts(products) {
        const container = $('#featured-products');
        
        if (products.length === 0) {
            container.html('<p style="padding: 20px; color: #999;">Không tìm thấy sản phẩm phù hợp.</p>');
            return;
        }

        container.html(products.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.discount > 0 ? `<div class="product-badge">Giảm ${product.discount}%</div>` : ''}
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-specs">
                        ${product.specs.slice(0, 3).map(spec => `<span>${spec}</span>`).join('')}
                    </div>
                    <div class="product-price">
                        <span class="current-price">${(product.price * (1 - (product.discount || 0)/100)).toLocaleString('vi-VN')}₫</span>
                        ${product.discount > 0 ? `<span class="old-price">${product.price.toLocaleString('vi-VN')}₫</span>` : ''}
                    </div>
                    <button class="add-to-cart">Thêm vào giỏ</button>
                </div>
            </div>
        `).join(''));
    }

    // Render categories
    function renderCategories(products) {
        const categories = {};
        products.forEach(product => {
            const category = product.category || "Khác";
            if (!categories[category]) categories[category] = [];
            categories[category].push(product);
        });

        $('#category-container').html(Object.keys(categories).map(cat => `
            <div class="category-card" data-category="${cat}">
                <img src="${categories[cat][0].imageUrl}" alt="${cat}">
                <h3>${cat}</h3>
            </div>
        `).join(''));
    }

    // Render promotions
    function renderPromotions(products) {
        $('#promotion-container').html(products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-badge">Giảm ${product.discount}%</div>
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${(product.price * (1 - product.discount/100)).toLocaleString('vi-VN')}₫</span>
                        <span class="old-price">${product.price.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <button class="add-to-cart">Thêm vào giỏ</button>
                </div>
            </div>
        `).join(''));
    }

    // Add to cart function
    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
    
        const existing = cart.find(item => item.id === productId);
    
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                price: product.price * (1 - (product.discount || 0) / 100),
                quantity: 1
            });
        }
    
        saveCart();
        showNotification(`${product.name} đã thêm vào giỏ hàng`);
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartCount();
    }
    
    // Show notifications
    function showNotification(message) {
        const notification = $('#notification');
        notification.text(message).addClass('show');
        setTimeout(() => notification.removeClass('show'), 3000);
    }

    // Search functionality
    function searchProducts(keyword) {
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword) ||
            p.specs.some(spec => spec.toLowerCase().includes(keyword)) ||
            p.category.toLowerCase().includes(keyword)
        );
        displayFeaturedProducts(filtered.slice(0, 5));
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search functionality
        document.addEventListener('searchCleared', function() {
            displayFeaturedProducts(allProducts.slice(0, 5));
        });

        $('#searchInput').on('input', function() {
            const keyword = $(this).val().toLowerCase();
            if (keyword.length > 0) {
                searchProducts(keyword);
            } else {
                displayFeaturedProducts(allProducts.slice(0, 5));
            }
        });

        // Category click
        $(document).on('click', '.category-card', function() {
            const category = $(this).data('category');
            const filtered = allProducts.filter(p => p.category === category);
            displayFeaturedProducts(filtered);
        });
    }

    // Search functionality
    document.getElementById('searchIcon').addEventListener('click', function() {
        const searchInput = document.getElementById('searchInput');
        searchInput.classList.add('active');
        searchInput.focus();
        document.getElementById('closeSearch').style.display = 'block';
        this.style.display = 'none';
    });

    document.getElementById('closeSearch').addEventListener('click', function() {
        const searchInput = document.getElementById('searchInput');
        searchInput.classList.remove('active');
        searchInput.value = '';
        this.style.display = 'none';
        document.getElementById('searchIcon').style.display = 'block';
        
        // Gửi sự kiện search cleared
        const event = new Event('searchCleared');
        document.dispatchEvent(event);
    });

    // Initialize functions
    function init() {
        loadCartCount();
        loadProducts();
        loadFlashSaleProducts();
        setupEventListeners();
        setInterval(updateFlashSaleTimer, 1000);
    }
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.top-nav');
        if (window.scrollY > 50) {
            nav.classList.add('shrink');
        } else {
            nav.classList.remove('shrink');
        }
    });
    // Initialize everything
    init();
});