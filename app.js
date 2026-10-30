(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const landing = $("#landingPage");
  const navbar = $("#siteNavbar");
  const footer = $("#siteFooter");
  const signupForm = $("#signupForm");
  const qrForm = $("#qrForm");
  const signupError = $("#signupError");
  const formError = $("#formError");
  const qrResult = $("#qrResult");
  const profileView = $("#profileView");

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const nav = $("#navigation");
  const toggle = $("#menuToggle");
  function closeMenu() {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation");
  }
  toggle?.addEventListener("click", () => {
    const opened = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(opened));
    toggle.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
  });
  $$("#navigation a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  window.addEventListener("resize", () => { if (innerWidth > 760) closeMenu(); });

  $$('a[href^="#"]').forEach(link => link.addEventListener("click", () => closeMenu()));

  function normalizeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
      return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".") ? url.href : null;
    } catch { return null; }
  }
  function encodeProfile(data) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let binary = "";
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  function decodeProfile(encoded) {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0))));
  }
  function profileUrl(data) {
    const url = new URL("index.html", location.href);
    url.hash = "profile=" + encodeProfile(data);
    return url.href;
  }
  function initials(name) {
    const words = String(name || "Business").trim().split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
  }
  function addDetail(parent, label, value, href = "", external = false) {
    if (!value) return;
    const card = document.createElement("article");
    card.className = "profile-detail-card";
    const small = document.createElement("small");
    small.textContent = label;
    const item = href ? document.createElement("a") : document.createElement("p");
    item.textContent = value;
    if (href) {
      item.href = href;
      if (external) { item.target = "_blank"; item.rel = "noopener noreferrer"; }
    }
    card.append(small, item);
    parent.append(card);
  }
  function renderProfile(data) {
    landing.hidden = true;
    navbar.hidden = true;
    footer.hidden = true;
    profileView.hidden = false;
    $("#profileBusinessName").textContent = data.businessName || "Business Profile";
    $("#profileAvatar").textContent = initials(data.businessName);
    $("#profileAbout").textContent = data.description || "Explore the details below and connect with this business.";
    const details = $("#profileDetails");
    details.replaceChildren();
    addDetail(details, "Contact person", data.contactName);
    addDetail(details, "Phone", data.phone, data.phone ? `tel:${data.phone.replace(/[^\d+]/g, "")}` : "");
    addDetail(details, "Email", data.email, data.email ? `mailto:${data.email}` : "");
    addDetail(details, "Website", data.website, data.website || "", true);
    addDetail(details, "Business address", data.address);
    const review = $("#profileReviewButton");
    if (data.reviewUrl) { review.href = data.reviewUrl; review.hidden = false; }
    else review.hidden = true;
    document.title = `${data.businessName || "Business"} | HKD Dewas QR Code`;
    window.scrollTo(0, 0);
  }
  function makeQr(url) {
    const output = $("#qrOutput");
    output.replaceChildren();
    if (typeof QRCode === "undefined") {
      output.innerHTML = '<p class="form-error">QR library did not load. Check your internet connection and reload.</p>';
      return false;
    }
    new QRCode(output, { text: url, width: 250, height: 250, colorDark: "#19213d", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    return true;
  }
  function showQr(data, url) {
    $("#qrBusinessLabel").textContent = data.businessName;
    qrResult.dataset.profileUrl = url;
    qrResult.hidden = false;
    $("#signupCard").hidden = true;
    makeQr(url);
    requestAnimationFrame(() => qrResult.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  signupForm?.addEventListener("submit", event => {
    event.preventDefault();
    signupError.textContent = "";
    const name = $("#signupName").value.trim();
    const email = $("#signupEmail").value.trim();
    const code = $("#accessCode").value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      signupError.textContent = "Enter your name and a valid email address.";
      return;
    }
    
    demoUser = { name, email };
    signupForm.hidden = true;
    qrForm.hidden = false;
    $("#signupTitle").textContent = "Set up your QR profile";
    $("#signupIntro").textContent = `Welcome, ${name}. Add your business details below to generate a sample QR.`;
    $("#contactName").value = name;
    $("#email").value = email;
    $("#businessName").focus();
  });

  

  qrForm?.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";
    const data = {
      businessName: $("#businessName").value.trim(),
      contactName: $("#contactName").value.trim(),
      phone: $("#phone").value.trim(),
      email: $("#email").value.trim(),
      website: $("#website").value.trim() ? normalizeUrl($("#website").value) : "",
      reviewUrl: normalizeUrl($("#reviewUrl").value),
      address: $("#address").value.trim(),
      description: $("#description").value.trim()
    };
    if (!data.businessName) { formError.textContent = "Please enter your business name."; $("#businessName").focus(); return; }
    if (!data.reviewUrl) { formError.textContent = "Enter a valid review page URL (including a domain)."; $("#reviewUrl").focus(); return; }
    if ($("#website").value.trim() && !data.website) { formError.textContent = "Enter a valid website URL."; $("#website").focus(); return; }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { formError.textContent = "Enter a valid business email."; $("#email").focus(); return; }
    const url = profileUrl(data);
    showQr(data, url);
  });

  $("#downloadQr")?.addEventListener("click", () => {
    const output = $("#qrOutput");
    const canvas = $("canvas", output);
    const image = $("img", output);
    const dataUrl = canvas ? canvas.toDataURL("image/png") : image?.src;
    if (!dataUrl) { alert("QR is not ready yet. Check your connection and try again."); return; }
    const safe = ($("#qrBusinessLabel").textContent || "hkd-dewas-qr-code").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "hkd-dewas-qr-code";
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `${safe}-qr.png`; document.body.append(a); a.click(); a.remove();
  });
  $("#copyProfileUrl")?.addEventListener("click", async () => {
    const url = qrResult.dataset.profileUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      $("#copyProfileUrl").innerHTML = '<i class="fa-solid fa-check"></i> Link copied';
    } catch { window.prompt("Copy this profile link:", url); }
  });
  $("#editDetails")?.addEventListener("click", () => {
    qrResult.hidden = true;
    $("#signupCard").hidden = false;
    qrForm.hidden = false;
    $("#businessName").focus();
    $("#signupCard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function openIncomingProfile() {
    const match = location.hash.match(/^#profile=(.+)$/);
    if (!match) return;
    try {
      const data = decodeProfile(match[1]);
      if (!data || typeof data.businessName !== "string" || !data.businessName.trim()) throw new Error("Invalid profile");
      data.website = data.website ? normalizeUrl(data.website) : "";
      data.reviewUrl = data.reviewUrl ? normalizeUrl(data.reviewUrl) : "";
      if (!data.website) data.website = "";
      if (!data.reviewUrl) data.reviewUrl = "";
      renderProfile(data);
    } catch (error) {
      console.error("Invalid QR profile", error);
      landing.hidden = true; navbar.hidden = true; footer.hidden = true; profileView.hidden = false;
      $("#profileBusinessName").textContent = "This QR profile is invalid";
      $("#profileAbout").textContent = "The profile link may be incomplete or corrupted. Please ask the business to create a new QR code.";
      $("#profileReviewButton").hidden = true;
      $("#profileDetails").replaceChildren();
      document.title = "Invalid QR profile | HKD Dewas QR Code";
    }
  }
  openIncomingProfile();

  // Sign Up is intentionally a button-only placeholder until real registration is connected.
  

  // Lightweight company-information assistant; no API key or backend required.
  const aiPanel = $("#aiChatPanel");
  const aiMessages = $("#aiMessages");
  const aiInput = $("#aiChatInput");
  function addAiMessage(text, isUser = false) {
    const bubble = document.createElement("p");
    bubble.className = "ai-bubble" + (isUser ? " user" : "");
    bubble.textContent = text;
    aiMessages?.append(bubble);
    if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;
  }
  function answerAi(question) {
    const q = question.toLowerCase();
    if (/hello|hi\b|hey|namaste/.test(q)) return "Hi! How can I help? Ask about our QR platform, services or contact details.";
    if (/qr|scan|review/.test(q)) return "HKD Dewas QR Code is designed to open a mobile-friendly business profile with contact details, website, address and review link in one scan. Contact our team to discuss setup.";
    if (/service|software|erp|website|app|ai integration|develop/.test(q)) return "HKD Dewas QR Code works on software development, customized ERP, web design and development, app development, digital solutions and AI integration.";
    if (/contact|phone|call|email|whatsapp|location|address/.test(q)) return "Contact us on WhatsApp or call +91 9399495748. WhatsApp support is available using the green WhatsApp button. Location Dewas.";
    if (/sign.?up|register|account|price|cost|trial|free/.test(q)) return "Sign Up is not connected to a live account system yet. Please contact our team on WhatsApp to ask about access and pricing.";
    if (/human|person|team|support|help/.test(q)) return "Our team can help. Message us on WhatsApp or call +91 9399495748.";
    return "I can help with HKD Dewas QR Code, our software services, Sign Up availability and contact details. For anything else, contact our team on WhatsApp or call +91 9399495748.";
  }
  $("#aiToggle")?.addEventListener("click", () => { if (aiPanel) aiPanel.hidden = !aiPanel.hidden; if (aiPanel && !aiPanel.hidden) aiInput?.focus(); });
  $("#aiClose")?.addEventListener("click", () => { if (aiPanel) aiPanel.hidden = true; });
  $("#aiChatForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const question = aiInput?.value.trim();
    if (!question) return;
    addAiMessage(question, true);
    addAiMessage(answerAi(question));
    aiInput.value = "";
  });

})();