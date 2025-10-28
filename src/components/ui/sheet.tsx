// src/components/ui/sheet.tsx
import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils' // keep your cn util

type SheetSide = 'top' | 'right' | 'bottom' | 'left'

export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close

// Portal wrapper: only accepts children and optional className
export const SheetPortal: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <Dialog.Portal>
      <div className={cn('fixed inset-0 z-50 flex', className)}>{children}</div>
    </Dialog.Portal>
  )
}

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/50 backdrop-blur-sm transition-opacity',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: SheetSide
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const base = 'fixed z-50 bg-card shadow-lg'
    const sideClass: Record<SheetSide, string> = {
      top: 'left-0 top-0 w-full h-auto',
      bottom: 'left-0 bottom-0 w-full h-auto',
      left: 'left-0 top-0 h-full w-[280px]',
      right: 'right-0 top-0 h-full w-[280px]',
    }

    const animClass: Record<SheetSide, string> = {
      top: 'animate-in slide-in-from-top-1',
      bottom: 'animate-in slide-in-from-bottom-1',
      left: 'animate-in slide-in-from-left-1',
      right: 'animate-in slide-in-from-right-1',
    }

    return (
      <Dialog.Portal>
        <SheetOverlay />
        <Dialog.Content
          ref={ref}
          className={cn(base, sideClass[side], animClass[side], className)}
          {...props}
        >
          <div className="relative flex h-full flex-col">
            {children}
            <Dialog.Close className="absolute top-3 right-3 rounded-md p-1 hover:bg-muted">
              <Cross2Icon />
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    )
  }
)
SheetContent.displayName = 'SheetContent'

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-4', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex items-center p-4', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

export const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <Dialog.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  )
)
SheetTitle.displayName = 'SheetTitle'

export const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <Dialog.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
SheetDescription.displayName = 'SheetDescription'
