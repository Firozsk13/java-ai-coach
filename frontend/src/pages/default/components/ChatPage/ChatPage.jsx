import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ChatPage.scss";
import ApiService, { startConversation } from "../../../../services/Api.service";
import { PulseLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";
import botAvatar from "./robot.png";
import jsPDF from "jspdf";

// Microphone Icon Component
const MicIcon = ({ isListening }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={isListening ? "listening" : ""}
  >
    <path
      d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
      fill={isListening ? "#ef4444" : "currentColor"}
      stroke={isListening ? "#ef4444" : "currentColor"}
      strokeWidth="1.5"
    />
    <path
      d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10"
      stroke={isListening ? "#ef4444" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="19"
      x2="12"
      y2="23"
      stroke={isListening ? "#ef4444" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="23"
      x2="16"
      y2="23"
      stroke={isListening ? "#ef4444" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Stop Icon Component
const StopIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="6"
      y="6"
      width="12"
      height="12"
      rx="2"
      fill="#ef4444"
    />
  </svg>
);

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const namespaceId = searchParams.get("namespace_id");
  
  // Get chat history key based on namespace_id
  const getChatStorageKey = (nsId) => {
    return nsId ? `javaai_chat_${nsId}` : "javaai_chat_default";
  };

  const [messages, setMessages] = useState(() => {
    if (!namespaceId) return [];
    const storageKey = getChatStorageKey(namespaceId);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Mark all loaded messages as already spoken to prevent auto-speech
      return parsed.map(msg => ({ ...msg, spoken: true }));
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState(""); // Buffer for streaming response
  const [isStreaming, setIsStreaming] = useState(false);

  const chatEndRef = useRef(null);

  /* -------------------- VOICE STATES -------------------- */
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const currentUtteranceRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const responseBufferRef = useRef("");
  const abortControllerRef = useRef(null);

  /* -------------------- AUTO SCROLL -------------------- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -------------------- SAVE CHAT -------------------- */
  useEffect(() => {
    if (namespaceId) {
      const storageKey = getChatStorageKey(namespaceId);
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, namespaceId]);

  /* -------------------- RESET CHAT WHEN NAMESPACE CHANGES -------------------- */
  useEffect(() => {
    if (namespaceId) {
      const storageKey = getChatStorageKey(namespaceId);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map(msg => ({ ...msg, spoken: true })));
      } else {
        setMessages([]);
      }
      setStreamingResponse("");
      setIsStreaming(false);
    }
  }, [namespaceId]);

  /* -------------------- SEND MESSAGE -------------------- */
  const handleSend = useCallback(async (e, textToSend = null) => {
    e.preventDefault();
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    setLoading(true);
    setIsStreaming(true);
    setStreamingResponse(""); // Clear previous buffer
    // Stop any ongoing speech when sending a new message
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
    const currentInput = messageText;
    setMessages((prev) => [...prev, { question: currentInput, Ai_response: "", spoken: false }]);

    try {
      const payload = {
        question: currentInput,
        namespace_id: searchParams.get("namespace_id"),
        chatHistory: messages,
      };

      setInput("");

      responseBufferRef.current = ""; // Reset buffer
      abortControllerRef.current = null; // Reset abort controller

      try {
        const abortController = await startConversation(payload, (chunk) => {
          let chunkText = "";
          
          // Handle different chunk formats
          if (typeof chunk === "string") {
            chunkText = chunk;
          } else if (chunk?.text) {
            chunkText = chunk.text;
          } else if (chunk?.Ai_response) {
            chunkText = chunk.Ai_response;
          } else if (chunk?.data) {
            chunkText = chunk.data;
          } else if (chunk && typeof chunk === "object") {
            // Try to extract text from object
            chunkText = JSON.stringify(chunk);
          } else {
            chunkText = String(chunk || "");
          }

          // Accumulate chunks in buffer
          if (chunkText) {
            responseBufferRef.current += chunkText;
            setStreamingResponse(responseBufferRef.current);
          }
        });

        abortControllerRef.current = abortController;

        // Wait a bit for streaming to complete, then process final response
        setTimeout(() => {
          const finalResponse = responseBufferRef.current;
          if (finalResponse && finalResponse.trim()) {
            setMessages((prev) => {
              // Always add AI response as a separate bot message
              // Don't update the user message, keep them separate
              return [...prev, { question: "", Ai_response: finalResponse, spoken: false }];
            });
          }

          responseBufferRef.current = ""; // Clear buffer
          setStreamingResponse(""); // Clear buffer
          setIsStreaming(false);
          abortControllerRef.current = null;
        }, 500);
      } catch (abortError) {
        if (abortError.name === 'AbortError') {
          // Request was aborted, clean up
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0 && updated[updated.length - 1].question && !updated[updated.length - 1].Ai_response) {
              updated.pop();
            }
            return updated;
          });
          setStreamingResponse("");
          setIsStreaming(false);
          responseBufferRef.current = "";
          abortControllerRef.current = null;
          return;
        }
        throw abortError;
      }
    } catch (err) {
      console.log("Chat error: ",err);
      // Don't show error if it was aborted by user
      if (err.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { question: "", Ai_response: "⚠️ Error receiving response.", spoken: false },
        ]);
      } else {
        // Remove the empty message if aborted
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].question && !updated[updated.length - 1].Ai_response) {
            updated.pop();
          }
          return updated;
        });
      }
      setStreamingResponse("");
      setIsStreaming(false);
      abortControllerRef.current = null;
    } finally {
      setLoading(false);
    }
  }, [input, messages, searchParams]);

  /* -------------------- STOP RESPONSE GENERATION -------------------- */
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setIsStreaming(false);
    setStreamingResponse("");
    responseBufferRef.current = "";
    toast.info("Response generation stopped");
  };

  /* -------------------- SPEECH RECOGNITION INIT -------------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // Use US English for better recognition
    recognition.interimResults = true; // Show interim results for better UX
    recognition.continuous = false;
    recognition.maxAlternatives = 1; // Get best match

    recognition.onstart = () => setIsListening(true);

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    let transcriptText = "";
    let interimText = "";
    
    recognition.onresult = (event) => {
      // Get final and interim results
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update final transcript
      if (finalTranscript) {
        transcriptText = finalTranscript.trim();
        setInput(transcriptText);
      }
      
      // Show interim results for better UX
      if (interimTranscript) {
        interimText = interimTranscript;
        setInput(transcriptText + interimText);
      }
    };

    // Auto-send when recognition ends (user stops speaking)
    recognition.onend = () => {
      setIsListening(false);
      // Auto-send the final transcript if it exists
      if (transcriptText.trim()) {
        setInput(transcriptText);
        // Use the transcript directly in handleSend
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => {} };
          handleSend(fakeEvent, transcriptText);
        }, 150);
      } else if (interimText.trim()) {
        // Fallback to interim if no final result
        setInput(interimText);
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => {} };
          handleSend(fakeEvent, interimText);
        }, 150);
      }
    };

    recognitionRef.current = recognition;
  }, [handleSend]);

  /* -------------------- PROCESS TEXT FOR TTS -------------------- */
  const processTextForTTS = useCallback((text) => {
    if (!text) return "";
    
    // Remove markdown headers but keep the text
    let processedText = text
      .replace(/^#{1,6}\s+/gm, "") // Remove markdown header markers but keep text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers but keep text
      .replace(/\*(.*?)\*/g, "$1"); // Remove italic markers but keep text
    
    // Remove ENTIRE code blocks (fenced code blocks) and replace with placeholder
    // This regex matches ```language ... ``` blocks
    const codeBlockRegex = /```[\s\S]*?```/g;
    processedText = processedText.replace(codeBlockRegex, " [CODE_BLOCK] ");
    
    // Keep inline code (single backticks) - these are usually keywords like "new", "class", etc.
    // Just remove the backticks but keep the word
    processedText = processedText.replace(/`([^`\n]+)`/g, "$1");
    
    // Add natural pauses at punctuation
    processedText = processedText
      .replace(/\.\s+/g, ". ") // Periods
      .replace(/!\s+/g, "! ") // Exclamation marks
      .replace(/\?\s+/g, "? ") // Question marks
      .replace(/;\s+/g, "; ") // Semicolons
      .replace(/,\s+/g, ", ") // Commas
      .replace(/:\s+/g, ": "); // Colons
    
    // Replace code block placeholder with natural phrase and long pause markers
    processedText = processedText.replace(/\[CODE_BLOCK\]/g, " [PAUSE_LONG] Below is the example [PAUSE_LONG] ");
    
    // Add pauses at line breaks (section breaks)
    processedText = processedText.replace(/\n\s*\n/g, " [PAUSE_LONG] ");
    
    // Clean up multiple spaces but preserve pause markers
    processedText = processedText
      .replace(/\s+(?=\[PAUSE)/g, " ") // Space before pause markers
      .replace(/(?<=PAUSE\])\s+/g, " ") // Space after pause markers
      .replace(/\s{2,}/g, " ") // Multiple spaces to single
      .trim();
    
    return processedText;
  }, []);

  /* -------------------- GET BEST AVAILABLE VOICE -------------------- */
  const getBestVoice = useCallback(() => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    
    // Prefer natural, human-like voices
    const preferredVoices = [
      "Google UK English Female",
      "Google UK English Male",
      "Microsoft Zira - English (United States)",
      "Microsoft David - English (United States)",
      "Samantha",
      "Alex",
      "Google US English",
    ];
    
    // Try to find a preferred voice
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }
    
    // Fallback to first English voice
    const englishVoice = voices.find(v => v.lang.startsWith("en"));
    return englishVoice || voices[0] || null;
  }, []);

  /* -------------------- TEXT TO SPEECH WITH NATURAL PAUSES -------------------- */
  useEffect(() => {
    // Skip on initial mount to prevent auto-speech when returning to chat
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (!loading && messages.length > 0) {
      const last = messages[messages.length - 1];

      // Only speak if the message has AI response and hasn't been spoken yet
      if (last?.Ai_response && !last.spoken && last.Ai_response.trim()) {
        // Cancel any ongoing speech
        synthRef.current.cancel();
        
        // Process text for TTS
        const processedText = processTextForTTS(last.Ai_response);
        
        if (!processedText.trim()) {
          // Mark as spoken even if no text to speak
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]) {
              updated[lastIdx] = { ...updated[lastIdx], spoken: true };
            }
            return updated;
          });
          return;
        }
        
        // Split text by pause markers, keeping track of pause types
        const pauseRegex = /\[PAUSE(_LONG)?\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        // Split text and track pause types
        while ((match = pauseRegex.exec(processedText)) !== null) {
          const textBeforePause = processedText.substring(lastIndex, match.index).trim();
          if (textBeforePause) {
            parts.push({ text: textBeforePause, pauseAfter: match[1] === "_LONG" ? "long" : "short" });
          } else {
            // If there's a pause marker but no text before it, still add pause info
            if (parts.length > 0) {
              parts[parts.length - 1].pauseAfter = match[1] === "_LONG" ? "long" : "short";
            }
          }
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text after last pause
        const remainingText = processedText.substring(lastIndex).trim();
        if (remainingText) {
          parts.push({ text: remainingText, pauseAfter: null });
        }
        
        // If no pause markers found, just use the whole text
        if (parts.length === 0 && processedText.trim()) {
          parts.push({ text: processedText.trim(), pauseAfter: null });
        }
        
        let currentIndex = 0;
        const voice = getBestVoice();
        
        const speakNextPart = () => {
          if (currentIndex >= parts.length) {
            setIsSpeaking(false);
            currentUtteranceRef.current = null;
            // Mark message as spoken
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (updated[lastIdx]) {
                updated[lastIdx] = { ...updated[lastIdx], spoken: true };
              }
              return updated;
            });
            return;
          }
          
          const partData = parts[currentIndex];
          const part = partData.text.trim();
          
          if (part) {
            const utterance = new SpeechSynthesisUtterance(part);
            
            // Configure voice settings for natural speech
            if (voice) {
              utterance.voice = voice;
            }
            utterance.lang = voice?.lang || "en-US";
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0; // Natural pitch
            utterance.volume = 1.0;
            
            currentUtteranceRef.current = utterance;
            setIsSpeaking(true);
            
            utterance.onend = () => {
              // Determine pause duration based on pause type
              let pauseDuration = 300; // Default short pause
              
              if (partData.pauseAfter === "long") {
                pauseDuration = 1500; // Long pause (1.5 seconds) after code blocks or section breaks
              } else if (partData.pauseAfter === "short") {
                pauseDuration = 400; // Short pause between sentences
              }
              
              // Additional pause if this part mentions code example
              if (part.includes("Below is the example")) {
                pauseDuration = 2000; // Extra long pause (2 seconds) after mentioning code
              }
              
              setTimeout(() => {
                currentIndex++;
                speakNextPart();
              }, pauseDuration);
            };
            
            utterance.onerror = (e) => {
              console.error("Speech synthesis error:", e);
              setIsSpeaking(false);
              currentUtteranceRef.current = null;
            };
            
            synthRef.current.speak(utterance);
          } else {
            // Skip empty parts
            currentIndex++;
            speakNextPart();
          }
        };
        
        // Wait for voices to load if needed
        if (synthRef.current.getVoices().length === 0) {
          synthRef.current.onvoiceschanged = () => {
            speakNextPart();
          };
        } else {
          speakNextPart();
        }
      }
    }
  }, [loading, messages, processTextForTTS, getBestVoice]);

  /* -------------------- DOWNLOAD PDF -------------------- */
  const downloadPDF = useCallback(() => {
    if (messages.length === 0) {
      toast.info("No conversation to download");
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = margin;
      const lineHeight = 7;
      const codeLineHeight = 5;
      const sectionSpacing = 10;

      // Helper function to add text with word wrap
      const addText = (text, isBold = false, fontSize = 12, color = [0, 0, 0], isMonospace = false) => {
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFontSize(fontSize);
        
        if (isMonospace) {
          pdf.setFont("courier", "normal");
        } else if (isBold) {
          pdf.setFont(undefined, "bold");
        } else {
          pdf.setFont(undefined, "normal");
        }

        const lines = pdf.splitTextToSize(text, maxWidth);
        const actualLineHeight = isMonospace ? codeLineHeight : lineHeight;
        
        if (yPos + (lines.length * actualLineHeight) > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }

        lines.forEach((line) => {
          pdf.text(line, margin, yPos);
          yPos += actualLineHeight;
        });
      };

      // Helper function to add blank line
      const addBlankLine = (spacing = sectionSpacing) => {
        if (yPos + spacing > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        } else {
          yPos += spacing;
        }
      };

      // Title
      addText("Java AI Coach - Conversation", true, 18, [34, 197, 94]);
      addBlankLine();

      // Date
      const date = new Date().toLocaleString();
      addText(`Exported on: ${date}`, false, 10, [107, 114, 128]);
      addBlankLine(sectionSpacing * 2);

      // Process messages
      messages.forEach((msg, index) => {
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          yPos = margin;
        }

        if (msg.question) {
          // User question
          addText("You:", true, 12, [34, 197, 94]);
          yPos += 3;
          addText(msg.question, false, 11, [0, 0, 0]);
          addBlankLine();
        }

        if (msg.Ai_response) {
          // AI response
          addText("Java AI Coach:", true, 12, [59, 130, 246]);
          yPos += 3;
          
          // Process markdown content
          let responseText = msg.Ai_response;
          
          // Extract code blocks and replace with placeholders
          const codeBlocks = [];
          const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
          let match;
          let blockIndex = 0;
          
          while ((match = codeBlockRegex.exec(responseText)) !== null) {
            const language = match[1] || "code";
            const code = match[2];
            const placeholder = `__CODE_BLOCK_${blockIndex}__`;
            codeBlocks.push({ placeholder, language, code });
            responseText = responseText.replace(match[0], placeholder);
            blockIndex++;
          }
          
          // Split text by code block placeholders
          const parts = responseText.split(/(__CODE_BLOCK_\d+__)/);
          
          parts.forEach((part) => {
            const codeBlockMatch = part.match(/__CODE_BLOCK_(\d+)__/);
            
            if (codeBlockMatch) {
              // This is a code block placeholder
              const blockIndex = parseInt(codeBlockMatch[1]);
              const codeBlock = codeBlocks[blockIndex];
              
              if (codeBlock) {
                addBlankLine();
                // Add code block header
                addText(`Code (${codeBlock.language}):`, true, 10, [59, 130, 246]);
                yPos += 2;
                
                // Add code with monospace font
                const codeLines = codeBlock.code.split('\n');
                codeLines.forEach((line) => {
                  if (yPos > pageHeight - 20) {
                    pdf.addPage();
                    yPos = margin;
                  }
                  addText(line || " ", false, 9, [0, 0, 0], true);
                });
                
                addBlankLine();
              }
            } else if (part.trim()) {
              // Regular text - remove other markdown but keep structure
              let cleanText = part
                .replace(/`([^`]+)`/g, "$1") // Inline code
                .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
                .replace(/\*(.+?)\*/g, "$1") // Italic
                .replace(/#{1,6}\s(.+)/g, "$1") // Headers
                .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Links
                .trim();
              
              if (cleanText) {
                addText(cleanText, false, 10, [0, 0, 0]);
                addBlankLine(5);
              }
            }
          });
          
          addBlankLine(sectionSpacing);
        }
      });

      // Save PDF
      const fileName = `Java_AI_Coach_Conversation_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      toast.success("Conversation downloaded as PDF");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  }, [messages]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  /* -------------------- STOP SPEECH -------------------- */
  const handleStopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      toast.info("Audio stopped");
    }
  };

  return (
    <div className="chat-page">
      <span className="chat-blob b1"></span>
      <span className="chat-blob b2"></span>

      <div className="chat-wrapper">
        {/* Header */}
        <div className="chat-top">
          <div className="bot-identity">
            <div className={`bot-avatar ${loading ? "typing" : ""}`}>
              <img src={botAvatar} alt="Bot" />
            </div>
            <div>
              <h5>JavaAI Coach</h5>
              <p>AI-powered Java assistant</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="outline-secondary"
              className="download-btn"
              onClick={downloadPDF}
              disabled={messages.length === 0}
              title="Download conversation as PDF"
            >
              📥 Download PDF
            </Button>
            <Button
              variant="outline-secondary"
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body">
          {messages.length === 0 && (
            <div className="chat-row bot">
              <div className="chat-bubble">
                Hello 👋 I’m your JavaAI Coach. Ask me anything about Java!
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <React.Fragment key={index}>
              {/* User message - only show if there's a question */}
              {msg.question && (
                <div className="chat-row user">
                  <div className="chat-bubble">
                    <strong>{msg.question}</strong>
                  </div>
                </div>
              )}

              {/* Bot message - only show if there's an AI response */}
              {msg.Ai_response && (
                <div className="chat-row bot">
                  <div className="chat-bubble">
                    <div className="markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[]}
                        components={{
                          h2: ({ children, ...props }) => {
                            const text = String(children || "");
                            const lowerText = text.toLowerCase();
                            let icon = null;
                            let className = "section-header";
                            
                            if (lowerText.includes("simple definition") || lowerText.includes("definition")) {
                              icon = "💎";
                              className += " definition-header";
                            } else if (lowerText.includes("example")) {
                              icon = "🔥";
                              className += " example-header";
                            } else if (lowerText.includes("key points") || lowerText.includes("keypoints")) {
                              icon = "👍";
                              className += " keypoints-header";
                            }
                            
                            return (
                              <h2 className={className} {...props}>
                                {icon && <span className="section-icon">{icon}</span>}
                                {text}
                              </h2>
                            );
                          },
                          ul: ({ children, ...props }) => (
                            <ul className="key-points-list" {...props}>
                              {children}
                            </ul>
                          ),
                          li: ({ children, ...props }) => (
                            <li className="key-point-item" {...props}>
                              {children}
                            </li>
                          ),
                          p: ({ children, ...props }) => {
                            // Ensure paragraphs have proper spacing
                            return <p className="markdown-paragraph" {...props}>{children}</p>;
                          },
                          // Handle line breaks within text
                          br: () => <br />,
                          pre: ({ children, ...props }) => {
                            const codeProps = children?.props || {};
                            const match = /language-(\w+)/.exec(codeProps.className || "");
                            const codeString = String(codeProps.children || "").replace(/\n$/, "");
                            
                            if (match && codeString) {
                              return (
                                <div className="code-block-wrapper">
                                  <div className="code-block-header">
                                    <span className="code-language">{match[1]}</span>
                                    <button
                                      className="code-copy-btn"
                                      onClick={() => {
                                        copyToClipboard(codeString);
                                      }}
                                      title="Copy code" >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                      </svg>
                                      Copy code
                                    </button>
                                  </div>
                                  <pre {...props}>
                                    {children}
                                  </pre>
                                </div>
                              );
                            }
                            return <pre {...props}>{children}</pre>;
                          },
                          code: ({ node, inline, className, children, ...props }) => {
                            if (inline) {
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.Ai_response}
                      </ReactMarkdown>
                    </div>

                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(msg.Ai_response)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Show streaming response while loading */}
          {isStreaming && streamingResponse && (
            <div className="chat-row bot">
              <div className="chat-bubble">
                <div className="markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children, ...props }) => {
                        return <p className="markdown-paragraph" {...props}>{children}</p>;
                      },
                      br: () => <br />,
                    }}
                  >
                    {streamingResponse}
                  </ReactMarkdown>
                  <span className="streaming-cursor">|</span>
                </div>
              </div>
            </div>
          )}

          {loading && !isStreaming && (
            <div className="chat-row bot">
              <div className="chat-bubble loading">
                <PulseLoader color="#4ade80" size={8} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-bar" onSubmit={handleSend}>
          {isSpeaking ? (
            <button
              type="button"
              className="stop-btn"
              onClick={handleStopSpeech}
              title="Stop audio"
            >
              <StopIcon />
            </button>
          ) : (
          <button
            type="button"
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={() => {
              if (!recognitionRef.current) {
                alert("Speech recognition not supported");
                return;
              }

              isListening
                ? recognitionRef.current.stop()
                : recognitionRef.current.start();
            }}
              title={isListening ? "Stop listening" : "Start voice input"}
          >
              <MicIcon isListening={isListening} />
              {isListening && <span className="listening-waves"></span>}
          </button>
          )}

          <input
            type="text"
            placeholder="Ask something about Java…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          {loading || isStreaming ? (
            <button
              type="button"
              className="stop-generation-btn"
              onClick={handleStopGeneration}
              title="Stop generation"
            >
              ⏹ Stop
            </button>
          ) : (
            <button type="submit" disabled={loading}>
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
