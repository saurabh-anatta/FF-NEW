import { Component } from '@theme/component';

/**
 * @typedef {Object} PdpSubscriptionSelectorRefs
 * @property {HTMLElement} subscribeCard - Subscribe & Save card
 * @property {HTMLElement} onetimeCard - One-time purchase card
 * @property {HTMLElement} subscribeDetails - Subscribe details panel
 * @property {HTMLInputElement} sellingPlanInput - Hidden selling plan input
 */

/** @extends {Component<PdpSubscriptionSelectorRefs>} */
class PdpSubscriptionSelector extends Component {
  /** @type {Array<Object>} */
  #sellingPlans = [];

  /** @type {string|null} */
  #selectedPlanId = null;

  connectedCallback() {
    super.connectedCallback();

    const dataScript = this.querySelector('script[type="application/json"][data-selling-plans]');

    if (dataScript) {
      try {
        this.#sellingPlans = JSON.parse(dataScript.textContent);
      } catch {
        this.#sellingPlans = [];
      }
    }

    if (this.#sellingPlans.length > 0) {
      this.#selectedPlanId = String(this.#sellingPlans[0].id);
      this.#updateSellingPlanInput();
    }
  }

  /** @param {Event} event */
  handleSubscribeSelect(event) {
    event.preventDefault();
    this.#setMode('subscribe');
  }

  /** @param {Event} event */
  handleOnetimeSelect(event) {
    event.preventDefault();
    this.#setMode('onetime');
  }

  /** @param {Event} event */
  handleFrequencySelect(event) {
    const button = event.currentTarget;
    const planId = button.dataset.planId;

    if (!planId) return;

    this.#selectedPlanId = planId;

    const frequencyButtons = this.querySelectorAll('[data-frequency-btn]');

    for (const btn of frequencyButtons) {
      btn.classList.toggle('is-selected', btn.dataset.planId === planId);
    }

    this.#updateSellingPlanInput();
    this.#dispatchPlanChange();
  }

  /** @param {'subscribe'|'onetime'} mode */
  #setMode(mode) {
    const isSubscribe = mode === 'subscribe';

    if (this.refs.subscribeCard) {
      this.refs.subscribeCard.classList.toggle('is-selected', isSubscribe);
    }

    if (this.refs.onetimeCard) {
      this.refs.onetimeCard.classList.toggle('is-selected', !isSubscribe);
    }

    if (this.refs.subscribeDetails) {
      this.refs.subscribeDetails.hidden = !isSubscribe;
    }

    if (isSubscribe && this.#sellingPlans.length > 0) {
      if (!this.#selectedPlanId) {
        this.#selectedPlanId = String(this.#sellingPlans[0].id);
      }
    } else {
      this.#selectedPlanId = null;
    }

    this.#updateSellingPlanInput();
    this.#dispatchPlanChange();
  }

  #updateSellingPlanInput() {
    const form = this.closest('form') || this.closest('.shopify-section')?.querySelector('form[action*="/cart/add"]');

    if (!form) return;

    let input = form.querySelector('input[name="selling_plan"]');

    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'selling_plan';
      form.appendChild(input);
    }

    input.value = this.#selectedPlanId || '';
  }

  #dispatchPlanChange() {
    const section = this.closest('.shopify-section');
    const plan = this.#selectedPlanId
      ? this.#sellingPlans.find((p) => String(p.id) === this.#selectedPlanId)
      : null;

    if (section) {
      section.dispatchEvent(
        new CustomEvent('selling-plan:change', {
          detail: { sellingPlan: plan, sellingPlanId: this.#selectedPlanId },
          bubbles: true,
        })
      );
    }
  }
}

customElements.define('pdp-subscription-selector', PdpSubscriptionSelector);
