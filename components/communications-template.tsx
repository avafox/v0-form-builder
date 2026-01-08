"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Send, Slack, FileText, ArrowLeft, Home } from "lucide-react"
import DOMPurify from "isomorphic-dompurify"

interface CommunicationData {
  title: string
  greeting: string
  details: string
  action: string
  contactEmail: string
  slackChannel: string
  priority: "low" | "medium" | "high"
  department: string
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
}

const priorityLabels = {
  low: "General Information",
  medium: "Important Notice",
  high: "Urgent Communication",
}

const priorityTitles = {
  low: "General Information",
  medium: "Important Notice",
  high: "Urgent Communication",
}

export function CommunicationsTemplate() {
  const router = useRouter()
  const [previewMode, setPreviewMode] = useState(false)
  const [isOutlookDialogOpen, setIsOutlookDialogOpen] = useState(false)
  const [isHyperlinkDialogOpen, setIsHyperlinkDialogOpen] = useState(false)
  const [hyperlinkData, setHyperlinkData] = useState({ text: "", url: "" })
  const [emailSettings, setEmailSettings] = useState({
    recipients: "",
    ccRecipients: "",
    bccRecipients: "",
    customSubject: "",
    senderEmail: "cti-gpe-communications@sky.uk",
    provider: "resend" as "ses" | "resend",
  })
  const [commData, setCommData] = useState<CommunicationData>({
    title: "System Maintenance Notification",
    greeting: "Dear Colleagues,",
    details:
      "We will be performing scheduled system maintenance on our core infrastructure to improve performance and security. During this time, some services may be temporarily unavailable.",
    action:
      "Please save any important work and log out of all systems by 5:00 PM today. We expect all services to be fully restored by 8:00 AM tomorrow.",
    contactEmail: "support@company.com",
    slackChannel: "#it-support",
    priority: "medium",
    department: "IT Operations",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null) // Added state for image preview

  const updateField = (field: keyof CommunicationData, value: string) => {
    setCommData((prev) => ({ ...prev, [field]: value }))
  }

  const insertHyperlink = () => {
    if (hyperlinkData.text && hyperlinkData.url) {
      const linkMarkdown = `[${hyperlinkData.text}](${hyperlinkData.url})`
      const currentValue = commData.slackChannel
      const newValue = currentValue ? `${currentValue} ${linkMarkdown}` : linkMarkdown
      updateField("slackChannel", newValue)
      setHyperlinkData({ text: "", url: "" })
      setIsHyperlinkDialogOpen(false)
    }
  }

  const updateEmailSetting = (field: keyof typeof emailSettings, value: string) => {
    setEmailSettings((prev) => ({ ...prev, [field]: value }))
  }

  const formatTextForHTML = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" style="color: inherit; text-decoration: underline;">$1</a>')
      .replace(/\n/g, "<br>")
  }

  const formatTextForDisplay = (text: string) => {
    const unsafeHtml = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>',
      )

    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(unsafeHtml, {
      ALLOWED_TAGS: ["strong", "em", "u", "a", "br"],
      ALLOWED_ATTR: ["href", "target", "rel", "style"],
      ALLOW_DATA_ATTR: false,
    })
  }

  const generatePlainTextEmail = () => {
    const plainText = `
GROUP PLATFORM ENGINEERING
${priorityTitles[commData.priority].toUpperCase()}

Please Read - ${commData.title}

${commData.greeting
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/\*(.*?)\*/g, "$1")
  .replace(/__(.*?)__/g, "$1")}

DETAILS
${commData.details
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/\*(.*?)\*/g, "$1")
  .replace(/__(.*?)__/g, "$1")}

REQUIRED ACTION
${commData.action
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/\*(.*?)\*/g, "$1")
  .replace(/__(.*?)__/g, "$1")}

QUESTIONS OR SUPPORT
For any questions regarding this communication, please contact:
✉️ ${commData.contactEmail}
Slack: ${commData.slackChannel}

---
Group Platform Engineering • ${new Date().toLocaleDateString()}
    `.trim()

    return plainText
  }

  const sendViaAzure = async () => {
    try {
      console.log("[v0] Starting email send via", emailSettings.provider.toUpperCase(), "...")

      // Validate required fields
      if (!emailSettings.recipients) {
        alert("❌ Please enter at least one recipient email address")
        return
      }

      if (!emailSettings.senderEmail) {
        alert("❌ Please enter a sender email address")
        return
      }

      // Generate the HTML email content
      const htmlContent = generateEmailHTML()

      console.log("[v0] Generated HTML email content (preview):", htmlContent.substring(0, 500))
      console.log("[v0] HTML content length:", htmlContent.length, "characters")

      const subject = emailSettings.customSubject || `${priorityTitles[commData.priority]}: ${commData.title}`

      // Parse recipients (split by semicolon or comma)
      const toEmails = emailSettings.recipients
        .split(/[;,]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0)

      const ccEmails = emailSettings.ccRecipients
        ? emailSettings.ccRecipients
            .split(/[;,]/)
            .map((email) => email.trim())
            .filter((email) => email.length > 0)
        : undefined

      const bccEmails = emailSettings.bccRecipients
        ? emailSettings.bccRecipients
            .split(/[;,]/)
            .map((email) => email.trim())
            .filter((email) => email.length > 0)
        : undefined

      console.log(`[v0] Sending email via ${emailSettings.provider.toUpperCase()} with:`, {
        from: emailSettings.senderEmail,
        to: toEmails,
        cc: ccEmails,
        bcc: bccEmails,
        subject,
        provider: emailSettings.provider,
      })

      // Call the API
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromEmail: emailSettings.senderEmail,
          to: toEmails,
          subject: subject,
          htmlContent: htmlContent,
          cc: ccEmails,
          bcc: bccEmails,
          provider: emailSettings.provider,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        const providerName = result.provider === "resend" ? "Resend" : "AWS SES"
        console.log(`[v0] Email sent successfully via ${providerName}:`, result)
        alert(
          `✅ Email sent successfully via ${providerName}!\n\nSent to: ${toEmails.join(", ")}\nFrom: ${emailSettings.senderEmail}\n\nThe styled communication has been delivered.`,
        )
        setIsOutlookDialogOpen(false)
      } else {
        console.error("[v0] Email send failed:", result)
        alert(
          `❌ Failed to send email:\n\n${result.error || "Unknown error"}\n\nMessage: ${result.message || "Please check your email service configuration."}`,
        )
      }
    } catch (error) {
      console.error("[v0] Error sending email:", error)
      alert(`❌ Failed to send email: ${error.message}`)
    }
  }

  const generateCommunicationImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")

        const scale = 2
        const width = 600
        const height = 800
        canvas.width = width * scale
        canvas.height = height * scale
        ctx.scale(scale, scale)

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.textBaseline = "top"

        const createGradient = (x1: number, y1: number, x2: number, y2: number) => {
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
          gradient.addColorStop(0, "#fb923c")
          gradient.addColorStop(0.5, "#a855f7")
          gradient.addColorStop(1, "#3b82f6")
          return gradient
        }

        const logoImg = new Image()
        logoImg.crossOrigin = "anonymous"

        logoImg.onload = () => {
          try {
            ctx.fillStyle = "#ffffff"
            ctx.globalAlpha = 1.0
            ctx.fillRect(0, 0, width, height)

            ctx.fillStyle = "rgba(255, 255, 255, 1.0)"
            ctx.fillRect(0, 0, width, height)

            // Header with gradient
            const headerGradient = createGradient(0, 0, width, 0)
            ctx.fillStyle = headerGradient
            ctx.fillRect(0, 0, width, 80)

            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 28px Arial, sans-serif"
            ctx.textAlign = "center"
            ctx.fillText("Group Platform Engineering", width / 2, 25)

            // Priority section with gradient
            const priorityGradient = createGradient(0, 80, width, 0)
            ctx.fillStyle = priorityGradient
            ctx.fillRect(0, 80, width, 60)

            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 22px Arial, sans-serif"
            ctx.fillText(priorityTitles[commData.priority], width / 2, 105)

            // Title section
            ctx.fillStyle = "#dc2626"
            ctx.fillRect(0, 140, width, 40)

            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 18px Arial, sans-serif"
            ctx.fillText(commData.title, width / 2, 155)

            // Content sections
            let yPos = 200
            const lineHeight = 20
            const sectionSpacing = 30

            // Details section
            ctx.fillStyle = "#000000"
            ctx.font = "bold 16px Arial, sans-serif"
            ctx.textAlign = "left"
            ctx.fillText("Details", 40, yPos)
            yPos += 25

            ctx.font = "14px Arial, sans-serif"
            const detailsLines = wrapText(ctx, commData.details, width - 80)
            detailsLines.forEach((line) => {
              ctx.fillText(line, 40, yPos)
              yPos += lineHeight
            })
            yPos += sectionSpacing

            // Action Required section
            ctx.font = "bold 16px Arial, sans-serif"
            ctx.fillText("Action Required", 40, yPos)
            yPos += 25

            ctx.font = "14px Arial, sans-serif"
            const actionLines = wrapText(ctx, commData.action, width - 80)
            actionLines.forEach((line) => {
              ctx.fillText(line, 40, yPos)
              yPos += lineHeight
            })
            yPos += sectionSpacing

            // Questions or Support section
            ctx.font = "bold 16px Arial, sans-serif"
            ctx.fillText("Questions or Support", 40, yPos)
            yPos += 25

            ctx.font = "14px Arial, sans-serif"
            ctx.fillText("For any questions regarding this communication, please contact:", 40, yPos)
            yPos += lineHeight + 5

            ctx.fillStyle = "#0078d4"
            ctx.fillText(`✉️ ${commData.contactEmail}`, 40, yPos)
            yPos += lineHeight

            ctx.fillStyle = "#059669"
            const slackWebUrl = createSlackChannelLink(commData.slackChannel)
            ctx.fillText(`🔗 Slack: ${slackWebUrl}`, 40, yPos)
            yPos += sectionSpacing

            const logoAreaY = height - 120
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, logoAreaY, width, 120)

            const logoWidth = 200
            const logoHeight = (logoImg.height / logoImg.width) * logoWidth
            const logoX = (width - logoWidth) / 2
            const logoY = height - logoHeight - 40

            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight)

            // Footer text
            ctx.fillStyle = "#6b7280"
            ctx.font = "14px Arial, sans-serif"
            ctx.textAlign = "center"
            ctx.fillText(`Group Platform Engineering • ${new Date().toLocaleDateString()}`, width / 2, height - 15)

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob)
                } else {
                  reject(new Error("Failed to create blob from canvas"))
                }
              },
              "image/png",
              1.0,
            )
          } catch (error) {
            reject(error)
          }
        }

        logoImg.onerror = () => {
          console.warn("[v0] Logo failed to load, generating image without logo")

          ctx.fillStyle = "#ffffff"
          ctx.globalAlpha = 1.0
          ctx.fillRect(0, 0, width, height)

          ctx.fillStyle = "rgba(255, 255, 255, 1.0)"
          ctx.fillRect(0, 0, width, height)

          const headerGradient = createGradient(0, 0, width, 0)
          ctx.fillStyle = headerGradient
          ctx.fillRect(0, 0, width, 80)

          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 28px Arial, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("Group Platform Engineering", width / 2, 25)

          const priorityGradient = createGradient(0, 80, width, 0)
          ctx.fillStyle = priorityGradient
          ctx.fillRect(0, 80, width, 60)

          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 22px Arial, sans-serif"
          ctx.fillText(priorityTitles[commData.priority], width / 2, 105)

          ctx.fillStyle = "#dc2626"
          ctx.fillRect(0, 140, width, 40)

          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 18px Arial, sans-serif"
          ctx.fillText(commData.title, width / 2, 155)

          let yPos = 200
          const lineHeight = 20
          const sectionSpacing = 30

          ctx.fillStyle = "#000000"
          ctx.font = "bold 16px Arial, sans-serif"
          ctx.textAlign = "left"
          ctx.fillText("Details", 40, yPos)
          yPos += 25

          ctx.font = "14px Arial, sans-serif"
          const detailsLines = wrapText(ctx, commData.details, width - 80)
          detailsLines.forEach((line) => {
            ctx.fillText(line, 40, yPos)
            yPos += lineHeight
          })
          yPos += sectionSpacing

          ctx.font = "bold 16px Arial, sans-serif"
          ctx.fillText("Action Required", 40, yPos)
          yPos += 25

          ctx.font = "14px Arial, sans-serif"
          const actionLines = wrapText(ctx, commData.action, width - 80)
          actionLines.forEach((line) => {
            ctx.fillText(line, 40, yPos)
            yPos += lineHeight
          })
          yPos += sectionSpacing

          ctx.font = "bold 16px Arial, sans-serif"
          ctx.fillText("Questions or Support", 40, yPos)
          yPos += 25

          ctx.font = "14px Arial, sans-serif"
          ctx.fillText("For any questions regarding this communication, please contact:", 40, yPos)
          yPos += lineHeight + 5

          ctx.fillStyle = "#0078d4"
          ctx.fillText(`✉️ ${commData.contactEmail}`, 40, yPos)
          yPos += lineHeight

          ctx.fillStyle = "#059669"
          const slackWebUrl = createSlackChannelLink(commData.slackChannel)
          ctx.fillText(`🔗 Slack: ${slackWebUrl}`, 40, yPos)

          ctx.fillStyle = "#6b7280"
          ctx.font = "14px Arial, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`Group Platform Engineering • ${new Date().toLocaleDateString()}`, width / 2, height - 15)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob from canvas"))
              }
            },
            "image/png",
            1.0,
          )
        }

        logoImg.src = "/images/image.png"
      } catch (error) {
        reject(error)
      }
    })
  }

  const exportAsImage = async () => {
    try {
      console.log("[v0] Starting image export...")

      const imageBlob = await generateCommunicationImage()
      console.log("[v0] Image generated for export, size:", imageBlob.size)

      if (imageBlob.size === 0) {
        throw new Error("Generated image is empty")
      }

      downloadBlob(imageBlob, "styled-communication.png")
      alert("✅ Styled communication image exported successfully!")
      return true
    } catch (error) {
      console.error("[v0] Error exporting image:", error)
      alert(`❌ Failed to export image: ${error.message}`)
      return false
    }
  }

  const exportAsPDF = async () => {
    try {
      console.log("[v0] Starting PDF export...")

      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [210, 297], // A4 size in mm for better scaling
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let yPos = 0

      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"

      const loadLogo = new Promise<void>((resolve) => {
        logoImg.onload = () => resolve()
        logoImg.onerror = () => resolve() // Continue even if logo fails to load
        logoImg.src = "/images/image.png"
      })

      await loadLogo

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
        doc.setFontSize(fontSize)
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * (fontSize * 0.4) + 2 // Reduced spacing between lines
      }

      doc.setFillColor(251, 146, 60) // Orange color
      doc.rect(0, 0, pageWidth, 35, "F") // Increased from 25 to 35

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24) // Increased from 20 to 24
      doc.setFont(undefined, "bold")
      doc.text("Group Platform Engineering", pageWidth / 2, 20, { align: "center" }) // Adjusted position

      yPos = 35 // Updated starting position

      doc.setFillColor(168, 85, 247) // Purple color
      doc.rect(0, yPos, pageWidth, 20, "F") // Increased from 15 to 20

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18) // Increased from 16 to 18
      doc.text(priorityTitles[commData.priority], pageWidth / 2, yPos + 12, { align: "center" })

      yPos += 20 // Updated

      doc.setFillColor(220, 38, 38) // Red color
      doc.rect(0, yPos, pageWidth, 16, "F") // Increased from 12 to 16

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16) // Increased from 14 to 16
      doc.text(`Please Read - ${commData.title}`, pageWidth / 2, yPos + 10, { align: "center" })

      yPos += 25 // Increased spacing

      // Content sections with larger fonts
      doc.setTextColor(0, 0, 0)

      doc.setFontSize(16) // Increased from 14
      doc.setFont(undefined, "bold")
      yPos = addWrappedText(commData.greeting, margin, yPos, contentWidth, 16)
      yPos += 8

      doc.setFontSize(14) // Increased from 12
      doc.setFont(undefined, "bold")
      doc.text("Details", margin, yPos)
      yPos += 10

      doc.setFont(undefined, "normal")
      yPos = addWrappedText(commData.details, margin, yPos, contentWidth, 13) // Increased from 11
      yPos += 10

      doc.setFont(undefined, "bold")
      doc.text("Action Required", margin, yPos)
      yPos += 10

      doc.setFont(undefined, "normal")
      yPos = addWrappedText(commData.action, margin, yPos, contentWidth, 13) // Increased from 11
      yPos += 10

      doc.setFont(undefined, "bold")
      doc.text("Questions or Support", margin, yPos)
      yPos += 10

      doc.setFont(undefined, "normal")
      doc.text("For any questions regarding this communication, please contact:", margin, yPos)
      yPos += 10

      doc.setTextColor(0, 120, 212) // Blue color for links
      doc.textWithLink(`Email: ${commData.contactEmail}`, margin, yPos, { url: `mailto:${commData.contactEmail}` })
      yPos += 8

      doc.setTextColor(5, 150, 105) // Green color for Slack
      const slackUrl = createSlackChannelLink(commData.slackChannel)
      doc.textWithLink(`Slack: ${commData.slackChannel}`, margin, yPos, { url: slackUrl })
      yPos += 20

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        try {
          // Convert image to canvas to get it as data URL for jsPDF
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (ctx) {
            canvas.width = logoImg.naturalWidth
            canvas.height = logoImg.naturalHeight
            ctx.drawImage(logoImg, 0, 0)
            const logoDataUrl = canvas.toDataURL("image/png")

            const footerHeight = 90 // Increased from 80 to 90 for more space
            const footerStartY = pageHeight - footerHeight
            doc.setFillColor(243, 244, 246) // Light gray background
            doc.rect(0, footerStartY, pageWidth, footerHeight, "F")

            const logoWidth = 120 // Increased from 80 to 120
            const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth
            const logoX = (pageWidth - logoWidth) / 2
            const logoY = footerStartY + 2 // Moved from +5 to +2 to position even higher

            doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight)
          }
        } catch (logoError) {
          console.warn("[v0] Could not add logo to PDF:", logoError)
        }
      }

      doc.setTextColor(107, 114, 128) // Gray color
      doc.setFontSize(12) // Increased from 10
      doc.text(`Group Platform Engineering • ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, {
        // Moved from -10 to -5 to position at very bottom
        align: "center",
      })

      // Save the PDF
      doc.save("communication.pdf")

      console.log("[v0] PDF exported successfully")
      alert("✅ PDF exported successfully with clickable links!")
    } catch (error) {
      console.error("[v0] Error exporting PDF:", error)
      alert(`❌ Failed to export PDF: ${error.message}`)
    }
  }

  const copyImageToClipboard = async () => {
    try {
      console.log("[v0] Starting copy to clipboard...")

      const imageBlob = await generateCommunicationImage()
      console.log("[v0] Image generated for clipboard, size:", imageBlob.size)

      if (imageBlob.size === 0) {
        throw new Error("Generated image is empty")
      }

      // Try clipboard copy first - must be called directly in click handler
      try {
        await copyPngToClipboard(imageBlob)
        console.log("[v0] Image copied to clipboard successfully")
        alert(
          "✅ Styled communication image copied to clipboard! You can now paste it directly into Gmail or any email client.",
        )
        return true
      } catch (clipboardError) {
        console.log("[v0] Clipboard failed, falling back to download:", clipboardError)
        // Fallback: trigger download if clipboard write fails
        downloadBlob(imageBlob, "styled-communication.png")
        alert(
          "📥 Your browser blocked clipboard access. The styled communication image was downloaded instead - you can attach it to your email!",
        )
        return true
      }
    } catch (error) {
      console.error("[v0] Error in copyImageToClipboard:", error)
      alert(`❌ Failed to copy/download image: ${error.message}`)
      return false
    }
  }

  const downloadImage = async () => {
    try {
      console.log("[v0] Starting image download...")

      const imageBlob = await generateCommunicationImage()
      console.log("[v0] Image generated for download, size:", imageBlob.size)

      if (imageBlob.size === 0) {
        throw new Error("Generated image is empty")
      }

      downloadBlob(imageBlob, "styled-communication.png")
      alert(
        "📥 Styled communication image downloaded! This image contains all the colors, graphics, and formatting from your preview.",
      )
      return true
    } catch (error) {
      console.error("[v0] Error downloading image:", error)
      alert(`❌ Failed to download image: ${error.message}`)
      return false
    }
  }

  const copyPngToClipboard = async (pngBlob: Blob) => {
    // Feature detection
    const canWrite = !!(navigator.clipboard && (window as any).ClipboardItem)
    if (!canWrite) throw new Error("Image clipboard not supported")

    // Pre-create the ClipboardItem to avoid long awaits in the handler
    const item = new (window as any).ClipboardItem({ "image/png": pngBlob })

    // Must be called directly in the click handler for security
    await navigator.clipboard.write([item])
  }

  const downloadBlob = (blob: Blob, filename = "styled-communication.png") => {
    console.log("[v0] Starting download of blob, size:", blob.size)

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.style.display = "none"

    // Add to DOM, click, then remove
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100)

    console.log("[v0] Download triggered successfully")
  }

  const generateEmailHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${commData.title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <tr>
                        <td style="background-color: #fb923c; background-image: linear-gradient(90deg, #fb923c 0%, #a855f7 50%, #3b82f6 100%); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                            <!--[if mso]>
                            <td style="background-color: #fb923c; padding: 24px; text-align: center;">
                            <![endif]-->
                            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1.2;">Group Platform Engineering</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #a855f7; background-image: linear-gradient(90deg, #fb923c 0%, #a855f7 50%, #3b82f6 100%); padding: 16px; text-align: center;">
                            <!--[if mso]>
                            <td style="background-color: #a855f7; padding: 16px; text-align: center;">
                            <![endif]-->
                            <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1.2;">${priorityTitles[commData.priority]}</h2>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #dc2626; padding: 12px; text-align: center;">
                            <p style="margin: 0; color: #ffffff; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.2;">Please Read - ${commData.title}</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 32px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">${formatTextForHTML(commData.greeting)}</h2>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #000000; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">Details</h3>
                                        <p style="margin: 0; color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6;">${formatTextForHTML(commData.details)}</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #000000; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">Required Action</h3>
                                        <p style="margin: 0; color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6;">${formatTextForHTML(commData.action)}</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #000000; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">Questions or Support</h3>
                                        <p style="margin: 0 0 8px 0; color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6;">For any questions regarding this communication, please contact:</p>
                                        
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="padding-right: 16px; padding-top: 8px;">
                                                    <a href="${createEmailLink(commData.contactEmail)}" style="color: #0078d4; text-decoration: none; font-weight: 500; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">✉️ ${commData.contactEmail}</a>
                                                </td>
                                                <td style="padding-top: 8px;">
                                                    <a href="slack://channel?team=T1234567890&id=${commData.slackChannel.replace("#", "")}" style="color: #059669; text-decoration: none; font-weight: 500; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">Slack: ${commData.slackChannel}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 0 0 8px 8px;">
                            <img src="/images/image.png" alt="Group Platform Engineering" style="max-width: 100%; height: auto; display: block; margin: 0 auto 8px auto;" />
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif; line-height: 1.4;">Group Platform Engineering • ${new Date().toLocaleDateString()}</p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

    return html
  }

  const copyHTMLToClipboard = async () => {
    try {
      const htmlContent = generateEmailHTML()
      await navigator.clipboard.writeText(htmlContent)
      alert(
        "✅ HTML email copied to clipboard! \n\nTo use in Outlook:\n1. Create new email\n2. Click 'Insert' → 'Attach File' → 'Web Page'\n3. Paste the HTML or save as .html file and attach\n\nAlternatively, switch to HTML view and paste directly.",
      )
    } catch (error) {
      console.error("Failed to copy HTML:", error)
      // Fallback: download as HTML file
      const blob = new Blob([generateEmailHTML()], { type: "text/html" })
      downloadBlob(blob, "communication.html")
      alert("📥 HTML email downloaded! Open this file in a browser, then copy/paste into Outlook.")
    }
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + " " + word).width
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  const previewGeneratedImage = async () => {
    try {
      console.log("[v0] Generating image preview...")
      const blob = await generateCommunicationImage()
      const url = URL.createObjectURL(blob)
      setImagePreview(url) // Use the state variable here
      console.log("[v0] Image preview generated successfully")
    } catch (error) {
      console.error("[v0] Failed to generate image preview:", error)
    }
  }

  const createSlackChannelLink = (channel: string) => {
    const channelName = channel.replace("#", "")
    // Replace 'your-workspace' with your actual Slack workspace name
    return `https://your-workspace.slack.com/channels/${channelName}`
  }

  const createEmailLink = (email: string) => {
    const subject = encodeURIComponent(`${priorityTitles[commData.priority]}: ${commData.title}`)
    const body = encodeURIComponent(
      `Dear Team,\n\nPlease see the attached communication regarding: ${commData.title}\n\nBest regards,\nGroup Platform Engineering`,
    )
    return `mailto:${email}?subject=${subject}&body=${body}`
  }

  const sendViaOutlook = () => {
    setEmailSettings((prev) => ({
      ...prev,
      customSubject: `${priorityTitles[commData.priority]}: ${commData.title}`,
    }))
    setIsOutlookDialogOpen(true)
  }

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg bg-black/20 rounded-lg py-2 px-4">
              Communication Preview
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportAsPDF}
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Dialog open={isOutlookDialogOpen} onOpenChange={setIsOutlookDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300">
                  <Mail className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Send Communication via Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Email Service</Label>
                    <select
                      id="provider"
                      value={emailSettings.provider}
                      onChange={(e) => updateEmailSetting("provider", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="resend">Resend (Recommended)</option>
                      <option value="ses">AWS SES</option>
                    </select>
                    <p className="text-xs text-gray-600">
                      {emailSettings.provider === "resend"
                        ? "Resend provides reliable email delivery with better inbox placement"
                        : "AWS SES requires verified sender addresses and may have delivery issues"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender">From (Sender Email)</Label>
                    <Input
                      id="sender"
                      value={emailSettings.senderEmail}
                      readOnly
                      className="bg-gray-50"
                      placeholder="cti-gpe-communications@sky.uk"
                    />
                    <p className="text-xs text-gray-600">
                      {emailSettings.provider === "resend"
                        ? "Configured in Resend dashboard"
                        : "Verified AWS SES sender address"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipients">To (Recipients)</Label>
                    <Input
                      id="recipients"
                      value={emailSettings.recipients}
                      onChange={(e) => updateEmailSetting("recipients", e.target.value)}
                      placeholder="email1@company.com; email2@company.com"
                    />
                    <p className="text-xs text-gray-600">Separate multiple recipients with semicolons or commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc">CC (Optional)</Label>
                    <Input
                      id="cc"
                      value={emailSettings.ccRecipients}
                      onChange={(e) => updateEmailSetting("ccRecipients", e.target.value)}
                      placeholder="cc@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc">BCC (Optional)</Label>
                    <Input
                      id="bcc"
                      value={emailSettings.bccRecipients}
                      onChange={(e) => updateEmailSetting("bccRecipients", e.target.value)}
                      placeholder="bcc@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Custom Subject (Optional)</Label>
                    <Input
                      id="subject"
                      value={emailSettings.customSubject}
                      onChange={(e) => updateEmailSetting("customSubject", e.target.value)}
                      placeholder={`${priorityTitles[commData.priority]}: ${commData.title}`}
                    />
                  </div>
                  <div className="mt-2">
                    <Button onClick={sendViaAzure} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      Send via {emailSettings.provider === "resend" ? "Resend" : "AWS SES"}
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      {emailSettings.provider === "resend"
                        ? "Sends email through Resend API with formatted HTML content"
                        : "Sends email through AWS Simple Email Service (SES)"}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => setPreviewMode(false)}
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
            >
              ⚙️ Edit Mode
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-500 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center drop-shadow-lg">Group Platform Engineering</h1>
          </div>

          <div className="bg-purple-600 px-8 py-4">
            <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">
              {priorityTitles[commData.priority]}
            </h2>
          </div>

          <div className="bg-red-600 px-8 py-3">
            <p className="text-center text-white font-semibold">Please Read - {commData.title}</p>
          </div>

          <div className="px-8 py-8 space-y-6">
            <div>
              <h2
                className="text-xl font-semibold text-gray-900 mb-3"
                dangerouslySetInnerHTML={{ __html: formatTextForDisplay(commData.greeting) }}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-black">Details</h3>
              <p
                className="text-black leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatTextForDisplay(commData.details) }}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-black">Required Action</h3>
              <p
                className="text-black leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatTextForDisplay(commData.action) }}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-black">Questions or Support</h3>
              <div className="space-y-2">
                <p className="text-black">For any questions regarding this communication, please contact:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={createEmailLink(commData.contactEmail)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    // Added onClick handler to ensure email client opens
                    onClick={(e) => {
                      e.preventDefault()
                      const mailtoUrl = createEmailLink(commData.contactEmail)
                      window.location.href = mailtoUrl
                    }}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {commData.contactEmail}
                  </a>
                  <div className="inline-flex items-center text-green-600 hover:text-green-800 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Slack className="w-4 h-4" />
                      <a
                        href={createSlackChannelLink(commData.slackChannel)}
                        className="hover:underline cursor-pointer"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {commData.slackChannel}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white px-8 py-4 border-t text-center">
            <div className="bg-white rounded-lg p-6 inline-block mb-2 shadow-sm border border-gray-200">
              <div className="bg-white p-2 rounded">
                <img
                  src="/images/image.png"
                  alt="Group Platform Engineering"
                  className="max-w-full h-auto mx-auto bg-white rounded"
                  style={{ backgroundColor: "white" }}
                />
              </div>
            </div>
            <p className="text-gray-600 text-sm">Group Platform Engineering • {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="default"
                className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <CardTitle className="flex items-center gap-2 text-gray-900">✏️ Communication Editor</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewMode(true)}
                className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
              >
                👁️ Full Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Communication Title</Label>
              <Input
                id="title"
                value={commData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter communication title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={commData.priority} onValueChange={(value) => updateField("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">General Information</SelectItem>
                    <SelectItem value="medium">Important Notice</SelectItem>
                    <SelectItem value="high">Urgent Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={commData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="e.g., IT Operations"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greeting">1. Greeting Section</Label>
              <RichTextEditor
                value={commData.greeting}
                onChange={(value) => updateField("greeting", value)}
                placeholder="e.g., Dear Colleagues,"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">2. Details Section</Label>
              <RichTextEditor
                value={commData.details}
                onChange={(value) => updateField("details", value)}
                placeholder="Provide detailed information about the communication..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">3. Action Section</Label>
              <RichTextEditor
                value={commData.action}
                onChange={(value) => updateField("action", value)}
                placeholder="Describe any required actions or next steps..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">4. Contact Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={commData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  placeholder="support@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack">Slack Channel</Label>
                <div className="flex gap-2">
                  <Input
                    id="slack"
                    value={commData.slackChannel}
                    onChange={(e) => updateField("slackChannel", e.target.value)}
                    // Updated placeholder to show proper Slack channel format
                    placeholder="#it-support (will link to your Slack workspace)"
                    className="flex-1"
                  />
                  <Dialog open={isHyperlinkDialogOpen} onOpenChange={setIsHyperlinkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" type="button">
                        🔗 Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Hyperlink</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkText">Link Text</Label>
                          <Input
                            id="linkText"
                            value={hyperlinkData.text}
                            onChange={(e) => setHyperlinkData((prev) => ({ ...prev, text: e.target.value }))}
                            placeholder="e.g., Click here for more info"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkUrl">URL</Label>
                          <Input
                            id="linkUrl"
                            value={hyperlinkData.url}
                            onChange={(e) => setHyperlinkData((prev) => ({ ...prev, url: e.target.value }))}
                            // Updated placeholder to show Slack workspace URL format
                            placeholder="https://your-workspace.slack.com/channels/channel-name"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={insertHyperlink} className="flex-1">
                            Insert Link
                          </Button>
                          <Button variant="outline" onClick={() => setIsHyperlinkDialogOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p>
                            <strong>Tip:</strong> You can also type links manually using this format:
                          </p>
                          <code className="bg-gray-100 px-1 rounded">[Link Text](https://example.com)</code>
                          {/* Added note about Slack workspace URL */}
                          <p className="mt-2">
                            <strong>For Slack:</strong> Replace 'your-workspace' with your actual Slack workspace name
                            in the URL.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-900">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-orange-500 px-4 py-3">
              <h1 className="text-lg font-bold text-white text-center drop-shadow-lg">Group Platform Engineering</h1>
            </div>

            <div className="bg-purple-600 px-4 py-2">
              <h2 className="text-sm font-bold text-white text-center drop-shadow-lg">
                {priorityTitles[commData.priority]}
              </h2>
            </div>

            <div className="bg-red-600 px-4 py-2">
              <p className="text-center text-white text-sm font-semibold">{commData.title}</p>
            </div>

            <div className="px-4 py-4 space-y-4 text-sm">
              <div>
                <p
                  className="font-semibold"
                  dangerouslySetInnerHTML={{ __html: formatTextForDisplay(commData.greeting) }}
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-black text-xs">Details</h4>
                <p
                  className="text-black text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatTextForDisplay(commData.details) }}
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-black text-xs">Required Action</h4>
                <p
                  className="text-black text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatTextForDisplay(commData.action) }}
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-black text-xs">Questions or Support</h4>
                <div className="space-y-1">
                  <p className="text-blue-600 text-xs flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <a
                      href={createEmailLink(commData.contactEmail)}
                      className="hover:underline cursor-pointer"
                      // Added onClick handler to ensure email client opens
                      onClick={(e) => {
                        e.preventDefault()
                        const mailtoUrl = createEmailLink(commData.contactEmail)
                        window.location.href = mailtoUrl
                      }}
                    >
                      {commData.contactEmail}
                    </a>
                  </p>
                  <p className="text-green-600 text-xs flex items-center gap-1">
                    <Slack className="h-3 w-3" />
                    <a
                      href={createSlackChannelLink(commData.slackChannel)}
                      className="hover:underline cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {commData.slackChannel}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-2 border-t text-center">
              <div className="bg-white rounded-lg p-3 inline-block mb-1 shadow-sm border border-gray-200">
                <div className="bg-white p-1 rounded">
                  <img
                    src="/images/image.png"
                    alt="Group Platform Engineering"
                    className="max-w-full h-8 mx-auto bg-white rounded"
                    style={{ backgroundColor: "white" }}
                  />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Group Platform Engineering • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
