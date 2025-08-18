"use client";
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { GearIcon } from "@radix-ui/react-icons"

export function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onStatusChange
}) {
  const [selectedStatus, setSelectedStatus] = useState(vehicle?.status || "active")

  if (!vehicle) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "idle":
        return <Clock className="w-4 h-4 text-accent" />;
      case "maintenance":
        return <GearIcon className="w-4 h-4 text-destructive" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  }

  const handleStatusUpdate = () => {
    onStatusChange(vehicle.id, selectedStatus)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-muted-foreground">
            Vehicle details are now displayed in the right sidebar
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            All vehicle information, diagnostics, and driver details can be found in the right panel.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
