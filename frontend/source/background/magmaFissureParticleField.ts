import { magmaParticleColors } from '@/source/design/themeColors';

export interface ParticleFieldOptions {
  particleCount: number;
  flowSpeed: number;
  noiseScale: number;
  timeScale: number;
  pointerRepulsionRadius: number;
}

export const defaultParticleFieldOptions: ParticleFieldOptions = {
  particleCount: 900,
  flowSpeed: 2,
  noiseScale: 0.003,
  timeScale: 0.0005,
  pointerRepulsionRadius: 220,
};

interface PointerPosition {
  x: number;
  y: number;
}

class MagmaParticle {
  private positionX: number;
  private positionY: number;
  private velocityX: number;
  private velocityY: number;
  private remainingLife: number;
  private maximumLife: number;
  private size: number;
  private color: string;

  constructor(
    private readonly fieldWidth: number,
    private readonly fieldHeight: number
  ) {
    this.positionX = Math.random() * fieldWidth;
    this.positionY = Math.random() * fieldHeight;
    this.velocityX = 0;
    this.velocityY = 0;
    this.maximumLife = Math.random() * 120 + 120;
    this.remainingLife = this.maximumLife;
    this.size = Math.random() * 1.6 + 0.5;
    this.color = this.pickColor();
  }

  private pickColor(): string {
    const sample = Math.random();
    if (sample > 0.94) {
      return magmaParticleColors.hotCore;
    }
    if (sample > 0.55) {
      return magmaParticleColors.ember;
    }
    return magmaParticleColors.flame;
  }

  private respawn(): void {
    this.positionX = Math.random() * this.fieldWidth;
    this.positionY = Math.random() * this.fieldHeight;
    this.remainingLife = this.maximumLife;
    this.velocityX = 0;
    this.velocityY = 0;
    this.color = this.pickColor();
  }

  public advance(
    elapsedTime: number,
    pointer: PointerPosition,
    options: ParticleFieldOptions
  ): void {
    const flowAngle =
      (Math.cos(this.positionX * options.noiseScale) +
        Math.sin(this.positionY * options.noiseScale + elapsedTime)) *
      Math.PI;

    const targetVelocityX = Math.cos(flowAngle);
    const targetVelocityY = Math.sin(flowAngle);

    this.velocityX += (targetVelocityX * options.flowSpeed - this.velocityX) * 0.1;
    this.velocityY += (targetVelocityY * options.flowSpeed - this.velocityY) * 0.1;

    const distanceX = this.positionX - pointer.x;
    const distanceY = this.positionY - pointer.y;
    const distanceToPointer = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distanceToPointer < options.pointerRepulsionRadius) {
      const repulsionStrength =
        (options.pointerRepulsionRadius - distanceToPointer) /
        options.pointerRepulsionRadius;
      const repulsionAngle = Math.atan2(distanceY, distanceX);
      this.velocityX += Math.cos(repulsionAngle) * repulsionStrength * 2;
      this.velocityY += Math.sin(repulsionAngle) * repulsionStrength * 2;
    }

    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
    this.remainingLife -= 1;

    const isOutOfBounds =
      this.positionX < 0 ||
      this.positionX > this.fieldWidth ||
      this.positionY < 0 ||
      this.positionY > this.fieldHeight;

    if (this.remainingLife <= 0 || isOutOfBounds) {
      this.respawn();
    }
  }

  public render(renderingContext: CanvasRenderingContext2D): void {
    renderingContext.fillStyle = this.color;
    renderingContext.fillRect(this.positionX, this.positionY, this.size, this.size);
  }
}

export function startMagmaFissureField(
  canvas: HTMLCanvasElement,
  options: ParticleFieldOptions = defaultParticleFieldOptions
): () => void {
  const renderingContext = canvas.getContext('2d');
  if (!renderingContext) {
    return () => undefined;
  }

  let fieldWidth = (canvas.width = window.innerWidth);
  let fieldHeight = (canvas.height = window.innerHeight);
  const pointer: PointerPosition = { x: fieldWidth / 2, y: fieldHeight };

  let particles: MagmaParticle[] = createParticles(fieldWidth, fieldHeight, options);
  let elapsedTime = 0;
  let animationFrameId = 0;

  const renderFrame = (): void => {
    renderingContext.fillStyle = magmaParticleColors.fadeBackground;
    renderingContext.fillRect(0, 0, fieldWidth, fieldHeight);

    for (const particle of particles) {
      particle.advance(elapsedTime, pointer, options);
      particle.render(renderingContext);
    }

    elapsedTime += options.timeScale;
    animationFrameId = window.requestAnimationFrame(renderFrame);
  };

  const handleResize = (): void => {
    fieldWidth = canvas.width = window.innerWidth;
    fieldHeight = canvas.height = window.innerHeight;
    particles = createParticles(fieldWidth, fieldHeight, options);
  };

  const handlePointerMove = (event: MouseEvent): void => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handlePointerMove);
  renderFrame();

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handlePointerMove);
  };
}

function createParticles(
  fieldWidth: number,
  fieldHeight: number,
  options: ParticleFieldOptions
): MagmaParticle[] {
  const particles: MagmaParticle[] = [];
  for (let index = 0; index < options.particleCount; index += 1) {
    particles.push(new MagmaParticle(fieldWidth, fieldHeight));
  }
  return particles;
}
