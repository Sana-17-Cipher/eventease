// @/hooks/use-toast.ts
import React, { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id?: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: React.ReactElement
}

interface ToastState {
  toasts: Toast[]
}

const toastState: ToastState = {
  toasts: []
}

let toastCount = 0
const listeners: Array<(state: ToastState) => void> = []

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE
  return toastCount.toString()
}

function dispatch(action: { type: string; toast?: Toast; toastId?: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      if (action.toast) {
        toastState.toasts = [action.toast, ...toastState.toasts]
      }
      break
    case 'UPDATE_TOAST':
      if (action.toast) {
        toastState.toasts = toastState.toasts.map(t => 
          t.id === action.toast?.id ? { ...t, ...action.toast } : t
        )
      }
      break
    case 'DISMISS_TOAST':
      if (action.toastId === undefined) {
        toastState.toasts = []
      } else {
        toastState.toasts = toastState.toasts.filter(t => t.id !== action.toastId)
      }
      break
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        toastState.toasts = []
      } else {
        toastState.toasts = toastState.toasts.filter(t => t.id !== action.toastId)
      }
      break
  }

  listeners.forEach(listener => {
    listener(toastState)
  })
}

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: Toast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id }
    })

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      duration: props.duration ?? 5000
    }
  })

  return {
    id,
    dismiss,
    update
  }
}

function useToast() {
  const [state, setState] = useState<ToastState>(toastState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId })
  }
}

export { useToast, toast }