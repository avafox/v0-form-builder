"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, rows = 4, className = "" }: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const applyFormatting = (format: "bold" | "italic" | "underline") => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (!selectedText) return

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "underline":
        formattedText = `__${selectedText}__`
        break
    }

    // Replace the selected text with formatted text
    range.deleteContents()
    range.insertNode(document.createTextNode(formattedText))

    // Update the value
    const newContent = editorRef.current.innerText
    onChange(newContent)

    // Clear selection
    selection.removeAllRanges()
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

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("bold")}
          className="h-8 w-8 p-0"
          disabled={!isEditing}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("italic")}
          className="h-8 w-8 p-0"
          disabled={!isEditing}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting("underline")}
          className="h-8 w-8 p-0"
          disabled={!isEditing}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button type="button" variant="outline" size="sm" onClick={toggleEditor} className="text-xs bg-transparent">
            {isEditing ? "Plain Text" : "Rich Text"}
          </Button>
        </div>
      </div>

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
          Format: **bold**, *italic*, __underline__
        </div>
      )}
    </div>
  )
}
