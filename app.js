(() => {
    const STORAGE_KEY = "violetPortfolio.v1";

    const defaultProfile = {
        name: "Nama Anda",
        role: "kreator & penjelajah ide",
        location: "Lokasi Anda",
        bio: "",
        email: "",
        photo: "",
        projects: [],
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

    function escapeHtml(value = "") {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return String(value).replace(/[&<>"']/g, (character) => replacements[character]);
    }

    function updateProfileView() {
        document.querySelectorAll("[data-profile]").forEach((element) => {
            const key = element.dataset.profile;
            element.textContent = profile[key] || defaultProfile[key] || "";
        });

        const profileImages = document.querySelectorAll("#heroPhoto, #aboutPhoto");

        profileImages.forEach((image) => {
            image.src = profile.photo || "";
            image.style.display = profile.photo ? "block" : "none";

            const placeholderId = image.id === "heroPhoto"
                ? "heroPlaceholder"
                : "aboutPlaceholder";
            const placeholder = document.getElementById(placeholderId);

            if (placeholder) {
                placeholder.style.display = profile.photo ? "none" : "grid";
            }
        });

        const emailInput = document.getElementById("profileEmail");

        if (emailInput) {
            emailInput.value = profile.email || "";
        }

        const emailLink = document.getElementById("emailLink");

        if (emailLink && profile.email) {
            emailLink.href = `mailto:${encodeURIComponent(profile.email)}`;
        }

        const fields = [
            ["profileName", profile.name],
            ["profileRole", profile.role],
            ["profileLocation", profile.location],
            ["profileBio", profile.bio],
        ];

        fields.forEach(([id, value]) => {
            const field = document.getElementById(id);

            if (field) {
                field.value = value || "";
            }
        });
    }

    function resizeImage(file, maxDimension = 1000) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = reject;
            reader.onload = () => {
                const image = new Image();

                image.onerror = reject;
                image.onload = () => {
                    const scale = Math.min(
                        1,
                        maxDimension / Math.max(image.width, image.height),
                    );
                    const canvas = document.createElement("canvas");

                    canvas.width = Math.round(image.width * scale);
                    canvas.height = Math.round(image.height * scale);
                    canvas
                        .getContext("2d")
                        .drawImage(image, 0, 0, canvas.width, canvas.height);

                    resolve(canvas.toDataURL("image/jpeg", 0.82));
                };

                image.src = reader.result;
            };

            reader.readAsDataURL(file);
        });
    }

    function renderProjects() {
        const grid = document.getElementById("projectGrid");

        if (!grid) return;

        grid.innerHTML = profile.projects.map((project) => `
            <div class="col-md-6 col-lg-4">
                <article class="glass project-card h-100">
                    <img
                        class="project-image"
                        src="${project.image}"
                        alt="${escapeHtml(project.title)}"
                    >
                    <div class="project-content">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <div>
                                <h2 class="h5 mb-2">${escapeHtml(project.title)}</h2>
                                <p class="muted mb-0">${escapeHtml(project.description || "Karya pilihan")}</p>
                            </div>
                            <button
                                class="btn btn-sm btn-outline-light rounded-circle"
                                data-delete-project="${project.id}"
                                aria-label="Hapus karya"
                            >
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `).join("");

        const emptyMessage = document.getElementById("emptyProjects");

        if (emptyMessage) {
            emptyMessage.hidden = profile.projects.length > 0;
        }

        grid.querySelectorAll("[data-delete-project]").forEach((button) => {
            button.addEventListener("click", () => {
                profile.projects = profile.projects.filter(
                    (project) => project.id !== button.dataset.deleteProject,
                );

                saveProfile();
                renderProjects();
                showToast("Karya dihapus dari galeri.");
            });
        });
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
    renderProjects();

    const profileForm = document.getElementById("profileForm");

    profileForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        profile.name = document.getElementById("profileName").value.trim()
            || defaultProfile.name;
        profile.role = document.getElementById("profileRole").value.trim()
            || defaultProfile.role;
        profile.location = document.getElementById("profileLocation").value.trim()
            || defaultProfile.location;
        profile.bio = document.getElementById("profileBio").value.trim();

        saveProfile();
        updateProfileView();
        showToast("Profil berhasil disimpan.");
    });

    document.getElementById("profilePhotoInput")?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            profile.photo = await resizeImage(file, 1200);
            saveProfile();
            updateProfileView();
            showToast("Foto profil berhasil diperbarui.");
        } catch {
            showToast("Foto tidak bisa dibaca. Coba pilih file gambar lain.");
        }
    });

    document.getElementById("projectForm")?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const imageFile = document.getElementById("projectImage").files?.[0];

        if (!imageFile) return;

        try {
            const image = await resizeImage(imageFile, 1400);

            profile.projects.unshift({
                id: crypto.randomUUID
                    ? crypto.randomUUID()
                    : String(Date.now()),
                title: document.getElementById("projectTitle").value.trim(),
                description: document.getElementById("projectDescription").value.trim(),
                image,
            });

            saveProfile();
            renderProjects();
            form.reset();
            showToast("Karya berhasil ditambahkan.");
        } catch {
            showToast("Foto karya tidak bisa dibaca.");
        }
    });

    document.getElementById("saveEmail")?.addEventListener("click", () => {
        const emailInput = document.getElementById("profileEmail");

        if (!emailInput.checkValidity()) {
            emailInput.reportValidity();
            return;
        }

        profile.email = emailInput.value.trim();
        saveProfile();
        updateProfileView();
        showToast("Email kontak berhasil disimpan.");
    });

    document.getElementById("contactForm")?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!profile.email) {
            showToast("Simpan email Anda terlebih dahulu di bagian kontak langsung.");
            document.getElementById("profileEmail")?.focus();
            return;
        }

        const senderName = document.getElementById("senderName").value.trim();
        const senderEmail = document.getElementById("senderEmail").value.trim();
        const message = document.getElementById("message").value.trim();
        const subject = encodeURIComponent(`Pesan portofolio dari ${senderName}`);
        const body = encodeURIComponent(
            `Nama: ${senderName}\nEmail: ${senderEmail}\n\n${message}`,
        );

        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
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
