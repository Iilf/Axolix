"use client"

/**
 * src/components/modals/ConfirmModal.tsx
 *
 * Title, description, confirm/cancel buttons.
 * Destructive variant turns the confirm button red — used for ban and delete actions.
 *
 * Works with useConfirmModal() from src/hooks/useModal.ts.
 */

import { useState }                              from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/modals/modal"
import type { ConfirmModalData }                  from "@/hooks/useModal"

interface ConfirmModalProps {
  isOpen:  boolean
  data:    ConfirmModalData | null
  onClose: () => void
}

export function ConfirmModal({ isOpen, data, onClose }: ConfirmModalProps) {
  const [isPending, setIsPending] = useState(false)

  if (!data) return null

  async function handleConfirm() {
    if (!data) return
    setIsPending(true)
    try {
      await data.onConfirm()
      onClose()
    } finally {
      setIsPending(false)
    }
  }

  const btnBase: React.CSSProperties = {
    display:      "inline-flex",
    alignItems:   "center",
    justifyContent:"center",
    padding:      "var(--space-2) var(--space-5)",
    borderRadius: "var(--radius-lg)",
    fontFamily:   "var(--font-ui)",
    fontSize:     "var(--text-sm)",
    fontWeight:   500,
    cursor:       isPending ? "not-allowed" : "pointer",
    opacity:      isPending ? 0.7 : 1,
    border:       "none",
    transition:   "background var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring)",
    lineHeight:   "var(--leading-ui)",
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" persistent={isPending}>
      <ModalHeader onClose={!isPending ? onClose : undefined}>
        {data.title}
      </ModalHeader>

      <ModalBody>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize:   "var(--text-base)",
            color:      "var(--text-secondary)",
            lineHeight: "var(--leading-body)",
          }}
        >
          {data.description}
        </p>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={onClose}
          disabled={isPending}
          style={{
            ...btnBase,
            background: "var(--bg-muted)",
            color:      "var(--text-secondary)",
          }}
        >
          {data.cancelLabel ?? "Cancel"}
        </button>

        <button
          onClick={handleConfirm}
          disabled={isPending}
          style={{
            ...btnBase,
            background: data.destructive
              ? "color-mix(in srgb, var(--status-red) 15%, transparent)"
              : "var(--accent-dim)",
            color: data.destructive ? "var(--status-red)" : "var(--text-accent)",
            border: data.destructive
              ? "1px solid color-mix(in srgb, var(--status-red) 30%, transparent)"
              : "1px solid transparent",
          }}
        >
          {isPending ? "…" : (data.confirmLabel ?? "Confirm")}
        </button>
      </ModalFooter>
    </Modal>
  )
}