import React from "react";
import { Modal, Button } from "react-bootstrap";
import { ClipLoader } from "react-spinners";

const DeleteConfirmModal = ({
  show,
  onClose,
  onConfirm,
  message,
  isDeleting,
}) => {
  return (
    <Modal show={show} onHide={!isDeleting ? onClose : undefined} centered>
      <Modal.Header closeButton={!isDeleting}>
        <Modal.Title className="fw-semibold text-danger">
          Confirm Delete
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0">
          {message || "Are you sure you want to delete this item?"}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isDeleting}
          className="d-flex align-items-center justify-content-center gap-2"
        >
          {isDeleting ? (
            <>
              <ClipLoader size={18} color="#fff" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
