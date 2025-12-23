'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                                   Avatar                                   */
/* -------------------------------------------------------------------------- */

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        `
        relative
        flex shrink-0 overflow-hidden rounded-full
        border border-white/15
        bg-white/5 backdrop-blur-xl
        shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
        transition-all duration-300
        hover:border-white/30
        hover:shadow-[0_0_30px_-12px_rgba(99,102,241,0.6)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-indigo-500/50
        size-10
        `,
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                Avatar Image                                */
/* -------------------------------------------------------------------------- */

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        `
        aspect-square size-full
        object-cover
        transition-opacity duration-300
        `,
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                               Avatar Fallback                               */
/* -------------------------------------------------------------------------- */

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        `
        flex size-full items-center justify-center rounded-full
        bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-purple-500/20
        text-sm font-semibold uppercase tracking-wide
        text-indigo-300
        `,
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
