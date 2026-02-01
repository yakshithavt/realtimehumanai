import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

export function useChatExport() {
  const { messages } = useApp();
  const { user } = useAuth();

  const exportToJSON = () => {
    const chatData = {
      exportDate: new Date().toISOString(),
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
      } : null,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        type: msg.type || 'text',
        timestamp: msg.timestamp.toISOString(),
      })),
      totalMessages: messages.length,
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    let textContent = `Chat History Export\n`;
    textContent += `Export Date: ${new Date().toLocaleString()}\n`;
    textContent += `Total Messages: ${messages.length}\n`;
    
    if (user) {
      textContent += `User: ${user.name} (${user.email})\n`;
    }
    
    textContent += `\n${'='.repeat(50)}\n\n`;

    messages.forEach((message, index) => {
      textContent += `[${message.timestamp.toLocaleString()}] ${message.role.toUpperCase()}\n`;
      textContent += `${message.content}\n`;
      if (message.type && message.type !== 'text') {
        textContent += `[Type: ${message.type}]\n`;
      }
      textContent += '\n' + '-'.repeat(30) + '\n\n';
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csvContent = 'Timestamp,Role,Content,Type\n';
    
    messages.forEach(message => {
      const timestamp = message.timestamp.toISOString();
      const role = message.role;
      const content = `"${message.content.replace(/"/g, '""')}"`; // Escape quotes
      const type = message.type || 'text';
      
      csvContent += `${timestamp},${role},${content},${type}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    let markdownContent = `# Chat History\n\n`;
    markdownContent += `**Export Date:** ${new Date().toLocaleString()}\n`;
    markdownContent += `**Total Messages:** ${messages.length}\n\n`;
    
    if (user) {
      markdownContent += `**User:** ${user.name} (${user.email})\n\n`;
    }
    
    markdownContent += `---\n\n`;

    messages.forEach((message, index) => {
      const roleEmoji = message.role === 'user' ? '👤' : '🤖';
      markdownContent += `${roleEmoji} **${message.role.charAt(0).toUpperCase() + message.role.slice(1)}** - ${message.timestamp.toLocaleString()}\n\n`;
      markdownContent += `${message.content}\n\n`;
      
      if (message.type && message.type !== 'text') {
        markdownContent += `*Type: ${message.type}*\n\n`;
      }
      
      if (index < messages.length - 1) {
        markdownContent += `---\n\n`;
      }
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportToJSON,
    exportToText,
    exportToCSV,
    exportToMarkdown,
  };
}
