import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Palette,
} from "lucide-react";

type Tool = "pen" | "eraser" | "rectangle" | "circle" | "line" | "text";

interface DrawAction {
  type: Tool;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  strokeWidth: number;
  text?: string;
}

interface WhiteboardProps {
  className?: string;
  isHost?: boolean;
  readOnly?: boolean;
}

const COLORS = [
  "#000000",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#FFFFFF",
];

export function Whiteboard({ className, isHost = true, readOnly = false }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [actions]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    actions.forEach((action) => {
      drawAction(ctx, action);
    });

    if (currentAction) {
      drawAction(ctx, currentAction);
    }
  }, [actions, currentAction]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
    ctx.strokeStyle = action.type === "eraser" ? "#FFFFFF" : action.color;
    ctx.lineWidth = action.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (action.type) {
      case "pen":
      case "eraser":
        if (action.points && action.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (action.startX !== undefined && action.startY !== undefined && 
            action.endX !== undefined && action.endY !== undefined) {
          ctx.beginPath();
          ctx.rect(
            action.startX,
            action.startY,
            action.endX - action.startX,
            action.endY - action.startY
          );
          ctx.stroke();
        }
        break;

      case "circle":
        if (action.startX !== undefined && action.startY !== undefined && 
            action.endX !== undefined && action.endY !== undefined) {
          const radiusX = Math.abs(action.endX - action.startX) / 2;
          const radiusY = Math.abs(action.endY - action.startY) / 2;
          const centerX = action.startX + (action.endX - action.startX) / 2;
          const centerY = action.startY + (action.endY - action.startY) / 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case "line":
        if (action.startX !== undefined && action.startY !== undefined && 
            action.endX !== undefined && action.endY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(action.startX, action.startY);
          ctx.lineTo(action.endX, action.endY);
          ctx.stroke();
        }
        break;

      case "text":
        if (action.text && action.startX !== undefined && action.startY !== undefined) {
          ctx.fillStyle = action.color;
          ctx.font = `${action.strokeWidth * 6}px sans-serif`;
          ctx.fillText(action.text, action.startX, action.startY);
        }
        break;
    }
  };

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setStartPoint(point);
    setRedoStack([]);

    if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const action: DrawAction = {
          type: "text",
          startX: point.x,
          startY: point.y,
          color,
          strokeWidth,
          text,
        };
        setActions((prev) => [...prev, action]);
      }
      setIsDrawing(false);
      return;
    }

    if (tool === "pen" || tool === "eraser") {
      setCurrentAction({
        type: tool,
        points: [point],
        color,
        strokeWidth: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
      });
    } else {
      setCurrentAction({
        type: tool,
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y,
        color,
        strokeWidth,
      });
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();

    const point = getCanvasPoint(e);

    if (tool === "pen" || tool === "eraser") {
      setCurrentAction((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...(prev.points || []), point],
        };
      });
    } else {
      setCurrentAction((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          endX: point.x,
          endY: point.y,
        };
      });
    }
  };

  const handleEnd = () => {
    if (!isDrawing || !currentAction) {
      setIsDrawing(false);
      return;
    }

    setActions((prev) => [...prev, currentAction]);
    setCurrentAction(null);
    setIsDrawing(false);
    setStartPoint(null);
  };

  const undo = () => {
    if (actions.length === 0) return;
    const lastAction = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastAction]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setActions((prev) => [...prev, lastRedo]);
  };

  const clearCanvas = () => {
    setActions([]);
    setRedoStack([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const tools = [
    { id: "pen", icon: Pencil, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "text", icon: Type, label: "Text" },
  ] as const;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
          {/* Tools */}
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            {tools.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={tool === id ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTool(id)}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <div
                  className="h-5 w-5 rounded-full border"
                  style={{ backgroundColor: color }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-3 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "h-8 w-8 rounded-md border-2 transition-transform hover:scale-110",
                      color === c ? "border-primary" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Stroke width */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-16">
                {strokeWidth}px
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <p className="text-sm font-medium">Stroke Width</p>
                <Slider
                  value={[strokeWidth]}
                  onValueChange={(v) => setStrokeWidth(v[0])}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-px bg-border" />

          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={undo}
            disabled={actions.length === 0}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={redo}
            disabled={redoStack.length === 0}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={clearCanvas}
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={downloadCanvas}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className={cn("touch-none", readOnly ? "cursor-default" : "cursor-crosshair")}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    </div>
  );
}
