"use client";

import React, { useState, useEffect, useRef, use, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from 'react-hot-toast';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface ChatMessage {
  role: "system" | "user" | "model";
  parts: { text: string }[];
}

interface response {
  history: ChatMessage[];
  ended: boolean;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { id } = use(params);

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetAudioBlob
  } = useAudioRecorder();

  const {
    isSpeaking,
    speakText,
    stopSpeaking
  } = useSpeechSynthesis();
  // Function to transcribe audio using the API
  const transcribeAudio = useCallback(async (blob: Blob) => {
    if (!blob) return;

    try {
      setIsTranscribing(true);

      const formData = new FormData();
      formData.append('audio', blob);

      const response = await fetch('/api/conversations/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      setUserInput(data.themes);

    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe your audio. Please try again.');
    } finally {
      setIsTranscribing(false);
      resetAudioBlob();
    }
  }, [resetAudioBlob]);  // Effect to transcribe audio when available
  useEffect(() => {
    if (audioBlob && !isRecording) {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording, transcribeAudio]);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  // Fetch interview data on initial load or restore from localStorage
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const savedData = localStorage.getItem(`interview_${id}`);

        if (savedData) {
          // Restore chat from localStorage
          const parsedData = JSON.parse(savedData);
          setHistory(parsedData.history || []);
          setEnded(parsedData.ended || false);

          // Set the current question to display
          const parsedHistory = parsedData.history || [];
          const lastMessage = parsedHistory[parsedHistory.length - 1];
          if (lastMessage && lastMessage.role === "model") {
            setCurrentQuestion(lastMessage.parts[0].text);

            // Speak the question
            speakText(lastMessage.parts[0].text, {
              onEnd: () => {
                listeningTimeoutRef.current = setTimeout(() => {
                  // After speech ends, wait a moment before allowing recording
                }, 1000);
              }
            });
          }
          setPageLoading(false);
          return;
        }

        // If no saved chat, fetch initial question
        setLoading(true);
        const response = await fetch(`/api/conversations/daily-talk/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ history: null }),
        });

        if (response.redirected) {
          window.location.href = response.url;
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch interview data');
        }

        const data: response = await response.json();
        setHistory(data.history);
        setEnded(data.ended);

        // Display the first question
        const lastMessage = data.history[data.history.length - 1];
        if (lastMessage && lastMessage.role === "model") {
          setCurrentQuestion(lastMessage.parts[0].text);

          // Speak the question
          speakText(lastMessage.parts[0].text, {
            onEnd: () => {
              // Start listening after speaking ends with a short delay
              listeningTimeoutRef.current = setTimeout(() => {
                // Ready for user input
              }, 1000);
            }
          });
        }

        // Save to localStorage
        localStorage.setItem(`interview_${id}`, JSON.stringify({
          history: data.history,
          ended: data.ended
        }));
        setPageLoading(false);
      } catch (error) {
        console.error('Error fetching interview data:', error);
        toast.error('Failed to load interview. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim() || loading) return;

    // Clear any scheduled listening timeouts
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    // Stop speech synthesis if active
    stopSpeaking();

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      const updatedHistory: ChatMessage[] = [
        ...history,
        {
          role: "user" as const,
          parts: [{ text: userInput }]
        }
      ];
      setUserInput('');
      setLoading(true);
      setCurrentQuestion('Thinking...');

      const response = await fetch(`/api/conversations/daily-talk/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: response = await response.json();

      setEnded(data.ended);

      localStorage.setItem(`interview_${id}`, JSON.stringify({
        history: data.history,
        ended: data.ended
      }));

      setHistory(data.history);

      const lastMessage = data.history[data.history.length - 1];
      if (lastMessage && lastMessage.role === "model") {
        setCurrentQuestion(lastMessage.parts[0].text);
        setUserInput('');

        speakText(lastMessage.parts[0].text, {
          onEnd: () => {
            listeningTimeoutRef.current = setTimeout(() => {
              // Ready for next user input
            }, 1000);
          }
        });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to send your response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInterview = async () => {
    // Stop any scheduled listener
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    // Stop speech synthesis if active
    stopSpeaking();

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setLoading(true);
      const formattedHistory = history
        .filter(msg => msg.role === "model" || msg.role === "user")
        .reduce((acc: any[], msg, i, arr) => {
          if (msg.role === "model" && i < arr.length - 1 && arr[i + 1].role === "user") {
            acc.push({
              question: msg.parts[0].text,
              answer: arr[i + 1].parts[0].text
            });
          }
          return acc;
        }, []);

      // Send history to the API
      const response = await fetch(`/api/conversations/daily-talk/${id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: formattedHistory,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to save interview. Please try again.');
        return;
      }

      // Clear local storage after successful save
      localStorage.removeItem(`interview_${id}`);
      localStorage.clear();

      toast.success('Interview saved successfully with AI suggestions!');

      // Redirect to results page or show completion message
      window.location.href = `/app/conversation/daily-talk/${id}/result`;

    } catch (error) {
      console.error('Error saving interview:', error);
      toast.error('Failed to save interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the session? This will save your interview and provide feedback."
    );

    if (!confirmEnd) {
      return; // Exit if the user cancels
    }

    // Stop any scheduled listener
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    // Stop speech synthesis if active
    stopSpeaking();

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setLoading(true);

      // Mark the session as ended
      const endSessionResponse = await fetch(`/api/conversations/daily-talk/${id}/end`, {
        method: "POST",
      });

      if (!endSessionResponse.ok) {
        const errorText = await endSessionResponse.text();
        console.error("End session error:", errorText);
        throw new Error("Failed to mark session as ended.");
      }

      // Format the history for saving
      const formattedHistory = history
        .filter((msg) => msg.role === "model" || msg.role === "user")
        .reduce((acc: any[], msg, i, arr) => {
          if (msg.role === "model" && i < arr.length - 1 && arr[i + 1].role === "user") {
            acc.push({
              question: msg.parts[0].text,
              answer: arr[i + 1].parts[0].text,
            });
          }
          return acc;
        }, []);

      // Send history to the save API
      const saveResponse = await fetch(`/api/conversations/daily-talk/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: formattedHistory,
        }),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("Save session error:", errorText);
        throw new Error("Failed to save interview.");
      }

      // Clear local storage after successful save
      localStorage.removeItem(`interview_${id}`);
      localStorage.clear();

      toast.success("Session ended successfully with AI feedback!");

      // Redirect to results page or show completion message
      window.location.href = `/app/conversation/daily-talk/${id}/result`;
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <p className="text-gray-500">Loading interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-4">Interview Session</h1>
      <p className="mb-4 text-gray-500">Answer the interviewers questions to proceed with the interview.</p>

      <div className="flex flex-col h-[calc(100vh-240px)]">
        {/* Main chat area */}
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-y-auto mb-4">
            <Card className={`mb-4 ${loading ? "animate-pulse" : ""} opacity-50`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    I
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-sm text-gray-700">Interviewer</p>
                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                      {loading ? 'Thinking...' : currentQuestion}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        // Clear any scheduled listener
                        if (listeningTimeoutRef.current) {
                          clearTimeout(listeningTimeoutRef.current);
                          listeningTimeoutRef.current = null;
                        }

                        // Stop recording before playing speech
                        if (isRecording) {
                          stopRecording();
                        }
                        speakText(currentQuestion);
                      }}
                      disabled={isSpeaking || loading}
                    >
                      <Volume2 className="mr-2 h-4 w-4" /> Listen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div ref={bottomRef}></div>
          </div>

          <div className="mt-2">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <div className="flex-grow mb-2">
                {userInput && (
                  <Card className="p-3 bg-gray-50">
                    <p className="whitespace-pre-wrap">{userInput}</p>
                  </Card>
                )}
              </div>

              <div className="flex space-x-2">                <Button
                type="button"
                variant={isRecording ? "default" : "outline"}
                className="flex-grow flex items-center justify-center"
                onClick={() => {
                  // Don't allow toggling during speech synthesis
                  if (isSpeaking) {
                    toast.custom("Please wait for the interviewer to finish speaking");
                    return;
                  }

                  // Clear any scheduled listener
                  if (listeningTimeoutRef.current) {
                    clearTimeout(listeningTimeoutRef.current);
                    listeningTimeoutRef.current = null;
                  }

                  if (isRecording) {
                    stopRecording();
                  } else {
                    setUserInput('');
                    startRecording();
                  }
                }}
                disabled={loading || isSpeaking || isTranscribing}
              >
                {isRecording ? (
                  <>
                    <Mic className="h-5 w-5 mr-2 text-white" />
                    <span>Stop Recording</span>
                  </>
                ) : isTranscribing ? (
                  <span>Transcribing audio...</span>
                ) : (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    <span>Start Voice Recording</span>
                  </>
                )}
              </Button>
              </div>              {ended ? (
                <Button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleSaveInterview}
                  disabled={loading || isSpeaking || isTranscribing || isRecording}
                >
                  {loading ? 'Saving...' : 'Save Interview & Get Feedback'}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !userInput.trim() || isSpeaking || isTranscribing || isRecording}
                >
                  {loading ? 'Sending...' : 'Send Response'}
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* End Session Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleEndSession}
          disabled={loading || isSpeaking || isTranscribing}
        >
          {loading ? 'Ending Session...' : 'End Session'}
        </Button>
      </div>
    </div>
  );
}