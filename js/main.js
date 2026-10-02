/**
 * D'Casa — Landing Page
 * JavaScript vanilla, sem dependências.
 * Comportamentos conforme especificação (11 itens).
 */

(function () {
  "use strict";

  // ===== MENSAGENS WHATSAPP POR CONTEXTO =====
  var WA_MESSAGES = {
    "geral": "Olá! Vim pela página da D'Casa e quero um orçamento para minha obra.",
    "material-bruto": "Olá! Quero um orçamento de material bruto (cimento, areia, tijolo) para minha obra.",
    "acabamentos": "Olá! Quero um orçamento de acabamentos (tintas, pisos, revestimentos).",
    "ferramentas": "Olá! Quero um orçamento de ferramentas.",
    "eletrica-hidraulica": "Olá! Quero um orçamento de material elétrico e hidráulico.",
    "cristal": "Olá! Quero falar com a unidade do Cristal.",
    "santa-tereza": "Olá! Quero falar com a unidade de Santa Tereza.",
    "coral": "Olá! Quero um orçamento de tintas Coral.",
    "quartzolit": "Olá! Quero um orçamento de produtos Quartzolit (argamassa, rejunte, impermeabilizante)."
  };

  // ===== 1. MONTAGEM DOS LINKS DE WHATSAPP =====
  function setupWhatsAppLinks() {
    var root = document.documentElement;
    var number = root.getAttribute("data-whatsapp") || "";
    var links = document.querySelectorAll("[data-wa]");

    if (!number) {
      links.forEach(function (el) {
        el.style.opacity = "0.5";
        el.style.pointerEvents = "none";
      });
      return;
    }

    links.forEach(function (el) {
      var key = el.getAttribute("data-wa");
      var msg = WA_MESSAGES[key] || WA_MESSAGES["geral"];
      var encoded = encodeURIComponent(msg);
      el.setAttribute("href", "https://wa.me/" + number + "?text=" + encoded);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  // ===== 2. REVELAR ELEMENTOS AO ENTRAR NA TELA =====
  function setupRevealOnScroll() {
    var reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  // ===== 3. PROGRESSO DE SCROLL DA PÁGINA =====
  function setupScrollProgress() {
    var root = document.documentElement;
    var ticking = false;

    function update() {
      var scrollTop = window.scrollY || document.body.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      root.style.setProperty("--scroll-progress", progress.toFixed(4));

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  // ===== MENU DE NAVEGAÇÃO (MOBILE) + LINK ATIVO =====
  function setupNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });

    // Destaca no menu a seção que está na tela
    var links = nav.querySelectorAll(".site-nav__link");
    if (!("IntersectionObserver" in window)) return;

    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
        var active = byId[entry.target.id];
        if (active) {
          active.classList.add("is-active");
          active.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // ===== 4. PROGRESSO DE SCROLL POR SEÇÃO =====
  function setupSectionProgress() {
    var root = document.documentElement;
    var stepsSection = document.getElementById("steps");
    var deliverySection = document.getElementById("delivery");
    var ticking = false;

    function getSectionProgress(section) {
      if (!section) return 0;
      var rect = section.getBoundingClientRect();
      var sectionHeight = rect.height;
      var viewportHeight = window.innerHeight;
      // 0 quando a seção entra, 1 quando sai
      var scrolled = viewportHeight - rect.top;
      var total = sectionHeight + viewportHeight;
      return Math.min(Math.max(scrolled / total, 0), 1);
    }

    function update() {
      root.style.setProperty("--section-progress-steps", getSectionProgress(stepsSection).toFixed(4));
      root.style.setProperty("--section-progress-delivery", getSectionProgress(deliverySection).toFixed(4));

      // 5. Estado dos círculos da trilha
      updateStepsCircles(getSectionProgress(stepsSection));

      // 6. Carimbo ENTREGUE
      updateDeliveryStamp(getSectionProgress(deliverySection));

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  // ===== 5. ESTADO DOS CÍRCULOS DA TRILHA =====
  function updateStepsCircles(progress) {
    var circles = document.querySelectorAll(".steps__circle");
    if (!circles.length) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      circles.forEach(function (c) {
        c.classList.add("is-filled");
        c.classList.add("is-pulsed");
      });
      return;
    }

    circles.forEach(function (circle, i) {
      var threshold = (i + 1) / circles.length;
      if (progress >= threshold) {
        if (!circle.classList.contains("is-filled")) {
          circle.classList.add("is-filled");
          circle.classList.add("is-pulsed");
          setTimeout(function () { circle.classList.remove("is-pulsed"); }, 400);
        }
      } else {
        circle.classList.remove("is-filled");
      }
    });
  }

  // ===== 6. CARIMBO ENTREGUE =====
  function updateDeliveryStamp(progress) {
    var stamp = document.getElementById("deliveryStamp");
    if (!stamp) return;
    if (progress >= 0.95) {
      stamp.classList.add("is-stamped");
    } else {
      stamp.classList.remove("is-stamped");
    }
  }

  // ===== 7. ETIQUETAS ANOTADAS DO PROBLEMA =====
  function setupProblemTags() {
    var problemPhotos = document.getElementById("problemPhotos");
    if (!problemPhotos) return;

    var tags = problemPhotos.querySelectorAll(".problem__tag");
    var photoTreats = problemPhotos.querySelectorAll(".photo-treat");

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      tags.forEach(function (t) { t.classList.add("is-visible"); });
      photoTreats.forEach(function (p) { p.classList.add("is-color"); });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      tags.forEach(function (t) { t.classList.add("is-visible"); });
      photoTreats.forEach(function (p) { p.classList.add("is-color"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tags.forEach(function (tag, i) {
            setTimeout(function () {
              tag.classList.add("is-visible");
            }, i * 160);
          });
          // Libera a cor natural após a última etiqueta
          setTimeout(function () {
            photoTreats.forEach(function (p) { p.classList.add("is-color"); });
          }, tags.length * 160 + 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(problemPhotos);
  }

  // ===== 8. CABEÇALHO QUE ENCOLHE =====
  function setupHeaderShrink() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    var ticking = false;

    function update() {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  // ===== 9. BARRA FIXA DE WHATSAPP (MOBILE) =====
  function setupStickyCta() {
    var stickyCta = document.getElementById("stickyCta");
    var heroCta = document.getElementById("heroCta");
    var ctaFinal = document.getElementById("cta-final");
    if (!stickyCta || !heroCta || !ctaFinal) return;

    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          // Hero saiu da tela — checar se CTA final também não está visível
          stickyCta.classList.add("is-visible");
        } else {
          stickyCta.classList.remove("is-visible");
        }
      });
    }, { threshold: 0 });

    heroObserver.observe(heroCta);

    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stickyCta.classList.remove("is-visible");
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -100px 0px" });

    ctaObserver.observe(ctaFinal);
  }

  // ===== 10. HOVER/FOCO DOS CARDS DE CATEGORIA (MOBILE) =====
  function setupCategoryCardsTouch() {
    var cards = document.querySelectorAll(".category-card");
    cards.forEach(function (card) {
      card.addEventListener("touchstart", function () {
        card.style.outline = "none";
      }, { passive: true });
    });
  }

  // ===== 11. VERIFICAÇÃO DE PREFERÊNCIA DE MOVIMENTO =====
  function shouldReduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function applyReducedMotionDefaults() {
    if (!shouldReduceMotion()) return;

    var root = document.documentElement;
    root.style.setProperty("--section-progress-steps", "1");
    root.style.setProperty("--section-progress-delivery", "1");

    var stamp = document.getElementById("deliveryStamp");
    if (stamp) stamp.classList.add("is-stamped");

    var circles = document.querySelectorAll(".steps__circle");
    circles.forEach(function (c) {
      c.classList.add("is-filled");
      c.classList.add("is-pulsed");
    });

    var lineFill = document.querySelector(".steps__line-fill");
    if (lineFill) lineFill.style.transform = "scaleY(1)";
  }

  // ===== INIT =====
  function init() {
    setupWhatsAppLinks();
    setupRevealOnScroll();
    setupHeaderShrink();
    setupNav();
    setupStickyCta();
    setupCategoryCardsTouch();
    setupProblemTags();

    if (shouldReduceMotion()) {
      applyReducedMotionDefaults();
    } else {
      setupScrollProgress();
      setupSectionProgress();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
