import { useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import icon from "../icon.png";
import type { OverlayAppearance } from "../../lib/overlayAppearance";

interface TopPillProps {
    expanded: boolean;
    onToggle: () => void;
    onQuit: () => void;
    appearance: OverlayAppearance;
    onLogoClick?: () => void;
}

export default function TopPill({
    expanded,
    onToggle,
    onQuit,
    appearance,
    onLogoClick,
}: TopPillProps) {
    const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
    const wasDraggedRef = useRef(false);

    return (
        <div className="flex justify-center select-none z-50">
            <div
                className="
          draggable-area
          flex items-center gap-2
          rounded-full
          border
          overlay-pill-surface
          backdrop-blur-md
          px-2.5 py-1.5 cursor-grab active:cursor-grabbing
          transition-all duration-300 ease-sculpted
        "
                style={appearance.pillStyle}
            >
                <div className="draggable-area">
                    {/* LOGO BUTTON */}
                    <button
                        data-no-drag="true"
                        onClick={onLogoClick}
                        className={`
              w-7 h-7
              rounded-full
              overlay-icon-surface
              overlay-icon-surface-hover
              flex items-center justify-center
              relative overflow-hidden
              interaction-base interaction-press
            `}
                        style={appearance.iconStyle}
                    >
                        <img
                            src={icon}
                            alt="Natively"
                            className="w-[24px] h-[24px] object-contain opacity-95 scale-105 force-black-icon"
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                        />
                    </button>
                </div>

                {/* CENTER SEGMENT */}
                <button
                    data-drag-handle="true"
                    onPointerDown={(e) => {
                        pointerStartRef.current = { x: e.screenX, y: e.screenY };
                        wasDraggedRef.current = false;
                    }}
                    onPointerMove={(e) => {
                        if (pointerStartRef.current) {
                            const dist = Math.hypot(e.screenX - pointerStartRef.current.x, e.screenY - pointerStartRef.current.y);
                            if (dist > 4) {
                                wasDraggedRef.current = true;
                            }
                        }
                    }}
                    onClick={() => {
                        if (wasDraggedRef.current) {
                            wasDraggedRef.current = false;
                            return;
                        }
                        onToggle();
                    }}
                    className={`
            flex items-center gap-2
            group
            px-3 py-1
            rounded-full
            backdrop-blur-md
            overlay-chip-surface
            overlay-text-interactive
            text-[12px]
            font-medium
            border
            interaction-base interaction-hover interaction-press
          `}
                    style={appearance.chipStyle}
                >
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                        {expanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                    </span>
                    <span className="tracking-wide opacity-80 group-hover:opacity-100">{expanded ? "Hide" : "Show"}</span>
                </button>

                {/* STOP / QUIT BUTTON */}
                <button
                    data-no-drag="true"
                    onClick={onQuit}
                    className={`
            w-7 h-7
            rounded-full
            overlay-icon-surface
            overlay-text-primary
            flex items-center justify-center
            interaction-base interaction-press
            hover:bg-red-500/10 hover:text-red-400
          `}
                    style={appearance.iconStyle}
                >
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-current opacity-80" />
                </button>
            </div>
        </div>
    );
}
