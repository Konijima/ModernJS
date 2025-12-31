/**
 * Animation Manager
 * Handles Web Animations API integration for components.
 */
export class AnimationManager {
    /**
     * Trigger an animation on an element
     * @param {HTMLElement} element - The element to animate
     * @param {string} triggerName - The name of the animation trigger
     * @param {string} state - The state to animate to (e.g., ':enter', ':leave')
     * @param {Object} animationsConfig - The component's animation configuration
     * @returns {Promise<void>}
     */
    static async animate(element, triggerName, state, animationsConfig) {
        if (!element || !element.animate || !animationsConfig) return;

        const trigger = animationsConfig[triggerName];
        if (!trigger) return;

        const animationDef = trigger[state];
        if (!animationDef) return;

        const { keyframes, options } = animationDef;
        
        if (keyframes && options) {
            const animation = element.animate(keyframes, options);
            await animation.finished;
        }
    }
}
