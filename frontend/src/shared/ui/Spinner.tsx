
type SpinnerProps = {
    size?: number;          // px
    color?: string;         // Tailwind color class
    text?: string;          // optional label
    className?: string;     // wrapper overrides
    center?: boolean;       // center inside container
};

export function Spinner({
    size = 32,
    color = "border-gray-600",
    text,
    className = "",
    center = false,
}: SpinnerProps) {
    return (
        <div
            className={`
        ${center ? "flex flex-col items-center justify-center" : "inline-flex items-center"}
        ${className}
      `}
        >
            <div
                className={`
          rounded-full animate-spin
          border-4 border-gray-300
          ${color}
          border-t-transparent
        `}
                style={{ width: size, height: size }}
            />
            {text && (
                <span className="text-gray-500 text-sm mt-2">{text}</span>
            )}
        </div>
    );
}
