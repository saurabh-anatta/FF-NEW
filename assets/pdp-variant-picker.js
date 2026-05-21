import { Component } from '@theme/component';

/**
 * @typedef {Object} PdpVariantPickerRefs
 * @property {HTMLElement[]} optionCards - Clickable variant option cards
 */

/** @extends {Component<PdpVariantPickerRefs>} */
class PdpVariantPicker extends Component {
  /** @type {Array<Object>} */
  #variants = [];

  /** @type {Map<string, string>} */
  #selectedOptions = new Map();

  connectedCallback() {
    super.connectedCallback();

    const dataScript = this.querySelector('script[type="application/json"][data-variant-json]');

    if (dataScript) {
      try {
        this.#variants = JSON.parse(dataScript.textContent);
      } catch {
        this.#variants = [];
      }
    }

    this.#initializeSelectedOptions();
  }

  #initializeSelectedOptions() {
    const url = new URL(window.location.href);
    const variantId = url.searchParams.get('variant');

    if (variantId) {
      const variant = this.#variants.find((v) => String(v.id) === variantId);

      if (variant) {
        for (const [index, value] of variant.options.entries()) {
          this.#selectedOptions.set(String(index + 1), value);
        }

        this.#updateCardStates();
        return;
      }
    }

    const firstAvailable = this.#variants.find((v) => v.available);
    const target = firstAvailable || this.#variants[0];

    if (target) {
      for (const [index, value] of target.options.entries()) {
        this.#selectedOptions.set(String(index + 1), value);
      }

      this.#updateCardStates();
    }
  }

  /**
   * @param {Event} event
   */
  handleOptionSelect(event) {
    const card = event.currentTarget;

    if (!card || card.hasAttribute('disabled')) return;

    const optionPosition = card.dataset.optionPosition;
    const optionValue = card.dataset.optionValue;

    if (!optionPosition || !optionValue) return;

    this.#selectedOptions.set(optionPosition, optionValue);
    this.#updateCardStates();

    const matchingVariant = this.#findMatchingVariant();

    if (matchingVariant) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', matchingVariant.id);
      history.replaceState({}, '', url.toString());

      const section = this.closest('.shopify-section');

      if (section) {
        section.dispatchEvent(
          new CustomEvent('variant:change', {
            detail: { variant: matchingVariant },
            bubbles: true,
          })
        );
      }
    }
  }

  #updateCardStates() {
    const cards = this.querySelectorAll('[data-option-card]');

    for (const card of cards) {
      const position = card.dataset.optionPosition;
      const value = card.dataset.optionValue;
      const isSelected = this.#selectedOptions.get(position) === value;

      card.classList.toggle('is-selected', isSelected);
      card.setAttribute('aria-checked', String(isSelected));
    }

    this.#updateSelectedLabels();
    this.#updateAvailability();
  }

  #updateSelectedLabels() {
    const labels = this.querySelectorAll('[data-selected-value]');

    for (const label of labels) {
      const position = label.dataset.selectedValue;
      const value = this.#selectedOptions.get(position);

      if (value) {
        label.textContent = value;
      }
    }
  }

  #updateAvailability() {
    const cards = this.querySelectorAll('[data-option-card]');

    for (const card of cards) {
      const position = card.dataset.optionPosition;
      const value = card.dataset.optionValue;

      const testOptions = new Map(this.#selectedOptions);
      testOptions.set(position, value);

      const isAvailable = this.#variants.some((v) => {
        for (const [pos, val] of testOptions) {
          const optionIndex = parseInt(pos, 10) - 1;

          if (v.options[optionIndex] !== val) return false;
        }
        return v.available;
      });

      card.classList.toggle('is-unavailable', !isAvailable);
      card.toggleAttribute('disabled', !isAvailable);
    }
  }

  /** @returns {Object|undefined} */
  #findMatchingVariant() {
    return this.#variants.find((v) => {
      for (const [position, value] of this.#selectedOptions) {
        const optionIndex = parseInt(position, 10) - 1;

        if (v.options[optionIndex] !== value) return false;
      }
      return true;
    });
  }
}

customElements.define('pdp-variant-picker', PdpVariantPicker);
