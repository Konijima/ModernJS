export const fadeAnimation = {
    route: {
        ':enter': {
            keyframes: [
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            options: { duration: 300, easing: 'ease-out', fill: 'forwards' }
        },
        ':leave': {
            keyframes: [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-10px)' }
            ],
            options: { duration: 200, easing: 'ease-in', fill: 'forwards' }
        }
    }
};
