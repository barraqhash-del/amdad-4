import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

export interface BarcodeGeneratorProps {
  value: string;
  format?:
    | "CODE128"
    | "CODE128A"
    | "CODE128B"
    | "CODE128C"
    | "EAN13"
    | "EAN8"
    | "EAN5"
    | "EAN2"
    | "UPC"
    | "UPCE"
    | "CODE39"
    | "ITF14"
    | "ITF"
    | "MSI"
    | "MSI10"
    | "MSI11"
    | "MSI1010"
    | "MSI1110"
    | "pharmacode"
    | "codabar";
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: "left" | "center" | "right";
  textPosition?: "bottom" | "top";
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  className?: string;
  id?: string;
  renderType?: "svg" | "canvas";
}

/**
 * Robust, real Barcode Generator component powered by JsBarcode.
 * Renders vector SVG or Canvas for crisp printing on thermal sticker & A4 label printers.
 */
export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  format = "CODE128",
  width = 1.6,
  height = 40,
  displayValue = true,
  text,
  fontOptions = "",
  font = "monospace",
  textAlign = "center",
  textPosition = "bottom",
  textMargin = 2,
  fontSize = 12,
  background = "transparent",
  lineColor = "#000000",
  margin = 4,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  className = "",
  id,
  renderType = "svg",
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Sanitize value
    const cleanValue = (value || "").trim();
    if (!cleanValue) {
      setHasError(true);
      setErrorMessage("رمز الباركود فارغ");
      return;
    }

    try {
      const targetElement = renderType === "canvas" ? canvasRef.current : svgRef.current;
      if (!targetElement) return;

      JsBarcode(targetElement, cleanValue, {
        format,
        width,
        height,
        displayValue,
        text: text || cleanValue,
        fontOptions,
        font,
        textAlign,
        textPosition,
        textMargin,
        fontSize,
        background,
        lineColor,
        margin,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        valid: (valid) => {
          if (!valid) {
            setHasError(true);
            setErrorMessage(`الرمز (${cleanValue}) غير متوافق مع نمط ${format}`);
          } else {
            setHasError(false);
            setErrorMessage("");
          }
        },
      });
    } catch (err: any) {
      // Fallback: If format like EAN13 fails with alphanumeric SKU, try CODE128 automatically
      if (format !== "CODE128") {
        try {
          const targetElement = renderType === "canvas" ? canvasRef.current : svgRef.current;
          if (targetElement) {
            JsBarcode(targetElement, cleanValue, {
              format: "CODE128",
              width,
              height,
              displayValue,
              text: text || cleanValue,
              fontSize,
              margin,
              background,
              lineColor,
            });
            setHasError(false);
            setErrorMessage("");
            return;
          }
        } catch (innerErr) {
          // ignore
        }
      }
      setHasError(true);
      setErrorMessage(err?.message || "خطأ في توليد الباركود");
    }
  }, [
    value,
    format,
    width,
    height,
    displayValue,
    text,
    fontOptions,
    font,
    textAlign,
    textPosition,
    textMargin,
    fontSize,
    background,
    lineColor,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    renderType,
  ]);

  if (hasError && errorMessage) {
    return (
      <div
        id={id}
        className={`inline-flex flex-col items-center justify-center p-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-mono ${className}`}
      >
        <span className="font-bold">⚠️ خطأ باركود: {value}</span>
        <span className="text-[10px] text-amber-700">{errorMessage}</span>
      </div>
    );
  }

  if (renderType === "canvas") {
    return (
      <canvas
        id={id}
        ref={canvasRef}
        className={`max-w-full h-auto inline-block ${className}`}
      />
    );
  }

  return (
    <svg
      id={id}
      ref={svgRef}
      className={`max-w-full h-auto inline-block select-none ${className}`}
    />
  );
};

export default BarcodeGenerator;
