"use client"
import { useToast } from "@/hooks/use-toast"

interface NotificationOptions {
  title: string
  description: string
  duration?: number
}

export function useRealTimeNotifications() {
  const { toast } = useToast()

  const showNotification = (options: NotificationOptions) => {
    toast({
      title: options.title,
      description: options.description,
      duration: options.duration || 4000,
    })

    // Play notification sound if supported
    if ("Audio" in window) {
      try {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
        )
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore audio play errors (user interaction required)
        })
      } catch (error) {
        // Ignore audio errors
      }
    }
  }

  return { showNotification }
}
