"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Laptop, BookOpen, User, Bot, X } from "lucide-react"
import styles from "../styles/chatInterface.module.css"

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

	type Message = {
		role: string;
		content: string;
	};

	const [messages, setMessages] = useState<Message[]>([]);


  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle input change
  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle form submission
	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		e?.preventDefault();

		if (!input.trim()) return;

		// Add user message
		const userMessage = { role: "user", content: input };
		setMessages(prevMessages => [...prevMessages, userMessage]);

		// Clear input and show loading state
		setInput("");
		setIsLoading(true);

		try {
			// Add an empty assistant message to start  
			setMessages(prevMessages => [
				...prevMessages,
				{ role: 'assistant', content: '' }
			]);

			// Call the API route
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [...messages, userMessage]
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Process the stream
			const reader = response?.body?.getReader();
			const decoder = new TextDecoder();
			let assistantMessage = '';

			while (true) {
				 const result=await reader?.read();
				 if(result){

					 const { done, value } = result;

					 if (done) {
						 break;
				}

				// Decode the stream chunk and add to message
				const chunk = decoder.decode(value);
				assistantMessage += chunk;

			}
				// Update the UI with the partial response
				setMessages(prevMessages => {
					const newMessages = [...prevMessages];
					// Update the last message 
					newMessages[newMessages.length - 1].content = assistantMessage;
					return newMessages;
				});
			}
		} catch (error) {
			console.error('Error sending message:', error);
			// Update error message
			setMessages(prevMessages => {
				const newMessages = [...prevMessages];
				newMessages[newMessages.length - 1].content =
					'Sorry, there was an error processing your request. Please try again.';
				return newMessages;
			});
		} finally {
			setIsLoading(false);
		}
	}
  // Predefined suggestions  
  const LoadingIndicator = () => {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingDot}></div>
        <div className={`${styles.loadingDot} ${styles.delayOne}`}></div>
        <div className={`${styles.loadingDot} ${styles.delayTwo}`}></div>
      </div>
    );
  };
  const suggestions:string[] = [
    "How does smartERP's attendance tracking work?",
    "What features does smartERP offer for teachers?",
    "How can our school get started with smartERP?",
    "Can you explain the digital learning solutions in smartERP?",
  ]

  // Handle suggestion click
  const handleSuggestionClick = (suggestion:string) => {
    setInput(suggestion)
    
		handleSubmit();
  }

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.chatButton}
      >
        <Bot className={styles.chatButtonIcon}/>
      </div>
    )
  }

  return (
		<>
    <div
		className={`${styles.container} ${isOpen ? styles.open : ''}`}
    >
      {/* Chat Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={styles.headerTitle}>smartERP Assistant</h3>
            <p className={styles.headerSubtitle}>Digital Learning Support</p>
          </div>
        </div>
        <div className={styles.actionButtons}>

          <button
            className={styles.iconButton}
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>


      {  (
        <>
          {/* Tabs */}
            <div className={styles.tabsList}>
              <button
                className={activeTab === "chat" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => setActiveTab("chat")}
								>
                <Bot className={styles.screenTitleIcon} />
                <span className={styles.screenTitle}>Chat</span>
              </button>
              <button
                className={activeTab === "resources" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => setActiveTab("resources")}
								>
                <BookOpen className={styles.screenTitleIcon} />
                <span className={styles.screenTitle}>Resources</span>
              </button>
              <button
                className={activeTab === "support" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => setActiveTab("support")}
								>
                <Laptop className={styles.screenTitleIcon} />
                <span className={styles.screenTitle}>Support</span>
              </button>
            </div>

            {activeTab === "chat" && (
								<div className={styles.scrollbarContainer}>
							<div className={styles.messageContainer}>
                {/* Chat Messages */}
                <div className={styles.messagesArea}>
                  {messages.length === 0 ? (
                    <div className={styles.emptyChat}>
                      <div className={styles.emptyIcon}>
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <h3 className={styles.emptyTitle}>How can I help you today?</h3>
                      <p className={styles.emptyDescription}>Ask me anything about smartERP&apos;s educational platform</p>
                      <div className={styles.suggestionGrid}>
                        {suggestions.map((suggestion, i) => (
													<button
													key={i}
													className={styles.suggestion}
													onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>


                    </div>
                  ) : (
										messages.map((message, i) => (
                      <div
                        key={i}
                        className={message.role === "user" ?
                          `${styles.messageRow} ${styles.messageRowUser}` :
                          `${styles.messageRow} ${styles.messageRowBot}`
                        }
												>
                        <div
                          className={message.role === "user" ?
                            `${styles.messageBubble} ${styles.userMessage}` :
                            `${styles.messageBubble} ${styles.botMessage}`
                          }
													>
                          <div className={styles.messageHeader}>
                            {message.role !== "user" && (
                              <div className={`${styles.smallAvatar} ${styles.botAvatar}`}>
                                <Bot className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <span className={styles.messageSender}>
                              {message.role === "user" ? "You" : "smartERP Assistant"}
                            </span>
                            {message.role === "user" && (
															<div className={`${styles.smallAvatar} ${styles.userAvatar}`}>
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className={styles.messageText}>
        {isLoading && i === messages.length - 1 && message.role === 'assistant' ? 
          <LoadingIndicator /> : 
          message.content
        }
      </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSubmit} className={styles.inputArea}>
                  <div className={styles.inputContainer}>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about smartERP..."
                        className={styles.textInput}
                        disabled={isLoading}
												/>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={styles.sendButton}
											>
                      <Send className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </form>
              </div>
							</div>
            )}

            {activeTab === "resources" && (
							<div className={styles.tabContent}>
											<div className={styles.scrollbarContainer}>
                <div className={styles.resourcesContainer}>
                  <h3 className={styles.resourceTitle}>smartERP Resources</h3>
                  <p className={styles.resourceDescription}>
                    Access helpful guides and resources for smartERP&apos;s educational platform.
                  </p>

                  <div className={styles.resourcesList}>
                    {[
											{ title: "Getting Started with smartERP", desc: "Learn the basics of our platform" },
                      { title: "Teacher's Guide to smartERP", desc: "Best practices for educators" },
                      { title: "Administrator Dashboard Tutorial", desc: "School management tools" },
                      { title: "Student Portal Guide", desc: "Navigate the learning platform" },
                      { title: "Attendance Tracking System", desc: "Real-time monitoring features" },
                    ].map((resource, i) => (
											<div
											key={i}
											className={styles.resourceCard}
                      >
                        <h4 className={styles.resourceCardTitle}>{resource.title}</h4>
                        <p className={styles.resourceCardDescription}>{resource.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
							</div>
            )}

            {activeTab === "support" && (
							<div className={styles.tabContent}>
<div className={styles.scrollbarContainer}>
                <div className={styles.supportContainer}>
                  <h3 className={styles.supportTitle}>smartERP Support</h3>
                  <p className={styles.supportDescription}>
                    Need help with smartERP? Our support team is here to assist you.
                  </p>

                  <div className={styles.supportForm}>
                    <h4 className={styles.supportFormTitle}>Contact Support</h4>
                    <p className={styles.supportFormDescription}>
                      Fill out the form below and our team will get back to you shortly.
                    </p>

                    <div className={styles.formFields}>
                      <input
                        type="text"
                        placeholder="Your Name"
                        className={styles.formInput}
												/>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className={styles.formInput}
												/>
                      <textarea
                        placeholder="Describe your issue with smartERP"
                        rows={4}
                        className={styles.formTextarea}
												/>
                      <button className={styles.formButton}>Submit Request</button>
                    </div>
                  </div>
                </div>
              </div>
							</div>
            )}
        </>
      )}
    </div>
					<div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.chatButton}
				>
        <Bot className={styles.chatButtonIcon} />
			</div>
				</>
  )
}
