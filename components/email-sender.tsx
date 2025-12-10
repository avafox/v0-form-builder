"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, AlertCircle, CheckCircle } from "lucide-react"

interface EmailSenderProps {
  htmlContent: string
  subject: string
}

export function EmailSender({ htmlContent, subject }: EmailSenderProps) {
  const [fromEmail, setFromEmail] = useState("")
  const [toEmails, setToEmails] = useState("")
  const [ccEmails, setCcEmails] = useState("")
  const [customSubject, setCustomSubject] = useState(subject)
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSendEmail = async () => {
    if (!fromEmail || !toEmails || !customSubject) {
      setStatus("error")
      setErrorMessage("Please fill in all required fields")
      return
    }

    setIsSending(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromEmail,
          to: toEmails.split(",").map((email) => email.trim()),
          cc: ccEmails ? ccEmails.split(",").map((email) => email.trim()) : [],
          subject: customSubject,
          htmlContent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to send email")
      }

      setStatus("success")
      setErrorMessage("")
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send via AWS SES
        </CardTitle>
        <CardDescription>Send this communication using AWS Simple Email Service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fromEmail">From Email *</Label>
          <Input
            id="fromEmail"
            type="email"
            placeholder="your.email@company.com"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="toEmails">To (comma-separated) *</Label>
          <Textarea
            id="toEmails"
            placeholder="recipient1@company.com, recipient2@company.com"
            value={toEmails}
            onChange={(e) => setToEmails(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ccEmails">CC (comma-separated)</Label>
          <Textarea
            id="ccEmails"
            placeholder="cc1@company.com, cc2@company.com"
            value={ccEmails}
            onChange={(e) => setCcEmails(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input id="subject" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} />
        </div>

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Email sent successfully!</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSendEmail} disabled={isSending} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </CardContent>
    </Card>
  )
}
