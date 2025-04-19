"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog"

// Define the context type
type ActionContextType = {
  handleDelete: (id: string, name: string, itemType: string, onConfirm?: () => void) => void
  confirmAction: (options: ConfirmActionOptions) => void
}

// Add a new interface for confirmAction options
interface ConfirmActionOptions {
  title: string
  description: string
  action: () => void
  cancelText?: string
  confirmText?: string
}

interface DeleteItem {
  id: string
  name: string
  type: string
  onConfirm?: () => void
}

// Create the context
const ActionContext = createContext<ActionContextType | undefined>(undefined)

// Create a provider component
export function ActionProvider({ children }: { children: ReactNode }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null)

  // Add a new state for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmOptions, setConfirmOptions] = useState<ConfirmActionOptions | null>(null)

  const handleDelete = (id: string, name: string, itemType: string, onConfirm?: () => void) => {
    setItemToDelete({ id, name, type: itemType, onConfirm })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      // In a real application, this would be an API call
      console.log(`Deleting ${itemToDelete.type} with ID: ${itemToDelete.id}`)

      // Call the onConfirm callback if provided
      if (itemToDelete.onConfirm) {
        itemToDelete.onConfirm()
      }

      // Show success toast
      toast({
        title: `${itemToDelete.type} deleted`,
        description: `${itemToDelete.name} has been successfully deleted.`,
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error deleting item",
        description: `There was a problem deleting ${itemToDelete.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // Add the confirmAction method to the provider
  const confirmAction = (options: ConfirmActionOptions) => {
    setConfirmOptions(options)
    setConfirmDialogOpen(true)
  }

  // Add the confirmAction to the context provider value
  return (
    <ActionContext.Provider value={{ handleDelete, confirmAction }}>
      {children}
      {itemToDelete && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          itemName={itemToDelete.name}
          itemType={itemToDelete.type}
        />
      )}
      {confirmOptions && (
        <DeleteConfirmationDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          onConfirm={() => {
            confirmOptions.action()
            setConfirmDialogOpen(false)
            setConfirmOptions(null)
          }}
          title={confirmOptions.title}
          description={confirmOptions.description}
          cancelText={confirmOptions.cancelText}
          confirmText={confirmOptions.confirmText}
        />
      )}
    </ActionContext.Provider>
  )
}

// Create a hook to use the context
export function useActions() {
  const context = useContext(ActionContext)
  if (context === undefined) {
    throw new Error("useActions must be used within an ActionProvider")
  }
  return context
}

export const useAction = () => {
  const context = useContext(ActionContext)
  if (context === undefined) {
    throw new Error("useAction must be used within an ActionProvider")
  }
  return context
}
