document.addEventListener('DOMContentLoaded', () => {
    const navigation = [...document.querySelectorAll('.section-nav a')];
    const updateNavigation = () => {
        const section = location.hash === '#photography' ? '#photography'
            : ['#work', '#more-work'].includes(location.hash) ? '#work' : '#overview';
        navigation.forEach(link => {
            const isActive = link.hash === section;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };
    updateNavigation();
    window.addEventListener('hashchange', updateNavigation);

    const photo = document.querySelector('.showphoto img');
    const photoFallback = document.querySelector('.photo-fallback');
    if (photo && photoFallback) {
        const showPhotoFallback = () => {
            photo.hidden = true;
            photoFallback.hidden = false;
        };
        photo.addEventListener('error', showPhotoFallback);
        if (photo.complete && photo.naturalWidth === 0) showPhotoFallback();
    }

    const mbtiItems = [...document.querySelectorAll('.mbti-item')];
    const mbtiDescriptions = [...document.querySelectorAll('.mbti-desc')];
    const descriptionPanel = document.querySelector('.mbti-descriptions');

    const setMbti = (selected = null) => {
        mbtiItems.forEach(item => {
            const isActive = item === selected;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
            item.setAttribute('aria-expanded', String(isActive));
        });
        mbtiDescriptions.forEach(description => {
            const isActive = selected?.dataset.type === description.dataset.type;
            description.classList.toggle('is-active', isActive);
            description.hidden = !isActive;
            description.setAttribute('aria-hidden', String(!isActive));
        });
        if (descriptionPanel) {
            descriptionPanel.classList.toggle('is-open', Boolean(selected));
            descriptionPanel.setAttribute('aria-hidden', String(!selected));
        }
    };

    mbtiItems.forEach(item => {
        const description = mbtiDescriptions.find(element => element.dataset.type === item.dataset.type);
        if (description) {
            description.id ||= `mbti-description-${item.dataset.type.toLowerCase()}`;
            item.setAttribute('aria-controls', description.id);
        }
        item.addEventListener('click', () => setMbti(item.classList.contains('is-active') ? null : item));
    });
    setMbti();

    document.addEventListener('click', event => {
        if (mbtiItems.some(item => item.contains(event.target)) || descriptionPanel?.contains(event.target)) return;
        setMbti();
    });
    document.addEventListener('keydown', event => {
        const activeItem = mbtiItems.find(item => item.classList.contains('is-active'));
        if (event.key !== 'Escape' || !activeItem) return;
        event.preventDefault();
        setMbti();
        activeItem.focus();
    });
});
