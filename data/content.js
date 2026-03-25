// ══════════════════════════════════════════
//  DATA — PANEL CONTENT HTML
//  Estructura: CTA principal → lista de items
//  Cada orbe mantiene su identidad visual vía theme CSS
// ══════════════════════════════════════════

export const panelContent = {

  // ── WORK ─────────────────────────────────
  work: `
    <a class="p-cta-main" onclick="navigateToPortfolio()" onmouseenter="uiSound('hover:see-all')" style="margin-top:28px">
      <span class="p-cta-main-label">Navegar el trabajo</span>
      <span class="p-cta-main-arrow">→</span>
    </a>

    <div class="p-section-label">Proyectos destacados</div>

    <div class="p-list">
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">01</span>
        <div class="pli-body">
          <div class="pli-name">Rachin</div>
          <div class="pli-meta">Personal · 2024 · 3D · Motion</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">02</span>
        <div class="pli-body">
          <div class="pli-name">Michelob Ultra NBA</div>
          <div class="pli-meta">Michelob Ultra · 2023 · Campaign</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">03</span>
        <div class="pli-body">
          <div class="pli-name">Pilsener FOMO</div>
          <div class="pli-meta">Pilsener · 2023 · Case Film</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">04</span>
        <div class="pli-body">
          <div class="pli-name">#SeMeAntojaGuate</div>
          <div class="pli-meta">Pepsi · 2022 · 8.4K views</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">13</span>
        <div class="pli-body">
          <div class="pli-name">Paradox</div>
          <div class="pli-meta">Personal · UX/UI Film Case</div>
        </div>
      </div>
    </div>`,

  // ── THOUGHTS ─────────────────────────────
  thoughts: `
    <a class="p-cta-main" href="thoughts/" onmouseenter="uiSound('hover:panel-cta-thoughts')" style="margin-top:28px">
      <span class="p-cta-main-label">Entrar al archivo</span>
      <span class="p-cta-main-arrow">→</span>
    </a>

    <div class="p-section-label">Escritos</div>

    <div class="p-list">
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">I</span>
        <div class="pli-body">
          <div class="pli-name">La Jaula Transparente</div>
          <div class="pli-meta">Ensayo · Ego · Conciencia</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">II</span>
        <div class="pli-body">
          <div class="pli-name">Hipótesis H</div>
          <div class="pli-meta">Framework · Próximamente</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">III</span>
        <div class="pli-body">
          <div class="pli-name">Kyran &amp; Lyra</div>
          <div class="pli-meta">Narrativa sci-fi · En desarrollo</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">IV</span>
        <div class="pli-body">
          <div class="pli-name">Nota Existencial</div>
          <div class="pli-meta">Ensayos · Paradoja · Agencia</div>
        </div>
      </div>
    </div>`,

  // ── EXPERIMENTS ──────────────────────────
  experiments: `
    <a class="p-cta-main" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-experiments')" style="margin-top:28px">
      <span class="p-cta-main-label">Ver experimentos</span>
      <span class="p-cta-main-arrow">→</span>
    </a>

    <div class="p-section-label">En laboratorio</div>

    <div class="p-list">
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">R</span>
        <div class="pli-body">
          <div class="pli-name">AI Video Studies</div>
          <div class="pli-meta">Kling 3.0 · Higgsfield · Slow-mo</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">A</span>
        <div class="pli-body">
          <div class="pli-name">Point Cloud / LiDAR</div>
          <div class="pli-meta">Estética de datos incompletos</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">3D</span>
        <div class="pli-body">
          <div class="pli-name">Sculpting Lab</div>
          <div class="pli-meta">Figuras · Entornos · Abstracción</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">M</span>
        <div class="pli-body">
          <div class="pli-name">Physics &amp; Procedural</div>
          <div class="pli-meta">Tests sin brief · En proceso</div>
        </div>
      </div>
    </div>`,

  // ── INFO ─────────────────────────────────
  info: `
    <p class="p-info-bio">Diseño ideas que se mueven entre arte, tecnología y sistemas. Branding, motion, 3D, interfaces experimentales — siempre buscando transformar ideas en experiencias.</p>

    <a class="p-cta-main" href="info/" onclick="navigateOut(event,'info/')" onmouseenter="uiSound('hover:close-btn')" style="margin-top:24px">
      <span class="p-cta-main-label">Entrar</span>
      <span class="p-cta-main-arrow">→</span>
    </a>

    <div class="p-section-label">Contacto</div>

    <div class="p-list">
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">✉</span>
        <div class="pli-body">
          <a class="pli-name pli-link" href="mailto:nifdel.rivera@gmail.com">nifdel.rivera@gmail.com</a>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">☏</span>
        <div class="pli-body">
          <a class="pli-name pli-link" href="tel:+50230381779">+502 3038 1779</a>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">IG</span>
        <div class="pli-body">
          <a class="pli-name pli-link" href="https://www.instagram.com/nifdel?igsh=MWFvdTY3dnZxZWMwbA%3D%3D&utm_source=qr" target="_blank">@nifdel</a>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">Be</span>
        <div class="pli-body">
          <a class="pli-name pli-link" href="https://www.behance.net/nifdelrivera" target="_blank">behance.net/nifdelrivera</a>
        </div>
      </div>
    </div>`,

  // ── SYSTEMS ──────────────────────────────
  systems: `
    <a class="p-cta-main" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')" style="margin-top:28px">
      <span class="p-cta-main-label">Acceder al sistema</span>
      <span class="p-cta-main-arrow">→</span>
    </a>

    <div class="sys-block">$ ls ./frameworks
→ project_synapse.md
→ ai_prompt_architecture/
→ regreso_al_rigor/
→ ue5_game_design/</div>

    <div class="p-section-label">Frameworks</div>

    <div class="p-list">
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">001</span>
        <div class="pli-body">
          <div class="pli-name">Project Synapse</div>
          <div class="pli-meta">Framework de análisis creativo</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">002</span>
        <div class="pli-body">
          <div class="pli-name">AI Prompt Architecture</div>
          <div class="pli-meta">Prompt engineering · Video IA</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">003</span>
        <div class="pli-body">
          <div class="pli-name">Regreso al Rigor</div>
          <div class="pli-meta">Álgebra interactiva · 16 semanas</div>
        </div>
      </div>
      <div class="p-list-item" onmouseenter="uiSound('hover:pm-card')">
        <span class="pli-num">004</span>
        <div class="pli-body">
          <div class="pli-name">Proyecto 4</div>
          <div class="pli-meta">Souls × God of War · En desarrollo</div>
        </div>
      </div>
    </div>`,
};
