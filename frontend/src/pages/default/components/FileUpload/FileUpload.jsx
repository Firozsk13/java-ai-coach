import React, { useEffect, useState, useRef } from "react";
import { Button, Table, Pagination } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../../../services/Api.service";
import { toast } from "react-toastify";
import { bytesToMB } from "../../../../utils/helper";
import DeleteConfirmModal from "../../../../components/confirmation.modal";
import uploadIcon from "./upload.png";
import "./FileUpload.scss";

/**
 * FileUpload Component (PdfManager)
 * Handles PDF file uploads and management for chatbots
 */
const PdfManager = () => {
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);


  const filesPerPage = 5;
  const fileInputRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletetionItem, setdeletetionItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAllFiles();
  }, []);

  /**
   * Fetch all uploaded files for the current chatbot
   */
  const fetchAllFiles = async () => {
    let { data, error } = await ApiService.getAllFiles(searchParams.get("id"));
    if (error) {
      toast.error(error.response.data.message);
      return;
    }
    if (data) setFiles(data.result);
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files[0]);
  };

  /**
   * Upload selected PDF file
   */
  const uploadFile = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("chatbot_id", searchParams.get("id"));
    formData.append("namespace_id", searchParams.get("namespace_id"));
    formData.append("files", selectedFiles);

    let { data, error } = await ApiService.uploadFile(formData);
    setLoading(false);

    if (error) {
      toast.error(error.response.data.message);
      return;
    }

    if (data) {
      fetchAllFiles();
      resetFileInput();
    }
  };

  /**
   * Handle drag over event for file drop zone
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = () => {
    setDragActive(false);
  };

  /**
   * Handle file drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFiles(file);
    } else {
      toast.error("Only PDF files are allowed");
    }
  };

  /**
   * Reset file input after upload
   */
  const resetFileInput = () => {
    setSelectedFiles(null);
    fileInputRef.current.value = "";
  };

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = (item) => {
    setdeletetionItem(item);
    setShowDeleteModal(true);
  };

  /**
   * Confirm and execute file deletion
   */
  const handleConfirmDelete = async () => {
    if (!deletetionItem) return;
    setIsDeleting(true);

    let payload = {
      id: deletetionItem._id["$oid"],
      name: deletetionItem.name,
      namespace_id: deletetionItem.namespace_id,
    };

    let { data, error } = await ApiService.deleteFile(payload);

    if (error) toast.error(error.response.data.message);
    if (data) {
      setCurrentPage(1);
      fetchAllFiles();
    }

    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  // Calculate pagination
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = files.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(files.length / filesPerPage);

  return (
    <div className="file-upload-page">
      <div className="page-header">
        <h3>📄 Document Upload</h3>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {/* Upload Card */}
      <div className="upload-card">
        <label
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <div className="upload-content">
            <img src={uploadIcon} alt="Upload" className="upload-icon" />

            <p>
              {selectedFiles
                ? selectedFiles.name
                : "Click to select a PDF file"}
            </p>
          </div>
        </label>

        <div className="upload-action">
          <Button
            onClick={uploadFile}
            disabled={!selectedFiles || loading}
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </Button>
        </div>
      </div>

      {/* Files Table */}
      <div className="files-card">
        <h5>Uploaded Documents</h5>

        {files.length === 0 ? (
          <p className="empty-text">No files uploaded yet.</p>
        ) : (
          <>
            <Table hover responsive className="files-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentFiles.map((file, index) => (
                  <tr key={file._id["$oid"]}>
                    <td>{indexOfFirstFile + index + 1}</td>
                    <td className="fw-semibold">{file.name}</td>
                    <td>{bytesToMB(file.size).toFixed(2)} MB</td>
                    <td>{file.createdAt["$date"]}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(file)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="justify-content-end mt-3">
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            )}
          </>
        )}
      </div>

      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message={`Delete "${deletetionItem?.name}"?`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PdfManager;
