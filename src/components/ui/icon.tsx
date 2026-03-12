'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps } from 'react'

// Re-export all icon data from sharp stroke
export {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  BarChartIcon,
  Calendar01Icon,
  Cancel01Icon,
  CancelCircleIcon,
  ChartLineData01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Delete01Icon,
  Download01Icon,
  Download04Icon,
  DragDropVerticalIcon,
  Dumbbell01Icon,
  FilterIcon,
  Home01Icon,
  InformationCircleIcon,
  Layers01Icon,
  Logout01Icon,
  MinusSignIcon,
  Money01Icon,
  Notebook02Icon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  PlayIcon,
  Search01Icon,
  SecurityLockIcon,
  Tick01Icon,
  UserAdd01Icon,
  UserGroupIcon,
  UserRemove01Icon,
} from '@hugeicons-pro/core-stroke-sharp'

// Re-export the renderer
export { HugeiconsIcon }

// Convenience wrapper that mirrors the old <IconName size={} color={} className={} /> API
type IconData = ComponentProps<typeof HugeiconsIcon>['icon']

type IconProps = {
  icon: IconData
  size?: number
  color?: string
  className?: string
}

export function Icon({ icon, size = 24, color = 'currentColor', className }: IconProps) {
  return <HugeiconsIcon icon={icon} size={size} color={color} className={className} />
}
