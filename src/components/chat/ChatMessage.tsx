'use client'

import { useState } from 'react'
import type { ChatMessage as ChatMsg } from '@/types'
import { Copy, Check, FlaskConical, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  message: ChatMsg
  isStreaming?: boolean
}

export default function ChatMessage({ message, isStreaming }: Props) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  function copy() {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-white/10' : 'bg-white'
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-white" />
          : <FlaskConical className="w-3.5 h-3.5 text-black" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {isUser ? (
          <div className="bg-white/10 border border-white/15 rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="prose-maid text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-white/60 ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>

            {/* Copy button */}
            {!isStreaming && (
              <button
                onClick={copy}
                className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white p-1 rounded"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}

        <span className="text-white/20 text-[10px] px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
