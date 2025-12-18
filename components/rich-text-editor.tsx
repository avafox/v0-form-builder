"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, List, ListOrdered, Upload, X } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, rows = 4, className = "" }: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([])
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editorRef.current && isEditing) {
      editorRef.current.innerHTML = convertToHTML(value)
    }
  }, [value, isEditing])

  const convertToHTML = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/\n/g, "<br>")
  }

  const convertFromHTML = (html: string) => {
    return html
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<u>(.*?)<\/u>/g, "__$1__")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]*>/g, "") // Remove any other HTML tags
  }

  const applyFormatting = (format: "bold" | "italic" | "underline" | "bulletList" | "numberedList") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let formattedText = ""
    let newCursorPos = start

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        newCursorPos = start + formattedText.length
        break
      case "italic":
        formattedText = `*${selectedText}*`
        newCursorPos = start + formattedText.length
        break
      case "underline":
        formattedText = `__${selectedText}__`
        newCursorPos = start + formattedText.length
        break
      case "bulletList":
        if (selectedText) {
          const lines = selectedText.split("\n")
          formattedText = lines.map((line) => (line.trim() ? `• ${line.trim()}` : line)).join("\n")
        } else {
          formattedText = "• "
        }
        newCursorPos = start + formattedText.length
        break
      case "numberedList":
        if (selectedText) {
          const lines = selectedText.split("\n").filter((line) => line.trim())
          formattedText = lines.map((line, index) => `${index + 1}. ${line.trim()}`).join("\n")
        } else {
          formattedText = "1. "
        }
        newCursorPos = start + formattedText.length
        break
    }

    // Replace the selected text with formatted text
    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerText
      onChange(content)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const toggleEditor = () => {
    if (isEditing && editorRef.current) {
      // Save content when switching from rich editor to textarea
      const content = editorRef.current.innerText
      onChange(content)
    }
    setIsEditing(!isEditing)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Create a local URL for the file
    const fileUrl = URL.createObjectURL(file)
    const fileName = file.name

    // Add file reference to the list
    setUploadedFiles((prev) => [...prev, { name: fileName, url: fileUrl }])

    // Insert file reference into the text
    const fileReference = `\n[📎 ${fileName}](${fileUrl})\n`
    const newValue = value + fileReference
    onChange(newValue)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName))

    // Remove file reference from text
    const fileRefPattern = new RegExp(`\\[📎 ${fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\$$[^)]+\$$`, "g")
    const newValue = value.replace(fileRefPattern, "").replace(/\n\n+/g, "\n\n")
    onChange(newValue)
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("bold")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("italic")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("underline")}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("bulletList")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("numberedList")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0"
          title="Upload File"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <div className="ml-auto">
          <Button type="button" variant="outline" size="sm" onClick={toggleEditor} className="text-xs bg-transparent">
            {isEditing ? "Plain Text" : "Rich Text"}
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="px-3 py-2 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div key={file.name} className="flex items-center gap-2 bg-white border rounded px-2 py-1 text-xs">
                <span className="text-gray-700">📎 {file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        {isEditing ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            className="min-h-24 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            style={{ minHeight: `${rows * 1.5}rem` }}
            dangerouslySetInnerHTML={{ __html: convertToHTML(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset bg-transparent"
          />
        )}
      </div>

      {/* Format Guide */}
      {!isEditing && (
        <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
          Format: **bold**, *italic*, __underline__ | Lists: • bullet or 1. numbered | Upload: Click upload icon
        </div>
      )}
    </div>
  )
}
