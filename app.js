(() => {
    const STORAGE_KEY = "violetPortfolio.v1";
    // Ganti dengan alamat email yang ingin ditampilkan dan menerima pesan.
    const CONTACT_EMAIL = "1251005@student.unklab.ac.id";
    // Ganti nilai ini untuk mengubah lokasi di halaman Tentang dan Kontak.
    const PROFILE_LOCATION = "Indonesia. Sulawesi Utara, Minahasa Utara. Universitas Klabat.";

    const defaultProfile = {
        name: "Nama Anda",
        role: "kreator & penjelajah ide",
        location: "Lokasi Anda",
        bio: "",
        photo: "",
    };

    function readProfile() {
        try {
            const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            return { ...defaultProfile, ...savedProfile };
        } catch {
            return { ...defaultProfile };
        }
    }

    let profile = readProfile();

    function saveProfile() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }

    function showToast(message) {
        const toast = document.getElementById("toastNote");

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 2600);
    }

    function updateProfileView() {
        document.querySelectorAll("[data-profile]").forEach((element) => {
            const key = element.dataset.profile;
            element.textContent = key === "email"
                ? CONTACT_EMAIL
                : key === "location"
                    ? PROFILE_LOCATION
                    : profile[key] || defaultProfile[key] || "";
        });

        const profileImages = document.querySelectorAll("#heroPhoto, #aboutPhoto");

        profileImages.forEach((image) => {
            if (profile.photo) {
                image.src = profile.photo;
            }

            const hasPhoto = Boolean(profile.photo || image.getAttribute("src"));
            image.style.display = hasPhoto ? "block" : "none";

            const placeholderId = image.id === "heroPhoto"
                ? "heroPlaceholder"
                : "aboutPlaceholder";
            const placeholder = document.getElementById(placeholderId);

            if (placeholder) {
                placeholder.style.display = hasPhoto ? "none" : "grid";
            }
        });

        const emailLink = document.getElementById("emailLink");

        if (emailLink) {
            emailLink.href = `mailto:${CONTACT_EMAIL}`;
        }

    }

    const welcomeScreen = document.getElementById("welcomeScreen");

    if (welcomeScreen && !sessionStorage.getItem("violetWelcomeSeen")) {
        welcomeScreen.classList.remove("leaving");
    } else if (welcomeScreen) {
        welcomeScreen.remove();
    }

    document.getElementById("welcomeButton")?.addEventListener("click", () => {
        sessionStorage.setItem("violetWelcomeSeen", "1");
        welcomeScreen.classList.add("leaving");
        window.setTimeout(() => welcomeScreen.remove(), 850);
    });

    document.querySelectorAll("[data-year]").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    updateProfileView();

    document.getElementById("contactForm")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const senderName = document.getElementById("senderName").value.trim();
        const senderEmail = document.getElementById("senderEmail").value.trim();
        const message = document.getElementById("message").value.trim();
        const subject = encodeURIComponent(`Pesan portofolio dari ${senderName}`);
        const body = encodeURIComponent(
            `Nama: ${senderName}\nEmail: ${senderEmail}\n\n${message}`,
        );

        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((element) => {
        revealObserver.observe(element);
    });
})();
