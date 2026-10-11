/* =========================================
   СКРИПТЫ САЙТА "ШКОЛА КАПОЭЙРЫ"
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // Сброс возможного «залипшего» overflow от лайтбокса
    document.body.style.overflow = '';

    // ==========================================
    // 1. ГАЛЕРЕЯ (Бесконечная карусель + Лайтбокс)
    // ==========================================
    const track = document.getElementById('carouselTrack');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (track) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        let isAnimating = false;
        const GAP = 20;   // отступ между слайдами (совпадает с CSS gap)
        const SPEED = 500; // скорость анимации, мс

        // Ширина одного слайда + отступ
        function getSlideWidth() {
            const slide = track.firstElementChild;
            return slide ? slide.offsetWidth + GAP : 370;
        }

        // Установка transform с анимацией или без
        function setTransform(offset, animated = true) {
            track.style.transition = animated
                ? `transform ${SPEED}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none';
            track.style.transform = `translateX(${offset}px)`;
        }

        // ВПРАВО (следующий слайд) — бесконечный
        function nextSlide() {
            if (isAnimating) return;
            isAnimating = true;

            const slideWidth = getSlideWidth();
            setTransform(-slideWidth, true);

            // Ждем РЕАЛЬНОГО окончания анимации, а не слепого таймера
            const onTransitionEnd = () => {
                track.removeEventListener('transitionend', onTransitionEnd);
                
                // Переставляем первый слайд в конец
                track.appendChild(track.firstElementChild);
                
                // Мгновенно возвращаемся в исходную позицию (без анимации)
                setTransform(0, false);
                void track.offsetWidth; // принудительный reflow для применения стилей
                
                isAnimating = false;
            };
            
            track.addEventListener('transitionend', onTransitionEnd);
        }

        // ВЛЕВО (предыдущий слайд) — бесконечный
        function prevSlide() {
            if (isAnimating) return;
            isAnimating = true;

            const slideWidth = getSlideWidth();

            // 1. Переносим последний слайд в начало
            track.insertBefore(track.lastElementChild, track.firstElementChild);

            // 2. Мгновенно сдвигаем на -1 слайд (без анимации)
            setTransform(-slideWidth, false);
            void track.offsetWidth; // reflow

            // 3. Плавно сдвигаем вправо на один слайд (через requestAnimationFrame для гарантии)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTransform(0, true);
                });
            });

            const onTransitionEnd = () => {
                track.removeEventListener('transitionend', onTransitionEnd);
                isAnimating = false;
            };
            
            track.addEventListener('transitionend', onTransitionEnd);
        }

        // Начальная позиция
        setTransform(0, false);

        // Обработчики стрелок
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Свайпы для мобильных
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) {
                nextSlide();
            } else if (touchEndX > touchStartX + 50) {
                prevSlide();
            }
        }, { passive: true });

        // ЛАЙТБОКС
        const openLightbox = (img) => {
            if (lightbox && lightboxImg) {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        document.querySelectorAll('.gallery-item').forEach(img => {
            img.addEventListener('click', () => openLightbox(img));
        });

        const closeLightbox = () => {
            if (lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ==========================================
    // 2. ОТПРАВКА ФОРМЫ (Formspree сейчас / MODX потом)
    // ==========================================
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            const messageBox = contactForm.querySelector('.form-message');

            submitBtn.disabled = true;
            btnText.hidden = true;
            btnLoader.hidden = false;
            
            if (messageBox) {
                messageBox.className = 'form-message'; 
                messageBox.hidden = true;
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (messageBox) {
                        messageBox.textContent = 'Спасибо! Мы перезвоним вам в ближайшее время.';
                        messageBox.classList.add('success');
                        messageBox.hidden = false;
                    }
                    contactForm.reset();
                } else {
                    throw new Error('Ошибка сервера');
                }
            } catch (error) {
                console.error('Ошибка при отправке формы:', error);
                if (messageBox) {
                    messageBox.textContent = 'Произошла ошибка. Пожалуйста, позвоните нам: 8 904 983 15 21';
                    messageBox.classList.add('error');
                    messageBox.hidden = false;
                }
            } finally {
                submitBtn.disabled = false;
                btnText.hidden = false;
                btnLoader.hidden = true;
            }
        });
    }
}); // <-- ВАЖНО: здесь должна быть ТОЛЬКО ОДНА закрывающая скобка для DOMContentLoaded