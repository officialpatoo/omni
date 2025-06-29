"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error?: string;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        const recog = new SpeechRecognitionAPI();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscript + interimTranscript);
        };

        recog.onerror = (event) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        recog.onend = () => {
          // Keep listening if isListening is still true
          // This handles cases where recognition stops unexpectedly
          if(isListening) {
            try {
              recog.start();
            } catch (e) {
              // already started or other error
            }
          }
        };

        setRecognition(recog);
      } else {
        setIsSupported(false);
        setError('Speech recognition not supported in this browser.');
      }
    }
  }, [isListening]); // Re-setup onend handler if isListening changes

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      setError(undefined);
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        setError('Failed to start speech recognition.');
        setIsListening(false);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return { isListening, transcript, startListening, stopListening, isSupported, error };
}
