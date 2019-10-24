import { DrawCall } from './DrawCall';
import { Program } from './Program';
import { VertexArray } from './VertexArray';
import { VertexBuffer } from './VertexBuffer';
export class WebGL2Renderer {
    constructor(canvas, contextAttributes) {
        this.width = 0;
        this.height = 0;
        this.currentDrawCalls = 0;
        this.contextLostExt = null;
        this.contextRestoredHandler = null;
        const gl = canvas.getContext('webgl2', contextAttributes);
        this.gl = gl;
        this.canvas = canvas;
        this.setState();
        this.initExtensions();
        this.width = gl.drawingBufferWidth;
        this.height = gl.drawingBufferHeight;
        this.setViewport(0, 0, this.width, this.height);
        // tslint:disable-next-line: no-bitwise
        this.clearBits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT;
        this.contextLostExt = null;
        this.contextRestoredHandler = null;
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
        });
        this.canvas.addEventListener('webglcontextrestored', () => {
            this.initExtensions();
            if (this.contextRestoredHandler) {
                this.contextRestoredHandler();
            }
        });
    }
    setState() {
        const gl = this.gl;
        const maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        const maxUniformBuffers = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
        this.state = {
            program: null,
            vertexArray: null,
            transformFeedback: null,
            activeTexture: -1,
            textures: new Array(maxTextureUnits),
            uniformBuffers: new Array(maxUniformBuffers),
            freeUniformBufferBases: [],
            drawFramebuffer: null,
            readFramebuffer: null,
            extensions: {
                debugShaders: gl.getExtension('WEBGL_debug_shaders'),
                multiDrawInstanced: gl.getExtension('WEBGL_multi_draw_instanced')
            },
            maxTextureUnits,
            maxUniformBuffers,
            maxUniforms: Math.min(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS), gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)),
            samples: gl.getParameter(gl.SAMPLES),
            parallelShaderCompile: Boolean(gl.getExtension('KHR_parallel_shader_compile')),
            multiDrawInstanced: Boolean(gl.getExtension('WEBGL_multi_draw_instanced'))
        };
        return this;
    }
    loseContext() {
        if (this.contextLostExt) {
            this.contextLostExt.loseContext();
        }
        return this;
    }
    restoreContext() {
        if (this.contextLostExt) {
            this.contextLostExt.restoreContext();
        }
        return this;
    }
    onContextRestored(callback) {
        this.contextRestoredHandler = callback;
        return this;
    }
    initExtensions() {
        const gl = this.gl;
        gl.getExtension('EXT_color_buffer_float');
        gl.getExtension('OES_texture_float_linear');
        gl.getExtension('WEBGL_compressed_texture_s3tc');
        gl.getExtension('WEBGL_compressed_texture_s3tc_srgb');
        gl.getExtension('WEBGL_compressed_texture_etc');
        gl.getExtension('WEBGL_compressed_texture_astc');
        gl.getExtension('WEBGL_compressed_texture_pvrtc');
        gl.getExtension('EXT_disjoint_timer_query_webgl2');
        gl.getExtension('EXT_disjoint_timer_query');
        gl.getExtension('EXT_texture_filter_anisotropic');
        this.contextLostExt = gl.getExtension('WEBGL_lose_context');
        // Draft extensions
        gl.getExtension('KHR_parallel_shader_compile');
    }
    setViewport(x, y, width, height) {
        const viewport = this.viewport;
        if (viewport.width !== width || viewport.height !== height || viewport.x !== x || viewport.y !== y) {
            viewport.x = x;
            viewport.y = y;
            viewport.width = width;
            viewport.height = height;
            this.gl.viewport(x, y, width, height);
        }
        return this;
    }
    defaultViewport() {
        this.setViewport(0, 0, this.width, this.height);
        return this;
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = this.gl.drawingBufferWidth;
        this.height = this.gl.drawingBufferHeight;
        this.setViewport(0, 0, this.width, this.height);
        return this;
    }
    colorMask(r, g, b, a) {
        this.gl.colorMask(r, g, b, a);
        return this;
    }
    clearColor(r, g, b, a) {
        this.gl.clearColor(r, g, b, a);
        return this;
    }
    clearMask(mask) {
        this.clearBits = mask;
        return this;
    }
    clear() {
        this.gl.clear(this.clearBits);
        return this;
    }
    createProgram(vsSource, fsSource) {
        const program = new Program(this.gl, this.state, vsSource, fsSource);
        program.link().checkLinkage();
        return program;
    }
    createVertexArray() {
        return new VertexArray(this.gl, this.state);
    }
    createVertexBuffer(type, itemSize, data, usage) {
        return new VertexBuffer(this.gl, this.state, type, itemSize, data, usage);
    }
    createDrawCall(program, vertexArray) {
        return new DrawCall(this.gl, this.state, program, vertexArray);
    }
}
//# sourceMappingURL=WebGL2Renderer.js.map