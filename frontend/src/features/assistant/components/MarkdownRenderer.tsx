import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-invert max-w-none text-sm md:text-base", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-4 text-sm"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={cn("bg-zinc-800 rounded px-1.5 py-0.5 text-[0.9em] text-emerald-400 font-mono", className)}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 border border-zinc-700/50 rounded-lg">
                <table className="min-w-full divide-y divide-zinc-700/50">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-zinc-800/50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-300 border-t border-zinc-700/50">{children}</td>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-5 space-y-1 my-2 text-zinc-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-5 space-y-1 my-2 text-zinc-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-1">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-semibold mt-6 mb-4 text-white border-b border-zinc-800 pb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-semibold mt-5 mb-3 text-white">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-medium mt-4 mb-2 text-white">{children}</h3>;
          },
          p({ children }) {
            return <p className="my-2 leading-relaxed text-zinc-300">{children}</p>;
          },
          a({ children, href }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-4 bg-zinc-800/30 rounded-r text-zinc-300 italic">
                {children}
              </blockquote>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
