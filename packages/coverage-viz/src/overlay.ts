export interface Offset {
  top: number;
  left: number;
}

export interface RangeRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function sizeCanvas(
  canvas: HTMLCanvasElement,
  c: CanvasRenderingContext2D
) {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  c.scale(ratio, ratio);
  c.lineWidth = 2;
}

const padding = 3;

function drawArrow(
  c: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const margin = 64;

  c.beginPath();
  c.moveTo(x1, y1);
  c.bezierCurveTo(
    (x1 + 2 * x2) / 3 + margin / 2,
    y1,
    (x1 * 2 + x2) / 3 - margin / 2,
    y2,
    x2,
    y2
  );
  c.stroke();
}

export function render(
  c: CanvasRenderingContext2D,
  canvasOffset: Offset,
  generatedOffest: Offset,
  generatedRect: RangeRect,
  originalOffset: Offset,
  originalRect: RangeRect,
  renderBoxes = false
) {
  const generatedOffsetTop = generatedOffest.top - canvasOffset.top;
  const generatedOffsetLeft = generatedOffest.left - canvasOffset.left;
  const generatedBoxHeight = generatedRect.height + padding * 2;

  const generatedStartX = generatedOffsetLeft + generatedRect.left;
  const generatedStartTop = generatedOffsetTop + generatedRect.top;
  if (renderBoxes) {
    c.strokeRect(
      generatedStartX - padding,
      generatedStartTop - padding,
      generatedRect.width + padding * 2,
      generatedBoxHeight
    );
  }

  const originalOffsetTop = originalOffset.top - canvasOffset.top;

  const originalStartBottom = originalOffsetTop + originalRect.bottom;
  const originalBoxHeight = originalRect.height + padding * 2;
  if (renderBoxes) {
    const originalOffsetLeft = originalOffset.left - canvasOffset.left;
    const originalStartX = originalOffsetLeft + originalRect.left;
    const originalStartTop = originalOffsetTop + originalRect.top;
    c.strokeRect(
      originalStartX - padding,
      originalStartTop - padding,
      originalRect.width + padding * 2,
      originalBoxHeight
    );
  }

  c.strokeStyle = "rgba(0, 0, 0, 0.2)";
  drawArrow(
    c,
    generatedStartX - padding,
    generatedStartTop - padding + generatedBoxHeight / 2,
    originalRect.right + padding,
    originalStartBottom + padding - originalBoxHeight / 2
  );
}
