import React, { useState, useEffect } from "react";
import "./BotList.scss";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../../services/Api.service";
import { toast } from "react-toastify";

/**
 * BotList Component
 * Displays list of chatbots with create, edit, and delete functionality
 */
const BotList = () => {
  const [bots, setBots] = useState([]);
  const [formData, setFormData] = useState({ bot_name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const navigate = useNavigate();

  // Fetch all chatbots on component mount
  useEffect(() => {
    fetchAllChatBots();
  }, []);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setShowCreate(false);
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  /**
   * Fetch all chatbots from the API
   */
  const fetchAllChatBots = async () => {
    let { data, error } = await ApiService.getAllChatBots({});
    if (error) {
      toast.error(error.response.data.message);
      return;
    }
    setBots(data.result);
  };

  /**
   * Handle chatbot creation
   * @param {Event} e - Form submit event
   */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.bot_name.trim()) {
      toast.error("Chat name is required");
      return;
    }

    setLoading(true);
    let { data, error } = await ApiService.createChatBot(formData);
    setLoading(false);

    if (error) {
      toast.error(error.response.data.message);
      return;
    }

    toast.success(data.message);
    setFormData({ bot_name: "", description: "" });
    setShowCreate(false);
    fetchAllChatBots();
  };

  /**
   * Navigate to a specific page with query parameters
   * @param {string} url - Target route path
   * @param {string} id - Chatbot ID
   * @param {string} namespace_id - Namespace ID for the chatbot
   */
  const goToPage = (url, id, namespace_id = "") => {
    navigate(`${url}?id=${id}&namespace_id=${namespace_id}`);
  };

  /**
   * Delete a chatbot
   * @param {string} botId - ID of the chatbot to delete
   */
  const handleDelete = async (botId) => {
    if (!window.confirm("Are you sure you want to delete this chatbot?")) return;

    const { data, error } = await ApiService.deleteChatBot(botId);

    if (error) {
      toast.error(error.response?.data?.message || "Delete failed");
      return;
    }

    toast.success(data.message);

    // Update UI immediately after successful deletion
    setBots((prev) =>
      prev.filter((bot) => bot._id["$oid"] !== botId)
    );
  };


  return (
    <div className="dashboard-bg">
      <span className="shape s1"></span>
      <span className="shape s2"></span>

      <div className="dashboard-content">
        {/* Create Button */}
        <div className="create-bot-wrapper">
          <button
            className="create-bot-main-btn"
            onClick={() => setShowCreate(true)}
          >
            + Create New Chat
          </button>
        </div>

        {/* Bot List Table */}
        <div className="bot-table-card">
          <h5 className="fw-bold mb-4 text-center">Your Chats</h5>

          {bots.length === 0 ? (
            <p className="text-muted text-center mb-0">
              No chats created yet.
            </p>
          ) : (
            <div className="table-responsive">
              <Table hover className="bot-table align-middle">
                <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {bots.map((bot) => (
                    <tr key={bot._id["$oid"]}>
                      <td className="fw-semibold">{bot.bot_name}</td>
                      <td className="text-muted">{bot.description}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            size="sm"
                            variant="outline-success"
                            className="action-btn"
                            onClick={() =>
                              goToPage(
                                "/default/chat",
                                bot._id["$oid"],
                                bot.namespace_id
                              )
                            }
                          >
                            <span className="btn-text-full">Chat</span>
                            <span className="btn-text-mobile">Chat</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="action-btn"
                            onClick={() =>
                              goToPage(
                                "/default/doc-upload",
                                bot._id["$oid"],
                                bot.namespace_id
                              )
                            }
                          >
                            <span className="btn-text-full">Upload Docs</span>
                            <span className="btn-text-mobile">Upload</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="action-btn"
                            onClick={() => handleDelete(bot._id["$oid"])}
                          >
                            <span className="btn-text-full">Delete</span>
                            <span className="btn-text-mobile">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="create-modal" onClick={() => setShowCreate(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="modal-title">Create New Chat</h4>

            <div className="modal-field">
              <label>Chat name</label>
              <input
                value={formData.bot_name}
                onChange={(e) =>
                  setFormData({ ...formData, bot_name: e.target.value })
                }
              />
            </div>

            <div className="modal-field">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotList;
