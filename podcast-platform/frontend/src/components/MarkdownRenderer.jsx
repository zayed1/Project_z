// ============================================
// عارض Markdown | Markdown Renderer
// تحويل بسيط بدون مكتبات خارجية
// ============================================

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const renderMarkdown = (text) => {
    let html = text
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">$1</a>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')
      // Lists
      .replace(/^- (.+)$/gm, '<li class="mr-4">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="mr-4 list-decimal">$2</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br/>');

    // Wrap lists
    html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="list-disc mr-6 mb-2">$&</ul>');

    return `<p class="mb-2">${html}</p>`;
  };

  return (
    <div
      className={`prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
