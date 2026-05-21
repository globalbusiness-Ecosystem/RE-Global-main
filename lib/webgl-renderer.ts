/**
 * WebGL-Accelerated Panoramic Renderer
 * GPU-powered rendering for maximum performance on desktop systems
 */

const vertexShaderSource = `
  attribute vec4 position;
  attribute vec2 texCoord;
  
  varying vec2 vTexCoord;
  
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * position;
    vTexCoord = texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  
  varying vec2 vTexCoord;
  uniform sampler2D uTexture;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uSaturation;
  
  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    
    // Apply brightness
    color.rgb += uBrightness;
    
    // Apply contrast
    color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
    
    // Apply saturation
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, uSaturation);
    
    gl_FragColor = color;
  }
`;

export class WebGLPanoramicRenderer {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private sphereVertices: Float32Array;
  private sphereIndices: Uint16Array;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl', {
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });

    if (!this.gl) {
      console.warn('WebGL not supported, falling back to Canvas2D');
      return;
    }

    this.initializeShaders();
    this.initializeSphere();
    this.setupBuffers();
  }

  private initializeShaders(): void {
    if (!this.gl) return;

    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
    this.gl.shaderSource(vertexShader, vertexShaderSource);
    this.gl.compileShader(vertexShader);

    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
    this.gl.shaderSource(fragmentShader, fragmentShaderSource);
    this.gl.compileShader(fragmentShader);

    this.program = this.gl.createProgram()!;
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
  }

  private initializeSphere(): void {
    const segments = 128;
    const rings = 64;
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let ring = 0; ring <= rings; ring++) {
      const phi = (ring / rings) * Math.PI;
      for (let seg = 0; seg <= segments; seg++) {
        const theta = (seg / segments) * 2 * Math.PI;

        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        vertices.push(x, y, z);
        vertices.push(theta / (2 * Math.PI), phi / Math.PI);
      }
    }

    for (let ring = 0; ring < rings; ring++) {
      for (let seg = 0; seg < segments; seg++) {
        const a = ring * (segments + 1) + seg;
        const b = a + segments + 1;

        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    this.sphereVertices = new Float32Array(vertices);
    this.sphereIndices = new Uint16Array(indices);
  }

  private setupBuffers(): void {
    if (!this.gl) return;

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sphereVertices, this.gl.STATIC_DRAW);

    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.sphereIndices, this.gl.STATIC_DRAW);
  }

  render(
    panoramaImage: HTMLImageElement,
    yaw: number,
    pitch: number,
    zoom: number,
    canvas: HTMLCanvasElement
  ): void {
    if (!this.gl || !this.program) return;

    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.useProgram(this.program);

    // Create projection matrix
    const fov = 75 / zoom;
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = this.createPerspectiveMatrix(fov, aspect, 0.1, 100);

    // Create view matrix with rotations
    const modelViewMatrix = this.createViewMatrix(yaw, pitch);

    // Set uniforms
    const projLoc = this.gl.getUniformLocation(this.program, 'projectionMatrix');
    const mvLoc = this.gl.getUniformLocation(this.program, 'modelViewMatrix');

    this.gl.uniformMatrix4fv(projLoc, false, projectionMatrix);
    this.gl.uniformMatrix4fv(mvLoc, false, modelViewMatrix);

    // Load texture
    if (!this.texture) {
      this.texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, panoramaImage);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    }

    // Draw sphere
    this.gl.drawElements(this.gl.TRIANGLES, this.sphereIndices.length, this.gl.UNSIGNED_SHORT, 0);
  }

  private createPerspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1 / Math.tan(fov * Math.PI / 360);
    const nf = 1 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ]);
  }

  private createViewMatrix(yaw: number, pitch: number): Float32Array {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    return new Float32Array([
      cy, -sy * sp, sy * cp, 0,
      0, cp, sp, 0,
      -sy, -cy * sp, cy * cp, 0,
      0, 0, 0, 1,
    ]);
  }

  isSupported(): boolean {
    return !!this.gl;
  }
}
