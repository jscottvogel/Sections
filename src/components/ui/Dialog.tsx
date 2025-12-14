import * as React from "react"


const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-0" onClick={() => onOpenChange?.(false)} />
            {children}
        </div>
    )
}

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`fixed z-50 grid w-full gap-4 rounded-b-lg border bg-white p-6 shadow-lg animate-in slide-in-from-bottom-10 sm:max-w-lg sm:rounded-lg sm:zoom-in-90 sm:slide-in-from-bottom-0 ${className}`}>
            {children}
        </div>
    )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle }
