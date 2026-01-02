// ============================================================================
// Framework Imports
// ============================================================================
import {
    Component,
    DeviceService
} from '@modernjs/core';

export const CursorComponent = Component.create({
    selector: 'cursor-overlay',
    inject: [DeviceService],
    styles: `
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
        }
        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
    `,
    template: `<canvas></canvas>`,
    onInit() {
        this.initialized = false;
        
        this.sub = this.deviceService.subscribe(({ isMobile }) => {
            if (isMobile) {
                this.style.display = 'none';
                this.cleanupWebGL();
            } else {
                this.style.display = 'block';
                // Wait for render if not initialized
                if (!this.initialized) {
                    requestAnimationFrame(() => this.initWebGL());
                }
            }
        });
    },
    
    onDestroy() {
        if (this.sub) this.sub.unsubscribe();
        this.cleanupWebGL();
    },

    initWebGL() {
        if (this.initialized) return;

        this.canvas = this.shadowRoot.querySelector('canvas');
        if (!this.canvas) return;

        this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: true });
        
        if (!this.gl) {
            console.warn('WebGL not supported, cursor effect disabled');
            return;
        }

        this.initialized = true;

        // Initialize state
        this.trail = Array.from({ length: 20 }, () => ({ x: 0, y: 0 }));
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.hoverState = 0; // 0 = none, 1 = hover
        this.clickState = 0; // 0 = none, 1 = click
        this.targetHover = 0;
        this.targetClick = 0;

        this.initShaders();
        this.initBuffers();
        this.resize();
        
        this.bindEvents();
        this.animate();
    },

    cleanupWebGL() {
        if (!this.initialized) return;
        
        this.unbindEvents();
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        this.initialized = false;
    },

    bindEvents() {
        this.resizeBound = this.resize.bind(this);
        this.mouseMoveBound = (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = window.innerHeight - e.clientY; // WebGL Y is inverted
        };
        this.mouseDownBound = () => this.targetClick = 1;
        this.mouseUpBound = () => this.targetClick = 0;
        
        this.mouseOverBound = (e) => {
            if (e.target.closest('a, button, .btn, .card, input, textarea, .hover-card')) {
                this.targetHover = 1;
            }
        };
        this.mouseOutBound = (e) => {
            if (e.target.closest('a, button, .btn, .card, input, textarea, .hover-card')) {
                this.targetHover = 0;
            }
        };

        window.addEventListener('resize', this.resizeBound);
        document.addEventListener('mousemove', this.mouseMoveBound);
        document.addEventListener('mousedown', this.mouseDownBound);
        document.addEventListener('mouseup', this.mouseUpBound);
        document.addEventListener('mouseover', this.mouseOverBound);
        document.addEventListener('mouseout', this.mouseOutBound);
    },

    unbindEvents() {
        if (this.resizeBound) window.removeEventListener('resize', this.resizeBound);
        if (this.mouseMoveBound) document.removeEventListener('mousemove', this.mouseMoveBound);
        if (this.mouseDownBound) document.removeEventListener('mousedown', this.mouseDownBound);
        if (this.mouseUpBound) document.removeEventListener('mouseup', this.mouseUpBound);
        if (this.mouseOverBound) document.removeEventListener('mouseover', this.mouseOverBound);
        if (this.mouseOutBound) document.removeEventListener('mouseout', this.mouseOutBound);
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    },

    initShaders() {
        const vsSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform vec2 u_trail[20];
            uniform float u_hover;
            uniform float u_click;
            uniform float u_time;

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution;
                float brightness = 0.0;
                
                // Base color (Sky Blue to Pink)
                vec3 color = mix(vec3(0.22, 0.74, 0.97), vec3(0.96, 0.45, 0.71), u_hover);
                
                // Click effect (turns white/hot)
                color = mix(color, vec3(1.0, 1.0, 1.0), u_click * 0.5);

                for (int i = 0; i < 20; i++) {
                    float dist = distance(gl_FragCoord.xy, u_trail[i]);
                    
                    // Radius changes based on index (tapering trail) and hover state
                    // Reduced intensity: 1.5 -> 0.8 base, and hover multiplier reduced
                    float radius = (20.0 - float(i)) * (0.8 + u_hover * 0.8 + u_click * 0.5);
                    
                    // Soft glow
                    brightness += (radius * radius) / (dist * dist + 1.0);
                }

                // Threshold to make it look like liquid/metaballs
                // Reduced threshold multiplier: 0.08 -> 0.06
                float alpha = smoothstep(0.8, 1.0, brightness * 0.06);
                
                // Add a subtle outer glow
                // Reduced glow: 0.005 -> 0.002
                alpha += brightness * 0.002;

                gl_FragColor = vec4(color * alpha, alpha);
            }
        `;

        const vs = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Shader program init failed:', this.gl.getProgramInfoLog(this.program));
        }

        this.gl.useProgram(this.program);
        
        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            trail: this.gl.getUniformLocation(this.program, 'u_trail'),
            hover: this.gl.getUniformLocation(this.program, 'u_hover'),
            click: this.gl.getUniformLocation(this.program, 'u_click'),
            time: this.gl.getUniformLocation(this.program, 'u_time')
        };
    },

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile failed:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    },

    initBuffers() {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ]), this.gl.STATIC_DRAW);
        
        this.gl.enableVertexAttribArray(this.locations.position);
        this.gl.vertexAttribPointer(this.locations.position, 2, this.gl.FLOAT, false, 0, 0);
    },

    animate(time) {
        if (!this.initialized) return;

        // Smooth state transitions
        this.hoverState += (this.targetHover - this.hoverState) * 0.1;
        this.clickState += (this.targetClick - this.clickState) * 0.2;

        // Update trail physics
        // Shift array
        for (let i = this.trail.length - 1; i > 0; i--) {
            this.trail[i] = {
                x: this.trail[i].x + (this.trail[i-1].x - this.trail[i].x) * 0.6,
                y: this.trail[i].y + (this.trail[i-1].y - this.trail[i].y) * 0.6
            };
        }
        // Head follows mouse
        this.trail[0] = {
            x: this.trail[0].x + (this.mouse.x - this.trail[0].x) * 0.8,
            y: this.trail[0].y + (this.mouse.y - this.trail[0].y) * 0.8
        };

        // Render
        this.gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.locations.hover, this.hoverState);
        this.gl.uniform1f(this.locations.click, this.clickState);
        this.gl.uniform1f(this.locations.time, time * 0.001);

        const trailFlat = [];
        this.trail.forEach(p => trailFlat.push(p.x, p.y));
        this.gl.uniform2fv(this.locations.trail, new Float32Array(trailFlat));

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
});
