import { Component } from '@theme/component';

/**
 * @typedef {Object} CollectionTabsRefs
 * @property {HTMLButtonElement[]} tab - Tab buttons
 * @property {HTMLElement[]} panel - Content panels
 * @property {HTMLElement} [allHeader] - Optional all-tab header
 */

/** @extends {Component<CollectionTabsRefs>} */
class CollectionTabs extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.#setInitialState();
  }

  #setInitialState() {
    const tabs = this.refs.tab;

    if (!tabs || tabs.length === 0) return;

    const activeTab = tabs.find((t) => t.classList.contains('is-active'));

    if (activeTab) {
      const target = activeTab.getAttribute('data-target');
      this.#activateTarget(target);
    }
  }

  /**
   * @param {Event} event
   */
  handleTabClick(event) {
    const button = /** @type {HTMLButtonElement} */ (event.target).closest('[data-target]');

    if (!button) return;

    const target = button.getAttribute('data-target');
    const tabs = this.refs.tab;

    if (!tabs) return;

    for (const tab of tabs) {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-selected', 'false');
    }

    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');
    button.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });

    this.#activateTarget(target);
  }

  /**
   * @param {string|null} target
   */
  #activateTarget(target) {
    const panels = this.refs.panel;
    const allHeader = this.refs.allHeader;

    if (!panels) return;

    if (target === 'all') {
      for (const panel of panels) {
        panel.classList.remove('is-hidden');
      }

      if (allHeader) {
        allHeader.classList.remove('is-hidden');
      }
    } else {
      for (const panel of panels) {
        const panelIndex = panel.getAttribute('data-panel');

        if (panelIndex === target) {
          panel.classList.remove('is-hidden');
        } else {
          panel.classList.add('is-hidden');
        }
      }

      if (allHeader) {
        allHeader.classList.add('is-hidden');
      }
    }
  }
}

customElements.define('collection-tabs', CollectionTabs);
