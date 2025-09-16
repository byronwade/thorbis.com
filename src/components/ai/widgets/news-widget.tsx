'use client';

import React from 'react';
import { ExternalLink, Clock, User } from 'lucide-react';

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  author?: string;
  imageUrl?: string;
}

interface NewsWidgetProps {
  articles: NewsArticle[];
  loading?: boolean;
  title?: string;
}

export function NewsWidget({ articles, loading = false, title = "Latest News" }: NewsWidgetProps) {
  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="h-5 bg-neutral-700 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-neutral-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-3 bg-neutral-700 rounded w-16"></div>
                  <div className="h-3 bg-neutral-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago';
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return '${diffInDays}d ago';
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="text-xs text-neutral-400">
            {articles.length} article{articles.length !== 1 ? 's' : '}
          </div>
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {articles.slice(0, 5).map((article, index) => (
            <article key={index} className="group">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-all duration-200"
              >
                <div className="flex gap-3">
                  {/* Article Image */}
                  {article.imageUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-16 h-16 rounded-lg object-cover bg-neutral-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h4>
                    
                    {article.summary && (
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    
                    {/* Article Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{article.source}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      
                      {article.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">{article.author}</span>
                        </div>
                      )}
                      
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>

        {/* View More */}
        {articles.length > 5 && (
          <div className="mt-4 pt-3 border-t border-neutral-800">
            <div className="text-center text-xs text-neutral-400">
              +{articles.length - 5} more articles available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsWidget;
