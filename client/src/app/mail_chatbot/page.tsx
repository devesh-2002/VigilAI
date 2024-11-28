'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from 'lucide-react'

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

function EmailChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [numberOfEmails, setNumberOfEmails] = useState('');
  const [showPhishingCheck, setShowPhishingCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleGetEmails = async () => {
    if (!numberOfEmails || isNaN(Number(numberOfEmails))) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/get-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number_of_emails: Number(numberOfEmails)
        }),
      });
      const data = await response.json();
      setEmailCount(data.count);
      setShowPhishingCheck(true);
    } catch (error) {
      console.error('Error fetching emails:', error);
      const errorResponse: Message = {
        id: messages.length + 1,
        text: "Sorry, there was an error checking your emails.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    setLoading(false);
  };

  const handleMalwareCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/malware-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      const botResponse: Message = {
        id: messages.length + 1,
        text: `Malware check results: ${data.response}`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error checking malware:', error);
      const errorResponse: Message = {
        id: messages.length + 1,
        text: "Sorry, there was an error checking for phishing emails.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (input.trim()) {
        const newMessage: Message = { id: messages.length + 1, text: input, sender: 'user' };
        setMessages([...messages, newMessage]);
        setInput('');

        try {
            const response = await fetch('http://localhost:8000/query-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: input }), 
            });
            console.log("Input : ",input)
            console.log(response)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data.response)
            const botResponse: Message = {
                id: messages.length + 2,
                text: data.response || "Sorry, I couldn't process your request.",
                sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Error querying emails:', error);
            const errorResponse: Message = {
                id: messages.length + 2,
                text: "Sorry, there was an error processing your email query. Please try again.",
                sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, errorResponse]);
        }
    }
}
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Check Your Emails</CardTitle>
        </CardHeader>
        <CardContent>
          {emailCount !== null ? (
            <p className="text-lg">You have {emailCount} emails in your inbox.</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-count" className="text-sm font-medium">
                  Number of emails to process
                </label>
                <Input
                  id="email-count"
                  type="number"
                  placeholder="Enter number of emails"
                  value={numberOfEmails}
                  onChange={(e) => setNumberOfEmails(e.target.value)}
                  min="1"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleGetEmails} 
                disabled={loading || !numberOfEmails || isNaN(Number(numberOfEmails))}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Email Count'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {emailCount !== null && (
        <>
          {showPhishingCheck && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Phishing Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleMalwareCheck} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Check for Phishing Emails'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="w-full h-[600px] flex flex-col">
            <CardContent className="flex-grow p-4 overflow-hidden">
              <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{message.sender === 'user' ? 'U' : 'B'}</AvatarFallback>
                        <AvatarImage src={message.sender === 'user' ? '/user-avatar.png' : '/bot-avatar.png'} />
                      </Avatar>
                      <div className={`mx-2 p-3 rounded-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send'
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}

export default EmailChatbot;

