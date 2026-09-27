document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       1. MOBILE NAVIGATION
       ========================================================= */

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    const trtlHeader = document.querySelector(".trtl-header-full");

    const MENU_DURATION = 550;

    let menuIsOpen = false;
    let menuAnimating = false;
    let closeTimer = null;

    const setMenuState = (open) => {
        if (!menuToggle || !navLinks || menuAnimating) return;

        clearTimeout(closeTimer);

        if (open) {

            menuAnimating = true;
            menuIsOpen = true;

            navLinks.classList.remove("menu-closing");
            navLinks.classList.add("menu-open");

            if (trtlHeader) {
                trtlHeader.classList.add("is-active");
            }

            document.body.classList.add("menu-is-open");

            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute(
                "aria-label",
                "Close navigation menu"
            );

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    menuAnimating = false;
                });
            });

        } else {

            menuAnimating = true;
            menuIsOpen = false;

            /*
             * Keep the menu visually active while it slides
             * completely out of the screen.
             */
            navLinks.classList.add("menu-closing");
            navLinks.classList.remove("menu-open");

            /*
             * Keep header styling synchronized during the
             * closing animation.
             */
            if (trtlHeader) {
                trtlHeader.classList.add("is-active");
            }

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

            /*
             * Wait for the panel's 550ms transition to finish
             * before removing the remaining active states.
             */
            closeTimer = setTimeout(() => {

                navLinks.classList.remove("menu-closing");

                if (trtlHeader) {
                    trtlHeader.classList.remove("is-active");
                }

                document.body.classList.remove("menu-is-open");

                menuAnimating = false;

            }, MENU_DURATION);
        }
    };

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            if (menuAnimating) return;

            setMenuState(!menuIsOpen);
        });

        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                if (menuIsOpen && !menuAnimating) {
                    setMenuState(false);
                }

            });
        });

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                menuIsOpen &&
                !menuAnimating
            ) {
                setMenuState(false);
            }

        });
    }


    /* =========================================================
       2. FAQ ACCORDION
       ========================================================= */

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {

        const questionButton =
            item.querySelector(".faq-question");

        if (!questionButton) return;

        questionButton.addEventListener("click", () => {

            const isActive =
                item.classList.contains("active");

            faqItems.forEach((faqItem) => {

                faqItem.classList.remove("active");

                const button =
                    faqItem.querySelector(".faq-question");

                if (button) {
                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            });

            if (!isActive) {

                item.classList.add("active");

                questionButton.setAttribute(
                    "aria-expanded",
                    "true"
                );
            }
        });
    });


    /* =========================================================
       3. LEAD FORM HANDLER
       ========================================================= */

    const leadForm = document.getElementById("leadForm");
    const formStatus = document.getElementById("formStatus");

    if (leadForm && formStatus) {

        leadForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const name =
                document.getElementById("userName").value.trim();

            const email =
                document.getElementById("userEmail").value.trim();

            const scope =
                document.getElementById("projectScope").value;

            const budget =
                document.getElementById("budgetRange").value;

            const details =
                document.getElementById("projectDetails").value.trim();

            if (
                !name ||
                !email ||
                !scope ||
                !budget ||
                !details
            ) {

                formStatus.style.color = "#888888";

                formStatus.textContent =
                    "Please complete all required fields.";

                return;
            }

            const subject = encodeURIComponent(
                `New Project Inquiry from ${name}`
            );

            const body = encodeURIComponent(
`Name: ${name}
Email: ${email}
Scope: ${scope}
Budget: ${budget}

Project Details:
${details}`
            );

            formStatus.style.color = "#111111";

            formStatus.textContent =
                "Preparing your email...";

            setTimeout(() => {

                window.location.href =
                    `mailto:hello.atharvaapate@gmail.com?subject=${subject}&body=${body}`;

                formStatus.style.color = "#666666";

                formStatus.textContent =
                    "Your email draft has been prepared. Please send it from your mail app.";

            }, 500);
        });
    }


    /* =========================================================
       4. SCROLL ANIMATIONS
       ========================================================= */

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    };

    const scrollObserver =
        new IntersectionObserver((entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "is-visible"
                    );

                } else {

                    entry.target.classList.remove(
                        "is-visible"
                    );
                }
            });

        }, observerOptions);

    document
        .querySelectorAll(".fade-element, .stagger-box")
        .forEach((element) => {

            scrollObserver.observe(element);
        });

});