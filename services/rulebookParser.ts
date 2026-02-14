export const parseRulebook = (text: string) => {
    const rules: { article: string; title: string; content: string }[] = [];
    const lines = text.split('\n');
    let currentArticle = '';
    let currentTitle = '';
    let currentContent: string[] = [];

    lines.forEach(line => {
        const articleMatch = line.trim().match(/^Article\s+(\d+)\s+(.+)$/i);
        if (articleMatch) {
            if (currentArticle) {
                rules.push({
                    article: currentArticle,
                    title: currentTitle,
                    content: currentContent.join(' ').substring(0, 150) + '...'
                });
            }
            currentArticle = articleMatch[1];
            currentTitle = articleMatch[2];
            currentContent = [];
        } else if (currentArticle && line.trim()) {
            currentContent.push(line.trim());
        }
    });

    if (currentArticle) {
        rules.push({
            article: currentArticle,
            title: currentTitle,
            content: currentContent.join(' ').substring(0, 150) + '...'
        });
    }

    return rules;
};
