// ══════════════════════════════════════════
//  DATA — PANEL CONTENT HTML
//  Contenido HTML de cada dominio para el panel lateral
//  Importado por navigation.js
// ══════════════════════════════════════════

export const panelContent = {
  work: `
    <div class="p-highlights">
      <div class="ph-item" style="--ph-r:124;--ph-g:58;--ph-b:237">
        <div class="ph-bar"></div>
        <div class="ph-body">
          <span class="ph-num">01</span>
          <div class="ph-title">Rachin</div>
          <div class="ph-meta">Personal · 2024</div>
          <div class="ph-cats">
            <span class="ph-cat">3D</span>
            <span class="ph-cat">Character</span>
            <span class="ph-cat">AI</span>
          </div>
        </div>
      </div>
      <div class="ph-item" style="--ph-r:107;--ph-g:159;--ph-b:255">
        <div class="ph-bar"></div>
        <div class="ph-body">
          <span class="ph-num">02</span>
          <div class="ph-title">Michelob Ultra NBA</div>
          <div class="ph-meta">Michelob Ultra · 2023</div>
          <div class="ph-cats">
            <span class="ph-cat">Motion</span>
            <span class="ph-cat">Campaign</span>
          </div>
        </div>
      </div>
      <div class="ph-item" style="--ph-r:245;--ph-g:158;--ph-b:11">
        <div class="ph-bar"></div>
        <div class="ph-body">
          <span class="ph-num">03</span>
          <div class="ph-title">Pilsener FOMO</div>
          <div class="ph-meta">Pilsener · 2023</div>
          <div class="ph-cats">
            <span class="ph-cat">Motion</span>
            <span class="ph-cat">Case Film</span>
          </div>
        </div>
      </div>
      <div class="ph-item" style="--ph-r:59;--ph-g:130;--ph-b:246">
        <div class="ph-bar"></div>
        <div class="ph-body">
          <span class="ph-num">04</span>
          <div class="ph-title">#SeMeAntojaGuate</div>
          <div class="ph-meta">Pepsi · 2022 · 8.4K views</div>
          <div class="ph-cats">
            <span class="ph-cat">Campaign</span>
            <span class="ph-cat">Motion</span>
          </div>
        </div>
      </div>
      <div class="ph-item" style="--ph-r:6;--ph-g:182;--ph-b:212">
        <div class="ph-bar"></div>
        <div class="ph-body">
          <span class="ph-num">13</span>
          <div class="ph-title">Paradox</div>
          <div class="ph-meta">Personal · UX/UI Film Case</div>
          <div class="ph-cats">
            <span class="ph-cat">UX/UI</span>
            <span class="ph-cat">Motion</span>
          </div>
        </div>
      </div>
    </div>
    <div class="p-work-see-all" onclick="navigateToPortfolio()" onmouseenter="uiSound('hover:see-all')" style="cursor:none">
      <div>
        <span class="p-work-see-all-label">Ver portfolio completo</span>
        <span class="p-work-see-all-meta">16 proyectos · Motion · 3D · AI · UX</span>
      </div>
      <div class="p-work-see-all-right">
        <span class="p-work-see-all-arrow">→</span>
        <span class="p-work-see-all-count">16 / 16</span>
      </div>
    </div>`,

  thoughts: `
    <div class="p-nodes">
      <div class="p-node">
        <div class="pn-n">Essay I</div>
        <div class="pn-name">La Jaula Transparente</div>
        <div class="pn-sub">On ego, consciousness, and the transparent cage we cannot see from within.</div>
        <a class="p-item-cta gold" href="thoughts/jaula-transparente/" onclick="navigateOut(event,'thoughts/jaula-transparente/')" onmouseenter="playCTAHover('thoughts')">Leer ensayo</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Framework</div>
        <div class="pn-name">Hipótesis H</div>
        <div class="pn-sub">A theoretical framework for meaning-making in fragmented systems.</div>
        <a class="p-item-cta gold" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-thoughts')">Próximamente</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Universe</div>
        <div class="pn-name">Kyran &amp; Lyra</div>
        <div class="pn-sub">Sci-fi narrative. The Lattice of States — consciousness and time reimagined.</div>
        <a class="p-item-cta gold" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-thoughts')">En desarrollo</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Platform</div>
        <div class="pn-name">Nota Existencial</div>
        <div class="pn-sub">Essays on paradox, agency, and identity within systems that cannot fully perceive themselves.</div>
        <a class="p-item-cta gold" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-thoughts')">Próximamente</a>
      </div>
    </div>`,

  experiments: `
    <div class="p-nodes">
      <div class="p-node">
        <div class="pn-n">Research</div>
        <div class="pn-name">AI Video Studies</div>
        <div class="pn-sub">Slow-motion, chromatic aberration ghosts, directional motion blur. Kling 3.0 + Higgsfield.</div>
        <a class="p-item-cta dark" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-experiments')">Ver estudios</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Aesthetic</div>
        <div class="pn-name">Point Cloud / LiDAR</div>
        <div class="pn-sub">Reconstruction aesthetics as visual language. The poetics of incomplete data.</div>
        <a class="p-item-cta dark" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-experiments')">Ver serie</a>
      </div>
      <div class="p-node">
        <div class="pn-n">3D</div>
        <div class="pn-name">Sculpting Lab</div>
        <div class="pn-sub">Figures, environments, abstraction — work that doesn't need a brief to exist.</div>
      </div>
      <div class="p-node">
        <div class="pn-n">Motion</div>
        <div class="pn-name">Physics &amp; Procedural</div>
        <div class="pn-sub">Tests that are valuable precisely because they don't know what they are yet.</div>
      </div>
    </div>`,

  systems: `<div class="sys-block"><span class="s-cmd">$ ls ./frameworks</span>
<span class="s-out">→ project_synapse.md</span>
<span class="s-out">→ ai_prompt_architecture/</span>
<span class="s-out">→ regreso_al_rigor/</span>
<span class="s-out">→ ue5_game_design/</span>
</div>
    <div class="p-nodes" style="margin-top:20px">
      <div class="p-node">
        <div class="pn-n">001</div>
        <div class="pn-name">Project 1</div>
        <div class="pn-sub">Creative analysis framework. A system for dissecting what makes work land.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">Ver framework</a>
      </div>
      <div class="p-node">
        <div class="pn-n">002</div>
        <div class="pn-name">Project 2</div>
        <div class="pn-sub">Structured prompt engineering for cinematic AI video. Labeled sections, constraints, negative prompts.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">Ver sistema</a>
      </div>
      <div class="p-node">
        <div class="pn-n">003</div>
        <div class="pn-name">Project 3</div>
        <div class="pn-sub">16-week interactive algebra course. Duolingo structure. Feynman-for-teenagers voice. UE5 soul.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">Ver curso</a>
      </div>
      <div class="p-node">
        <div class="pn-n">004</div>
        <div class="pn-name">Project 4</div>
        <div class="pn-sub">Spanish Inquisition / early colonial Latin America. Souls × God of War. La Llorona. El Cadejo.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">En desarrollo</a>
      </div>
    </div>`,
};
