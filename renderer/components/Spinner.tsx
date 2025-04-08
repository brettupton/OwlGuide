interface ISpinner {
    size: "sm" | "md" | "lg"
    color: "white" | "gray"
}

export default function Spinner({ size, color }: ISpinner) {
    const sizeClasses = { sm: "h-6 w-6 border-[6px]", md: "h-8 w-8 border-[6px]", lg: "h-10 w-10 border-[8px]" }
    const colorClasses = { gray: "border-gray-600", white: "border-white" }

    return (
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`} />
        </div>
    )
}